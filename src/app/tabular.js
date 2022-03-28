var tabular = new Object;


// Process add or edit submits
tabular.processSubmit = function() {
    closeModal()
    this.draw()
    g.draw()
}

// Draw the sortie and cycles tables.
tabular.draw = () => {
    tabular.sorties.draw()
    tabular.cycles.draw()
}

highlightInvalidInput = ($object) => {
    $object.css("border-color", "red");
    $object.one('click',() => {
        console.log("click event on ", $object);
        $object.css("border-color", "black");
    });
}

//
//  Cycles Table
// 
tabular.cycles = new Object;
tabular.cycles.draw = () => {
    var html = "<h3>Cycle List</h3>";
    html += "<button class='btn btn-primary btn-block mb-2' onclick=tabular.cycles.add()>Add Cycle</button>";
    html += "<table class='table table-striped table-hover table-sm text-center'>";
    html += "<thead><tr>";
    html += "<th class='col-3'>Cycle</th>";
    html += "<th class='col-3'>Start</th>"
    html += "<th class='col-3'>End</th>";
    html += "<th class='col-3'></th></thead>";
    html += "<tbody>";
    Object.entries(airplan.cycles).sort((a,b)=>a[1].start-b[1].start).forEach(([id,cycle],i) => {
        cycle.number = parseInt(i+1);
        html += "<tr>";
        html += "<td class='align-middle'>" + cycle.number + "</td>";
        html += "<td class='align-middle'>" + cycle.start.toHHMM() + "</td>";
        html += "<td class='align-middle'>" + cycle.end.toHHMM() + "</td>";
        html += "<td class='align-middle'><div class='btn-group' role='group'>"
        html +=   "<button class='btn btn-sm btn-secondary' onclick=tabular.cycles.edit('"+id+"')>Edit</button>"
        html +=   "<button class='btn btn-sm btn-danger'    onclick=tabular.cycles.delete('"+id+"')>X</button>"
        html += "</div></td>"; // Method needs to be exitCycles or something like that. cycles.edit, whatever works.
        html += "</tr>";
        }
    )
    html += "</tbody>";
    $("#tabular-cycles").html(html);
}

tabular.cycles.addEditForm = () => {
    let html = ""
    // Cycle Number
    // let html = "<div class='form-group row align-items-center'>";
    // html += "<label for='number' class='col-12 col-md-2 text-left text-md-right'>Cycle #</label>";
    // html += "<input type='number' class='col form-control mr-5' id='number' placeholder='Cycle Number' required disabled>";
    // html += "</div>"
    // Start time
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='start' class='col-12 col-md-2 text-left text-md-right'>Start</label>";
    html += "<input type='datetime-local' class='col form-control mr-5' id='start' placeholder='Start'>";
    html += "</div>";
    // End time
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='end' class='col-12 col-md-2 text-left text-md-right'>End</label>";
    html += "<input type='datetime-local' class='col form-control mr-5' id='end' placeholder='End'>";
    html += "</div>";
    return html
}

tabular.cycles.readForm = () => {
    // let number    = $( "#number" ).val();
    let number = Object.keys(airplan.cycles).length + 1;
    let start     = new Date(Date.parse($('#start').val()));
    let end       = new Date(Date.parse($( '#end' ).val()));
    return {number: number, start: start, end: end}
}


// Callback on the "Add Cycle" button.
tabular.cycles.add = () => {
    var html = "<h3>Add Cycle</h3>";
    html += tabular.cycles.addEditForm();
    html += "<button type='submit' class='btn btn-primary' onclick=tabular.cycles.addSubmit()>Submit</button>";
    openModal(html);
    $("#number").val(Object.keys(airplan.cycles).length+1);
    let d = new Date(new Date(airplan.date.valueOf()).setHours(9,0,0,0));
    let startTime = Object.values(airplan.cycles).reduce((p,c)=>p.end > c.end ? p : c,{end:d}).end;
    let endTime = new Date(startTime.valueOf())
    let end = startTime.getHours() + 1
    $("#start").val( startTime.toLocalTimeString() )
    endTime.setHours(end)
    $("#end").val(   endTime.toLocalTimeString() )
}

