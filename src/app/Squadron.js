class Squadron { 
    constructor(name, cs, tms, modex, day=0, night=0) {
        this.name = name;
        this.cs = cs;
        this.tms = tms;
        this.modex = modex;
        this.ID = uuidv4();
        this._day = day;
        this._night=night;
    }
    static convert({name, cs, tms, modex, _day, _night, ID}) {
        let squadron = new Squadron(name, cs, tms, modex, _day, _night);
        squadron.ID = ID
        return squadron
    }
    get letter() {
        return String.fromCharCode(Object.values(this.parent.squadrons).findIndex(squadron => squadron.ID === this.ID)+65);
    }
    get sorties() {
        if (this.parent) {
            return this.parent.sortieList.filter(s=>s.line.squadronID==this.ID)
        }
    }
    get day() {
        if (this.parent) {
            return new Proxy({},{get:(obj,key) => {
                let sr = this.parent.sunrise
                let ss = this.parent.sunset
                let jd = key.split(',').map(Number)
                return this.sorties.filter(s=>!s.isAlert).filter(s=>s.start.julianDate().toString()===jd.toString()).filter(s=> s.start > sr[jd] && s.end < ss[jd]).length
            }})
        }
    }
    get night() {
        if (this.parent) {
            return new Proxy({},{get:(obj,key)=>{
                let sr = this.parent.sunrise
                let ss = this.parent.sunset
                let jd = key.split(',').map(Number)
                return this.sorties.filter(s=>!s.isAlert).filter(s=>s.start.julianDate().toString()===jd.toString()).filter(s => s.start < sr[jd] && s.start || s.end > ss[jd]).length
            }})
        }
    }
}