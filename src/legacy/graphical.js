// {padX=0,padY=0}={} allows for default values of padX and padY. 
// If a param object isn't passed, the ={} is needed to not thrown an error on destructuring
fitWidthToChildren = function(p,{padX=0,padY=0}={}) {
  if (p.children.length>0){
    let width  = p.children.map(c=>{return c.x()+c.width()-c.offsetX() - Math.min(c.x()-c.offsetX(),0)}).reduce((prev,curr)=>Math.max(prev,curr))
    p.width(width+padX)
  }
  return p
}

fitHeightToChildren = function(p,{padX=0,padY=0}={}) {
  if (p.children.length>0){
    let height = p.children.map(c=>{return c.y()+c.height()-c.offsetY()-Math.min(c.y()-c.offsetY(),0)}).reduce((prev,curr)=>Math.max(prev,curr))
    p.height(height+padY)
  }
  return p
}

fitSizeToChildren = function(p,{padX=0,padY=0}={}) {
  p = fitWidthToChildren(p,{padX,padY})
  p = fitHeightToChildren(p,{padX,padY})
  return p
}

fitStageIntoParentContainer = function({stage, sceneHeight, sceneWidth}) {
  if (this === window) {
    stage = g.stage;
    sceneHeight = g.sceneHeight;
    sceneWidth = g.sceneWidth;
  }
  var container = document.querySelector('#graphic-stage');
  // now we need to fit stage into parent container
  var containerWidth = container.offsetWidth;
  // but we also make the full scene visible so we need to scale all objects on canvas
  var scale = containerWidth / g.sceneWidth;
  stage.width(g.sceneWidth * scale);
  stage.height(g.sceneHeight * scale);
  stage.scale({ x: scale, y: scale });
}
window.addEventListener('resize', fitStageIntoParentContainer);



// blurChildren = function(p, {shadowBlur}={shadowBlur:10}) {
//   if (p.children){
//     p.children.forEach(c=>{
//       blurChildren(c,{shadowBlur})
//     })
//   } else {
//     p.setAttrs({shadowBlur:shadowBlur, shadowColor:'black',})
//   }
// }

// unBlurChildren = function(p) {
//   blurChildren(p, {shadowBlur:0})
// }

HighlightBox = function(c,{stroke='#0275d8',strokeWidth=2, name='highlight', fillEnabled='false', fill='', opacity=0, zIndex=0, minSize=10}={},){
  let box = drawBoundingBox(c,{stroke:stroke, strokeWidth:strokeWidth, name:name, fillEnabled:fillEnabled, fill:fill, opacity:opacity, zIndex:zIndex, minSize:minSize})

  box.on('mouseenter touchstart pointerdown', function () {
    box.setAttrs({cornerRadius:0, opacity:.8, stroke:stroke, strokeWidth:strokeWidth, shadowBlur:10, shadowColor:'black',})
    g.stage.container().style.cursor = 'pointer'
  })
  
  box.on('mouseleave touchend pointerup',function() {
    box.setAttrs({opacity:0})
    g.stage.container().style.cursor = 'default'
  })
  return box
}


time2pixels = function(h,p) {
  let pixels = (h.valueOf()-airplan.start.valueOf()) * p.width()/(airplan.end.valueOf()-airplan.start.valueOf())
  pixels = pixels<0 ? 0 : pixels
  pixels = pixels>p.width() ? p.width(): pixels
  return pixels
}

var g = {
  // Page Margin
  m: 10,
  
  // This means that the scene drawn in units of 1/10th inch. 
  // Also forces aspect ratio to be 11:8.5, which is the ratio of the paper size.
  sceneWidth: 1100,
  sceneHeight: 850,
}

g.draw = function() {
  this.makeStage();
  fitStageIntoParentContainer(this);
}

g.makeStage = function() {
  console.log('Make Stage')
  let stage = new Konva.Stage({
    container: 'graphic-stage',   // id of container <div>
    width: this.sceneWidth,
    height: this.sceneHeight,
    name: 'stage',
  });
  this.stage = stage;
  stage.pageLayer = this.makePageLayer(stage);
  stage.add(stage.pageLayer)  
  return stage;
}

