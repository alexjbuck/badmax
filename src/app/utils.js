let config = new Object();
config = {
  body: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    padding: 10,
  },
  title: {
    fontFamily: 'Calibri',
    fontSize: 36,
    padding: 10,
    align: 'center',
  },
  anno: {
    fontFamily: 'sans-serif',
    fontSize: 8,
    padding: 0,
  },
  subtitle: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    padding: 10,
    align: 'center',
  },
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };
  

refresh = function() {

}

Date.prototype.toLocalTimeString = function() {
    // Take a date object and return a string of the format:
    // yyyy-mm-ddTHH:MM and return this in local time.
    // This looks like ISO format but ISO format uses GMT.
    let yyyy = this.getFullYear()
    let mm = this.getMonth() < 9 ? '0'+(+this.getMonth()+1) : this.getMonth()+1 // getMonth returns 0-11
    let dd = this.getDate() < 10 ? '0'+this.getDate() : this.getDate()
    let HH = this.getHours() < 10 ? '0'+this.getHours() : this.getHours()
    let MM = this.getMinutes() < 10 ? '0'+this.getMinutes() : this.getMinutes()
    return yyyy+'-'+mm+'-'+dd+'T'+HH+':'+MM
}

Date.prototype.toYYYYMMDD = function() {
    let yyyy = this.getFullYear()
    let mm = this.getMonth() < 9 ? '0'+(+this.getMonth()+1) : this.getMonth()+1 // getMonth returns 0-11
    let dd = this.getDate() < 10 ? '0'+this.getDate() : this.getDate()
    return yyyy+'-'+mm+'-'+dd
}

Date.prototype.toHHMM = function() {
    // return the datetime object as HHMM string
    let HH = this.getHours() < 10 ? '0'+this.getHours() : this.getHours()
    let MM = this.getMinutes() < 10 ? '0'+this.getMinutes() : this.getMinutes()
    return ''+HH+MM
}

Konva.Node.prototype.drawBoundingBox = function({stroke='black',strokeWidth=1, name='box', fillEnabled='false', fill='',opacity=1,zIndex=0, minSize=15}={}){
    let x=0,y=0
    if (this.nodeType == 'Shape') {
        x = this.x()
        y = this.y()
    } else if (this.nodeType == 'Group') {
        if (this.children.length) {
            x = this.children.map(c=>c.x()-c.offsetX()).reduce((prev,curr)=>Math.min(prev,curr),0)
            y = this.children.map(c=>c.y()-c.offsetY()).reduce((prev,curr)=>Math.min(prev,curr),0)
        }
    }
    let width = this.width()
    let offsetX = this.offsetX()
    if (width < minSize) {
        width = minSize
        offsetX = (minSize-width)/2    
    }
    let height = this.height()
    let offsetY = this.offsetY()
    if (height < minSize) {
        height = minSize
        offsetY = (minSize-height)/2
    }
    let box = new Konva.Rect({
        x: x,
        y: y,
        width: width,
        height: height,
        stroke: stroke,
        strokeWidth: strokeWidth,
        name: name,
        fillEnabled: fillEnabled,
        fill: fill,
        opacity: opacity,
    })
    if (this.nodeType == 'Shape') {
        box.offsetX(offsetX)
        box.offsetY(offsetY)
    }
    return box
}

Konva.Node.prototype.addHighlightBox = function({stroke='#0275d8',strokeWidth=2, name='highlight', fillEnabled='false', fill='', opacity=0, zIndex=0, minSize=10}={},) {
    let box = this.drawBoundingBox({stroke:stroke, strokeWidth:strokeWidth, name:name, fillEnabled:fillEnabled, fill:fill, opacity:opacity, zIndex:zIndex, minSize:minSize})
    
    box.on('mouseenter touchstart pointerdown', function () {
        box.setAttrs({cornerRadius:0, opacity:.8, stroke:stroke, strokeWidth:strokeWidth, shadowBlur:10, shadowColor:'black',})
        this.getStage().container().style.cursor = 'pointer'
    })
    
    box.on('mouseleave touchend pointerup',function() {
        box.setAttrs({opacity:0})
        this.getStage().container().style.cursor = 'default'
    })
    this.add(box)
    return this
}

