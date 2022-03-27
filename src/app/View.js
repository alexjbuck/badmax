/**
* The View class is the base class for all views.
*/
class View {
    /**
    * Create a view object
    * @param {Model} airplan 
    */
    constructor() {
        this.app                = this.getElement('#view');
        this.margin             = {top: 10, right: 10, bottom: 10, left: 10};
        this.sceneWidth         = 1100;
        this.sceneHeight        = 850;
        this.headerHeight       = 90;
        this.leftCol            = 90;
        this.letterCol          = 15;
        this.rightCol           = 40;
        this.topRow             = 20;
        this.bottomRow          = 20;
        this.drawMenu();
        this.drawSquadrons();
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }
    // ASCII Comments generated with: https://patorjk.com/software/taag
    //    __  __                      __      __ _                      
    //   |  \/  |                     \ \    / /(_)                     
    //   | \  / |  ___  _ __   _   _   \ \  / /  _   ___ __      __ ___ 
    //   | |\/| | / _ \| '_ \ | | | |   \ \/ /  | | / _ \\ \ /\ / // __|
    //   | |  | ||  __/| | | || |_| |    \  /   | ||  __/ \ V  V / \__ \
    //   |_|  |_| \___||_| |_| \__,_|     \/    |_| \___|  \_/\_/  |___/
    /**
    * @method drawMenu Populate the #menu in the menu div.
    */
    drawMenu = () => {
        this.menu = {file:{},info:{}}
        var html =`
        <details open>
        <summary class='h3'>Menu / Help</summary>
        <div class='btn-group menu-group'>
        <button id='reset'   class='btn btn-outline-danger'       data-toggle='tooltip' data-placement='top' title='Burn it Down!'><i class='fas fa-dumpster-fire'> </i></button>
        <button id='refresh' class='btn btn-outline-primary'      data-toggle='tooltip' data-placement='top' title='Refresh'>      <i class='fas fa-sync'>          </i></button>
        <label  id='load'    class='btn btn-outline-primary my-0' data-toggle='tooltip' data-placement='top' title='Load'>         <i class='fas fa-folder-open'>   </i><input type='file' id='filepath' hidden></label>
        <button id='save'    class='btn btn-outline-primary'      data-toggle='tooltip' data-placement='top' title='Save'>         <i class='fas fa-save'>          </i></button>
        <button id='export'  class='btn btn-outline-primary'      data-toggle='tooltip' data-placement='top' title='Export PDF'>   <i class='fas fa-file-pdf'>      </i></button>
        </div>
        <div class='btn-group menu-group'>
        <button id="help"            class='btn btn-outline-warning' data-toggle='tooltip' data-placement='top' title='Help'>         <i class='fas fa-question-circle'></i></button>
        <button id="feedback"        class='btn btn-outline-success' data-toggle='tooltip' data-placement='top' title='Send Feedback'><i class="fas fa-bullhorn"></i>       </button>
        </div>
        </details>
        `;
        $('#menu').html(html)
        // this.squadron.add = $('#add-squadron')
        // this.squadron.rem = $('#rem-squadron')
        this.menu.file.reset = $('#reset')
        this.menu.file.refresh = $('#refresh')
        this.menu.file.load = $('#load')
        this.menu.file.save = $('#save')
        this.menu.file.export = $('#export')
        this.menu.info.help = $('#help')
        this.menu.info.feedback = $('#feedback')
    }
    /**
    * @method drawHelp Draws the help modal dialog.
    */
    drawHelp() {
        let html = `
        <div class='container'>
        <div class='row'>
        <div>
        <h3>BAD MAX airplan writer: \u2708</h3>
        <h5>For when you don't have ADMACS, <em>and <sup>maybe <sup>even <sup>when <sup>you do!</sup></sup></sup></sup></em></h5>
        </div>
        <div class='ml-auto'>
        <small>Version: 0.5.1</small>
        </div>
        </div>
        </div>
        <hr>
        <p>
        Writing airplans in PowerPoint is the worst &#129324;.
        This is a simple web app that allows you to view and edit your squadron's air plans.
        You can add new flights, edit existing flights, and delete flights.
        You can also export your air plan to PDF <i class="far fa-file-pdf"></i>.
        </p>
        <i class="fas fa-exclamation-triangle"></i> Tips:
        <ol>
        <li>To get started, click the blue <i style="color:blue" class='fas fa-plus'></i> or red <i style="color:red" class='fas fa-minus'></i> in the menu to add or remove a squadron.</li>
        <li>Click on the squadron text block in the graphical view to edit the name, callsign, TMS, and modex.</li>
        <li>Start adding cycles by clicking the "<i class='fas fa-plus'></i> Add Cycle" button and providing the cycle times</li>
        <li>Add an aircraft line by clicking the "<i class='fas fa-plus'></i> Add Line" button and selecting a squadron.</li>
        <li>Add a sortie in the line by clicking "<i class='fas fa-plus'></i> Add Sortie" underneath the desired line.</li>
        <li>Save your airplan by clicking the <i class='fas fa-save'></i> button. This downloads a file that you can load <i class='fas fa-folder-open'></i> to resume your progress.</li>
        <li>Items on the display to the left open edit menu's if they have a <span class='blue-border'>blue border</span> when you hover over them.</li>
        </ol><ul>
        <li><b>Best Practice</b>: Add all of your squadrons, then save your airplan. Use that file as your starting point for the future.</li>
        <li><b>Pro Tip</b>: View these tips anytime by clicking the <i style='color:#ffc107' class='fa fa-question-circle'></i> help icon in the menu.</li>
        </ul>
        <p>
        Play around, you can't break anything, and hopefully you find this app useful!
        </p>
        <p>
        Please provide feedback to <span class='jarvis'>JARVIS</span> at <a href=mailto:alexander.j.buck@gmail.com>alexander.j.buck@navy.mil</a> by
        clicking the green <span style="color:green"><i class="fas fa-bullhorn"></i></span> button in the menu.
        </p>
        `
        openModal(html)
    }
    //    __  __                       ____   _             _  _                    
    //   |  \/  |                     |  _ \ (_)           | |(_)                   
    //   | \  / |  ___  _ __   _   _  | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //   | |\/| | / _ \| '_ \ | | | | |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //   | |  | ||  __/| | | || |_| | | |_) || || | | || (_| || || | | || (_| |\__ \
    //   |_|  |_| \___||_| |_| \__,_| |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //                                                                    __/ |     
    //                                                                   |___/      
    /**
    * Bind the menu controls functions to the view object click event
    * @param {Function} handler
    */
    bindMenuReset(handler){
        this.menu.file.reset.on('click', event=>{
            handler()
        })
    }
    bindMenuRefresh(handler){
        this.menu.file.refresh.on('click', event=>{
            handler()
        })
    }
    bindMenuLoad(handler){
        this.menu.file.load.on('change', event=>{
            if(event.target.files[0]!=''){
                handler(event.target.files[0])
            }
        })
        this.menu.file.load.on('click', event=>{
            event.target.value=''
        })
    }
    bindMenuSave(handler){
        this.menu.file.save.on('click', event=>{
            handler()
        })
    }
    bindMenuExport(handler){
        this.menu.file.export.on('click', event=>{
            handler()
        })
    }
    bindMenuHelp(handler){
        this.menu.info.help.on('click', event=>{
            handler()
        })
    }
    bindMenuFeedback(handler){
        this.menu.info.feedback.on('click', event=>{
            handler()
        })
    }