// Page area is the whole page, then add it to stage, draw it, and add a red bounding box
g.makePageLayer = function(p) {
  console.log('Make Page Layer')
  let pageLayer = new Konva.Layer({
    name: 'pageLayer',
  });
  pageLayer.printArea = this.makePrintArea(pageLayer);
  pageLayer.add(pageLayer.printArea);
  return pageLayer;
}

// Print Area is the printable area, inset by a margin of g.m on all sides, add it to stage, and draw it
g.makePrintArea = function(p) {
  console.log('Make Print Area')
  let printArea = new Konva.Group({
    x: this.m,
    y: this.m,  
    width: this.sceneWidth-2*this.m,
    height: this.sceneHeight-2*this.m,
    name: 'printArea',
  })
  printArea.add( drawBoundingBox(printArea,{name:'printAreahighlight'}) )
  
  printArea.header = this.makeHeader(printArea);
  printArea.events = this.makeEvents(printArea);
  printArea.add(printArea.header);
  printArea.add(printArea.events);
  return printArea;
}

g.makeHeader = function(p) {
  console.log('Make Header')
  let header = new Konva.Group({
    x: 0,
    y: 0,
    width: p.width(),
    height: 100,
    name: 'header',
  });
  header.slap = this.makeSlap(header);
  header.title = this.makeTitle(header);
  header.time = this.makeTime(header);
  header.add(header.slap);
  header.add(header.title);
  header.add(header.time);
  header = fitHeightToChildren(header,{padY:this.m})
  let bottomLine = new Konva.Line({
    points: [0, header.height(), header.width(), header.height()],
    stroke: 'black',
    strokeWidth: 1,
    name: 'header.line'
  });
  header.add(bottomLine);
  // header.draw()
  return header
}

g.makeSlap = function(p) {
  let slap = new Konva.Group({
    x: config.body.padding,
    y: config.body.padding,
    name: 'slap',
  })
  // Label Text
  var slapLabel = new Konva.Text({
    text: Object.keys(airplan.slap).join('\n').toUpperCase(),
    fontSize: config.body.fontSize,
    align: 'left',
    fontFamily: config.body.fontFamily,
    name: 'slap.label',
  });
  // SLAP Data
  var slapData = new Konva.Text({
    text: Object.values(airplan.slap).map((v)=>{
      if(typeof(v)=='object'){
        return v.toHHMM()
      } else {
        return v
      }
    }).join('\n'),
    fontSize: slapLabel.fontSize(),
    fontFamily: slapLabel.fontFamily(),
    name: 'slap.data',
  });
  slapData.offsetX(-1*(slapLabel.width()+config.body.padding));  
  // Add to Group
  slap.add(slapLabel, slapData);
  slap = fitSizeToChildren(slap)
  slap.add( HighlightBox(slap) )
  slap.on('click tap', function () {
    openModal(g.editSlapForm())
    $('#sunrise').val(airplan.slap.sunrise.toLocalTimeString())
    $('#sunset').val(airplan.slap.sunset.toLocalTimeString())
    $('#moonrise').val(airplan.slap.moonrise.toLocalTimeString())
    $('#moonset').val(airplan.slap.moonset.toLocalTimeString())
    $('#moonphase').val(airplan.slap.moonphase)
  });
  return slap
}

g.makeTitle = function(p) {
  let title = new Konva.Group({
    x: p.width()/2,
    y: config.body.padding,
    name: 'title',
  })
  // Title Text
  var titleText = new Konva.Text({
    text: airplan.title,
    fontSize: config.title.fontSize,
    fontFamily: config.title.fontFamily,
    align: config.title.align,
    name: 'title.title',
  });
  // Subtitle Text
  var subTitleText = new Konva.Text({
    y: titleText.height() + config.subtitle.padding,
    text: airplan.date.toDateString(),
    fontSize: config.subtitle.fontSize,
    fontFamily: config.subtitle.fontFamily,
    align: config.subtitle.align,
    name: 'title.subtitle',
  });
  // Add to Group
  title.add(titleText,subTitleText);
  title.children.forEach(c=>{c.offsetX(c.width()/2)})
  title = fitSizeToChildren(title)
  title.add( HighlightBox(title) )
  title.on('click tap', function(e) {
    openModal(g.editTitleForm())
    $('#title').val(airplan.title)
    $('#date').val(airplan.date.toYYYYMMDD())
  })
  return title
}

