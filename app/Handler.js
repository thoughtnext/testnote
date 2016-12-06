var constants = require("./payload"),
  foo = require('./implementation'),
  implement = foo();

function HandlePayload(payload, senderID) {
  // var payload = payload.toString()
  console.log('\n[HandlePayload]')
  console.log(payload)

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
    implement.promptUserForLocation(senderID)
  }
  //
  // else if (payload == constants.OTHER_CITY) {
  //   implement.promptUserForOtherLocation(senderID)
  // }
  //
  else if (payload.coordinates != undefined) {
    var lat = payload.coordinates.lat
    var long = payload.coordinates.long
    implement.getEventsByLocation(lat, long, 0, senderID)
  }

  //
  else if (payload.indexOf(constants.MORE) != -1) {
    var str = payload.split("-");
    var offset = str[1]
    var lat = str[2]
    var long = str[3]
    implement.getEventsByLocation(lat, long, offset, senderID)
  }
  //
  else if (payload.indexOf(constants.DETAILS)!= -1 ) {
    var str = payload.split("-");
    var id = str[1];
    implement.getEventById(id, senderID)
  }

  //
  else {
    console.log('[Handler.js] payload == ' + payload)
    console.log('[Handler.js] No Action found for this payload')
  }

}

exports.HandlePayload = HandlePayload
