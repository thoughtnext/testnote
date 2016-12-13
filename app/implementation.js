'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api'),
  Q = require("q"),
  fs = require("fs"),
  _ = require("underscore"),
  wit = require('./wit')

module.exports = function() {

  var baseUrl = 'http://api.gotimenote.com/'
  var welcome = function(senderID) {

    var message = fbTemplate.textMessage('Hi User. Timenote bot allows you to explore any city in the world as a city guide. ')
    return fbTemplate.reply(message, senderID)
      .then(function() {
        promptForLogin(senderID)
      })
  }
  var promptForLogin = function(senderID) {
    var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
    var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
    var message = fbTemplate.quickReplyMessage('You can also check your calendar and see your day.', [qr1, qr2])
    return fbTemplate.reply(message, senderID)
  }

  var whereToCheckEvents = function(senderID) {
    var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
    var otherCity = fbTemplate.createPostBackButton('ANOTHER CITY', constants.ANOTHER_CITY)
      // var otherCity = fbTemplate.createWebViewButton('https://timenotebot.herokuapp.com?user=' + senderID, 'ANOTHER CITY', 'tall')
    var message = fbTemplate.buttonMessage('Discover events in the city of your choice', [nearBy, otherCity])
    return fbTemplate.reply(message, senderID)
  }

  var promptUserForInputLocation = function(senderID) {

    var message = fbTemplate.textMessage('Write the city you want.')
    return fbTemplate.reply(message, senderID)
  }
  var promptUserForLocation = function(senderID) {
    var message = fbTemplate.locationMessage()
    return fbTemplate.reply(message, senderID)
  }

  var getCity = function(city) {
    return externalApi.getCity(city)
      .then(function(result) {
        return result;
      }, function(error) {
        console.log('Error in getting City ' + error)
      })
  }

  var getCityGeometry = function(placeid, senderID) {
    return externalApi.getCityGeometry(placeid)
      .then(function(result) {
        return result;
      }, function(error) {
        console.log('Error in getting placeid ' + error)
      })
      .then(function(location) {
        console.log(location)
        getEventsByLocation(location.lat, location.lng, 0, senderID)

        .then(function(result) {
          console.log('inside')
          var location = result
          var configFile = fs.readFileSync('./app/location.json');
          var config = JSON.parse(configFile);
          var a = { "userId": senderID, "context": "location" }
          config.splice(_.indexOf(config, _.find(config, function(a) { console.log('Deleted ' + JSON.stringify(a)) })), 1);
          var configJSON = JSON.stringify(config);
          fs.writeFileSync('./app/location.json', configJSON)
          return location;
        })
      })
  }

  var promptCityConfirmationFromUser = function(text, senderID) {
    return getCity(text)
      .then(function(result) {
        if (result != undefined) {
          var placeid = result.place_id
          var city = result.description;
          var qr1 = fbTemplate.createQuickReply('Yes', constants.YES_CONFIRMATION_FOR_CITY + '-' + placeid)
          var qr2 = fbTemplate.createQuickReply('No', constants.NO_CONFIRMATION_FOR_CITY)
          var message = fbTemplate.quickReplyMessage('Did you mean ' + city + ' ?', [qr1, qr2])
          return fbTemplate.reply(message, senderID)
        } else {
          var message = fbTemplate.textMessage('Sorry. I could not understand your query. ')
          return fbTemplate.reply(message, senderID)
            .then(function() {
              promptUserForInputLocation(senderID)
            })
        }
      })
  }

  var getEventsByLocation = function(lat, long, offset, senderID) {
    // console.log()
    var senderID = parseInt(senderID)
    console.log(senderID)
    console.log(lat)
    console.log(long)
    console.log(offset)
    return externalApi.getEventsByLocation(lat, long, offset)
      .then(function(result) {
        console.log(result)
        var body = JSON.parse(result)
        var data = body.data.nearby;
        if (data == null) {
          console.log('No result')
        }
        var offset = body.data.offset
        console.log(offset)
        var btn = [];
        var elements = [];
        for (var i = 0; i <= data.length; i++) {
          if (i < data.length) {
            var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id)
            var btn2 = fbTemplate.createShareButton()
            var btn = [btn1, btn2];
            var date;
            var time;
            var datetimestamp = new Date(data[i].time * 1000)
            var fullDate = datetimestamp.toDateString().split(' ')
            var date = fullDate[2] + ' ' + fullDate[1] + ' ' + fullDate[3];
            var hours = datetimestamp.getHours() > 12 ? datetimestamp.getHours() - 12 : datetimestamp.getHours();
            var am_pm = datetimestamp.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = datetimestamp.getMinutes() < 10 ? "0" + datetimestamp.getMinutes() : datetimestamp.getMinutes();
            // var seconds = datetimestamp.getSeconds() < 10 ? "0" + datetimestamp.getSeconds() : datetimestamp.getSeconds();
            time = hours + ":" + minutes + " " + am_pm;
            elements[i] = fbTemplate.createElement(data[i].fullname + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + data[i].link, btn)
          } else {
            var btn = fbTemplate.createPostBackButton('More Events', constants.MORE + '-' + offset + '-' + lat + '-' + long)
            elements[i] = fbTemplate.createElement('More Events', 'Click to load more events', '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', [btn])
          }
        }

        var message = fbTemplate.genericMessage(elements)
          // console.log(message)
        return fbTemplate.reply(message, senderID)
      })
      .then(function() {
        var qr1 = fbTemplate.createQuickReply('Restart', constants.RESTART)
        var qr2 = fbTemplate.createQuickReply('Go Back', constants.GO_BACK)
        var message = fbTemplate.quickReplyMessage('Options', [qr2, qr1])
        return fbTemplate.reply(message, senderID)
      })

  }

  var getEventsByUserLocation = function(lat, long, offset, address, senderID) {
    var message = fbTemplate.textMessage('Your selected location is set to:\n ' + address)
    return fbTemplate.reply(message, senderID)
      .then(function() {
        getEventsByLocation(lat, long, offset, senderID)
      })
  }

  var getMoreEvents = function(lat, long, offset, senderID) {
    getEventsByLocation(lat, long, offset, senderID)
  }

  var getEventById = function(id, senderID) {
    return externalApi.getEventById(id)
      .then(function(result) {
        var body = JSON.parse(result)
        console.log(baseUrl + body.data.timer.link)
        var message = fbTemplate.ImageMessage(baseUrl + body.data.timer.link)
        return fbTemplate.reply(message, senderID)
          .then(function() {
            var message = fbTemplate.textMessage(body.data.timer.fullname)
            return fbTemplate.reply(message, senderID)
          })
          .then(function() {
            var description = body.data.timer.description
            var length = description.length
            var remainder = length % 320
            var n = parseInt(length / 320);
            if (remainder != 0) {
              n = n + 1
            }
            Substr(description, 320, senderID)
          })
      })
  }

  function Substr(str, size, senderID) {
    var numChunks = Math.ceil(str.length / size),
      chunks = new Array(numChunks);

    for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
      console.log(chunks[i] + '\n\n')
      var message = fbTemplate.textMessage(chunks[i])
      fbTemplate.reply(message, senderID)
    }
  }

  function sorryMsg(senderID){
    var message = fbTemplate.textMessage("Sorry, I could't understand you. Here's what you can do with TimeNote Bot. ")
    return fbTemplate.reply(message, senderID)
    .then(function(){
      promptForLogin(senderID)
    })
  }

  return {
    welcome: welcome,
    whereToCheckEvents: whereToCheckEvents,
    promptUserForLocation: promptUserForLocation,
    promptUserForInputLocation: promptUserForInputLocation,
    getEventsByLocation: getEventsByLocation,
    getMoreEvents: getMoreEvents,
    getEventsByUserLocation: getEventsByUserLocation,
    promptCityConfirmationFromUser: promptCityConfirmationFromUser,
    getEventById: getEventById,
    getCityGeometry: getCityGeometry,
    getCity: getCity,
    promptForLogin: promptForLogin,
    sorryMsg: sorryMsg
  };
}
