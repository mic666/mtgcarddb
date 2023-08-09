import _ from "lodash";
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import MtgCard, { compareCardById } from "./card/MtgCard.js";
import * as mtgCardDB from "./card/mtgCardDB.js";

const app = express();
app.use(cors())
let cards = mtgCardDB.loadAllCards();
let scryfallURL = 'https://scryfall.com/card/';
let htmlHeader = "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "<head>\n" +
    "<meta charset=\"utf-8\">\n" +
    "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Mtg Card List</title>" +
    "<!-- CSS only -->\n" +
    "<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" " +
    "integrity=\"sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65\" crossorigin=\"anonymous\">" +
    "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css\">" +
    "<!-- JavaScript Bundle with Popper -->\n" +
    "<script\n" +
    "  src=\"https://code.jquery.com/jquery-3.6.2.min.js\"\n" +
    "  integrity=\"sha256-2krYZKh//PcchRtd+H+VyyQoZ/e3EcrkxhM8ycwASPA=\"\n" +
    "  crossorigin=\"anonymous\"></script>" +
    "<script\n" +
    "  src=\"https://code.jquery.com/ui/1.13.2/jquery-ui.min.js\"\n" +
    "  integrity=\"sha256-lSjKY0/srUM9BE3dPm+c4fBo1dky2v27Gdjm2uoZaL0=\"\n" +
    "  crossorigin=\"anonymous\"></script>" +
    "<script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js\" " +
    "integrity=\"sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4\" " +
    "crossorigin=\"anonymous\"></script>" +
    "<script type=\"text/javascript\" charset=\"utf8\" src=\"https://cdn.datatables.net/1.13.1/js/jquery.dataTables.js\"></script>" +
    "</head>\n" +
    "<body>";

function retrieveCardForId(requestedCardId) {
    let requestedCard = null;
    for (const element of cards) {
        if (element.id === requestedCardId) {
            requestedCard = element;
            break;
        }
    }
    return requestedCard;
}

function addCard(cardToAdd) {
    cards.push(cardToAdd);
    mtgCardDB.addCard(cardToAdd);
}

function updateCard(requestedCardId, numberOwned) {
    let requestedCard = null;
    for (const element of cards) {
        if (element.id === requestedCardId) {
            element.numberOwned = numberOwned;
            mtgCardDB.updateNumberOwnedCard(requestedCardId, numberOwned);
            break;
        }
    }
    return requestedCard;
}

function updateCardPrice(requestedCardId, price) {
    let requestedCard = null;
    for (const element of cards) {
        if (element.id === requestedCardId) {
            element.price = price;
            mtgCardDB.updateCardPrice(requestedCardId, price);
            break;
        }
    }
    return requestedCard;
}

function getMtgSets() {
    let mtgSet = new Set()
    for (const element of cards) {
        let cardId = element.id;
        mtgSet.add(cardId.split("-")[1]);
    }
    return mtgSet;
}


function getCardImgHtml(card) {
    let splitCardId = card.id.split('-');
    let cardImgHTML = "<a href=\"" + scryfallURL + splitCardId[1] + '/' + splitCardId[0];
    cardImgHTML += "\" target=\"_blank\" rel=\"noopener noreferrer\">"
    cardImgHTML += "<img src=\"" + card.imgUrl + "?format=image&version=small\" alt='" + card.id + "'>";
    cardImgHTML += "</a>";
    return cardImgHTML;
}

function getCardHtml(card) {
    let cardHTML = "<h3>" + card.id + ":</h3>"
    cardHTML += getCardImgHtml(card) + "<br/>";
    cardHTML += " Number owned :" + card.numberOwned;
    return cardHTML;
}