g.makeTime = function(p) {
  let time = new Konva.Group({
    x: p.width()-config.body.padding,
    y: config.body.padding,
    name: 'time',
  })
  // Time Label
  let timeLabel = new Konva.Text({
    text: ['flight quarters:','Helo quarters:','Mag Var:','Time Zone:'].join('\n').toUpperCase(),
    fontSize: config.body.fontSize,
    fontFamily: config.body.fontFamily,
    align: 'right',
    name: 'time.label',
  });
  // Time Data
  let timeData = new Konva.Text({
    x: timeLabel.width()+config.body.padding,
    text: ['flightquarters','heloquarters','variation','timezone'].map((k)=>{
      let v = airplan[k]
      if(typeof(v)=='object'){
        return v.toHHMM()
      } else {
        return v
      }
    }).join('\n'),
    fontSize: timeLabel.fontSize(),
    fontFamily: timeLabel.fontFamily(),
    name: 'time.data',
  });
  // Add to Group
  time.add(timeLabel,timeData);
  time = fitSizeToChildren(time);
  time.offsetX(time.width())
  time.add( HighlightBox(time) )
  time.on('click tap', function(e) {
    openModal(g.editTimeForm())
    $('#fq').val(airplan.flightquarters.toLocalTimeString())
    $('#hq').val(airplan.heloquarters.toLocalTimeString())
    $('#variation').val(airplan.variation)
    $('#timezone').val(airplan.timezone)
  })
  return time
}

g.makeEvents = function(p) {
  console.log('Make Events')
  let events = new Konva.Group({
    x: 0,
    y: p.header.height(),
    width: p.width(),
    height: p.height()-p.header.height(),
    name: 'events',
  })
  events.leftColWidth = 100
  events.rightColWidth = 50
  this.time2pixels = (events.width()-events.leftColWidth-events.rightColWidth)/(airplan.end-airplan.start)
  
  events.timeline = this.makeTimeline(events)
  events.cycleTotals = this.makeCycleTotals(events)
  events.squadrons = this.makeSquadrons(events)
  events.add(events.timeline)
  events.add(events.cycleTotals)
  events.add(events.squadrons)
  return events
}

