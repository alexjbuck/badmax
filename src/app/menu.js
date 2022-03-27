var menu = new Object

menu.draw = function() {
    var html = "<div class='btn-group py-2 mr-5'>";
    html += "<button class='btn btn-outline-success btn' onclick='menu.addSquadron()'>+</button>";
    html += "<button class='btn btn-outline-danger btn' onclick='menu.deleteBottomSquadron()'>\u2212</button>";
    html += "</div>";
    html += "<button id='help' class='btn btn-warning py-2 mr-5' onclick='menu.help()'>Help</button>"
    html += "<div class='btn-group py-2 mr-5'>";
    html += "<button id='reset-stage' class='btn btn-outline-danger' onclick='menu.reset()'>New Airplan</button>"
    html += "<button id='refresh-stage' class='btn btn-outline-primary' onclick='refresh()'>Refresh</button>"
    html += "<label type='file' id='load' class='btn btn-outline-primary my-0'>Load<input type='file' id='filepath' hidden onchange='menu.load(event)'></label>"
    html += "<button id='save' class='btn btn-outline-primary' onclick='menu.save()'>Save</button>"
    html += "<button id='print' class='btn btn-outline-primary' onclick='menu.print()'>Export PDF</button>"
    html += "</div>"

    $('#menu').html(html)
}
menu.load = function(e) {
    console.log("Loaded airplan: "+e.target.files[0].name)
    let reader = new FileReader();
    reader.onload = function(e) {
        airplan = JSON.parse(reader.result)
        // convert all Date objects to Date objects
        airplan.date = new Date(airplan.date)
        airplan.start = new Date(airplan.start)
        airplan.end = new Date(airplan.end)
        airplan.slap.sunrise = new Date(airplan.slap.sunrise)
        airplan.slap.sunset = new Date(airplan.slap.sunset)
        airplan.slap.moonrise = new Date(airplan.slap.moonrise)
        airplan.slap.moonset = new Date(airplan.slap.moonset)
        airplan.flightquarters = new Date(airplan.flightquarters)
        airplan.heloquarters = new Date(airplan.heloquarters)
        Object.values(airplan.sorties).forEach((sortie) => {
            sortie.start = new Date(sortie.start)
            sortie.end = new Date(sortie.end)
        })
        Object.values(airplan.cycles).forEach((cycle) => {
            cycle.start = new Date(cycle.start)
            cycle.end = new Date(cycle.end)
        })
        refresh()
    }
    reader.readAsText(e.target.files[0])
}
menu.save = function() {
    console.log("Save!")
    let file = new Blob([JSON.stringify(airplan)], {type: "application/json"})
    saveAs(file,airplan.date.toYYYYMMDD()+".json")
}

menu.print = function() {
    let w = 11
    let h = 8.5
    let m = .01
    var pdf = new jspdf.jsPDF('l', 'in', [8.5, 11]);
    let imgData = g.stage.toDataURL({mimeType: 'image/png', quality: 1, pixelRatio: 3});
    pdf.addImage(imgData, 'JPEG', m*w/2, m*h/2, w*(1-m), h*(1-m), undefined, 'FAST');
    pdf.save('airplan_'+airplan.date.toYYYYMMDD()+'.pdf');
}

menu.addSquadron = function() {
    if (Object.values(airplan.squadrons).length >= 9) {
        alert("You can only have 9 squadrons!")
        return
    }
    let html = "<h3>Add Squadron</h3>"
    html += menu.squadronForm()
    html += "<button class='btn btn-primary' onclick='menu.addSquadronConfirm()'>Add Squadron</button>"
    openModal(html)
    $('#squadron-name').val("Squadron")
}

menu.editSquadron = function(i) {
    let html = "<h3>Edit Squadron</h3>"
    html += menu.squadronForm()
    html += "<button class='btn btn-primary' onclick='menu.editSquadronConfirm("+i+")'>Update Squadron</button>"
    openModal(html)
    $('#squadron-name').val(airplan.squadrons[id].name)
    $('#squadron-cs').val(airplan.squadrons[id].cs)
    $('#squadron-tms').val(airplan.squadrons[id].tms)
    $('#squadron-modex').val(airplan.squadrons[id].modex)
}

menu.squadronForm = function() {
    let html = "<div class='form-group  row align-items-center'>"
    html += "<label for='squadron-name' class='col-12 col-md-2 text-left text-md-right'>Squadron Name</label>"
    html += "<input type='text' class='col form-control mr-5' id='squadron-name' placeholder='Squadron Name'>"
    html += "</div>"
    html += "<div class='form-group  row align-items-center'>"
    html += "<label for='squadron-cs' class='col-12 col-md-2 text-left text-md-right'>Callsign</label>"
    html += "<input type='text' class='col form-control mr-5' id='squadron-cs' placeholder='Callsign'>"
    html += "</div>"
    html += "<div class='form-group  row align-items-center'>"
    html += "<label for='squadron-tms' class='col-12 col-md-2 text-left text-md-right'>TMS</label>"
    html += "<input type='text' class='col form-control mr-5' id='squadron-tms' placeholder='TMS'>"
    html += "</div>"
    html += "<div class='form-group  row align-items-center'>"
    html += "<label for='squadron-modex' class='col-12 col-md-2 text-left text-md-right'>MODEX</label>"
    html += "<input type='text' class='col form-control mr-5' id='squadron-modex' placeholder='XXX'>"
    html += "</div>"
    return html
}

    

menu.addSquadronConfirm = function() {
    let squadron = {
        name: $('#squadron-name').val(),
        cs: $('#squadron-cs').val(),
        tms: $('#squadron-tms').val(),
        modex: $('#squadron-modex').val(),
        letter: String.fromCharCode(Object.values(airplan.squadrons).length + 65),
    }
    airplan.squadrons.push(squadron)
    refresh()
    closeModal()
}

menu.editSquadronConfirm = function(id) {
    let squadron = {
        name: $('#squadron-name').val(),
        cs: $('#squadron-cs').val(),
        tms: $('#squadron-tms').val(),
        modex: $('#squadron-modex').val(),
        letter: airplan.squadrons[id].letter,
    }
    airplan.squadrons[id] = squadron
    refresh()
    closeModal()
}

menu.deleteBottomSquadron = function() {
    if (Object.values(airplan.squadrons).length <= 0) {
        alert("There are no squadrons!")
        return
    }
    airplan.squadrons.pop()
    refresh()
}

menu.reset = function() {
    if(confirm("Are you sure you want to reset the airplan?\nThis will remove all data and reset the airplan to a blank state.")) {
        airplan = new BlankAirplan()
        refresh()
    }
}