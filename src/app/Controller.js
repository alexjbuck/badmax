class Controller {
    constructor() {
        this.airplan = new Model();
        this.view = new View();
        window.addEventListener('resize', this.view.fitStageIntoParentContainer);
        this.onAirplanChanged();
        this.view.fitStageIntoParentContainer();
        
        // Bind Model update events
        this.airplan.bindOnChange(this.onAirplanChanged)
        
        // Bind Menu Buttons. This only needs to be done once because the menu is not redrawn.
        this.view.bindMenuAddPlaceholderSquadron(this.handleAddPlaceholderSquadron)
        this.view.bindMenuRemoveSquadron(this.handleRemoveBottomSquadron)
        this.view.bindMenuReset(this.handleReset)
        this.view.bindMenuRefresh(this.handleRefresh)
        this.view.bindMenuLoad(this.handleLoadFile)
        this.view.bindMenuSave(this.handleSaveFile)
        this.view.bindMenuExport(this.handleExportFile)
        this.view.bindMenuHelp(this.handleHelp)
        this.view.bindMenuFeedback(this.handleFeedback)
        
        // Draw the spash page help.
        this.view.drawHelp()
    }
    
    /**
    * Core function to handle any updates that need to occur when the model changes.
    * @callback onAirplanChanged This is called when the model changes.
    */
    onAirplanChanged = () => {
        // Redraw the view.
        this.view.drawStage(this.airplan);
        this.view.drawCycleList(this.airplan);
        this.view.drawSortieList(this.airplan);        
        
        // Bind items in the stage and list view.
        // We need to rebind each time we draw because the elements are recreated.
        this.view.bindAddCycleMenu(this.handleAddCycleMenu)
        this.view.bindEditCycleMenu(this.handleEditCycleMenu)
        this.view.bindEditCycleRemove(this.handleRemoveCycle)
        
        this.view.bindAddLineMenu(this.handleAddLineMenu)
        this.view.bindEditLineMenu(this.handleEditLineMenu)
        this.view.bindLineRemove(this.handleRemoveLine)
        this.view.bindLineToggleDisplay(this.handleToggleLineDisplay)
        
        this.view.bindAddSortieMenu(this.handleAddSortieMenu)
        this.view.bindEditSortieMenu(this.handleEditSortieMenu)
        this.view.bindSortieRemove(this.handleRemoveSortie)

        this.view.bindCanvasClick(this.handleCanvasClick)
        this.view.fitStageIntoParentContainer();
    }
    
    /**
     * MENU VIEW UNIQUE EVENTS
     */ 
    handleAddPlaceholderSquadron = () => {
        this.airplan.addSquadron('Squadron ' + (Object.keys(this.airplan.squadrons).length+1),'CS','TMS','MODEX')
    }
    handleReset = () => { this.airplan.init() }
    handleRefresh = () => { this.onAirplanChanged(); this.view.fitStageIntoParentContainer() }
    handleLoadFile = (file) => {
        let reader = new FileReader();
        reader.onload = (e) => {
            let data = JSON.parse(e.target.result)
            this.airplan.load(data)
        }
        reader.readAsText(file)
    }
    handleSaveFile = () => {
        let file = new Blob([JSON.stringify(this.airplan,getCircularReplacer())], {type: "application/json"})
        saveAs(file,this.airplan.date.toYYYYMMDD()+".json")
    }
    handleExportFile = () => {
        let w = 11
        let h = 8.5
        let m = .01
        var pdf = new jspdf.jsPDF('l', 'in', [8.5, 11]);
        let imgData = this.view.stage.toDataURL({mimeType: 'image/png', quality: 1, pixelRatio: 3});
        pdf.addImage(imgData, 'JPEG', m*w/2, m*h/2, w*(1-m), h*(1-m), undefined, 'FAST');
        pdf.save('airplan_'+this.airplan.date.toYYYYMMDD()+'.pdf');    
    }
    handleHelp = () => { this.view.drawHelp() }
    
    handleFeedback = () => {
        let email = `alexander.j.buck@navy.mil`
        let subject=`BadMax Airplan Writer Feedback`
        let body=`If you're reporting an issue, please save and export your working file. Attach the json and pdf to this email to assist troubleshooting.%0d%0a%0d%0aThree things I liked:%0d%0a1. %0d%0a2. %0d%0a3. %0d%0a%0d%0aThree things I did not like:%0d%0a1. %0d%0a2. %0d%0a3. %0d%0a%0d%0aAny other feedback:%0d%0a%0d%0aThank You!`
        window.open(`mailto:${email}?subject=${subject}&body=${body}`)
    }

    /**
     * ADD/EDIT MENU HANDLERS
     */
    /**
    * @method handleAddCycleMenu is called when the user clicks the add cycle button.
    * It draws the menu and binds the submit button.
    * It prepopulates the start and end fields based on the following rules:
    *  - The start time is set based on the following priorities:
    *    1. The last cycle's end time
    *    2. One hour after the airplan's start time
    *  - The end time is set based on the following priorities:
    *    1. The start time plus one hour
    */
    handleAddCycleMenu = () => {
        this.view.drawAddCycleMenu()
        let start = new Date()
        let end = new Date()
        if (Object.keys(this.airplan.cycles).length > 0) {
            start = new Date(this.airplan.cycleList.at(-1).end)
        } else {
            start = new Date(this.airplan.start.valueOf() + 3600*1000)
        }
        end = new Date(start.valueOf() + 3600*1000)
        $('#start').val(start.toLocalTimeString())
        $('#end').val(end.toLocalTimeString())
        this.view.bindAddCycleSubmit(this.handleAddCycle) 
    }    
    handleEditCycleMenu = (cycleID) => {
        this.view.drawEditCycleMenu(cycleID)
        let cycle = this.airplan.cycles[cycleID]
        $('#start').val(cycle.start.toLocalTimeString())
        $('#end').val(cycle.end.toLocalTimeString())
        this.view.bindEditCycleSubmit(this.handleEditCycle)
        this.view.bindEditCycleRemove(this.handleRemoveCycle)
    }
    handleAddLineMenu = () => {
        this.view.drawAddLineMenu(this.airplan.squadrons)
        this.view.bindAddLineSubmit(this.handleAddLine)
    }
    handleEditLineMenu = (lineID) => {
        this.view.drawEditLineMenu(lineID, this.airplan.squadrons)
        $('#squadron').val(this.airplan.lines[lineID].squadronID)
        this.view.bindEditLineSubmit(this.handleEditLine)
        this.view.bindEditLineRemove(this.handleRemoveLine)
    }
    /**
    * @method handleAddSortieMenu is called when the user clicks on the add sortie button.
    * It draws the menu and binds the submit button.
    * It prepopulates the fields based on the following rules:
    *  - The start time is set based on the following priorities:
    *    1. The start time is the end time of the line's last sortie if this is not the first sortie in the line.
    *    2. The start time is the start of the first cycle, if there is a cycle.
    *    3. The start time is the start of the airplan timeline.
    *  - The end time is set based on the following priorities:
    *    1. The end time is the cycle end time if the start was set to the cycle start time.
    *    1. The end time is 1 hour after the start time
    *  - The start type is set based on the following priorities:
    *    1. The start type is the end type of the line's last sortie if this is not the first sortie in the line.
    *    2. The start type is a pull.
    *  - The end type is set based on the following priorities:
    *    1. The end type is a stuff.
    *  - The start cycle is set based on the following priorities:
    *    1. The start cycle ID is null.
    *  - The end cycle is set based on the following priorities:
    *    1. The end cycle ID is null.
    * @param {String} lineID 
    */
    handleAddSortieMenu = (lineID) => {
        this.view.drawAddSortieMenu(this.airplan.lines[lineID], this.airplan.cycleList)
        .then(()=>{
            let start = new Date()
            let end = new Date()
            let startOnCycle = false
            let endOnCycle = false
            let startCycleID = null
            let endCycleID = null
            let startType = 'pull'
            let endType = 'stuff'
            if(this.airplan.lines[lineID].end != undefined) {
                start = new Date(this.airplan.lines[lineID].end)
                end = new Date(start.valueOf()+3600*1000)
            } else if ( this.airplan.cycleList.length>0 && this.airplan.cycleList[0].end != undefined) {
                start = new Date(this.airplan.cycleList[0].start)
                end = new Date(this.airplan.cycleList[0].end)
            } else {
                start = new Date(this.airplan.start)
                end = new Date(start.valueOf()+3600*1000)
            }
            // Match start type to prev sortie end type
            if (this.airplan.lines[lineID].sorties.length>0) {
                startType = this.airplan.endStartTypeMap[this.airplan.lines[lineID].sorties.at(-1).endType]
            }
            $('#start').val(start.toLocalTimeString())
            $('#end').val(end.toLocalTimeString())
            $('.start-on-cycle').prop('checked', startOnCycle).trigger('change')
            $('.end-on-cycle').prop('checked', endOnCycle).trigger('change')
            $('#startType').val(startType)
            $('#endType').val(endType)
            $('#isAlert').prop('checked',false)
            // Bind handleAddSortie to the submit button.
            this.view.bindAddSortieSubmit(this.handleAddSortie)
        })
    }
    handleEditSortieMenu = (sortieID) => {
        let sortie = this.airplan.sorties[sortieID]
        this.view.drawEditSortieMenu(sortie, this.airplan.cycleList)
        this.view.bindEditSortieSubmit(this.handleEditSortie)
        this.view.bindEditSortieRemove(this.handleRemoveSortie)
        $('.start-on-cycle').prop('checked', sortie.startOnCycle).trigger('change')
        $('.end-on-cycle').prop('checked', sortie.endOnCycle).trigger('change')
        $('#start').val(sortie.start.toLocalTimeString())
        $('#start-cycle').val(sortie.startCycleID!=null ? sortie.startCycleID : sortie.cycle.ID)  // If there is a startCycleID, set the input to the startCycleID, if not, set it to the sortie cycle.
        $('#end').val(sortie.end.toLocalTimeString())
        $('#end-cycle').val(sortie.endCycleID!=null ? sortie.endCycleID : sortie.cycle.ID)  // If there is a startCycleID, set the input to the startCycleID, if not, set it to the sortie cycle.
        $('#startType').val(sortie.startType)
        $('#endType').val(sortie.endType)
        $('#note').val(sortie.note)
        $('#isAlert').prop('checked',sortie.isAlert)
    }
    handleEditSquadronMenu = (squadronID) => {
        let squadron = this.airplan.squadrons[squadronID]
        this.view.drawEditSquadronData(squadron)
        this.view.bindEditSquadronSubmit(this.handleEditSquadron)
        this.view.bindEditSquadronRemove(this.handleRemoveSquadron)
        $('#name').val(squadron.name)
        $('#cs').val(squadron.cs)
        $('#tms').val(squadron.tms)
        $('#modex').val(squadron.modex)
    }
    handleEditHeaderMenu = () => {
        this.view.drawEditHeaderData(this.airplan)
        $('#title').val(this.airplan.title)
        $('#subtitle').val(this.airplan.subtitle)
        // $('#date').val(this.airplan.date.toYYYYMMDD())
        $('#start').val(this.airplan.start.toLocalTimeString())
        $('#end').val(this.airplan.end.toLocalTimeString())
        $('#sunrise').val(this.airplan.sunrise.toLocalTimeString())
        $('#sunset').val(this.airplan.sunset.toLocalTimeString())
        $('#moonrise').val(this.airplan.moonrise.toLocalTimeString())
        $('#moonset').val(this.airplan.moonset.toLocalTimeString())
        $('#moonphase').val(this.airplan.moonphase)
        $('#flightquarters').val(this.airplan.flightquarters.toLocalTimeString())
        $('#heloquarters').val(this.airplan.heloquarters.toLocalTimeString())
        $('#variation').val(this.airplan.variation)
        $('#timezone').val(this.airplan.timezone)
        this.view.bindEditHeaderSubmit(this.handleEditHeader)
    }
    
    /**
     * handleCanvasClick is bound to all clickable objects in the Konva canvas.
     * The event target is the Highlight Box.
     * The event parent is the object the box is drawn around.
     * The event parent ID is the type of object that it represents:
     *  - Sortie
     *  - Header
     *  - Timeline
     *  - Squadron
     *  - (TODO) Cycle
     * @param {Object} e Event object e. Triggered from on.click events.
     */
    handleCanvasClick = (e) => {
        // console.log(e.parent.name() + ' ' + e.parent.id())
        if (e.parent.name() == 'sortie') {
            this.handleEditSortieMenu(e.parent.id())
        } else if (e.parent.name() == 'cycle') {
            // Does not yet exist
        } else if (e.parent.name() == 'header' || e.parent.name() == 'timeline') {
            this.handleEditHeaderMenu(e.parent.id())
        } else if (e.parent.name() == 'squadron') {
            this.handleEditSquadronMenu(e.parent.id())
        }
    }

    // Handle State Changes

    // Add/Remove/Edit Squadron
    handleAddSquadron = (name,cs,tms,modex) => { this.airplan.addSquadron(name,cs,tms,modex) }
    handleRemoveSquadron = (id) => { this.airplan.removeSquadron(id) }
    handleRemoveBottomSquadron = () => { this.airplan.removeSquadron(Object.values(this.airplan.squadrons).at(-1).ID) }
    handleEditSquadron = (squadronID, name,cs,tms,modex) => { this.airplan.editSquadron(squadronID, name,cs,tms,modex) }

    // Add/Remove/Edit Cycle
    handleAddCycle = (start, end) => { this.airplan.addCycle(start,end) }
    handleRemoveCycle = (id) => { this.airplan.removeCycle(id) }
    handleEditCycle = (id, start, end) => { this.airplan.editCycle(id, start, end) }
    
    // Add/Remove/Edit Line
    handleAddLine = (id) => { this.airplan.addLine(id) }
    handleRemoveLine = (id) => { this.airplan.removeLine(id) }
    handleEditLine = (id, squadronID) => { this.airplan.editLine(id, squadronID) }
    handleToggleLineDisplay = (id) => { this.airplan.toggleLineDisplay(id) }

    // Add/Remove/Edit Sortie
    handleAddSortie = (lineID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert) => {
        this.airplan.addSortie(lineID, start, end, startType, endType, note, startCycleID, endCycleID, isAlert)
    }
    handleRemoveSortie = (id) => { this.airplan.removeSortie(id) }
    handleEditSortie = (id, start, end, startType, endType, note, startCycleID, endCycleID, isAlert) => {
        this.airplan.editSortie(id, start, end, startType, endType, note, startCycleID, endCycleID, isAlert);
    }

    // Edit Header
    handleEditHeader = (title, subtitle, date, start, end, sunrise, sunset, moonrise, moonset, moonphase, flightquarters, heloquarters, variation, timezone) => {
        this.airplan.title = title
        this.airplan.subtitle = subtitle 
        // this.airplan.date = new Date(Date.parse(date+'T00:00'))
        this.airplan.start = new Date(Date.parse(start))
        this.airplan.end = new Date(Date.parse(end))
        this.airplan.sunrise = new Date(Date.parse(sunrise))
        this.airplan.sunset = new Date(Date.parse(sunset))
        this.airplan.moonrise = new Date(Date.parse(moonrise))
        this.airplan.moonset = new Date(Date.parse(moonset))
        this.airplan.moonphase = moonphase
        this.airplan.flightquarters = new Date(Date.parse(flightquarters))
        this.airplan.heloquarters = new Date(Date.parse(heloquarters))
        this.airplan.variation = variation
        this.airplan.timezone = timezone
        this.onAirplanChanged();
    }
}