g.makeTimeline = function(p){
  console.log('Make Timeline')
  let timeline = new Konva.Group({
    x: 0,
    y: 0,
    width: p.width(),
    height:40,
    name: 'timeline'
  })
  timeline.add( new Konva.Line({
    points: [0,timeline.height()/2,timeline.width(),timeline.height()/2],
    stroke: 'black',
    strokeWidth: 1,
  }))
  timeline.add( new Konva.Line({
    points: [0,timeline.height()  ,timeline.width(),timeline.height()  ],
    stroke: 'black',
    strokeWidth: 1,
  }))
  // Create a timebox that is sized to use this.time2pixels conversions
  timeline.timebox = new Konva.Group({
    x: p.leftColWidth,
    y: 0,
    width: timeline.width() - p.leftColWidth - p.rightColWidth,
    height: timeline.height(),
    name: 'timeline.timebox'
  })
  timeline.add(timeline.timebox)
  timeline.timebox.on('click tap', function () {
    openModal(g.editTimelineForm())
    $('#start').val(airplan.start.toLocalTimeString())
    $('#end').val(airplan.end.toLocalTimeString())
  })
  
  let startTime = new Konva.Text({
    x: 0,
    y: timeline.timebox.height(),
    text: `\u21A6${airplan.start.toHHMM()}`,
  })
  let endTime = new Konva.Text({
    x: timeline.timebox.width(),
    y: timeline.timebox.height(),
    text: airplan.end.toHHMM()+'\u21A4',
  })
  endTime.offsetX(endTime.width())
  timeline.timebox.add(startTime,endTime)
  timeline.timebox.add( HighlightBox(timeline.timebox) )
  
  // Sunrise
  timeline.timebox.add( new Konva.Arc({
    x: time2pixels(airplan.slap.sunrise,timeline.timebox),
    y: 20,
    innerRadius: 0,
    outerRadius: 15,
    angle: 180,
    clockwise: true,
    stroke: 'black',
    strokeWidth: 1,
    name: 'sunrise.icon'
  }))
  timeline.find('.sunrise.icon').forEach((s)=>{
    timeline.timebox.add( new Konva.Text({
      x: s.x(),
      y: s.y(),
      text: airplan.slap.sunrise.toHHMM(),
      name: 'sunrise.text',
    }))
  })
  // Sunset
  timeline.timebox.add( new Konva.Arc({
    x: time2pixels(airplan.slap.sunset,timeline.timebox),
    y: 20,
    innerRadius: 0,
    outerRadius: 15,
    angle: 180,
    clockwise: true,
    stroke: 'black',
    fill: 'black',
    strokeWidth: 1,
    name: 'sunset.icon'
  }))
  timeline.find('.sunset.icon').forEach((s)=>{
    timeline.timebox.add( new Konva.Text({
      x: s.x(),
      y: s.y(),
      text: airplan.slap.sunset.toHHMM(),
      name: 'sunrise.text',
    }))
  })
  
  // Iterate over all cycles.
  Object.values(airplan.cycles).forEach((cycle)=>{
    // Cycle start line
    let x = time2pixels(cycle.start,timeline.timebox)
    timeline.timebox.add( new Konva.Line({
      points: [x,timeline.height()  ,x,p.height()  ],
      stroke: 'black',
      strokeWidth: 1,
      name: 'cycle.start'
    }))
    // Cycle launch total
    let launchLabel = new Konva.Text({
      x: x,
      y: p.height(),
      text: "0",
    })
    launchLabel.offsetX(launchLabel.width()+g.m/2)
    launchLabel.offsetY(launchLabel.height())
    timeline.timebox.add(launchLabel)
    // Cycle Start Time
    let startLabel = new Konva.Text({
      x: x,
      y: timeline.timebox.height(),
      text: cycle.start.toHHMM(),
    })
    startLabel.offsetX(startLabel.width()/2)
    startLabel.offsetY(startLabel.height())
    timeline.timebox.add(startLabel)
    // Cycle label
    x = time2pixels((cycle.start.valueOf()+cycle.end.valueOf())/2,timeline.timebox)
    let cycleText = new Konva.Text({
      x: x,
      y: timeline.height(),
      text: cycle.number,
    })
    timeline.timebox.add(cycleText)
    cycleText.offsetY(cycleText.height())
    // Cycle end line
    x = time2pixels(cycle.end,timeline.timebox)
    timeline.timebox.add( new Konva.Line({
      points: [x,timeline.height(),  x,p.height()  ],
      stroke: 'black',
      strokeWidth: 1,
      name: 'cycle.end'
    }))
    // Cycle End label
    let endLabel = new Konva.Text({
      x: x,
      y: timeline.timebox.height(),
      text: cycle.end.toHHMM(),
    })
    endLabel.offsetX(endLabel.width()/2)
    endLabel.offsetY(endLabel.height())
    timeline.timebox.add(endLabel)
    // Cycle return total
    let returnLabel = new Konva.Text({
      x: x,
      y: p.height(),
      text: "0",
    })
    returnLabel.offsetX(-g.m/2)
    returnLabel.offsetY(returnLabel.height())
    timeline.timebox.add(returnLabel)
  })
  // Draw the highlight box on top of everything.
  // We need to create it earlier so that it doesn't go around the cycle lines, just the timebox bar at the top.
  timeline.findOne('.highlight').zIndex(timeline.timebox.children.length-1)
  return timeline
}

g.makeCycleTotals = function(p){
  console.log('Make Cycle Totals')
  let cycleTotals = new Konva.Group({
    x: 0,
    y: p.height(),
    width: p.width(),
    height: 20,
    name: 'cycleTotals'
  })
  cycleTotals.offsetY(cycleTotals.height())
  // drawBoundingBox(cycleTotals,{stroke:'green', fillEnabled:true, fill: 'green'})
  return cycleTotals
}