  drawSquadrons() {
    var html =`
        <details open>
        <summary class='h3'>Squadrons</summary>
          <div class='btn-group menu-group'>
            <button id='add-squadron' class='btn btn-outline-primary add-squadron' data-toggle='tooltip' data-placement='top' title='Add Squadron'>   <i class='fas fa-plus'> </i> Add </button>
            <button id='rem-squadron' class='btn btn-outline-danger rem-squadron'  data-toggle='tooltip' data-placement='top' title='Remove Squadron'><i class='fas fa-minus'></i> Rem</button>
          </div>
        </details>`
    $('#squadrons').html(html)
    this.squadron = {}
    this.squadron.add = $('#add-squadron')
    this.squadron.rem = $('#rem-squadron')
  }
    
    //     _____                           _                      ____   _             _  _                    
    //    / ____|                         | |                    |  _ \ (_)           | |(_)                   
    //   | (___    __ _  _   _   __ _   __| | _ __  ___   _ __   | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //    \___ \  / _` || | | | / _` | / _` || '__|/ _ \ | '_ \  |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //    ____) || (_| || |_| || (_| || (_| || |  | (_) || | | | | |_) || || | | || (_| || || | | || (_| |\__ \
    //   |_____/  \__, | \__,_| \__,_| \__,_||_|   \___/ |_| |_| |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //               | |                                                                             __/ |     
    //               |_|                                                                            |___/      
    /**
    * Bind the add squadron controller to the view object click event
    * @param {Function} handler 
    */
    bindMenuAddPlaceholderSquadron(handler){
        this.squadron.add.on('click', event=>{
            handler()
        })
    }
    bindMenuRemoveSquadron(handler){
        this.squadron.rem.on('click', event=>{
            handler()
        })
    }
    bindEditSquadronSubmit(handler){
        this.editSquadronSubmit.on('click', event=>{
            let name = $('#name').val();
            let cs = $('#cs').val();
            let tms = $('#tms').val();
            let modex = $('#modex').val();
            let squadronID = event.currentTarget.id
            handler(squadronID, name, cs, tms, modex)
            closeModal()
        })
    }
    bindEditSquadronRemove(handler){
        this.editSquadronRemove.on('click', event=>{
            let squadronID = event.currentTarget.id
            handler(squadronID)
            closeModal()
        })
    }
    //     _____                           _                      __  __                          
    //    / ____|                         | |                    |  \/  |                         
    //   | (___    __ _  _   _   __ _   __| | _ __  ___   _ __   | \  / |  ___  _ __   _   _  ___ 
    //    \___ \  / _` || | | | / _` | / _` || '__|/ _ \ | '_ \  | |\/| | / _ \| '_ \ | | | |/ __|
    //    ____) || (_| || |_| || (_| || (_| || |  | (_) || | | | | |  | ||  __/| | | || |_| |\__ \
    //   |_____/  \__, | \__,_| \__,_| \__,_||_|   \___/ |_| |_| |_|  |_| \___||_| |_| \__,_||___/
    //               | |                                                                          
    //               |_|                                                                          
    drawEditSquadronData(squadron) {
        let html = `<h3>Edit Squadron</h3>`
        // Name
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='name' class='col-12 col-md-3 text-left text-md-right'>Squadron Name</label>";
        html += "<input type='text' class='col form-control mr-5' id='name' placeholder='VFA-XX'>";
        html += "</div>";
        // Callsign
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='cs' class='col-12 col-md-3 text-left text-md-right'>Callsign</label>";
        html += "<input type='text' class='col form-control mr-5' id='cs' placeholder='Airplan Title'>";
        html += "</div>";
        // TMS
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='tms' class='col-12 col-md-3 text-left text-md-right'>TMS</label>";
        html += "<input type='text' class='col form-control mr-5' id='tms' placeholder='Airplan Title'>";
        html += "</div>";
        // Modex
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='modex' class='col-12 col-md-3 text-left text-md-right'>Modex</label>";
        html += "<input type='text' class='col form-control mr-5' id='modex' placeholder='Airplan Title'>";
        html += "</div>";
        html += "<div class='btn-group'>";
        html += "<button id='"+squadron.ID+"' class='btn btn-primary edit-squadron-submit'>Submit</button>";
        html += "<button id='"+squadron.ID+"' class='btn btn-danger edit-squadron-remove'><i class='fas fa-trash-alt'></i></button>";
        html += "</div>";
        openModal(html)
        this.editSquadronSubmit = $('.edit-squadron-submit')
        this.editSquadronRemove = $('.edit-squadron-remove')
    }
    
