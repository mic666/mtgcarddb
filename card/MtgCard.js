export default class MtgCard {
    constructor(id, name, numberOwned, imgUrl, manaCost, cmc, colorIdentity, layout) {
        this.id = id;
        this.name = name
        this.imgUrl = imgUrl;
        this.numberOwned = numberOwned;
        this.manaCost = manaCost;
        this.cmc = cmc;
        this.colorIdentity = colorIdentity;
        this.layout = layout;
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