class Model {
    constructor() {
        this.init()
    }
    
    /**
     * @method init Initializes the model with default values.
     */
    init() {
        this._start          = new Date( new Date().setHours(8,0) )
        this._end            = new Date( new Date().setHours(18,0) )
        // this._date           = new Date( this.start.valueOf()/2 + this.end.valueOf()/2 )
        this.title           = "Airplan Title";
        this.subtitle        = "Subtitle";
        this._sunrise        = new Date( new Date().setHours(6,46) )
        this._sunset         = new Date( new Date().setHours(19,29) )
        this._moonrise       = new Date( new Date().setHours(10,8) )
        this._moonset        = new Date( new Date().setHours(4,20) )
        this.moonphase       = "__%";
        this._flightquarters = new Date( new Date() )
        this._heloquarters   = new Date( new Date() )
        this.variation      = "__E/W";
        this.timezone       = "__(+/-)";
        this.lines          = {};
        this.sorties        = {}
        this.squadrons      = {};
        this.cycles         = {};
        this.counts         = {};
        this.squadronCycleSortieMap = {};
        this.onChange()
    }
    
    // set date(date) {
    //     this._date = new Date(date);
    //     this._date.setHours(0);
    // }
    get date() { return new Date(this.start.valueOf()/2 + this.end.valueOf()/2) }
    set start(start)                    { this._start             = new Date(start)          }
    set end(end)                        { this._end               = new Date(end)            }
    set flightquarters(flightquarters)  { this._flightquarters    = new Date(flightquarters) }
    set heloquarters(heloquarters)      { this._heloquarters      = new Date(heloquarters)   }
    set sunrise(sunrise)                { this._sunrise           = new Date(sunrise)        }
    set sunset(sunset)                  { this._sunset            = new Date(sunset)         }
    set moonrise(moonrise)              { this._moonrise          = new Date(moonrise)       }
    set moonset(moonset)                { this._moonset           = new Date(moonset)        }
    // get date()                          { return this._date           } 
    get start()                         { return this._start          }
    get end()                           { return this._end            } 
    get flightquarters()                { return this._flightquarters }
    get heloquarters()                  { return this._heloquarters   }
    get sunrise()                       { return this._sunrise        }   
    get sunset()                        { return this._sunset         }
    get moonrise()                      { return this._moonrise       }
    get moonset()                       { return this._moonset        }
    
    /**
     * @method updateCounts Updates the sortie counts of each squadron-cycle pair. Used to number events.
     */
    updateCounts() {
        this.counts = {}
        this.sortieList.filter(s=>!s.isAlert).sort((a,b)=>a.start-b.start).forEach(s=>{
            if (this.counts[[s.cycle.number,s.line.squadron.letter]] == undefined) {
                this.counts[[s.cycle.number,s.line.squadron.letter]] = 1
            } else {
                this.counts[[s.cycle.number,s.line.squadron.letter]] += 1
            }
            this.squadronCycleSortieMap[s.ID] = this.counts[[s.cycle.number,s.line.squadron.letter]]
        })  
    }

    /**
     * @callback onChange Stub for the local callback function for when the model changes.
     */
    onChange() {}

    /**
     * @method bindOnChange The hook exposed to the controller for when the model changes.
     * @param {Function} handler The callback function from the controller to execute when the model is updated
     */
    bindOnChange(handler) {
        this.onChange = () => {
            this.updateCounts()
            handler()
        }
    }

