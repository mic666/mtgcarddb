export default class MtgCard {
    constructor(id, numberOwned, imgUrl) {
        this.id = id;
        this.numberOwned = numberOwned;
        this.imgUrl = imgUrl;
    }

    toString() {
        return 'Card :[id:' + this.id + ' number owned:' + this.numberOwned + 'Img URL:' + this.imgUrl + ']';
    }
}