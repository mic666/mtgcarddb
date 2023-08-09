export default class MtgCard {
    constructor(id, name, numberOwned, imgUrl, manaCost, cmc, colorIdentity, layout,price) {
        this.id = id;
        this.name = name
        this.imgUrl = imgUrl;
        this.numberOwned = numberOwned;
        this.manaCost = manaCost;
        this.cmc = cmc;
        this.colorIdentity = colorIdentity;
        this.layout = layout;
        this.price = price;
    }

    toString() {
        return 'Card :[id:' + this.id
            + ' name:' + this.name
            + ' number owned:' + this.numberOwned
            + ' Img URL:' + this.imgUrl + ']'
            + ' mana cost:' + this.manaCost
            + ' cmc:' + this.cmc
            + ' colorIdentity:' + this.colorIdentity
            + ' layout:' + this.layout;
    }


}
export function compareCardById(card, cardToCompare) {
    let splitIdCard = card.id.split('-');
    let splitIdCardToCompare = cardToCompare.id.split('-');
    if (splitIdCard[1] === splitIdCardToCompare[1]) {
        return Number(splitIdCard[0]) - Number(splitIdCardToCompare[0]);
    } else {
        return splitIdCard[1].localeCompare(splitIdCardToCompare[1]);
    }
}

export function compareCardByName(card, cardToCompare) {
   return card.name.localeCompare(cardToCompare)
}