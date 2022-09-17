window.addEventListener('load', ()=>{
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register("service-worker.js")
    }
})
let app = new Controller();
addEventListener('load',(event)=>{
    app.view.fitStageIntoParentContainer();
})