    //     _____              _        __      __ _                 
    //    / ____|            | |       \ \    / /(_)                
    //   | |     _   _   ___ | |  ___   \ \  / /  _   ___ __      __
    //   | |    | | | | / __|| | / _ \   \ \/ /  | | / _ \\ \ /\ / /
    //   | |____| |_| || (__ | ||  __/    \  /   | ||  __/ \ V  V / 
    //    \_____|\__, | \___||_| \___|     \/    |_| \___|  \_/\_/  
    //            __/ |                                             
    //           |___/                                              
    /**
    * @param {Model} airplan 
    * @method drawCycleList populates the #cycles-list div with cycles information.
    */
    drawCycleList = (airplan) => {
        let html = `
        <details open>
        <summary class='h3'>Cycles</summary>
        <div class='list-group'>`
        Object.values(airplan.cycles).forEach(cycle => {
            html += `<div id='`+cycle.ID+`' class='list-group-item list-group-item-action edit-cycle-menu'>`
            html +=     `<b>Cycle ${cycle.number}</b>: ${cycle.start.toHHMM()} - ${cycle.end.toHHMM()}`
            html +=     `<i id='`+cycle.ID+`' class='fas fa-trash-alt cycle-remove'></i> `
            html +=     `<i id='`+cycle.ID+`' class='fas fa-edit edit-cycle-menu'></i> `
            html += `</div>`
        })
        html += `<div class='list-group-item list-group-item-action add-cycle-menu'><i class='fas fa-plus'></i> Add Cycle...</div>`
        html += '</div>'
        html += '</details>'
        $('#cycles-list').html(html)
        this.addCycleMenu = $('.add-cycle-menu')
        this.editCycleMenu = $('.edit-cycle-menu')
        this.editCycleRemove = $('.cycle-remove')
    }
    //     _____              _         ____   _             _  _                    
    //    / ____|            | |       |  _ \ (_)           | |(_)                   
    //   | |     _   _   ___ | |  ___  | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //   | |    | | | | / __|| | / _ \ |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //   | |____| |_| || (__ | ||  __/ | |_) || || | | || (_| || || | | || (_| |\__ \
    //    \_____|\__, | \___||_| \___| |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //            __/ |                                                    __/ |     
    //           |___/                                                    |___/      
    /**
    * Bind the add cycle controller to the view object click event
    * @param {Function} handler 
    */
    bindAddCycleMenu(handler){
        this.addCycleMenu.on('click', event=>{
            handler()
        })              
    }
    bindAddCycleSubmit(handler){
        this.addCycleSubmit.on('click', event=>{
            let start = Date.parse($('#start').val())
            let end = Date.parse($('#end').val())
            handler(start,end)
            closeModal()
        })
    }
    bindEditCycleMenu(handler){
        if(this.editCycleMenu.length){
            this.editCycleMenu.on('click', event=>{
                let cycleID = event.currentTarget.id
                handler(cycleID)
            })
        }
    }
    bindEditCycleSubmit(handler){
        this.editCycleSubmit.on('click', event=>{
            let cycleID = event.currentTarget.id
            let start = Date.parse($('#start').val())
            let end = Date.parse($('#end').val())
            handler(cycleID, start, end)
            closeModal()
        })
    }
    bindEditCycleRemove(handler){
        this.editCycleRemove.on('click', event=>{
            let cycleID = event.currentTarget.id
            handler(cycleID)
            closeModal()
        })
    }
    //     _____              _         __  __                          
    //    / ____|            | |       |  \/  |                         
    //   | |     _   _   ___ | |  ___  | \  / |  ___  _ __   _   _  ___ 
    //   | |    | | | | / __|| | / _ \ | |\/| | / _ \| '_ \ | | | |/ __|
    //   | |____| |_| || (__ | ||  __/ | |  | ||  __/| | | || |_| |\__ \
    //    \_____|\__, | \___||_| \___| |_|  |_| \___||_| |_| \__,_||___/
    //            __/ |                                                 
    //           |___/                                                  
    drawAddCycleMenu() {
        let html = this.drawAddEditCycleMenu('Add')
        html += `<button class='btn btn-primary add-cycle-submit'>Submit</button>`
        openModal(html)
        this.addCycleSubmit = $('.add-cycle-submit')
    }
    drawEditCycleMenu(cycleID) {
        let html = this.drawAddEditCycleMenu('Edit')
        html += `<div class='btn-group'>`
        html += `<button id='`+cycleID+`' class='btn btn-primary edit-cycle-submit'>Submit</button>`
        html += `<button id='`+cycleID+`' class='btn btn-danger edit-cycle-remove'><i class='fas fa-trash-alt'></i></button>`
        html += `</div>`
        openModal(html)
        this.editCycleSubmit = $('.edit-cycle-submit')
        this.editCycleRemove = $('.edit-cycle-remove')
    }
    drawAddEditCycleMenu(type) {
        let html = `
        <h3>`+type+` Cycle</h3>
        <div class='form-group row align-items-center'>
        <label for='start' class='col-12 col-md-2 text-left text-md-right'>Start</label>
        <input type='datetime-local' class='col form-control mr-5' id='start' placeholder='Start'>
        </div>
        <div class='form-group row align-items-center'>
        <label for='end' class='col-12 col-md-2 text-left text-md-right'>End</label>
        <input type='datetime-local' class='col form-control mr-5' id='end' placeholder='End'>
        </div>
        `
        return html
    }
    
    //    _       _                ____   _             _  _                    
    //   | |     (_)              |  _ \ (_)           | |(_)                   
    //   | |      _  _ __    ___  | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //   | |     | || '_ \  / _ \ |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //   | |____ | || | | ||  __/ | |_) || || | | || (_| || || | | || (_| |\__ \
    //   |______||_||_| |_| \___| |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //                                                                __/ |     
    //                                                               |___/      
    /**
    * Bind the add line controller to the view object click event
    * @param {Function} handler 
    */
    bindAddLineMenu(handler){
        this.addLineMenu.on('click', event=>{
            handler()
        })
    }
    bindAddLineSubmit(handler){
        this.addLineSubmit.on('click', event=>{
            let squadronID = $('#squadron').val()
            handler(squadronID)
            closeModal()
        })
    }
    bindEditLineMenu(handler){
        this.editLineMenu.on('click', event=>{
            let lineID = event.currentTarget.id
            handler(lineID)
        })
    }
    bindEditLineSubmit(handler){
        this.editLineSubmit.on('click', event=>{
            let lineID = event.currentTarget.id
            let squadronID = $('#squadron').val()
            handler(lineID, squadronID)
            closeModal()
        })
    }
    bindEditLineRemove(handler){
        this.editLineRemove.on('click', event=>{
            let lineID = event.currentTarget.id
            handler(lineID)
            closeModal()
        })
    }
    bindLineRemove(handler){
        this.lineRemove.on('click', event=>{
            let lineID = event.currentTarget.id
            handler(lineID)
        })
    }
    bindLineToggleDisplay(handler){
        this.lineToggleDisplay.on('click', event=>{
            let lineID = event.currentTarget.id
            handler(lineID)
        })
    }
    
