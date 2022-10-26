export default class MtgCard {
    constructor(id, numberOwned) {
        this.id = id;
        this.numberOwned = numberOwned;
    }

    toString() {
        return 'Card :[id:' + this.id + ' number owned:' + this.numberOwned + ']';
    }
}