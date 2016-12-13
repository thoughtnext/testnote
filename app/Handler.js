var constants = require("./payload"),
  foo = require('./implementation'),
  externalApi = require('./api'),
  context = require('./context'),
  Q = require('q'),
  implement = foo();

function HandlePayload(payload, senderID) {
  console.log('[Handler.js] payload == ' + payload)

  if (payload == constants.LOGIN) {

  } else if (payload == constants.EXPLORE_WITHOUT_LOGIN) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload == constants.GET_STARTED) {
    implement.welcome(senderID)
  }
  //
  else if (payload == constants.NEARBY_ME) {
    console.log('[Handler] \n' + payload)
    implement.promptUserForLocation(senderID)
  } else if (payload == constants.ANOTHER_CITY) {
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

  } else if (payload.coordinates != undefined) {
    var lat = payload.coordinates.lat
    var long = payload.coordinates.long
    externalApi.getAddress(lat, long).then(function(result) {
      var body = JSON.parse(result)
      var address = body.results[2].formatted_address
      implement.getEventsByUserLocation(lat, long, 0, address, senderID)
    })
  }

  //
  else if (payload.indexOf(constants.MORE) != -1) {
    var str = payload.split("-");
    var offset = str[1]
    var lat = str[2]
    var long = str[3]
    implement.getMoreEvents(lat, long, offset, senderID)
  }
  //
  else if (payload.indexOf(constants.DETAILS) != -1) {
    var str = payload.split("-");
    var id = str[1];
    implement.getEventById(id, senderID)
  }
  //
  else if (payload.indexOf(constants.GO_BACK) != -1) {
    implement.whereToCheckEvents(senderID)
  }
  //
  else if (payload.indexOf(constants.RESTART) != -1) {
    implement.welcome(senderID)
  }
  //
  else if (payload.indexOf(constants.YES_CONFIRMATION_FOR_CITY) != -1) {
    var index = payload.indexOf("-");
    var str = payload
    var placeid = str.substring(index+1);
    implement.getCityGeometry(placeid, senderID)
  }
  //
  else if (payload.indexOf(constants.NO_CONFIRMATION_FOR_CITY) != -1) {

    implement.promptUserForInputLocation(senderID)
  }
  //
  else {
    console.log('[Handler.js] payload == ' + payload)
    console.log('[Handler.js] No Action found for this payload')
  }

}

exports.HandlePayload = HandlePayload
