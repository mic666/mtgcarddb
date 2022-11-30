import _ from "lodash";
import express from "express";
import MtgCard from "./card/MtgCard.js";
import * as mtgCardDB from "./card/mtgCardDB.js";

const app = express();
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
    "<!-- JavaScript Bundle with Popper -->\n" +
    "<script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js\" " +
    "integrity=\"sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4\" " +
    "crossorigin=\"anonymous\"></script>" +
    "</head>\n" +
    "<body>";

function retrieveCardForId(requestedCardId) {
    let requestedCard = null;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === requestedCardId) {
            requestedCard = cards[i];
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
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === requestedCardId) {
            cards[i].numberOwned = numberOwned;
            mtgCardDB.updateCard(requestedCardId, numberOwned);
            break;
        }
    }
    return requestedCard;
}


function getCardImgHtml(card) {
    let splitCardId = card.id.split('-');
    let cardImgHTML = "<a href=\"" + scryfallURL + splitCardId[0] + '/' + splitCardId[1];
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

app.get('/cards', (req, res) => {
    try {
        res.send("Card List : <br/>" + cards)
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

function getCardsHtmlTableHeaders(sortedCards) {
    let tableHtml = "<div class=\"table-responsive-md\">" +
        "<table class=\"table table-striped table-hover align-middle\"><thead class=\"table-dark\"><tr><th>ID</th><th>Name</th><th>Number owned</th>" +
        "<th>Mana cost</th><th>Color identity</th><th>CMC</th><th>Layout</th><th>IMG</th></tr></thead><tbody class=\"table-group-divider\">";
    for (let i = 0; i < sortedCards.length; i++) {
        let cardHtmlRow = "<tr>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].id) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].name) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].numberOwned) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].manaCost) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].colorIdentity) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].cmc) + "</td>";
        cardHtmlRow += "<td>" + dashIfValueNotDefined(cards[i].layout) + "</td>";
        cardHtmlRow += "<td>" + getCardImgHtml(cards[i]) + "</td>";
        cardHtmlRow += "</tr>";
        tableHtml += cardHtmlRow;
    }
    return tableHtml + "</tbody></table></div>"

}

function dashIfValueNotDefined(value) {
    return value === undefined || value === null || value === "" ? "-" : value;
}

app.get('/cards/scryfall', (req, res) => {
    try {

        let html = htmlHeader + "Cards list : <br/>";
        let sortedCards = cards.sort((a, b) => a.id.localeCompare(b.id));
        html += getCardsHtmlTableHeaders(sortedCards);
        html += "</body>"
        res.send(html)
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.get('/cards/:id', (req, res) => {
    try {
        let requestedCardId = req.params.id;
        let requestedCard = retrieveCardForId(requestedCardId);
        if (requestedCard !== null) {
            let title = "Card info : <br/>";
            let cardHTML = getCardHtml(requestedCard);
            res.send(title + cardHTML)
        } else {
            res.status(404)
            res.type('txt').send("No card found for this id :" + requestedCardId);
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.post('/cards', (req, res) => {
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
        if (retrieveCardForId(req.query.id) === null) {
            let cardToAdd = new MtgCard(req.query.id, req.query.name, req.query.numberOwned, req.query.imgUrl,
                req.query.manaCost, req.query.cmc, req.query.colorIdentity, req.query.layout);
            addCard(cardToAdd);
            res.send("carte bien ajoutée : " + cardToAdd);
        } else {
            res.status(304)
            res.type('txt').send("card added with success")
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});
app.put('/cards/:id', (req, res) => {
    try {
        let requestedCardId = req.params.id;
        let requestedCard = retrieveCardForId(requestedCardId);
        if (requestedCard !== null) {
            if (req.query.numberOwned === undefined) {
                res.send("Param numberOwned is missing");
                return;
            }
            updateCard(requestedCardId, req.query.numberOwned);
            res.send("Cartes modifiée avec succès : <br/>" + requestedCard);
        } else {
            res.status(404)
            res.type('txt').send("No card found for this id :" + requestedCardId);
        }
    } catch (e) {
        res.status(500)
        res.type('txt').send("Server error occurs during the processing of the request")
    }
});

app.delete('/cards', (req, res) => {
    try {
        if (req.query.id === undefined) {
            res.send("The param id is missing");
            return;
        }
        if (retrieveCardForId(req.query.id) !== null) {
            let deletedCards = _.remove(cards, function (cardToDelete) {
                return cardToDelete.id === req.query.id;
            });
            if (deletedCards.length > 0) {
                mtgCardDB.deleteCard(req.query.id);
                res.send("Successfully deleted the card :" + req.query.id);
            } else {
                res.status(304)
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

app.listen(8080, () => console.log("Server started"));