g.makeSquadrons = function(p){
  console.log('Make Squadrons')
  let squadrons = new Konva.Group({
    x: 0,
    y: p.timeline.height(),
    width: p.width(),
    height:p.height()-p.cycleTotals.height()-p.timeline.height(),
    name: 'squadrons'
  })
  // Right border of squadron labels
  squadrons.add( new Konva.Line({
    points:[p.leftColWidth,0,  p.leftColWidth,squadrons.height()],
    stroke: 'black',
    strokeWidth: 1,
  }))
  let header = new Konva.Text({
    x: p.leftColWidth/2,
    y: 0,
    text: 'SQUADRON',
    align: 'center',
    style: 'bold',
  })
  header.offsetX(header.width()/2)
  header.offsetY(header.height())
  squadrons.add(header)
  squadrons.leftColWidth = p.leftColWidth
  squadrons.rightColWidth = p.rightColWidth
  squadrons.squadronGroups = []
  // --------- Loop over all squadrons ---------
  Object.values(airplan.squadrons).forEach((s,i)=>{
    let group = this.makeSquadronGroup(s,i,squadrons)
    squadrons.squadronGroups.push(group)
    squadrons.add(group)
  })
  return squadrons  
}

g.makeSquadronGroup = function(sq,i,p) {
  let n = Object.values(airplan.squadrons).length
  let squadronHeight = p.height()/n
  let group = new Konva.Group({
    x:0,
    y:i*squadronHeight,
    width: p.width(),
    height: squadronHeight,
    name: 'squadron.group'
  })
  group.add( new Konva.Line({
    points: [0,group.height(),  group.width(), group.height()],
    stroke: 'black',
    strokeWidth: 1,
    name:'squadron.bottomline'
  }))
  // vertical line between text and letter
  let letterWidth = 15
  group.add( new Konva.Line({
    points: [p.leftColWidth-letterWidth, 0, p.leftColWidth-letterWidth, group.height()],
    stroke: 'black',
    strokeWidth: 1,
  }))
  // A,B,C,... letter labels
  let letterText = new Konva.Text({
    x: p.leftColWidth-letterWidth/2,
    y: group.height()/2,
    text: sq.letter,
    align: 'center',
    name: 'squadron.letter'
  })
  letterText.offsetX(letterText.width()/2)
  letterText.offsetY(letterText.height()/2)
  // Squadron name/cs/type/modex labels
  let groupText = new Konva.Text({
    x: (p.leftColWidth-letterWidth)/2,
    y: group.height()/2,
    text: [sq.name, sq.cs, sq.tms, sq.modex].join('\n').toUpperCase(),
    align: 'center',
    name: 'squadron.name'
  })
  groupText.offsetX(groupText.width()/2)
  groupText.offsetY(groupText.height()/2)
  // squadron totals vertical line
  group.add( new Konva.Line({
    points: [group.width()-p.rightColWidth,0,  group.width()-p.rightColWidth,group.height()],
    stroke: 'black',
    strokeWidth: 1,
  }))
  group.add(letterText)
  group.add(groupText)
  let box = HighlightBox(groupText)
  box.on('click tap',()=>{
    menu.editSquadron(i)
  })
  group.add(box)
  
  // Squadron Sorties
  let sortieGroup = new Konva.Group({
    x: p.leftColWidth,
    y: 0,
    width: group.width()-p.rightColWidth-p.leftColWidth,
    height: group.height(),
    name: 'sortie.group',
  })
  console.log("Sorties for "+sq.name)
  let sorties = Object.values(airplan.sorties).filter(sortie=>sortie.squadron==sq.name)
  let ns = sorties.length
  let h = group.height()/(ns+2)
  let cycles = Object.values(airplan.cycles).map(cycle=>cycle.number)
  cycles.push(0,cycles.length+1) // Add the "before" and "after" cycles
  cycles.sort((a,b)=>a-b).forEach(c=>{
    sorties.filter(s=>getCycle(s)==c).forEach((s,i)=>{
      let x1 = time2pixels(s.start,sortieGroup)
      let x2 = time2pixels(s.end,sortieGroup)
      let y = h*(i+1)
      // Sortie line
      sortieGroup.add( new Konva.Line({
        points: [x1,y,x2,y],
        stroke: 'black',
        strokeWidth: 1,
        name: 'sortie.line'
      }))
      // Sortie note
      let note = new Konva.Text({
        x: x1,
        y: y-10,
        text: s.event + " " + s.note,
        fontSize: config.anno.fontSize,
      })
      let box = HighlightBox(note,{minSize:0})
      sortieGroup.add(note,box)
      box.on('click', ()=>{
        tabular.sorties.edit(s.id)
      })
      // Draw the start and end conditions
      this.makeCondition[s.startCondition](x1,y,sortieGroup)
      this.makeCondition[s.endCondition](x2,y,sortieGroup)
    })
  })
  group.add(sortieGroup)
  group.sortieGroup = sortieGroup
  return group
}

