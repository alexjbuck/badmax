class Model {
    constructor() {
        this.init()
    }
    
    /**
     * @method init Initializes the model with default values.
     */
    init() {
        this._start          = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(8,0,0,0) )})
        this._start[new Date().julianDate()] = this._start[new Date().julianDate()]
        this._end            = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(18,0,0,0) )})
        this.title           = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : "Airplan Title"})
        this.subtitle        = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : "Subtitle"})
        this._sunrise        = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(6,46,0,0) )})
        this._sunset         = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(19,29,0,0) )})
        this._moonrise       = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(10,8,0,0) )})
        this._moonset        = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(4,20,0,0) )})
        this.moonphase       = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : "__%"})
        this._flightquarters = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(11,30,0,0) )})
        this._heloquarters   = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(10,0,0,0) )})
        this.variation       = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : "__E/W"})
        this.timezone        = new Proxy({},{get:(obj,key) => key in obj ? obj[key] : 'UTC'+Date.fromJulianDate(key.split(',').map(Number)).getTimezoneOffset()/-60})
        this.lines          = {};
        this.sorties        = {}
        this.squadrons      = {};
        this.cycles         = {};
        this.counts         = {};
        this.squadronCycleSortieMap = {};
        this.version        = 2
        this.onChange()
    }
    
    // set date(date) {
    //     this._date = new Date(date);
    //     this._date.setHours(0);
    // }
    set start(start)                    { this._start             = Object.assign({},start)          }
    set end(end)                        { this._end               = Object.assign({},end)            }
    set flightquarters(flightquarters)  { this._flightquarters    = Object.assign({},flightquarters) }
    set heloquarters(heloquarters)      { this._heloquarters      = Object.assign({},heloquarters)   }
    set sunrise(sunrise)                { this._sunrise           = Object.assign({},sunrise)        }
    set sunset(sunset)                  { this._sunset            = Object.assign({},sunset)         }
    set moonrise(moonrise)              { this._moonrise          = Object.assign({},moonrise)       }
    set moonset(moonset)                { this._moonset           = Object.assign({},moonset)        }
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
            let jd = s.start.julianDate()
            if (this.counts[[s.cycle.number,s.line.squadron.letter,...jd]] == undefined) {
                this.counts[[s.cycle.number,s.line.squadron.letter,...jd]] = 1
            } else {
                this.counts[[s.cycle.number,s.line.squadron.letter,...jd]] += 1
            }
            this.squadronCycleSortieMap[s.ID] = this.counts[[s.cycle.number,s.line.squadron.letter,...jd]]
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
        if (data.version == undefined || data.version <= this.version) {
            // Previous API, must upgrade breaking changes.
            // THIS RESETS ALL TIME DATA TO DEFAULTS on upgrade. USER WILL NEED TO SET THIS INFO AGAIN.
            data._start = this.start
            data._end = this.end
            data._sunrise = this.sunrise
            data._sunset = this.sunset
            data._moonrise = this.moonrise
            data._moonset = this.moonset
            data.moonphase = this.moonphase
            data._flightquarters = this.flightquarters
            data._heloquarters = this.heloquarters
            data.variation = this.variation
            // Mark as upgraded
            data.version = 2
        }
        this._start          = new Proxy(data._start,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(8,0,0,0) )})
        this._end            = new Proxy(data._end,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(18,0,0,0) )})
        this.title           = new Proxy(data.title,{get:(obj,key) => key in obj ? obj[key] : "Airplan Title"})
        this.subtitle        = new Proxy(data.subtitle,{get:(obj,key) => key in obj ? obj[key] : "Subtitle"})
        this._sunrise        = new Proxy(data._sunrise,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(6,46,0,0) )})
        this._sunset         = new Proxy(data._sunset,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(19,29,0,0) )})
        this._moonrise       = new Proxy(data._moonrise,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(10,8,0,0) )})
        this._moonset        = new Proxy(data._moonset,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(4,20,0,0) )})
        this.moonphase       = new Proxy(data.moonphase,{get:(obj,key) => key in obj ? obj[key] : "__%"})
        this._flightquarters = new Proxy(data._flightquarters,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(11,30,0,0) )})
        this._heloquarters   = new Proxy(data._heloquarters,{get:(obj,key) => key in obj ? obj[key] : new Date( Date.fromJulianDate(key.split(',').map(Number)).setHours(10,0,0,0) )})
        this.variation       = new Proxy(data.variation,{get:(obj,key) => key in obj ? obj[key] : "__E/W"})
        this.timezone        = new Proxy(data.timezone,{get:(obj,key) => key in obj ? obj[key] : 'UTC'+Date.fromJulianDate(key.split(',').map(Number)).getTimezoneOffset()/-60})
        this.version        = data.version
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
    addSortie(lineID, start, end, startType, endType, note, prenote, postnote, startCycleID, endCycleID, isAlert) {
        let sortie = new Sortie(lineID, start, end, startType, endType, note, prenote, postnote, startCycleID, endCycleID, isAlert)
        sortie.parent = this;
        this.sorties[sortie.ID] = sortie;
        this.onChange()
        return sortie
    }
    editSortie(id, start, end, startType, endType, note, prenote, postnote, startCycleID=null, endCycleID=null, isAlert=false) {
        this.sorties[id].start = start
        this.sorties[id].end = end
        this.sorties[id].startType = startType
        this.sorties[id].endType = endType
        this.sorties[id].note = note
        this.sorties[id].prenote = prenote
        this.sorties[id].postnote = postnote
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

    // get timezone() {
    //     return Object.keys(this.start).reduce((obj,jd) => {
    //         obj[jd] = 'UTC'+this.start[jd].getTimezoneOffset()/-60
    //         return obj
    //     },new Proxy({},{get:(obj,key) => key in obj ? obj[key] : 'UTC'+new Date( new Date().setHours(0,0,0,0) ).getTimezoneOffset()/-60}))
    // }
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

    get startDate() {
        let start =Object.keys(this.start).map(k=>Date.fromJulianDate(k.split(','))).reduce((a,b)=>{return a<b?a:b},Infinity)
        let firstSortie = Object.values(this.sorties).reduce((a,b)=>{
            return a.start<b.start? a : b
        },{start: Infinity})
        let firstCycle = Object.values(this.cycles).reduce((a,b)=>{
            return a.start<b.start? a : b
        },{start: Infinity})
        return new Date(Math.min(firstSortie.start,firstCycle.start,start))
    }

    /**
     * Shift all dates in the Model by `shift` amount.
     * @param {Number} shift Number of days to shift all dates by
     */
    shiftDates(shift) {
        console.log(shift)
        Object.keys(this.sorties).forEach(k => {
            this.sorties[k].shiftDates(shift)
        })
        Object.keys(this.cycles).forEach(k => {
            this.cycles[k].shiftDates(shift)
        })
        this.start          = Object.keys(this.start).reduce((obj,k)=>{obj[k+shift]=this.start[k];return obj},{})
        this.end            = Object.keys(this.end).reduce((obj,k)=>{obj[k+shift]=this.end[k];return obj},{})
        this.flightquarters = Object.keys(this.flightquarters).reduce((obj,k)=>{obj[k+shift]=this.flightquarters[k];return obj},{})
        this.heloquarters   = Object.keys(this.heloquarters).reduce((obj,k)=>{obj[k+shift]=this.heloquarters[k];return obj},{})
        this.sunrise        = Object.keys(this.sunrise).reduce((obj,k)=>{obj[k+shift]=this.sunrise[k];return obj},{})
        this.sunset         = Object.keys(this.sunset).reduce((obj,k)=>{obj[k+shift]=this.sunset[k];return obj},{})
        this.moonrise       = Object.keys(this.moonrise).reduce((obj,k)=>{obj[k+shift]=this.moonrise[k];return obj},{})
        this.moonset        = Object.keys(this.moonset).reduce((obj,k)=>{obj[k+shift]=this.moonset[k];return obj},{})
        this.moonphase      = Object.keys(this.moonphase).reduce((obj,k)=>{obj[k+shift]=this.moonphase[k];return obj},{})
    }

    // changeDate(date) {
    //     Object.keys(this.sorties).forEach(k => {
    //         this.sorties[k].setDates(date)
    //     })
    //     Object.keys(this.cycles).forEach(k => {
    //         this.cycles[k].setDates(date)
    //     })

    //     let year = date.getFullYear()
    //     let month = date.getMonth()
    //     let day = date.getDate()
    //     console.log('Change to: ',year,month,day)
    //     this.start.setFullYear(year,month,day) 
    //     this.end.setFullYear(year,month,day) 
    //     this.flightquarters.setFullYear(year,month,day) 
    //     this.heloquarters.setFullYear(year,month,day) 
    //     this.sunrise.setFullYear(year,month,day) 
    //     this.sunset.setFullYear(year,month,day) 
    //     this.moonrise.setFullYear(year,month,day) 
    //     this.moonset.setFullYear(year,month,day) 
    // }
}