    //    _       _                __  __                          
    //   | |     (_)              |  \/  |                         
    //   | |      _  _ __    ___  | \  / |  ___  _ __   _   _  ___ 
    //   | |     | || '_ \  / _ \ | |\/| | / _ \| '_ \ | | | |/ __|
    //   | |____ | || | | ||  __/ | |  | ||  __/| | | || |_| |\__ \
    //   |______||_||_| |_| \___| |_|  |_| \___||_| |_| \__,_||___/
    //                                                             
    //                                                             
    makeAddEditLineMenu(type,squadrons) {
        let html = `
        <h3>${type} Line</h3>
        <div class='form-group row align-items-center'>
        <label for='squadron' class='col-12 col-md-2 text-left text-md-right'>Squadron</label>
        <select class='col form-control mr-5' id='squadron'>`
        Object.values(squadrons).forEach((sqdrn, i) => {
            html += "<option value='"+sqdrn.ID+"'>"+sqdrn.name+"</option>";
        })
        html += `
        </select>
        </div>`
        return html
    }
    drawAddLineMenu(squadrons) {
        let html = this.makeAddEditLineMenu('Add',squadrons)
        html += `<button id='add-line-submit' class='btn btn-primary'>Submit</button>`
        openModal(html)
        this.addLineSubmit = $('#add-line-submit')
    }
    drawEditLineMenu(lineID, squadrons) {
        let html = this.makeAddEditLineMenu('Edit',squadrons)
        html += `<div class='btn-group'>`
        html += `<button id='`+lineID+`' class='btn btn-primary edit-line-submit'>Submit</button>`
        html += `<button id='`+lineID+`' class='btn btn-danger edit-line-remove'><i class='fas fa-trash-alt'></i></button>`
        html += `</div>`
        openModal(html)
        this.editLineSubmit = $('.edit-line-submit')
        this.editLineRemove = $('.edit-line-remove')
    }
    //    _       _                    __   _____               _    _        __      __ _                 
    //   | |     (_)                  / /  / ____|             | |  (_)       \ \    / /(_)                
    //   | |      _  _ __    ___     / /  | (___    ___   _ __ | |_  _   ___   \ \  / /  _   ___ __      __
    //   | |     | || '_ \  / _ \   / /    \___ \  / _ \ | '__|| __|| | / _ \   \ \/ /  | | / _ \\ \ /\ / /
    //   | |____ | || | | ||  __/  / /     ____) || (_) || |   | |_ | ||  __/    \  /   | ||  __/ \ V  V / 
    //   |______||_||_| |_| \___| /_/     |_____/  \___/ |_|    \__||_| \___|     \/    |_| \___|  \_/\_/  
    //                                                                                                     
    //                                                                                                     
    /**
    * @param {Model} airplan
    * @method drawSortieList populates the #sorties-view div view with sorties information
    */
    drawSortieList = (airplan) => {
        let html = ``
        html += `<details open>`
            html += `<summary class='h3'>Lines and Sorties</summary>`
            html += `<div class='list-group'>`
        Object.values(airplan.squadrons).forEach(squadron => {
            Object.values(airplan.lines).filter(line=>line.squadronID == squadron.ID).sort((a,b)=>a.start-b.start).forEach((line,i) => {
                let display='open'
                if(line.display!=undefined && !line.display){
                    display=''
                }
                html += `<details id='${line.ID}' ${display}>`
                    html += `<summary id='${line.ID}' class='list-group-item list-group-item-action line line-toggle-display'>`
                    html +=     `<b>${squadron.name}</b>: Line ${i+1} `
                    if (line.sorties.length) {
                        html +=  `<small>${line.start.toHHMM()}-${line.end.toHHMM()}</small> `
                    }
                    html +=      `<i id='${line.ID}' class='fas fa-trash-alt line-remove'></i> `
                    html +=      `<i id='${line.ID}' class='fas fa-edit edit-line-menu'></i> `
                    html += `</summary>`
                    html += `<div class='list-group list-group-flush'>`
                    Object.values(airplan.sorties).filter(sortie => sortie.lineID === line.ID).forEach(sortie => {
                        html += `<div id='${sortie.ID}' class='list-group-item list-group-item-action edit-sortie-menu px-4 py-1 sortie'>`
                            html += `<small>`
                                html += `<b>${sortie.event}:</b> ${sortie.start.toHHMM()}-${sortie.end.toHHMM()} ${sortie.note}`
                            html += `</small>`
                            html += `<i id='${sortie.ID}' class='fas fa-trash-alt sortie-remove'></i>`
                            html += `<i id='${sortie.ID}' class='fas fa-edit edit-sortie-menu'></i>`
                        html += `</div>`
                    })
                        html += `<div id='${line.ID}' class='list-group-item list-group-item-action px-4 py-1 sortie add-sortie-menu'>`
                            html += `<small><i class='fas fa-plus'></i> Add Sortie...</small>`
                        html += `</div>`
                    html += `</div>`
                html += `</details>`
            })
        })
                html += `<div class='list-group-item list-group-item-action add-line-menu'>`
                    html += `<i class='fas fa-plus'></i> Add Line...`
                html += `</div>`        
            html += `</div>`
        html += `</details>`
        
        $('#sorties-list').html(html)
        this.addLineMenu = $('.add-line-menu')
        this.editLineMenu = $('.edit-line-menu')
        this.lineRemove = $('.line-remove')
        this.addSortieMenu = $('.add-sortie-menu')
        this.editSortieMenu = $('.edit-sortie-menu')
        this.sortieRemove = $('.sortie-remove')
        this.lineToggleDisplay = $('.line-toggle-display')
    }
    //     _____               _    _         ____   _             _  _                    
    //    / ____|             | |  (_)       |  _ \ (_)           | |(_)                   
    //   | (___    ___   _ __ | |_  _   ___  | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //    \___ \  / _ \ | '__|| __|| | / _ \ |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //    ____) || (_) || |   | |_ | ||  __/ | |_) || || | | || (_| || || | | || (_| |\__ \
    //   |_____/  \___/ |_|    \__||_| \___| |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //                                                                           __/ |     
    //                                                                          |___/      
    /**
    * Bind the add sortie controller to the list view add sortie
    * @param {Function} handler 
    */
    bindAddSortieMenu(handler){
        this.addSortieMenu.on('click', event=>{
            let lineID = event.currentTarget.id
            handler(lineID)
        })
    }
    bindEditSortieMenu(handler){
        this.editSortieMenu.on('click', event=>{
            let sortieID = event.currentTarget.id
            handler(sortieID)
        })
    }
    bindAddSortieSubmit(handler){
        this.addSortieSubmit.on('click', event=>{
            let lineID = event.currentTarget.id
            let start = Date.parse($( "#start" ).val())
            let end   = Date.parse($( "#end"   ).val())
            let startType = $( "#startType" ).val()
            let endType   = $( "#endType" ).val()
            let note = $( "#note" ).val()
            let startCycleID = $('.start-on-cycle').prop('checked') ? $('#start-cycle').val() : null
            let endCycleID   = $('.end-on-cycle').prop('checked')   ? $('#end-cycle').val()   : null
            let isAlert = $('#isAlert').prop('checked')
            handler(lineID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert)
            closeModal()
        })
    }
    bindEditSortieSubmit(handler){
        this.editSortieSubmit.on('click', event=>{
            let sortieID = event.currentTarget.id
            let start = Date.parse($( "#start" ).val())
            let end   = Date.parse($( "#end"   ).val())
            let startType = $( "#startType" ).val()
            let endType   = $( "#endType" ).val()
            let note = $( "#note" ).val()
            let startCycleID = $('.start-on-cycle').prop('checked') ? $('#start-cycle').val() : null
            let endCycleID = $('.end-on-cycle').prop('checked') ? $('#end-cycle').val() : null
            let isAlert = $('#isAlert').prop('checked')
            handler(sortieID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert)
            closeModal()
        })
    }
    /**
    * 
    * @param {Function} handler Bind the delete sortie controller to the delete button on the edit menu
    */
    bindEditSortieRemove(handler){
        this.editSortieRemove.on('click', event=>{
            let sortieID = event.currentTarget.id
            handler(sortieID)
            closeModal()
        })
    }
    bindSortieRemove(handler){
        this.sortieRemove.on('click', event=>{
            let sortieID = event.currentTarget.id
            handler(sortieID)
        })
    }
    
    
    //     _____               _    _         __  __                          
    //    / ____|             | |  (_)       |  \/  |                         
    //   | (___    ___   _ __ | |_  _   ___  | \  / |  ___  _ __   _   _  ___ 
    //    \___ \  / _ \ | '__|| __|| | / _ \ | |\/| | / _ \| '_ \ | | | |/ __|
    //    ____) || (_) || |   | |_ | ||  __/ | |  | ||  __/| | | || |_| |\__ \
    //   |_____/  \___/ |_|    \__||_| \___| |_|  |_| \___||_| |_| \__,_||___/
    //                                                                        
    //                                                                        
    makeAddEditSortieMenu(line, cycleList) {
        let html = '<h3>Add/Edit Sortie: ' + line.squadron.name + ' Line ' + line.number+'</h3>'
        html += `<input type='checkbox' class='start-on-cycle'>Attach launch to cycle</input>`
        html += `<input type='checkbox' class='end-on-cycle'>Attach recovery to cycle</input>`
        // Start Time
        html += `<div class='form-group row align-items-center start-time'>`;
        html += `<label for='start' class='col-12 col-md-3 text-left text-md-right'>Start Time</label>`;
        html += `<input type='datetime-local' class='col form-control mr-5' id='start' placeholder='0000'>`;
        html += `</div>`;
        // Start cycle
        html += `<div class='form-group row align-items-center start-cycle'>`;
        html += `<label for='start-cycle' class='col-12 col-md-3 text-left text-md-right'>Start Cycle</label>`;
        html += `<select type='text' class='col form-control mr-5' id='start-cycle' placeholder='0000'>`;
        cycleList.forEach(cycle=>{
            html += `<option value='${cycle.ID}'>${cycle.number}</option>`
        })
        html += `</select>`;
        html += `</div>`;
        // Start Condition
        html += `<div class='form-group row align-items-center'>`;
        html += `<label for='startType' class='col-12 col-md-3 text-left text-md-right'>Start Condition</label>`;
        html += `<select type='text' class='col form-control mr-5' id='startType' placeholder='Start Condition'>`;
        html += `<option value='pull'>Pull</option>`;
        html += `<option value='flyon'>Fly On</option>`;
        html += `<option value='hp'>Hot Pump</option>`;
        html += `<option value='hpcs'>Hot Pump & Crew Swap</option>`;
        html += `</select>`;
        html += `</div>`;
        // End time
        html += `<div class='form-group row align-items-center end-time'>`;
        html += `<label for='end' class='col-12 col-md-3 text-left text-md-right'>End Time</label>`;
        html += `<input type='datetime-local' class='col form-control mr-5' id='end' placeholder='0000'>`;
        html += `</div>`;
        // end cycle
        html += `<div class='form-group row align-items-center end-cycle'>`;
        html += `<label for='end-cycle' class='col-12 col-md-3 text-left text-md-right'>end Cycle</label>`;
        html += `<select type='text' class='col form-control mr-5' id='end-cycle' placeholder='0000'>`;
        cycleList.forEach(cycle=>{
            html += `<option value='${cycle.ID}'>${cycle.number}</option>`
        })
        html += `</select>`;
        html += `</div>`;
        // End Condition
        html += `<div class='form-group row align-items-center'>`;
        html += `<label for='endType' class='col-12 col-md-3 text-left text-md-right'>End Condition</label>`;
        html += `<select type='text' class='col form-control mr-5' id='endType' placeholder='End Condition'>`;
        html += `<option value='stuff'>Stuff</option>`;
        html += `<option value='flyoff'>Fly Off</option>`;
        html += `<option value='hp'>Hot Pump</option>`;
        html += `<option value='hpcs'>Hot Pump & Crew Swap</option>`;
        html += `</select>`;
        html += `</div>`;
        // note
        html += `<div class='form-group row align-items-center'>`;
        html += `<label for='note' class='col-12 col-md-3 text-left text-md-right'>Note</label>`;
        html += `<input type='text' class='col form-control mr-5' id='note' placeholder='Mission'>`;
        html += `</div>`;
        // isAlert
        html += `<div class='form-gorup row align-items-center'>`
        html += `<label for='isAlert' class='col-12 col-md-3 text-left text-md-right'>Alert?</label>`
        html += `<input type='checkbox' class='col form-control mr-5' id='isAlert'>`
        html += `</div>`
        return html
    }
    /**
    * I don't know if this actually needs to be async. I don't think it does.
    * If you remove the async, then contrller.handleAddSortieMenu needs to change
    * it is expecting a promise.
    * @param {Line} line 
    */
    async drawAddSortieMenu(line,cycleList) {
        let html = this.makeAddEditSortieMenu(line,cycleList)
        html += "<button id='"+line.ID+"' class='btn btn-primary add-sortie-submit'>Submit</button>";
        openModal(html)
        this.addSortieSubmit = $('.add-sortie-submit')
        this.startOnCycle = $('.start-on-cycle')
        this.endOnCycle = $('.end-on-cycle')
        this.startOnCycle.change(this.handleStartOnCycleToggle)
        this.endOnCycle.change(this.handleEndOnCycleToggle)
    }
    drawEditSortieMenu(sortie,cycleList) { 
        let line = sortie.line
        let html = this.makeAddEditSortieMenu(line,cycleList)
        html += "<div class='btn-group'>";
        html += "<button id='"+sortie.ID+"' class='btn btn-primary edit-sortie-submit'>Submit</button>";
        html += "<button id='"+sortie.ID+"' class='btn btn-danger  edit-sortie-remove'><i class='fas fa-trash-alt'></i></button>";
        html += "</div>";
        openModal(html)
        this.editSortieSubmit = $('.edit-sortie-submit')
        this.editSortieRemove = $('.edit-sortie-remove')
        this.startOnCycle = $('.start-on-cycle')
        this.endOnCycle = $('.end-on-cycle')
        this.startOnCycle.change(this.handleStartOnCycleToggle)
        this.endOnCycle.change(this.handleEndOnCycleToggle)
    }
    handleStartOnCycleToggle(event){
        if(event.currentTarget.checked){
            $('.start-cycle').show()
            $('.start-time').hide()
        }else{
            $('.start-cycle').hide()
            $('.start-time').show()
        }
    }
    handleEndOnCycleToggle(event){
        if(event.currentTarget.checked){
            $('.end-cycle').show()
            $('.end-time').hide()
        }else{
            $('.end-cycle').hide()
            $('.end-time').show()
        }
    }
    