// Callback on the "Submit" button in the "Add Cycle" modal.
tabular.cycles.addSubmit = () => {
    tabular.cycles.editSubmit(uuidv4());
}

tabular.cycles.edit = (id) => {
    var html = "<h3>Edit Cycle</h3>";
    html += tabular.cycles.addEditForm();
    html += "<button type='submit' class='btn btn-primary' onclick=tabular.cycles.editSubmit('"+id+"')>Submit</button>";
    openModal(html);
    $("#number").val(airplan.cycles[id].number);
    $("#start").val(airplan.cycles[id].start.toLocalTimeString());
    $("#end").val(airplan.cycles[id].end.toLocalTimeString());
}

tabular.cycles.editSubmit = (id) => {
    let cycle = tabular.cycles.readForm();
    // if valid cycle, update data object, log, close modal, redraw table.
    if (tabular.cycles.validate(cycle)) {
        // Update the cycle in the data object.
        console.log("Updated Cycle: ",cycle.number, cycle.start, cycle.end);
        airplan.cycles[id] = cycle;
        tabular.processSubmit()
    }
}

tabular.cycles.validate = ({number,start,end}) => {
    let valid = {number:true,start:true,end:true};
    let $number = $("#number");
    let $start = $("#start");
    let $end = $("#end");

    // Check if number is empty or undefined
    if (number == "" || typeof number == "undefined") {
        alert("Cycle number cannot be empty.");
        valid.number = false;
    } 
    // Check if start is empty or undefined
    if (start == "" || typeof start == "undefined") {
        alert("Start time cannot be empty.");
        valid.start = false;
    }
    // Check if end is empty or undefined
    if (end == "" || typeof end == "undefined") {
        alert("End time cannot be empty.");
        valid.end = false;
    }
    // Check if the cycle number is unique.
    // if (airplan.cycles.filter(c => c.number == number).length > 0) {
    //     alert("Cycle number must be unique.");
    //     valid.number = false;
    // }
    // Check if the start is before the end.
    if (start > end) {
        alert("Start must be before end.");
        valid.start = false;
        valid.end = false;
    }

    // if id not valid, highlight red until input changed
    if (!valid.number) {
        highlightInvalidInput( $number );
    }
    // if start not valid, highlight red until input changed
    if (!valid.start) {
        highlightInvalidInput( $start );
    }
    // if end not valid, highlight red until input changed
    if (!valid.end) {
        highlightInvalidInput( $end );
    }
    console.log(number,start,end);
    //if all valid, return true, otherwise return false
    return valid.number && valid.start && valid.end;
}

//
//  Sorties Table
// 
tabular.sorties = new Object;
tabular.sorties.draw = () => {
    var html = "<h3>Sortie List</h3>";
    html += "<button class='btn btn-primary btn-block mb-2' onclick=tabular.sorties.add()>Add Sortie</button>";
    html += "<table class='table table-striped table-hover table-sm text-center'>";
    html += "<thead><tr>"
    html += "<th class='col-3'>Sqdrn</th>"
    html += "<th class='col-2'>Time</th>"
    html += "<th class='col-2'>Recovery</th>"
    html += "<th class='col-2'>Event</th>"
    html += "<th class='col-3'></th>";
    html += "</tr></thead>";
    html += "<tbody>";
    Object.values(airplan.squadrons).forEach((sqdrn, i) => {
        console.log("Sorties for: "+sqdrn.name);
        Object.entries(airplan.sorties).filter(([id,sortie])=>sortie.squadron == sqdrn.name).sort(([id1,a],[id2,b])=>a.start-b.start).forEach(([id,sortie]) => {
            console.log("  Sortie: "+id+" "+sortie);
            html += "<tr>";
            html += "<td class='align-middle'>"+sortie.squadron+"</td>";
            html += "<td class='align-middle'>"+sortie.start.toHHMM()+"</td>";
            html += "<td class='align-middle'>"+sortie.end.toHHMM()+"</td>";
            html += "<td class='align-middle'>"+sortie.event+"</td>";
            html += "<td class='align-middle'><div class='btn-group'>"
            html +=   "<button class='btn btn-sm btn-secondary' onclick=tabular.sorties.edit('"+id+"')>Edit</button>"
            html +=   "<button class='btn btn-sm btn-danger'    onclick=tabular.sorties.delete('"+id+"') >X</button>"
            html += "</div></td>";
            html += "</tr>";
        })
    })
    html += "</tbody>";
    $("#tabular-sorties").html(html);
}

