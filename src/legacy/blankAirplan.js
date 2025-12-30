blankAirplan = function() {
    return {
        "date": new Date(new Date().setHours(0)),
        "start": new Date( new Date().setHours(8,0) ), // Thu Jan 20 2022 10:30:00 GMT-0500 (Eastern Standard Time)
        "end": new Date( new Date().setHours(18,0) ), // Thu Jan 20 2022 17:30:00 GMT-0500 (Eastern Standard Time)
        "title": "Airplan Title",
        "slap": {
            "sunrise": new Date( new Date().setHours(6,30) ),
            "sunset": new Date( new Date().setHours(19,0) ),
            "moonrise": new Date( new Date().setHours(20) ),
            "moonset": new Date( new Date().setHours(2) ),
            "moonphase": "__%"
        },
        "flightquarters": new Date(),
        "heloquarters": new Date(),
        "variation": "__",
        "timezone": "__",
        "sorties":{
        },
        "squadrons": {
        },
        "cycles": {
        },
        "defaults": {
            "sortieDuration": 1,
        }
    } 
}
// airplan = new blankAirplan();