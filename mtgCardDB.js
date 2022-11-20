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
    });
    let createTableSQL = 'CREATE TABLE IF NOT EXISTS mtgCards ( id TEXT PRIMARY KEY , numberOwned INTEGER , imgURL VARCHAR)';
    mtgCardDb.exec(createTableSQL);
    return mtgCardDb;
}

function closeDB(mtgCardDb) {
    mtgCardDb.close((err) => {
        if (err) {
            return console.error(err.message);
        }
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
            let mtgCard = new MtgCard(row.id, row.numberOwned,row.imgURL);
            cards.push(mtgCard);
        });
    });
    closeDB(mtgCardDb);
    return cards;
}

export function addCard(card) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('INSERT INTO mtgCards(id,numberOwned,imgURL) values(?,?,?)', card.id, card.numberOwned,card.imgUrl);

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

export function updateCard(id, numberOwned, imgUrl) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('UPDATE mtgCards SET numberOwned=?,imgURL=? WHERE ID is ?', numberOwned, imgUrl, id);

    closeDB(mtgCardDb);
    return cards;
}

