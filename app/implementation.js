'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api');

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
        var qr2 = fbTemplate.createQuickReply('Explore Without Login', constants.EXPLORE_WITHOUT_LOGIN)
        var message = fbTemplate.quickReplyMessage('Options', [qr1, qr2])
        return fbTemplate.reply(message, senderID)
      })
  }

  var whereToCheckEvents = function(senderID) {
    var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
    var otherCity = fbTemplate.createPostBackButton('OTHER CITY', constants.OTHER_CITY)
    var message = fbTemplate.buttonMessage('Ok. So where do you want to check the events ?', [nearBy, otherCity])
    return fbTemplate.reply(message, senderID)
  }

  var promptUserForLocation = function(senderID) {
    var message = fbTemplate.locationMessage()
    return fbTemplate.reply(message, senderID)
  }

  var getEventsByLocation = function(lat, long, page, senderID) {
    return externalApi.getEventsByLocation(lat, long, page)
      .then(function(result) {
        var body = JSON.parse(result)
        var data = body.data.nearby;
        // console.log(data)
        var btn = [];
        var elements = [];
        console.log('data.length ' + data.length)
          // console.log(parseInt(page))
        var n = parseInt(page) + 1
        for (var i = 0; i <= data.length; i++) {
          if (i < data.length) {
            var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id)
            var btn2 = fbTemplate.createShareButton()
            var btn = [btn1, btn2];
            elements[i] = fbTemplate.createElement(data[i].fullname, data[i].description, '', baseUrl + data[i].link, btn)
          } else {
            // var page = 
            var btn = fbTemplate.createPostBackButton('More Events', constants.MORE + '-' + (n) + '-' + lat + '-' + long)
            console.log(i)
            elements[i] = fbTemplate.createElement('More Events', 'Click to load more events', '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', [btn])
          }
        }

        var message = fbTemplate.genericMessage(elements)
        console.log(message)
        return fbTemplate.reply(message, senderID)
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
            var message = fbTemplate.textMessage(body.data.timer.description)
            return fbTemplate.reply(message, senderID)
          })
      })

    // })
  }

  return {
    welcome: welcome,
    whereToCheckEvents: whereToCheckEvents,
    promptUserForLocation: promptUserForLocation,
    getEventsByLocation: getEventsByLocation,
    getEventById: getEventById
  };
}
