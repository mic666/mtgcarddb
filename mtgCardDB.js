import sqlite from "sqlite3";
import MtgCard from "./MtgCard.js";
import fs from "fs";

const sqlite3 = sqlite.verbose();

function initDB() {
    fs.mkdirSync('./db', {recursive: true});// create the directory if missing
    let mtgCardDb = new sqlite3.Database('./db/mtgCardDB.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the mtgCardDB SQlite database.');
    });
    let createTableSQL = 'CREATE TABLE IF NOT EXISTS mtgCards ( id TEXT PRIMARY KEY , numberOwned INTEGER)';
    mtgCardDb.exec(createTableSQL);
    return mtgCardDb;
}

function closeDB(mtgCardDb) {
    mtgCardDb.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('closing to the mtgCardDB SQlite database.');
    });
}


export function loadAllCards() {
    let mtgCardDb = initDB();
    let cards = [];
    let loadAllCardsSql = 'select * from mtgCards order by id';

    mtgCardDb.all(loadAllCardsSql, (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            let mtgCard = new MtgCard(row.id, row.numberOwned);
            cards.push(mtgCard);
            console.log(mtgCard);
        });
    });
    closeDB(mtgCardDb);
    return cards;
}

export function addCard(card) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('INSERT INTO mtgCards(id,numberOwned) values(?,?)', card.id, card.numberOwned);

    closeDB(mtgCardDb);
    return cards;
}

export function deleteCard(id) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('DELETE FROM mtgCards WHERE ID is ?', id);

    closeDB(mtgCardDb);
    return cards;
}

export function updateCard(id, numberOwned) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('UPDATE mtgCards SET numberOwned=? WHERE ID is ?', numberOwned, id);

    closeDB(mtgCardDb);
    return cards;
}

