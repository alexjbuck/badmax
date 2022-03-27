/** 
 * @class Sortie
 * @classdesc A sortie has a start and end time.
 * @see Event
 * */
class Sortie extends Event {
    constructor(lineID, start, end, startType, endType, note, startCycleID=null, endCycleID=null, isAlert=false) {
        super(start, end);
        this.lineID = lineID;
        this.startType = startType;
        this.endType = endType;
        this.note = note;
        this.startCycleID = startCycleID;
        this.endCycleID = endCycleID;
        this.isAlert = isAlert
    }
    static defaultDuration = 1;
    static convert({lineID, _start, _end, startType, endType, note, startCycleID=null, endCycleID=null, isAlert=false, ID}) {
        let start = Date.parse(_start);
        let end = Date.parse(_end);
        let sortie = new Sortie(lineID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert);
        sortie.ID = ID
        return sortie;
    }
    
    /** @param {Line} line */
    set line(line) {
        this.lineID = line.ID;
    }
    /** @returns {Line} The line the sortie is on. */
    get line() {
        if (this.parent) {
            return this.parent.lines[this.lineID];
        }
    }

    get startOnCycle() {
        if (this.startCycleID != null) {
            return true;
        } else {
            return false;
        }
    }

    get endOnCycle() {
        if (this.endCycleID != null) {
            return true;
        } else {
            return false;
        }
    }
    
    /** @returns {Date} The start time. If this.startOnCycle, then its the start of the cycle. */
    get start() {
        if (this.startOnCycle && this.parent) {
            this._start = this.parent.cycles[this.startCycleID].start;
        }
        return this._start;
    }
    set start(value) {
        this._start = new Date(value);
        return this._start;
    }
    /** @returns {Date} The end time. If this.endOnCycle, then its the end of the cycle. */
    get end() {
        if (this.endOnCycle && this.parent) {
            this._end = this.parent.cycles[this.endCycleID].end;
        }
        return this._end;
    }
    set end(value) {
        this._end = new Date(value)
        return this._end;
    }

    /** The sortie squadron is set by the line its attached to.
     * @returns {Squadron} The squadron the sortie belongs to.
     */
    get squadron() {
        if (this.parent) {
            return this.parent.squadrons[this.line.squadronID];
        }
    }

    /** Find the cycle the sortie belongs to.
     * A sortie belongs to a cycle if it takes at or after the cycle start and before the cycle end.
     * If a sortie starts before any cycle, it is cycle 0.
     * If a sortie ends after the last cycle, it is the last cycle + 1
     * @returns {Cycle} The cycle the sortie belongs to.
     * */
    get cycle() {
        if (this.parent) {
            let sorted = Object.values(this.parent.cycles).sort((a,b)=>a.start-b.start);
            if (sorted.length<1) {
                return {number:0};
            }
            if (this.start < sorted[0].start) {
                // If the start is before the first cycle, it's cycle 0.
                return {number:0};
            } else if (this.start >= sorted[sorted.length-1].end) {
                // If the start is after the last cycle, it's the last cycle + 1
                return {number:sorted.length+1};
            } else {
                // Otherwise, it's the first cycle that starts before and ends after the start.
                let cycle = sorted.find(c => c.start <= this.start && c.end > this.start)
                if (cycle == undefined) {
                    1+1;
                }
                return cycle ? cycle : {number:0};
            }
        }
    }

    /** Find the cycle the sortie ends in.
     * @returns {String} the event number for the sortie
     * */
    get event() {
        if (this.parent) {
            if (this.isAlert) {
                return '';
            } else {
                return this.cycle.number + this.line.squadron.letter + this.parent.squadronCycleSortieMap[this.ID]
            }
        }
    }

    /** Create a sortie that starts after this sortie. */
    after() {
        if (this.parent) {
            let end = new Date(this.end);
            end.setHours( end.getHours() + Sortie.defaultDuration );
            return new Sortie(this.lineID, this.end, end, this.endType, this.endType, this.note);
        }
    }
    
    /** Create a sortie that starts before this sortie. */
    before() {
        let start = new Date(this.start);
        start.setHours( start.getHours() - Sortie.defaultDuration );
        return new Sortie(this.lineID, start, this.start, this.startType, this.startType, this.note);
    }
}