Konva.Node.prototype.fitWidthToChildren = function({padX=0,padY=0}={}) {
    if (this.children.length>0){
        let width  = this.children.map(c=>{return c.x()+c.width()-c.offsetX() - Math.min(c.x()-c.offsetX(),0)}).reduce((prev,curr)=>Math.max(prev,curr))
        this.width(width+padX)
    }
    return this
}

Konva.Node.prototype.fitHeightToChildren = function({padX=0,padY=0}={}) {
    if (this.children.length>0){
        let height = this.children.map(c=>{return c.y()+c.height()-c.offsetY()-Math.min(c.y()-c.offsetY(),0)}).reduce((prev,curr)=>Math.max(prev,curr))
        this.height(height+padY)
      }
      return this
}
Konva.Node.prototype.fitToChildren = function({padX=0,padY=0}={}) {
    return this.fitWidthToChildren({padX,padY}).fitHeightToChildren({padX,padY})
}


// ^
Konva.Node.prototype.anchorTopMiddle = function({padX=0,padY=0}={}) {
    return this.offsetX(this.width()/2).offsetY(-padY)
}
// <
Konva.Node.prototype.anchorMiddleLeft = function({padX=0,padY=0}={}) {
    return this.offsetY(this.height()/2).offsetX(-padX)
}
// >
Konva.Node.prototype.anchorMiddleRight = function({padX=0,padY=0}={}) {
    return this.offsetY(this.height()/2).offsetX(this.width()+padX)
}
// v
Konva.Node.prototype.anchorBottomMiddle = function({padX=0,padY=0}={}) {
    return this.offsetX(this.width()/2).offsetY(this.height()+padY)
}
// x
Konva.Node.prototype.anchorCenter = function() {
    return this.offsetX(this.width()/2).offsetY(this.height()/2)
}
// `\
Konva.Node.prototype.anchorTopLeft = function({padX=0,padY=0}={}) {
    return this.offsetX(-padX).offsetY(-padY)
}
// /`
Konva.Node.prototype.anchorTopRight = function({padX=0,padY=0}={}) {
    return this.offsetX(this.width()+padX).offsetY(-padY)
}
// _/
Konva.Node.prototype.anchorBottomLeft = function({padX=0,padY=0}={}) {
    return this.offsetY(this.height()+padY).offsetX(-padX)
}
// \_
Konva.Node.prototype.anchorBottomRight = function({padX=0,padY=0}={}) {
    return this.offsetX(this.width()+padX).offsetY(this.height()+padY)
}

Konva.Node.prototype.addTo = function (node) {
    node.add(this)
    return this
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16) );
}

// Returns the cycle number for a sortie based on launch time.
getCycle = ({start}) => {
    if (typeof start == "undefined" || start == null) {
        return "-"
    }
    let sorted = Object.values(airplan.cycles).sort((a,b)=>a.start-b.start)
    if (sorted.length<1) {
        return 0
    }
    if (start < sorted[0].start) {
        // If the start is before the first cycle, it's cycle 0.
        return 0;
    } else if (start >= sorted[sorted.length-1].end) {
        // If the start is after the last cycle, it's the last cycle + 1 (which is the length+1).
        return sorted.length+1;
    } else {
        // Otherwise, it's the first cycle that starts before and ends after the start.
        let cycle = sorted.find(c => c.start <= start && c.end > start).number
        return cycle ? cycle : '-'
    }
}

getSquadron = ({squadron}) => {
    return Object.values(airplan.squadrons).find(s => s.name == squadron)
}

assignEvents = () => {
    // Assign an event code to each sortie. The code is defined as the cycle number, followed by the squadron letter, followed by the sortie number for that squadron within that cycle.
    let counts = {}
    Object.values(airplan.sorties).sort((a,b)=>a.start-b.start).forEach(s=>{
        let cycle = getCycle(s)
        let letter = getSquadron(s).letter
        if (counts[[cycle,letter]] == undefined) {
            counts[[cycle,letter]] = 1
        } else {
            counts[[cycle,letter]] += 1
        }
        s.event = cycle+letter+counts[[cycle,letter]]
    })
}