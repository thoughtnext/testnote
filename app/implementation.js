'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api'),
  Q = require("q");


module.exports = function() {

  var baseUrl = 'http://api.gotimenote.com/'
  var welcome = function(senderID) {

    var message = fbTemplate.textMessage('Hi User. Welcome to our bot')
    return fbTemplate.reply(message, senderID)
      .then(function() {
        var message = fbTemplate.textMessage('Simply you can create or view events around you. You can login or explore without login as well. Please select an option ')
        return fbTemplate.reply(message, senderID)
      })
      .then(function() {
        var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
        var qr2 = fbTemplate.createQuickReply('Explore W/O Login', constants.EXPLORE_WITHOUT_LOGIN)
        var message = fbTemplate.quickReplyMessage('Options', [qr1, qr2])
        return fbTemplate.reply(message, senderID)
      })
  }

  var whereToCheckEvents = function(senderID) {
    var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
    var otherCity = fbTemplate.createWebViewButton('https://timenotebot.herokuapp.com?user=' + senderID, 'OTHER CITY', 'compact')
    var message = fbTemplate.buttonMessage('Ok. So where do you want to check the events ?', [nearBy, otherCity])
    return fbTemplate.reply(message, senderID)
  }

  var promptUserForLocation = function(senderID) {
    var message = fbTemplate.locationMessage()
    return fbTemplate.reply(message, senderID)
  }

  var getEventsByLocation = function(lat, long, offset, address, senderID) {
    var message = fbTemplate.textMessage('Your selected location is set to:\n ' + address)
    return fbTemplate.reply(message, senderID)
      .then(function() {
        return externalApi.getEventsByLocation(lat, long, offset)
          .then(function(result) {
            var body = JSON.parse(result)
            var data = body.data.nearby;
            var offset = body.data.offset
            console.log(offset)
            var btn = [];
            var elements = [];
            for (var i = 0; i <= data.length; i++) {
              if (i < data.length) {
                var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id)
                var btn2 = fbTemplate.createShareButton()
                var btn = [btn1, btn2];
                elements[i] = fbTemplate.createElement(data[i].fullname, data[i].description, '', baseUrl + data[i].link, btn)
              } else {
                // var page = 
                var btn = fbTemplate.createPostBackButton('More Events', constants.MORE + '-' + offset + '-' + lat + '-' + long)
                console.log(i)
                elements[i] = fbTemplate.createElement('More Events', 'Click to load more events', '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', [btn])
              }
            }

            var message = fbTemplate.genericMessage(elements)
            console.log(message)
            return fbTemplate.reply(message, senderID)
          })
      })

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
            console.log('length ' + length)
            console.log('remainder ' + remainder)
            console.log(n)
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
    // promptUserForOtherLocation: promptUserForOtherLocation,
    getEventsByLocation: getEventsByLocation,
    getEventById: getEventById
  };
}
