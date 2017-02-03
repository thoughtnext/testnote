var constants = require("./payload"),
  foo = require('./implementation'),
  externalApi = require('./api'),
  context = require('./context'),
  Q = require('q'),
  implement = foo();

function HandlePayload(payload, senderID) {
  console.log('[Handler.js] payload == ' + payload)
  if (typeof(payload) === 'object') {
    if (payload.lat != undefined) {
      console.log('getEventsByUserLocation')
      var lat = payload.lat
      var long = payload.long
      console.log(lat, long)
      externalApi.getAddress(lat, long)
        .then(function(result) {
          var body = JSON.parse(result)
          var address = body.results[2].formatted_address
          implement.getEventsByUserLocation(lat, long, 0, address, senderID)
        })
    }
  } else if (payload == constants.LOGIN) {
    implement.sendLoginButton(senderID)
    
  } else if (payload == constants.YES_LOGOUT) {
    implement.Logout(senderID)
  } else if (payload == constants.NO_LOGOUT) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload == constants.YES_LOGIN) {
    implement.sendLoginButton(senderID)
  } else if (payload == constants.NO_LOGIN) {
    implement.whereToCheckEvents(senderID)
  }
  // 
  else if (payload == constants.GET_STARTED) {
    implement.get_started(senderID)
  }
  //
  else if (payload == constants.MY_CALENDAR) {
    implement.showMyCalendar(senderID)
  }
  //
  else if (payload == constants.TODAY) {
    console.log('events for today')
    implement.getCalendarEventsForToday(senderID)
  }
  else if(payload == constants.VIEW_APP){
    console.log('VIEW_APP')
    implement.viewApp(senderID)
    // .then(function() {
    //     // implement.lastOptions(senderID)
    //     implement.
    //   })
  }
  //
  else if (payload.indexOf(constants.SAVE_EVENT) != -1) {
    console.log('events for SAVE_EVENT')
    var temp = payload.split(',')
    var event_id = temp[1]
    var lat = temp[2]
    var long = temp[3]
    implement.saveEvent(senderID, event_id, lat, long)
  }
  //
  else if (payload == constants.TOMORROW) {
    implement.getCalendarEventsForTomorrow(senderID)
  }
  //
  else if (payload == constants.THIS_WEEKEND) {
    implement.getCalendarEventsForThisWeekend(senderID)
  }
  //
  else if (payload == constants.THIS_WEEK) {
    implement.getCalendarEventsForThisWeek(senderID)
  }
  //
  else if (payload == constants.NEXT_7_DAYS) {
    implement.getCalendarEventsForNext7Days(senderID)
  }
  //  
  else if (payload == constants.NEXT_30_DAYS) {
    implement.getCalendarEventsForNext30Days(senderID)
  }
  //  
  else if (payload == constants.BACK_TO_MENU) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload == constants.EXPLORE_WITHOUT_LOGIN) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload == constants.AFTER_LOGIN) {
    implement.afterLogin(senderID)
  }
  //
  else if (payload == constants.NEARBY_ME) {
    console.log('[Handler] \n' + payload)
    implement.promptUserForLocation(senderID)
  }
  //
  else if (payload == constants.ANOTHER_CITY) {
    console.log('[Handler] \n' + payload)
    var obj = {
      userId: senderID,
      context: 'location'
    }
    var ready = Promise.resolve(null)
    ready.then(function() {
        return implement.promptUserForInputLocation(senderID)
      })
      .then(function() {
        return context.addContext(obj)
      })
  }
  //
  else if (payload == constants.MORE_FEATURES) {

    implement.downloadLink(senderID)
      .then(function() {
        implement.lastOptions(senderID)
      })
  }
  //
  else if (payload == constants.MYCALENDAR_IN_PERSISTENTMENU) {
    implement.showMyCalendarInPersistentMenu(senderID)
  }
  //
  else if (payload.indexOf(constants.MORE_EVENTS) != -1) {
    console.log('getMoreEvents')
    var str = payload.split("-");
    var maxDate = str[1]
    var minDate = str[2]
      // var long = str[3]
    implement.getCalendarEvents(senderID, maxDate, minDate)
  } 

  //
  else if (payload.indexOf(constants.MORE) != -1) {
    console.log('getMoreEvents')
    var str = payload.split(",");
    var offset = str[1]
    var lat = str[2]
    var long = str[3]
    implement.getMoreEvents(lat, long, offset, senderID)
  }
  //
  else if (payload.indexOf(constants.DETAILS) != -1) {
    console.log('getEventById')

    var str = payload.split(",");
    var id = str[1];
    var lat = str[2];
    var lng = str[3]
      // console.log(payload)
      // console.log(str)
      // var lat = str[2]
    var offset = 0;
    // console.log(id + ' ' + lat + ' ' + lng)
    implement.getEventById(id, lat, lng, offset, senderID)
  }
  //
  else if (payload.indexOf(constants.GO_BACK) != -1) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload.indexOf(constants.EVENTS_LIST) != -1) {
    console.log('hi')
    var str = payload.split(",");
    // var id = str[1];
    var lat = str[1]
    var lng = str[2]
      // var lat = str[2]
    console.log(lat + ' ' + lng)
    var offset = 0;
    implement.getEventsByLocation(lat, lng, offset, senderID)
  }
  //
  else if (payload.indexOf(constants.RESTART) != -1) {
    implement.get_started(senderID)
  }
  //
  else if (payload.indexOf(constants.YES_CONFIRMATION_FOR_CITY) != -1) {
    var index = payload.indexOf("-");
    var str = payload
    var placeid = str.substring(index + 1);
    console.log(placeid)
    implement.getCityGeometry(placeid, senderID)
  }
  //
  else if (payload.indexOf(constants.NO_CONFIRMATION_FOR_CITY) != -1) {
    implement.promptUserForInputLocation(senderID)
  }
  //
  //

  //
  else {
    console.log('[Handler.js] payload == ' + payload)
    console.log('[Handler.js] No Action found for this payload')
  }

}

exports.HandlePayload = HandlePayload
