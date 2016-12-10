'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api'),
  Q = require("q");


module.exports = function() {

  var baseUrl = 'http://api.gotimenote.com/'
  var welcome = function(senderID) {

    var message = fbTemplate.textMessage('Hi User. Timenote bot allows you to explore any city in the world as a city guide. ')
    return fbTemplate.reply(message, senderID)
      .then(function() {
        var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
        var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
        var message = fbTemplate.quickReplyMessage('You can also check your calendar and see your day.', [qr1, qr2])
        return fbTemplate.reply(message, senderID)
      })
  }

  var whereToCheckEvents = function(senderID) {
    var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
    var otherCity = fbTemplate.createWebViewButton('https://timenotebot.herokuapp.com?user=' + senderID, 'ANOTHER CITY', 'tall')
    var message = fbTemplate.buttonMessage('Discover events in the city of your choice', [nearBy, otherCity])
    return fbTemplate.reply(message, senderID)
  }

  var promptUserForLocation = function(senderID) {
    var message = fbTemplate.locationMessage()
    return fbTemplate.reply(message, senderID)
  }

  var getEventsByLocation = function(lat, long, offset, senderID) {
    return externalApi.getEventsByLocation(lat, long, offset)
      .then(function(result) {
        var body = JSON.parse(result)
        var data = body.data.nearby;
        if (data == null) {
          // console.log('hi')
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
        console.log(message)
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

  return {
    welcome: welcome,
    whereToCheckEvents: whereToCheckEvents,
    promptUserForLocation: promptUserForLocation,
    getEventsByLocation: getEventsByLocation,
    getMoreEvents: getMoreEvents,
    getEventsByUserLocation: getEventsByUserLocation,
    getEventById: getEventById
  };
}