tabular.sorties.addEditForm = () => {
    // Squadron dropdown
    let html = "<div class='form-group row align-items-center'>";
    html += "<label for='squadron' class='col-12 col-md-3 text-left text-md-right'>Squadron</label>";
    html += "<select class='col form-control mr-5' id='squadron'>";
    Object.values(airplan.squadrons).forEach((sqdrn, i) => {
        html += "<option value='"+sqdrn.name+"'>"+sqdrn.name+"</option>";
    })
    html += "</select>";
    html += "</div>";
    // Start Time
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='start' class='col-12 col-md-3 text-left text-md-right'>Start Time</label>";
    html += "<input type='datetime-local' class='col form-control mr-5' id='start' placeholder='0000'>";
    html += "</div>";
    // Start Condition
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='startCondition' class='col-12 col-md-3 text-left text-md-right'>Start Condition</label>";
    html += "<select type='text' class='col form-control mr-5' id='startCondition' placeholder='Start Condition'>";
        html += "<option value='pull'>Pull</option>";
        html += "<option value='flyOn'>Fly On</option>";
        html += "<option value='hp'>Hot Pump</option>";
        html += "<option value='hpcs'>Hot Pump & Crew Swap</option>";
    html += "</select>";
    html += "</div>";
    // End time
    html += "<div class='form-group row align-items-center end-time'>";
    html += "<label for='end' class='col-12 col-md-3 text-left text-md-right'>End Time</label>";
    html += "<input type='datetime-local' class='col form-control mr-5' id='end' placeholder='0000'>";
    html += "</div>";
    // End Condition
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='endCondition' class='col-12 col-md-3 text-left text-md-right'>End Condition</label>";
    html += "<select type='text' class='col form-control mr-5' id='endCondition' placeholder='End Condition'>";
        html += "<option value='stuff'>Stuff</option>";
        html += "<option value='flyOff'>Fly Off</option>";
        html += "<option value='hp'>Hot Pump</option>";
        html += "<option value='hpcs'>Hot Pump & Crew Swap</option>";
    html += "</select>";
    html += "</div>";
    // note
    html += "<div class='form-group row align-items-center'>";
    html += "<label for='note' class='col-12 col-md-3 text-left text-md-right'>note</label>";
    html += "<input type='text' class='col form-control mr-5' id='note' placeholder='Mission'>";
    html += "</div>";
    return html;
}

// Callback on the "Add Sortie" button.
tabular.sorties.add = () => {
    var html = "<h3>Add Sortie</h3>";
    html += tabular.sorties.addEditForm();
    html += "<div class='row'>"
    html += "<button type='submit' class='btn btn-primary' onclick=tabular.sorties.addSubmit()>Submit</button>";
    html += tabular.sorties.addCycleSelectButton();
    html += "</div>"
    openModal(html);
    let d = new Date(airplan.date);
    d.setHours(0,0,0,0);
    $("#start").val(d.toLocalTimeString());
    $("#end").val(d.toLocalTimeString());
    $("#note").val("_");
}

tabular.sorties.addCycleSelectButton = function(){

    var html = '<div class="dropdown ml-3">'
        html += '<button class="btn btn-secondary dropdown-toggle" id="dropdownMenuButton" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
            html += 'Sync With Cycle'
        html += '</button>'
        html += '<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">'
            //for over each cycle in airplan.data.events.cycles
            for(var id in airplan.data.events.cycles){
                var cycle = airplan.data.events.cycles[id];
                html += `<a class="dropdown-item" onclick=tabular.sorties.setTimesToCycle('${id}')>Cycle ${cycle.number}</a>`
            }
        html += '</div>'
    html += '</div>'
    html += '</div>'



    return html;
}