    load(data) {
        this.init()
        // this.date           = data._date
        this.start          = data._start
        this.end            = data._end
        this.title          = data.title
        this.sunrise        = data._sunrise
        this.sunset         = data._sunset
        this.moonrise       = data._moonrise
        this.moonset        = data._moonset
        this.moonphase      = data.moonphase
        this.flightquarters = data._flightquarters
        this.heloquarters   = data._heloquarters
        this.variation      = data.variation
        this.timezone       = data.timezone
        /**
         * The parent value needs to be reassigned to each object because it is stripped
         * from the JSON. It is stripped because it causes a circular reference.
         * Object.assign preserves all the properties of the json object, without calling the 
         * constructor. That means ID values are preserved.
         */
        Object.values(data.squadrons).forEach(s=>{
            this.squadrons[s.ID] = Squadron.convert(s)
            this.squadrons[s.ID].parent = this;
        })
        Object.values(data.cycles).forEach(c=>{
        this.cycles[c.ID] = Cycle.convert(c)
            this.cycles[c.ID].parent = this;
        })
        Object.values(data.lines).forEach(l=>{
            this.lines[l.ID] = Line.convert(l)
            this.lines[l.ID].parent = this;
        })
        Object.values(data.sorties).forEach(s=>{
            this.sorties[s.ID] = Sortie.convert(s)
            this.sorties[s.ID].parent = this;
        })
        this.onChange()    
    }
    
    async removeSquadron(id) {
        this.lineList.filter(l=>l.squadronID == id).forEach(l=>{
            this.removeLine(l.ID)
        })
        delete this.squadrons[id]
        this.onChange()
    }
    addSquadron(name, cs, tms, modex) {
        let squadron = new Squadron(name, cs, tms, modex)
        squadron.parent = this;
        this.squadrons[squadron.ID] = squadron;        
        this.onChange()
        return squadron
    }
    editSquadron(id, name, cs, tms, modex) {
        this.squadrons[id].name = name
        this.squadrons[id].cs = cs
        this.squadrons[id].tms = tms
        this.squadrons[id].modex = modex
        this.onChange()
    }

    async removeLine(id) {
        this.sortieList.filter(s=>s.lineID == id).forEach(s=>{
            this.removeSortie(s.ID)
        })
        delete this.lines[id]
        this.onChange()
    }
    addLine(squadronID) {
        let line = new Line(squadronID)
        line.parent = this;
        this.lines[line.ID] = line;
        this.onChange()
        return line;
    }
    editLine(lineID,squadronID) {
        this.lines[lineID].squadronID = squadronID
        this.onChange()
    }
    
    async removeSortie(id) {
        delete this.sorties[id]
        this.onChange()
    }
    addSortie(lineID, start, end, startType, endType, note, startCycleID=null, endCycleID=null, isAlert=false) {
        let sortie = new Sortie(lineID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert)
        sortie.parent = this;
        this.sorties[sortie.ID] = sortie;
        this.onChange()
        return sortie
    }
    editSortie(id, start, end, startType, endType, note, startCycleID=null, endCycleID=null, isAlert=false) {
        this.sorties[id].start = start
        this.sorties[id].end = end
        this.sorties[id].startType = startType
        this.sorties[id].endType = endType
        this.sorties[id].note = note
        this.sorties[id].startCycleID = startCycleID
        this.sorties[id].endCycleID = endCycleID
        this.sorties[id].isAlert = isAlert
        this.onChange()
    }
    
    async removeCycle(id) {
        delete this.cycles[id]
        this.onChange()
    }
    addCycle(start, end) {
        let cycle = new Cycle(start, end);
        cycle.parent = this;
        this.cycles[cycle.ID] = cycle;
        this.onChange()
        return cycle
    }
    editCycle(id,start,end) {
        this.cycles[id].start = start
        this.cycles[id].end = end
        this.onChange()
    }

    get sortieList() {
        return Object.values(this.sorties)
    }

    get lineList() {
        return Object.values(this.lines)
    }

    get cycleList() {
        return Object.values(this.cycles).sort((a,b)=>a.start-b.start)
    }

    /**
     * Default behavior for end => start mapping
     */
    get endStartTypeMap() {
        let map = {
            'hp': 'hp',
            'hpcs': 'hpcs',
            'stuff': 'pull',
            'flyoff': 'flyon',
        }
        return map
    }
    /**
     * Default behavior for start => end mapping.
     */
    get startEndTypeMap() {
        let map = {
            'hp': 'hp',
            'hpcs': 'hpcs',
            'pull': 'stuff',
            'flyon': 'stuff',
        }
        return map
    }

    toggleLineDisplay(id) {
        this.lines[id].toggleDisplay()
    }
}