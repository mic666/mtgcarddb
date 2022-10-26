import _ from "lodash";
import express from "express";
import MtgCard from "./MtgCard.js";
import * as mtgCardDB from "./mtgCardDB.js";

const app = express();
let cards = mtgCardDB.loadAllCards();

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

app.get('/cards', (req, res) => {
    res.send("Liste des cartes : <br/>" + cards)
});

app.get('/cards/:id', (req, res) => {
    let requestedCardId = req.params.id;
    let requestedCard = retrieveCardForId(requestedCardId);
    if (requestedCard !== null) {
        res.send("Cartes trouvée : <br/>" + requestedCard);
    } else {
        res.send("Pas de carte trouvée pour l'id :" + requestedCardId);
    }
});

app.post('/cards', (req, res) => {
    if (req.query.id === undefined) {
        res.send("le paramètre id est manquant");
        return;
    }
    if (req.query.numberOwned === undefined) {
        res.send("le paramètre numberOwned est manquant");
        return;
    }
    if (retrieveCardForId(req.query.id) === null) {
        let cardToAdd = new MtgCard(req.query.id, req.query.numberOwned);
        cards.push(cardToAdd);
        mtgCardDB.addCard(cardToAdd);
        res.send("carte bien ajoutée : " + cardToAdd);
    } else {
        res.send("Carte déja présente pas possible d'ajouter")
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
            res.send("carte supprimée avec succès :" + req.query.id);
        } else {
            res.send("carte trouvée mais pas supprimée:" + req.query.id);
        }
    } else {
        res.send("carte non trouvée pas possible de la supprimée")
    }
});

app.listen(8080, () => console.log("J'écoute"));
