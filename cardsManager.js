import _ from "lodash";
import express from "express";
import MtgCard from "./MtgCard.js";
import * as mtgCardDB from "./mtgCardDB.js";

const app = express();
let cards = mtgCardDB.loadAllCards();
let scryfallURL = 'https://scryfall.com/card/';

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

function updateCard(requestedCardId, numberOwned,imgURL) {
    let requestedCard = null;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === requestedCardId) {
            cards[i].numberOwned = numberOwned;
            cards[i].imgUrl = imgURL;
            mtgCardDB.updateCard(requestedCardId, numberOwned,imgURL);
            break;
        }
    }
    return requestedCard;
}

function getCardHtml(card) {
    let splitCardId = card.id.split('-');
    let cardHTML = "<h3>" + card.id + ":</h3>"
    cardHTML += "<a href=\"" + scryfallURL + splitCardId[0] + '/' + splitCardId[1];
    cardHTML += "\" target=\"_blank\" rel=\"noopener noreferrer\">"
    cardHTML += "<img src=\"" + card.imgUrl+"?format=image&version=small\" alt='" + card.id + "'>";
    cardHTML += "</a>" + "<br/>";
    cardHTML += " Number owned :" + card.numberOwned;
    return cardHTML;
}


app.get('/cards', (req, res) => {
    res.send("Liste des cartes : <br/>" + cards)
});

app.get('/cards/scryfall', (req, res) => {
    let title = "Liste des cartes : <br/>";
    let sortedCards = cards.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < sortedCards.length; i++) {
        let cardHTML = getCardHtml(sortedCards[i]);
        title += cardHTML;
    }
    res.send(title)
});

app.get('/cards/:id', (req, res) => {
    let requestedCardId = req.params.id;
    let requestedCard = retrieveCardForId(requestedCardId);
    if (requestedCard !== null) {
        let title = "Détail carte<br/>";
        let cardHTML = getCardHtml(requestedCard);
        res.send(title + cardHTML)
    } else {
        res.status(404)
        res.type('txt').send("Pas de carte trouvée pour l'id :" + requestedCardId);
    }
});

app.post('/cards', (req, res) => {
    if (req.query.id === undefined) {
        res.status(400)
        res.type('txt').send("le paramètre id est manquant");
        return;
    }
    if (req.query.numberOwned === undefined) {
        res.status(400)
        res.type('txt').send("le paramètre numberOwned est manquant");
        return;
    }
    if (retrieveCardForId(req.query.id) === null) {
        let cardToAdd = new MtgCard(req.query.id, req.query.numberOwned,req.query.imgUrl);
        cards.push(cardToAdd);
        mtgCardDB.addCard(cardToAdd);
        res.send("carte bien ajoutée : " + cardToAdd);
    } else {
        res.status(304)
        res.type('txt').send("Carte déja présente pas possible d'ajouter")
    }

});

app.put('/cards/:id', (req, res) => {
    let requestedCardId = req.params.id;
    let requestedCard = retrieveCardForId(requestedCardId);
    if (requestedCard !== null) {
        if (req.query.numberOwned === undefined) {
            res.send("le paramètre numberOwned est manquant");
            return;
        }
        updateCard(requestedCardId, req.query.numberOwned,req.query.imgUrl);
        res.send("Cartes modifiée avec succès : <br/>" + requestedCard);
    } else {
        res.status(404)
        res.type('txt').send("Pas de carte trouvée pour l'id :" + requestedCardId);
    }
});

app.delete('/cards', (req, res) => {
    if (req.query.id === undefined) {
        res.send("le paramètre id est manquant");
        return;
    }
    if (retrieveCardForId(req.query.id) !== null) {
        let deletedCards = _.remove(cards, function (cardToDelete) {
            return cardToDelete.id === req.query.id;
        });
        if (deletedCards.length > 0) {
            mtgCardDB.deleteCard(req.query.id);
            res.send("carte supprimée avec succès :" + req.query.id);
        } else {
            res.status(304)
            res.type('txt').send("carte trouvée mais pas supprimée:" + req.query.id);
        }
    } else {
        res.status(404)
        res.type('txt').send("carte non trouvée pas possible de la supprimée")
    }
});

app.listen(8080, () => console.log("J'écoute"));