    //     _____                                 ____   _             _  _                    
    //    / ____|                               |  _ \ (_)           | |(_)                   
    //   | |      __ _  _ __ __   __ __ _  ___  | |_) | _  _ __    __| | _  _ __    __ _  ___ 
    //   | |     / _` || '_ \\ \ / // _` |/ __| |  _ < | || '_ \  / _` || || '_ \  / _` |/ __|
    //   | |____| (_| || | | |\ V /| (_| |\__ \ | |_) || || | | || (_| || || | | || (_| |\__ \
    //    \_____|\__,_||_| |_| \_/  \__,_||___/ |____/ |_||_| |_| \__,_||_||_| |_| \__, ||___/
    //                                                                              __/ |     
    //                                                                             |___/      
    /**
    * Bind the canvas click controller to the view object click event
    * @param {Function} handler Universal handler for all canvas click events. Sorts out which element was clicked based on Konva name and id values.
    */
    bindCanvasClick(handler) {
        this.stage.find('.highlight').forEach(element => {
            element.off('click')
            element.on('click', event => {
                handler(element)
            })
        })
    }
    bindEditHeaderSubmit(handler){
        this.editHeaderSubmit.on('click', event=>{
            let title = $('#title').val();
            let subtitle = $('#subtitle').val();
            let date = $('#date').val();
            let start = $('#start').val();
            let end = $('#end').val();
            let sunrise = $('#sunrise').val();
            let sunset = $('#sunset').val();
            let moonrise = $('#moonrise').val();
            let moonset = $('#moonset').val();
            let moonphase = $('#moonphase').val();
            let flightquarters = $('#flightquarters').val();
            let heloquarters = $('#heloquarters').val();
            let variation = $('#variation').val();
            let timezone = $('#timezone').val();
            handler(title, subtitle, date, start, end, sunrise, sunset, moonrise, moonset, moonphase, flightquarters, heloquarters, variation, timezone)
            closeModal()
        })
    }
    //    _    _                   _               __  __                          
    //   | |  | |                 | |             |  \/  |                         
    //   | |__| |  ___   __ _   __| |  ___  _ __  | \  / |  ___  _ __   _   _  ___ 
    //   |  __  | / _ \ / _` | / _` | / _ \| '__| | |\/| | / _ \| '_ \ | | | |/ __|
    //   | |  | ||  __/| (_| || (_| ||  __/| |    | |  | ||  __/| | | || |_| |\__ \
    //   |_|  |_| \___| \__,_| \__,_| \___||_|    |_|  |_| \___||_| |_| \__,_||___/
    //                                                                             
    //                                                                             
    drawEditHeaderData(airplan) {
        let html = `<h3>Airplan Settings</h3>`
        // Title
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='title' class='col-12 col-md-3 text-left text-md-right'>Title</label>";
        html += "<input type='text' class='col form-control mr-5' id='title' placeholder='Airplan Title'>";
        html += "</div>";
        // Subtitle
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='subtitle' class='col-12 col-md-3 text-left text-md-right'>Subtitle</label>";
        html += "<input type='text' class='col form-control mr-5' id='subtitle' placeholder='Airplan Subtitle'>";
        html += "</div>";
        // Start
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='start' class='col-12 col-md-3 text-left text-md-right'>Start Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='start' placeholder='0000'>";
        html += "</div>";
        // End
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='end' class='col-12 col-md-3 text-left text-md-right'>End Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='end' placeholder='0000'>";
        html += "</div>";
        // Sunrise
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='sunrise' class='col-12 col-md-3 text-left text-md-right'>Sunrise Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='sunrise' placeholder='0000'>";
        html += "</div>";
        // sunset Time
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='sunset' class='col-12 col-md-3 text-left text-md-right'>Sunset Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='sunset' placeholder='0000'>";
        html += "</div>";
        // moonrise Time
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='moonrise' class='col-12 col-md-3 text-left text-md-right'>Moonrise Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='moonrise' placeholder='0000'>";
        html += "</div>";
        // moonset Time
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='moonset' class='col-12 col-md-3 text-left text-md-right'>Moonset Time</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='moonset' placeholder='0000'>";
        html += "</div>";
        // Moon phase
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='moonphase' class='col-12 col-md-3 text-left text-md-right'>Moon Phase</label>";
        html += "<input type='text' class='col form-control mr-5' id='moonphase' placeholder='__%'>";
        html += "</div>";
        // Flight Quarters
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='flightquarters' class='col-12 col-md-3 text-left text-md-right'>Flight Quarters</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='flightquarters' placeholder='0000'>";
        html += "</div>";
        // Helo Quarters
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='heloquarters' class='col-12 col-md-3 text-left text-md-right'>Helo Quarters</label>";
        html += "<input type='datetime-local' class='col form-control mr-5' id='heloquarters' placeholder='0000'>";
        html += "</div>";
        // Magvar
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='variation' class='col-12 col-md-3 text-left text-md-right'>Mag Var</label>";
        html += "<input type='text' class='col form-control mr-5' id='variation' placeholder='__E/W'>";
        html += "</div>";
        // Time Zone
        html += "<div class='form-group row align-items-center'>";
        html += "<label for='timezone' class='col-12 col-md-3 text-left text-md-right'>Timezone</label>";
        html += "<input type='text' class='col form-control mr-5' id='timezone' placeholder='__(+/-)'>";
        html += "</div>";
        html += "<button class='btn btn-primary edit-header-submit'>Submit</button>";
        openModal(html)
        this.editHeaderSubmit = $('.edit-header-submit')
    }
    