tabular.sorties.setTimesToCycle = function(id){
    var cycle = airplan.data.events.cycles[id];
    var start = new Date(cycle.start).toLocalTimeString();
    var end = new Date(cycle.end).toLocalTimeString();

    $("#start").val(start)
    $("#end").val(end)
}

tabular.sorties.readForm = function() {
    let sortie = new Sortie();
    sortie.squadron =                  $("#squadron").val();
    sortie.start = new Date(Date.parse($( "#start" ).val()));
    sortie.startCondition =            $( "#startCondition" ).val();
    sortie.end   = new Date(Date.parse($( "#end" ).val()));
    sortie.endCondition =              $( "#endCondition" ).val();
    sortie.note =                $( "#note" ).val();
    return new Sortie
}

// Callback on the "Submit" button in the "Add Sortie" modal.
tabular.sorties.addSubmit = () => {
    tabular.sorties.editSubmit(uuidv4())
    // let sortie = tabular.sorties.readForm()
    // if (tabular.sorties.validate(sortie)) {
    //     airplan.sorties[uuidv4()] = sortie;
    //     console.log(sortie.start, sortie.startCondition, sortie.end, sortie.endCondition, sortie.note);
    //     tabular.processSubmit()    
    // }
}

tabular.sorties.edit = (id) => {
    console.log("Editing sortie "+id);
    var html = "<h3>Edit Sortie</h3>";
    html += tabular.sorties.addEditForm();

    html += "<button type='submit' class='btn btn-primary' onclick=tabular.sorties.editSubmit('"+id+"')>Submit</button>";
    openModal(html);
    $("#squadron").val(airplan.sorties[id].squadron);
    $("#start").val(airplan.sorties[id].start.toLocalTimeString());
    $("#startCondition").val(airplan.sorties[id].startCondition);
    $("#end").val(airplan.sorties[id].end.toLocalTimeString());
    $("#endCondition").val(airplan.sorties[id].endCondition);
    $("#note").val(airplan.sorties[id].note);
}

tabular.sorties.editSubmit = (id) => {
    console.log("processing edit of sortie "+id);
    let sortie = tabular.sorties.readForm()
    sortie.id = id;
    if (tabular.sorties.validate(sortie)) {
        airplan.sorties[id] = sortie;
        sortie.event=0+airplan.squadrons.find(sq=>sq.name==sortie.squadron).letter+1;
        assignEvents();
        console.log(sortie.start, sortie.startCondition, sortie.end, sortie.endCondition, sortie.note);
        tabular.processSubmit()
    }
}

tabular.sorties.validate = ({squadron,start,startCondition,end,endCondition,note}) => {
    let valid = {squadron: true,start: true,startCondition: true,end: true,endCondition: true,note: true};
    $squadron =         $( "#squadron" );
    $start =            $( "#start" );
    $startCondition =   $( "#startCondition" );
    $end   =            $( "#end" );
    $endCondition =     $( "#endCondition" );
    $note =       $( "#note" );
    if (squadron == "") {
        highlightInvalidInput($squadron);
        valid.squadron = false;
    }
    if (start == "Invalid Date" || start == null) {
        highlightInvalidInput($start);
        valid.start = false;
    }
    if (end == "Invalid Date" || end == null) {
        highlightInvalidInput($end);
        valid.end = false;
    }
    if (start > end) {
        highlightInvalidInput($start);
        highlightInvalidInput($end);
        valid.start = false;
        valid.end = false;
    }
    if (note == "") {
        highlightInvalidInput($note);
        valid.note = false;
    }
    // if all valid, return true
    return Object.values(valid).reduce((a,b) => a && b, true);
}

tabular.cycles.delete = function(id) {
    let del = async () => delete airplan.cycles[id];
    del().then(refresh())
}

tabular.sorties.delete = function(id) {
    let del = async () => delete airplan.sorties[id];
    del().then(refresh())
}