g.makeCondition = {}
// Swoosh down to start point
g.makeFlyOn = function(x,y,p) {
  p.add( new Konva.Line({
    points: [x-14,y-14,x,y],
    stroke:'black',
    strokeWidth:1,
    name: 'flyon'
  }))
}
g.makeCondition.flyOn = g.makeFlyOn

// swoosh up from start point
g.makeFlyOff = function(x,y,p) {
  p.add( new Konva.Line({
    points: [x,y,x+14,y-14],
    strokeWidth: 1,
    stroke: 'black',
    name: 'flyoff',
  }))
}
g.makeCondition.flyOff = g.makeFlyOff

// vertical bar
g.makePullStuff = function(x,y,p) {
  p.add( new Konva.Line({
    points: [x,y-10,x,y+10],
    stroke: 'black',
    strokeWidth: 1,
    name: 'pullstuff',
  }))
}
g.makeCondition.stuff= g.makePullStuff
g.makeCondition.pull = g.makePullStuff

g.makeHotPump = function(x,y,p) {
  p.add( new Konva.Line({
    points: [x,y+10, x+5,y,  x,y-10,  x-5,y,  x,y+10],
    stroke: 'black',
    strokeWidth: 1,
    closed: true,
    fill: 'white',
    fillEnabled: true,
  }))
}
g.makeCondition.hp = g.makeHotPump

g.makeHotPumpCrewSwap = function(x,y,p) {
  p.add( new Konva.Line({
    points: [x,y+10, x+5,y,  x,y-10,  x-5,y,  x,y+10],
    stroke: 'black',
    strokeWidth: 1,
    fill:'black',
    fillEnabled:true,
    closed: true,
  }))
}
g.makeCondition.hpcs = g.makeHotPumpCrewSwap

g.editTitleForm = function () {
  let html = "<h3>Edit Title & Date</h3>";
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='title' class='col-12 col-md-2 text-left text-md-right'>Title</label>";
  html += "<input type='text' class='col form-control mr-5' id='title' placeholder='Air Plan' required>";
  html += "</div>"
  // Start time
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='date' class='col-12 col-md-2 text-left text-md-right'>Date</label>";
  html += "<input type='date' pattern='[0-9]{4}-[0-9]{2}-[0-9]{2}T00:00' class='col form-control mr-5' id='date' placeholder='Date'>";
  html += "</div>";
  html += "<button type='submit' class='btn btn-primary' onclick='g.updateTitle()'>Update</button>";
  return html
}

g.updateTitle = function () {
  let title = $('#title').val();
  let date = $('#date').val()+"T00:00";
  let od = airplan.date.getDate()
  airplan.title = title
  airplan.date = new Date(date)
  let d = airplan.date.getDate()
  let delta = d - od
  airplan.slap.sunrise.setDate(       airplan.slap.sunrise.getDate() + delta)
  airplan.slap.sunset.setDate(        airplan.slap.sunset.getDate() + delta)
  airplan.slap.moonrise.setDate(      airplan.slap.moonrise.getDate() + delta)
  airplan.slap.moonset.setDate(       airplan.slap.moonset.getDate() + delta)
  airplan.flightquarters.setDate(airplan.flightquarters.getDate() + delta)
  airplan.heloquarters.setDate(  airplan.heloquarters.getDate() + delta)
  airplan.start.setDate(              airplan.start.getDate() + delta)
  airplan.end.setDate(                airplan.end.getDate() + delta)
  Object.values(airplan.sorties).forEach(s=>{
    s.start.setDate(s.start.getDate() + delta)
    s.end.setDate(s.end.getDate() + delta)
  })
  Object.values(airplan.cycles).forEach(c=>{
    c.start.setDate(c.start.getDate() + delta)
    c.end.setDate(c.end.getDate() + delta)
  })
  
  closeModal()
  refresh()
}

