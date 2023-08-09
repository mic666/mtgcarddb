import sqlite from "sqlite3";
import MtgCard from "./MtgCard.js";
import fs from "fs";

const sqlite3 = sqlite.verbose();

function initDB() {
    fs.mkdirSync('./db', { recursive: true });// create the directory if missing
    let mtgCardDb = new sqlite3.Database('./db/mtgCardDB.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
    let createTableSQL = 'CREATE TABLE IF NOT EXISTS mtgCards ( id TEXT PRIMARY KEY, name VARCHAR , numberOwned INTEGER , imgURL VARCHAR, manaCost VARCHAR , cmc NUMERIC , colorIdentity VARCHAR, layout VARCHAR, price VARCHAR)';
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
            let mtgCard = new MtgCard(row.id, row.name, row.numberOwned, row.imgURL, row.manaCost, row.cmc, row.colorIdentity, row.layout,row.price);
            cards.push(mtgCard);
        });
    });
    closeDB(mtgCardDb);
    return cards;
}

export function addCard(card) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('INSERT INTO mtgCards(id,name,numberOwned,imgURL,manaCost,cmc,colorIdentity,layout,price) values(?,?,?,?,?,?,?,?,?)',
        card.id, card.name, card.numberOwned, card.imgUrl, card.manaCost, card.cmc, card.colorIdentity, card.layout,card.price);

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

export function updateNumberOwnedCard(id, numberOwned) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('UPDATE mtgCards SET numberOwned=? WHERE ID is ?', numberOwned, id);

    closeDB(mtgCardDb);
    return cards;
}
export function updateCardPrice(id, price) {
    let mtgCardDb = initDB();
    let cards = [];
    mtgCardDb.run('UPDATE mtgCards SET price=? WHERE ID is ?', price, id);

    closeDB(mtgCardDb);
    return cards;
}

