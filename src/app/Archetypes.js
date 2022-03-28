/** 
 * @class
 * @classdesc Abstract superclass for events that occur with a start and end time.
 */
class Event {
    constructor(start,end) {
        this._start = new Date(start);
        this._end = new Date(end);
        this.ID = uuidv4();
    }

    /** @param {Date} start */
    set start(start) {
        this._start = new Date(start);
    }
    get start() {return this._start}

    /** @param {Date} end */
    set end(end) {
        this._end = new Date(end);
    }
    get end() {return this._end}
    
    get duration() {
        return (this.end-this.start)/1000/60/60;
    }

    get night() {
        return false
    }
    
}
