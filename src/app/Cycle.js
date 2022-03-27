/**
 * @class Cycle
 * @classdesc A cycle has a start and end time. They're also numbered in order based on start time.
 * @see Event
 */
class Cycle extends Event {
    constructor(start, end) { 
        super(start,end);
    }
    static convert({_start, _end, ID}) {
        let start = Date.parse(_start);
        let end = Date.parse(_end);
        let cycle = new Cycle(start,end);
        cycle.ID = ID;
        return cycle
    }

    get number() {
        if (this.parent) {
            return this.parent.cycleList.findIndex(c=>c.ID == this.ID)+1
        }
    }
   
    get launchCount() {
        if (this.parent) {
            return this.parent.sortieList.filter(s=>!s.isAlert).filter(s=>s.start.valueOf() == this.start.valueOf()).length
        }
    }

    get landCount() {
        if (this.parent) {
            return this.parent.sortieList.filter(s=>!s.isAlert).filter(s=>s.end.valueOf() == this.end.valueOf()).length
        }
    }

    after() {
        // Return a cycle that starts after this cycle.
        let end = new Date(this.end);
        end.setHours( end.getHours() + airplan.defaults.sortieDuration );
        return new Cycle(this.end,end )
    }
    
    before() {
        // Return a cycle that starts before this cycle.
        let start = new Date(this.start);
        start.setHours( start.getHours() - airplan.defaults.sortieDuration );
        return new Cycle(start,this.start)
    }
}