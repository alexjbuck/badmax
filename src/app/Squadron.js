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
            let sr = this.parent.sunrise
            let ss = this.parent.sunset
            return this.sorties.filter(s=>!s.isAlert).filter(s=> s.start > sr && s.end < ss).length
        }
    }
    get night() {
        if (this.parent) {
            let sr = this.parent.sunrise
            let ss = this.parent.sunset
            return this.sorties.filter(s=>!s.isAlert).filter(s=> s.start < sr || s.end > ss).length
        }
    }
}