function getCardsHtmlTableHeaders(sortedCards, isExchange) {
    let tableHtml = "<div class=\"table-responsive-md\">" +
        "<table id='cardsTable' class=\"display table table-striped table-hover align-middle\"'><thead class=\"table-dark\"><tr><th>IMG</th><th>ID</th><th>Name</th>" +
        "<th>Number owned</th><th>Mana cost</th><th>Color identity</th><th>CMC</th><th>Layout</th><th>Price</th></tr></thead><tbody class=\"table-group-divider\">";
    for (const cardRow of sortedCards) {
        let cardHtmlRow = "<tr>";
        cardHtmlRow += "<td>" + getCardImgHtml(cardRow) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.id) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.name) + "</td>";
        cardHtmlRow += "<td>" + getNumberOwnedOrDash(cardRow.numberOwned, isExchange) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.manaCost) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.colorIdentity) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.cmc) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.layout) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cardRow.price) + "</td>";
        cardHtmlRow += "</tr>";
        tableHtml += cardHtmlRow;
    }
    return tableHtml + "</tbody></table></div>"

}

function getCardsText(sortedCards) {
    let cardsText = "";
    for (const element of sortedCards) {
        cardsText += element.toString();
        cardsText += " \\n ";
    }
    return cardsText
}

function getCardsJson(sortedCards) {
    let cardsJson = "";
    for (const element of sortedCards) {
        cardsJson += element.toString();
        cardsJson += " \\n ";
    }
    return cardsJson
}

function dashIfValueNotDefined(value) {
    return value === undefined || value === null || value === "" ? "-" : value;
}

function getNumberOwnedOrDash(value, isExchange) {
    if (value === undefined || value === null || value === "") {
        return "-"
    } else {
        return isExchange ? value - 4 : value
    }
}