g.editTimeForm = function(){
  let html = "<h3>Edit Times and Variation</h3>";
  // flight quarters time
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='fq' class='col-12 col-md-2 text-left text-md-right'>Flight Quarters</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='fq' required>";
  html += "</div>"
  // helo quarters time
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='hq' class='col-12 col-md-2 text-left text-md-right'>Helo Quarters</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='hq'>";
  html += "</div>";
  // Magnetic Variation
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='variation' class='col-12 col-md-2 text-left text-md-right'>Mag Var (\u00B0E/W)</label>";
  html += "<input type='text' class='col form-control mr-5' id='variation'>";
  html += "</div>";
  // Magnetic Variation
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='timezone' class='col-12 col-md-2 text-left text-md-right'>Time Zone (\u00B1offset)</label>";
  html += "<input type='text' class='col form-control mr-5' id='timezone'>";
  html += "</div>";
  html += "<button type='submit' class='btn btn-primary' onclick='g.updateTime()'>Update</button>";
  return html
}

g.updateTime = function () {
  let fq = new Date($('#fq').val())
  let hq = new Date($('#hq').val())
  let variation = $('#variation').val()
  let timezone = $('#timezone').val()
  airplan.flightquarters = fq
  airplan.heloquarters = hq
  airplan.variation = variation
  airplan.timezone = timezone
  closeModal()
  refresh()
}

g.editSlapForm = function () {
  let html = "<h3>Edit SLAP Data</h3>";
  // Sunrise
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='sunrise' class='col-12 col-md-2 text-left text-md-right'>Sunrise</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='sunrise' required>";
  html += "</div>"
  // Sunset
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='sunset' class='col-12 col-md-2 text-left text-md-right'>Sunset</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='sunset'>";
  html += "</div>";
  // Moonrise
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='moonrise' class='col-12 col-md-2 text-left text-md-right'>Moonrise</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='moonrise' required>";
  html += "</div>"
  // Moonset
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='moonset' class='col-12 col-md-2 text-left text-md-right'>Moonset</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='moonset'>";
  html += "</div>";
  // Moonphase
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='moonphase' class='col-12 col-md-2 text-left text-md-right'>Moonphase (%)</label>";
  html += "<input type='text' class='col form-control mr-5' id='moonphase'>";
  html += "</div>";
  html += "<button type='submit' class='btn btn-primary' onclick='g.updateSlap()'>Update</button>";
  return html
}

g.updateSlap = function () {
  // read the form
  let sunrise = new Date($('#sunrise').val())
  let sunset = new Date($('#sunset').val())
  let moonrise = new Date($('#moonrise').val())
  let moonset = new Date($('#moonset').val())
  let moonphase = $('#moonphase').val()
  // update the data
  airplan.slap.sunrise = sunrise
  airplan.slap.sunset = sunset
  airplan.slap.moonrise = moonrise
  airplan.slap.moonset = moonset
  airplan.slap.moonphase = moonphase
  closeModal()
  refresh()
}

g.editTimelineForm = function () {
  let html = "<h3>Edit Start & End of Day</h3>";
  // Sunrise
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='start' class='col-12 col-md-2 text-left text-md-right'>Start of Day</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='start' required>";
  html += "</div>"
  // Sunset
  html += "<div class='form-group row align-items-center'>";
  html += "<label for='end' class='col-12 col-md-2 text-left text-md-right'>End of Day</label>";
  html += "<input type='datetime-local' class='col form-control mr-5' id='end'>";
  html += "</div>";
  html += "<button type='submit' class='btn btn-primary' onclick='g.updateTimeline()'>Update</button>";
  return html
}

g.updateTimeline = function () {
  airplan.start = new Date($('#start').val())
  airplan.end = new Date($('#end').val())
  closeModal()
  refresh()
}