    //     _____                                __      __ _                 
    //    / ____|                               \ \    / /(_)                
    //   | |      __ _  _ __ __   __ __ _  ___   \ \  / /  _   ___ __      __
    //   | |     / _` || '_ \\ \ / // _` |/ __|   \ \/ /  | | / _ \\ \ /\ / /
    //   | |____| (_| || | | |\ V /| (_| |\__ \    \  /   | ||  __/ \ V  V / 
    //    \_____|\__,_||_| |_| \_/  \__,_||___/     \/    |_| \___|  \_/\_/  
    //                                                                       
    //                                                                       
    /**
    * @param {Model} airplan Create the Konva object and draw the airplan on it.
    */
    drawStage = (airplan) => { 
        // Create Stage
        this.stage = new Konva.Stage({
            container: 'graphic-stage',   // id of container <div>
            width: this.sceneWidth,
            height: this.sceneHeight,
        });
        
        // Page Layer
        this.pageLayer = new Konva.Layer().addTo(this.stage);
        
        // Print Area
        this.printArea = new Konva.Group({
            x: this.margin.left,
            y: this.margin.top,  
            width: this.sceneWidth-this.margin.left-this.margin.right,
            height: this.sceneHeight-this.margin.top-this.margin.bottom,
        }).addTo(this.pageLayer);
        
        new Konva.Rect({ width: this.printArea.width(), height: this.printArea.height(), stroke:'black', strokeWidth: 1})
        .addTo(this.printArea);
        
        // Header
        this.header = new Konva.Group({
            width: this.printArea.width(),
            height: this.headerHeight,
        }).addTo(this.printArea);
        
        new Konva.Line({
            points: [0,this.header.height(),this.header.width(),this.header.height()],
            stroke:'black',
            strokeWidth:1,
        }).addTo(this.header);
        
        // Header.Slap
        new Konva.Group({
            id: 'slap',
            name: 'header',
            x: config.body.padding,
            y: config.body.padding,
        }).addTo(this.header)
        
        new Konva.Text({
            id: 'slap.label',
            text: ['sunrise', 'sunset', 'moonrise', 'moonset','moonphase'].join('\n').toUpperCase(),
        }).addTo(this.stage.findOne('#slap'));
        
        new Konva.Text({
            text: ['sunrise', 'sunset', 'moonrise', 'moonset'].map(k=>airplan[k].toHHMM()).concat(airplan.moonphase).join('\n'),
            offsetX: -this.stage.findOne('#slap.label').width() - config.body.padding,
        }).addTo(this.stage.findOne('#slap'));
        
        this.stage.findOne('#slap').fitToChildren().addHighlightBox();
        
        // Header.Title
        new Konva.Group({id: 'title', name:'header', x: this.header.width()/2, y: config.body.padding }).addTo(this.header)
        
        new Konva.Text({
            id: 'title.title',
            text: airplan.title,
            fontSize: config.title.fontSize,
            fontFamily: config.title.fontFamily,
        }).addTo(this.stage.findOne('#title')).anchorTopMiddle()
        
        new Konva.Text({
            id: 'title.subtitle',
            y: this.stage.findOne('#title.title').height() + config.subtitle.padding,
            text: airplan.subtitle,
            fontSize : config.subtitle.fontSize,
        }).addTo(this.stage.findOne('#title')).anchorTopMiddle()
        
        this.stage.findOne('#title').fitToChildren().addHighlightBox();
        
        // Header.Time
        new Konva.Group({ id: 'time', name:'header', x: this.header.width()-config.body.padding, y: config.body.padding }).addTo(this.header)
        
        // Time Labels
        new Konva.Text({
            text: ['flight quarters:','Helo quarters:','Mag Var:','Time Zone:'].join('\n').toUpperCase(), 
            id: 'time.label',
            align: 'right' 
        }).addTo(this.stage.findOne('#time'));
        
        // Time Values
        new Konva.Text({
            text: ['flightquarters','heloquarters'].map(k=>airplan[k].toHHMM()).concat([airplan.variation,airplan.timezone]).join('\n'),
            id: 'time.value',
            x: this.stage.findOne('#time.label').width() + config.body.padding
        }).addTo(this.stage.findOne('#time'));
        
        this.stage.findOne('#time').fitToChildren().anchorTopRight().addHighlightBox();
        
        // Events
        this.events = new Konva.Group({
            id: 'events',
            y: this.header.height(),
            width: this.printArea.width(),
            height: this.printArea.height()-this.header.height()
        }).addTo(this.printArea);
        
        // Horizontal Line below sun/moon
        new Konva.Line({stroke:'black', strokeWidth:1, points: [0,this.topRow, this.events.width(),this.topRow]}).addTo(this.events);
        
        // Horizontal Line across top of sorties
        new Konva.Line({stroke:'black', strokeWidth:1, points: [0,2*this.topRow, this.events.width(),2*this.topRow]}).addTo(this.events);
        
        // Vertical Line along right side of squadrons
        new Konva.Line({stroke:'black', strokeWidth:1, points: [this.leftCol,2*this.topRow, this.leftCol, this.events.height()-this.bottomRow]}).addTo(this.events);
        
        // Vertical Line along right side of squadron letter
        new Konva.Line({stroke:'black', strokeWidth:1, points: [this.leftCol+this.letterCol,2*this.topRow, this.leftCol+this.letterCol, this.events.height()]}).addTo(this.events);
        
        // Horizontal Line across bottom of sorties
        new Konva.Line({stroke:'black', strokeWidth:1, points: [0,this.events.height()-this.bottomRow, this.events.width(), this.events.height()-this.bottomRow]}).addTo(this.events);
        
        // Vertical Line along the left side of day/night totals
        new Konva.Line({stroke:'black', strokeWidth:1, points: [this.events.width()-this.rightCol,this.topRow, this.events.width()-this.rightCol, this.events.height()]}).addTo(this.events);
        
        // Text label for Squadron column
        new Konva.Text({text:'SQUADRON', x: this.leftCol/2, y: 1.5 * this.topRow}).addTo(this.events).anchorCenter();
        
        // Text label for Launch/Land totals
        new Konva.Text({text:'LAUNCH/LAND', x: (this.leftCol+this.letterCol)/2, y: this.events.height()-this.bottomRow/2}).addTo(this.events).anchorCenter()
        
        // Text Label for day/night totals
        new Konva.Text({text:'D/N', x: this.events.width()-this.rightCol/2, y: 1.5 * this.topRow,}).addTo(this.events).anchorCenter()
        
        // Events.Timebox
        this.timebox = new Konva.Group({
            id: 'timebox',
            x: this.leftCol + this.letterCol,
            width: this.events.width() - this.leftCol - this.letterCol - this.rightCol,
            height: this.events.height() - this.bottomRow,
        }).addTo(this.events)
        
        /** Sunrise Group */
        new Konva.Group({id:'sunrise',name:'timeline', x: this.time2pixels(airplan.sunrise,airplan), y: 20 }).addTo(this.timebox).anchorCenter()
        
        // Sunrise
        new Konva.Arc({ angle: 180, outerRadius: 15, clockwise: true, stroke:'black', strokeWidth:1 }).addTo(this.stage.findOne('#sunrise'));
        
        // Sunrise Text
        new Konva.Text({ text: airplan.sunrise.toHHMM(), y: -20 }).addTo(this.stage.findOne('#sunrise')).anchorBottomMiddle();
        
        this.stage.findOne('#sunrise').fitToChildren().addHighlightBox()
        
        /** Sunset Group */
        new Konva.Group({id:'sunset',name:'timeline', x: this.time2pixels(airplan.sunset,airplan), y: 20 }).addTo(this.timebox).anchorCenter()
        
        // Sunset
        new Konva.Arc({ angle: 180, outerRadius: 15, clockwise: true, stroke:'black', fill: 'black', strokeWidth:1 }).addTo(this.stage.findOne('#sunset'));
        
        // Sunset Text
        new Konva.Text({ text: airplan.sunset.toHHMM(), y: -20 }).addTo(this.stage.findOne('#sunset')).anchorBottomMiddle();
        
        this.stage.findOne('#sunset').fitToChildren().addHighlightBox()
        
        /** Timebox.Start/End */
        new Konva.Text({ text: `\u21A6${airplan.start.toHHMM()}`, y: this.topRow*2.5 }).addTo(this.timebox).anchorTopLeft()
        new Konva.Text({ text: airplan.end.toHHMM()+'\u21A4',   y: this.topRow*2.5, x: this.timebox.width() }).addTo(this.timebox).anchorTopRight()
        
        /** Timebox.Cycles */
        Object.values(airplan.cycles).forEach((cycle,i)=>{
            let group = new Konva.Group({
                id: `cycle${i}`,
                x: this.time2pixels(cycle.start,airplan),
                y: this.topRow*2,
                width: this.time2pixels(cycle.end,airplan) - this.time2pixels(cycle.start,airplan),
                height: this.timebox.height() - this.topRow*2,
            }).addTo(this.timebox)
            // Start of Cycle lineebox)
            new Konva.Line({ stroke:'black', strokeWidth:1, points: [0,0,0,group.height()+this.bottomRow]}).addTo(group)
            // End of Cycle Line
            new Konva.Line({ stroke:'black', strokeWidth:1, points: [group.width(),0,group.width(),group.height()+this.bottomRow]}).addTo(group)
            // Cycle # Label
            new Konva.Text({ text:cycle.number,      x: group.width()/2 }).addTo(group).anchorBottomMiddle()
            // Cycle Launch Count
            new Konva.Text({ text:cycle.launchCount, y: group.height() }).addTo(group).anchorTopRight({padX:5,padY:5})
            // Cycle Land Count
            new Konva.Text({ text:cycle.landCount,   x: group.width(), y: group.height() }).addTo(group).anchorTopLeft({padX:5,padY:5})
            // Cycle Start Time
            new Konva.Text({ text:cycle.start.toHHMM() }).addTo(group).anchorBottomMiddle()
            // Cycle End Time
            new Konva.Text({ text:cycle.end.toHHMM(), x: group.width() }).addTo(group).anchorBottomMiddle()
        })
        
        /** Events.Squadrons */
        this.squadrons = new Konva.Group({ y: 2*this.topRow, width: this.events.width(), height: this.events.height()-this.bottomRow-2*this.topRow}).addTo(this.events)
        
        let spacing = Object.keys(airplan.squadrons).length ? this.squadrons.height() / (Object.keys(airplan.squadrons).length) : this.squadrons.height()
        // For each squadron
        Object.values(airplan.squadrons).forEach((squadron,i)=>{
            // Group for Squadron Text
            let group = new Konva.Group({id:squadron.ID, name:'squadron', x: this.leftCol/2, y: (i+.5)*spacing}).addTo(this.squadrons).anchorCenter()
            
            // Squadron Text
            new Konva.Text({align: 'center', text: [squadron.name,squadron.cs,squadron.tms,squadron.modex].join('\n').toUpperCase()}).addTo(group).anchorCenter()
            
            group.fitToChildren().addHighlightBox();
            
            // Squadron Letter
            new Konva.Text({ text: squadron.letter, x: this.leftCol/2+this.letterCol/2 }).addTo(group).anchorCenter()
            
            // Horizontal Line across bottom of squadron
            new Konva.Line({stroke:'black', strokeWidth:1, points: [0,(i+1)*spacing, this.squadrons.width(), (i+1)*spacing]}).addTo(this.squadrons);
            
            // Group for D/N Totals
            group = new Konva.Group({x: this.squadrons.width()-this.rightCol/2, y: (i+.5)*spacing}).addTo(this.squadrons).anchorCenter()
            
            // D/N Totals Text
            new Konva.Text({ text: squadron.day + '/' + squadron.night }).addTo(group).anchorCenter()
            
            // Squadron.Timebox
            let timebox = new Konva.Group({
                x: this.leftCol + this.letterCol,
                y: i*spacing,
                width: this.squadrons.width() - this.leftCol - this.letterCol-this.rightCol,
                height: spacing,
            }).addTo(this.squadrons)
            
            let lineCount = Object.values(airplan.lines).filter(l=>l.squadronID==squadron.ID).length
            let lineSpace = timebox.height() / (lineCount+1) //=> Heuristic for placing lines nicely
            // For each line in this squadron, sorting lines by start time. Lines will flow top left to bottom right
            Object.values(airplan.lines).filter(l=>l.squadronID==squadron.ID).sort((a,b)=>a.start-b.start).forEach((line,j)=>{
                // Draw all of the sorties
                line.sorties.forEach((sortie,k)=>{
                    // Group for sortie, to simplify drawing dimensions
                    let sortieGroup = new Konva.Group({
                        x: this.time2pixels(sortie.start,airplan),
                        y: (1+j)*lineSpace,
                        width: this.time2pixels(sortie.end,airplan) - this.time2pixels(sortie.start,airplan),
                        id: sortie.ID,
                        name: 'sortie',
                    }).addTo(timebox)
                    
                    // Sortie Line
                    new Konva.Line({stroke:'black', strokeWidth:1, points:[0,0,sortieGroup.width(),0], dash:[10,10], dashEnabled: sortie.isAlert}).addTo(sortieGroup)
                    View.drawCondition[sortie.startType](0,0).addTo(sortieGroup)
                    View.drawCondition[sortie.endType](sortieGroup.width(),0).addTo(sortieGroup)
                    
                    // Event + Note
                    new Konva.Text({ text:`${sortie.event} ${sortie.note}`,x:1,fontSize:10}).addTo(sortieGroup).anchorBottomLeft({padX:2,padY:2})
                    
                    sortieGroup.fitToChildren().addHighlightBox({minSize:4,strokeWidth:4})
                })
            })
        })
        // this.fitStageIntoParentContainer();
    }
    