app.get('/cards', (req, res) => {
    try {
        let sortedCards = cards.sort((a, b) => compareCardById(a, b));
        if (req.query.format === undefined || req.query.format === "html") {
            let html = htmlHeader + "Cards list : <br/>";
            html += getCardsHtmlTableHeaders(sortedCards, false);
            html += "<script>$(document).ready( function () {" +
                "    $('#cardsTable').DataTable();" +
                "} );</script></body>"
            res.type('html').send(html)
        } else if (req.query.format === "json") {
            res.type('json').send(JSON.stringify(sortedCards))

        } else if (req.query.format === "text") {
            res.type('txt').send(getCardsText(sortedCards))
        }
        else {
            res.status(400)
            res.type('txt').send("format param is incorrect");
            return;
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.get('/sets', (req, res) => {
    try {
        let html = htmlHeader + "List of Mtg set with owned cards : <br/>";
        let mtgSets = getMtgSets();
        mtgSets.forEach(set => html += " - " + set + "<br/>")
        html += "</body>"
        res.send(html)
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});


app.get('/cards/:set', (req, res) => {
    try {
        if (req.params.set === undefined) {
            res.status(400)
            res.type('txt').send("Param set is missing");
            return;
        }
        let sortedCards = cards.filter(card => card.id.includes(req.params.set)).sort((a, b) => compareCardById(a, b));
        if (req.query.format === undefined || req.query.format === "html") {
            let html = htmlHeader + "Cards available for " + req.params.set + " : <br/>";
            html += getCardsHtmlTableHeaders(sortedCards, false);
            html += "<script>$(document).ready( function () {" +
                "    $('#cardsTable').DataTable();" +
                "} );</script></body>"
            res.type('html').send(html)
        } else if (req.query.format === "json") {
            res.type('json').send(JSON.stringify(sortedCards))

        } else if (req.query.format === "text") {
            res.type('txt').send(getCardsText(sortedCards))
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.get('/card/:id', (req, res) => {
    try {
        let requestedCardId = req.params.id;
        let requestedCard = retrieveCardForId(requestedCardId);
        if (requestedCard !== null) {
            let title = "Card info : <br/>";
            let cardHTML = getCardHtml(requestedCard);
            res.type('txt').send(title + cardHTML)
        } else {
            res.status(404)
            res.type('txt').send("No card found for this id :" + requestedCardId);
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.get('/exchange', (req, res) => {
    try {
        let sortedCards = cards
            .filter(card => parseInt(card.numberOwned) > 4)
            .sort((a, b) => compareCardById(a, b));
        if (req.query.format === undefined || req.query.format === "html") {
            let html = htmlHeader + "Cards available for exchange : <br/>";
            html += getCardsHtmlTableHeaders(sortedCards, true);
            html += "<script>$(document).ready( function () {" +
                "    $('#cardsTable').DataTable();" +
                "} );</script></body>"
            res.type('html').send(html)
        } else if (req.query.format === "json") {
            res.type('json').send(JSON.stringify(sortedCards))

        } else if (req.query.format === "text") {
            res.type('txt').send(getCardsText(sortedCards))
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.get('/exchange/V2', (req, res) => {
    try {
        let sortedCards = cards
            .filter(card => parseInt(card.numberOwned) > 4)
            .sort((a, b) => compareCardById(a, b));
            
        if (req.query.format === undefined || req.query.format === "html") {
            let html = htmlHeader + "Cards available for exchange : <br/>";
            html += getCardsHtmlTableHeaders(sortedCards, true);
            html += "<script>$(document).ready( function () {" +
                "    $('#cardsTable').DataTable();" +
                "} );</script></body>"
            res.type('html').send(html)
        } else if (req.query.format === "json") {
            res.type('json').send(JSON.stringify(sortedCards))

        } else if (req.query.format === "text") {
            res.type('txt').send(getCardsText(sortedCards))
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.post('/card', (req, res) => {
    let regExpFoId = new RegExp('^[0-9]{1,}-.{3}');
    try {
        if (req.query.id === undefined) {
            res.status(400)
            res.type('txt').send("Param id is missing");
            return;
        }
        if (req.query.numberOwned === undefined) {
            res.status(400)
            res.type('txt').send("Param numberOwned is missing");
            return;
        }
        if (!regExpFoId.test(req.query.id)) {
            res.status(400)
            res.type('txt').send("Param id is incorrect must match this regexp /^[0-9]{1,}-.{3}");
            return;
        }
        if (retrieveCardForId(req.query.id) === null) {
            let cardToAdd = new MtgCard(req.query.id, req.query.name, req.query.numberOwned, req.query.imgUrl,
                req.query.manaCost, req.query.cmc, req.query.colorIdentity, req.query.layout,req.query.price);
            addCard(cardToAdd);
            res.type('txt').send("card added with success : " + cardToAdd.name);
        } else {
            res.status(400)
            res.type('txt').send("Cannot add the card it's already present please use the put instead of post")
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});
app.put('/card/:id', (req, res) => {
    try {
        let requestedCardId = req.params.id;
        let requestedCard = retrieveCardForId(requestedCardId);
        if (requestedCard !== null) {
            if (req.query.numberOwned === undefined) {
                res.status(400)
                res.type('txt').send("Param numberOwned is missing");
                return;
            }
            updateCard(requestedCardId, req.query.numberOwned);
            res.type('txt').send("Card succesfully updated : " + requestedCard.name);
        } else {
            res.status(404)
            res.type('txt').send("No card found for this id :" + requestedCardId);
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.put('/cardPrice/:id', (req, res) => {
    try {
        let requestedCardId = req.params.id;
        let requestedCard = retrieveCardForId(requestedCardId);
        if (requestedCard !== null) {
            if (req.query.price === undefined) {
                res.status(400)
                res.type('txt').send("Param price is missing");
                return;
            }
            updateCardPrice(requestedCardId, req.query.price);
            res.type('txt').send("card price updated with success : " + requestedCard.name);
        } else {
            res.status(404)
            res.type('txt').send("No card found for this id :" + requestedCardId);
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.delete('/card', (req, res) => {
    try {
        if (req.query.id === undefined) {
            res.status(400)
            res.type('txt').send("The param id is missing");
            return;
        }
        if (retrieveCardForId(req.query.id) !== null) {
            let deletedCards = _.remove(cards, function (cardToDelete) {
                return cardToDelete.id === req.query.id;
            });
            if (deletedCards.length > 0) {
                mtgCardDB.deleteCard(req.query.id);
                res.type('txt').send("Successfully deleted the card :" + req.query.id);
            } else {
                res.status(400)
                res.type('txt').send("Card was found but not deleted:" + req.query.id);
            }
        } else {
            res.status(404)
            res.type('txt').send("Cannot find the card")
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

https.createServer({
    key: fs.readFileSync("privkey.pem"),
    cert: fs.readFileSync("cert.pem"),
},app).listen(8080,()=>{console.log("Mtg card server is running")}) 

//app.listen(8080, () => console.log("Server started"));