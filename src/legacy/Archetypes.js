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

    /**
     * Shift the start and end Date objects by `shift` days. Times are not adjusted (except for when DST changes).
     * Dates are stored as GMT dates, so when DST shifts, the times will shift by one hour.
     * @param {Number} shift The integer number of days to shift.
     */
    shiftDates(shift) {
        this.start.setDate(this.start.getDate()+shift)
        this.end.setDate(this.end.getDate()+shift)
    }

    /**
     * 
     * @param {Date} date The date to set all Date objects to (year,month,day). Time is not adjusted.
     */
    setDates(date) {
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        this.start.setFullYear(year,month,day)
        this.end.setFullYear(year,month,day)
    }
    
}