    //     _____                                 _    _        _                         
    //    / ____|                               | |  | |      | |                        
    //   | |      __ _  _ __ __   __ __ _  ___  | |__| |  ___ | | _ __    ___  _ __  ___ 
    //   | |     / _` || '_ \\ \ / // _` |/ __| |  __  | / _ \| || '_ \  / _ \| '__|/ __|
    //   | |____| (_| || | | |\ V /| (_| |\__ \ | |  | ||  __/| || |_) ||  __/| |   \__ \
    //    \_____|\__,_||_| |_| \_/  \__,_||___/ |_|  |_| \___||_|| .__/  \___||_|   |___/
    //                                                           | |                     
    //                                                           |_|                     
    // Create an element with an optional CSS class
    createElement(tag, className) {
        const element = document.createElement(tag)
        if (className) element.classList.add(className)
        return element
    }
    
    // Retrieve an element from the DOM
    getElement(selector) {
        const element = document.querySelector(selector)
        return element
    }
    
    time2pixels = (time,airplan) => {
        let pixels = (time-airplan.start) * this.timebox.width()/(airplan.end-airplan.start)
        pixels = pixels<0 ? 0 : pixels
        pixels = pixels>this.timebox.width() ? this.timebox.width(): pixels
        return pixels
    }
    
    fitStageIntoParentContainer = () => {
        var container = this.stage.container();
        // now we need to fit stage into parent container
        var containerWidth = container.offsetWidth;
        // but we also make the full scene visible so we need to scale all objects on canvas
        var scaleLimW = containerWidth / this.sceneWidth;
        var scaleLimH = window.innerHeight / this.sceneHeight;
        var scale = Math.min(scaleLimW, scaleLimH);
        this.stage.width(this.sceneWidth * scale);
        this.stage.height(this.sceneHeight * scale);
        this.stage.scale({ x: scale, y: scale });
    }
    
    static drawCondition = {
        flyon: (x,y) => {
            return new Konva.Line({ points: [x-12,y-12,x,y],stroke: 'black', lineWidth:1, })
        },
        flyoff: (x,y) => {
            return new Konva.Line({ points: [x,y,x+12,y-12],stroke: 'black', lineWidth:1, })
        },
        pull: (x,y) => {
            return new Konva.Line({ points: [x,y-8,x,y+8],stroke: 'black', lineWidth:1, })
        },
        stuff: (x,y) => {
            return new Konva.Line({ points: [x,y-8,x,y+8],stroke: 'black', lineWidth:1, })
        },
        hp: (x,y) => {
            return new Konva.Line({
                points: [x,y+5, x+4,y,  x,y-5,  x-4,y,  x,y+5],
                stroke: 'black',
                lineWidth:1,
                closed: true,
                fill: 'white', fillEnabled: true,
            })
        },
        hpcs: (x,y) => {
            return new Konva.Line({
                points: [x,y+5, x+4,y,  x,y-5,  x-4,y,  x,y+5],
                stroke: 'black',
                lineWidth:1,
                closed: true,
                fill: 'black', fillEnabled: true,
            })
        }
    }
}
