// 'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api'),
  Q = require("q"),
  fs = require("fs"),
  _ = require("underscore"),
  wit = require('./wit'),
  messenger = require("./messenger"),
  moment = require('moment'),
  Adapter = require("./Adapter")
  // db = new Adapter();

module.exports = function() {

  var baseUrl = 'http://api.gotimenote.com/'

  var welcome = function(senderID) {
    return checkLoginStatus(senderID)
      .then(function(islogged) {
        console.log('[imp.js - 19] ' + islogged)
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
          externalApi.getUserProfile(senderID)
            .then(function(user) {
              var profile = JSON.parse(user)
              var name = profile.first_name
              return externalApi.checkBotUsers(name, senderID)
            })
            .then(function(result) {
              console.log(result)
              return sendLoginButton(senderID)
            })
        } else {
          console.log('logged in')
          var message = fbTemplate.textMessage('You are already logged in')
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
        }
      })
  }

  var get_started = function(senderID) {
    var islogged;
    return checkLoginStatus(senderID)
      .then(function(isloggedin) {
        islogged = isloggedin;
        return messenger.getLocale(senderID)
      })
      .then(function(userLocale) {
        return Adapter.getText(constants.useTimenote, userLocale)
      })
      .then(function(result) {
        console.log('hi')
        var txt = result

        if (islogged === '0' || islogged === null) {
          return externalApi.getUserProfile(senderID)
            .then(function(user) {
              var profile = JSON.parse(user)
              var name = profile.first_name
              return externalApi.checkBotUsers(name, senderID)
            })
            .then(function() {
              var text = fbTemplate.textMessage(txt.ifNotLoggedIn.textMessage)
              return fbTemplate.reply(text, senderID)
            })
            .then(function() {
              var obj = txt.ifNotLoggedIn.quickReplyMessage.qr
              var qr = []
              for (var prop in obj) {
                qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
              }
              var message = fbTemplate.quickReplyMessage(txt.ifNotLoggedIn.quickReplyMessage.message, qr)
              return fbTemplate.reply(message, senderID)
            })
        }
        //
        else {
          console.log(islogged)
          var message = fbTemplate.textMessage(txt.ifLoggedIn.textMessage)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
        }
      })
  }

  var greetUser = function(senderID) {
    return get_started(senderID)
  }

  var sayGoodBye = function(senderID) {
    /*Extra can be removed*/
    return externalApi.getUserProfile(senderID)
      .then(function(user) {
        var profile = JSON.parse(user)
        var name = profile.first_name
        var message = fbTemplate.textMessage('See you soon ' + name + '.\nDo remember you can always type HI or HELLO to start the conversation again.')
        return fbTemplate.reply(message, senderID)
      })
  }

  var afterLogin = function(senderID) {
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.afterLogin, userLocale)
      })
      .then(function(result) {
        txt = result;
        return externalApi.getUserProfile(senderID)
      })
      .then(function(user) {
        var profile = JSON.parse(user)
        var name = profile.first_name
        var message = fbTemplate.textMessage(txt.textMessage[0] + name + txt.textMessage[1])
        return fbTemplate.reply(message, senderID)
          .then(function() {
            return whereToCheckEvents(senderID)
          })
      })
  }

  var saveEvent = function(senderID, event_id, lat, long) {
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.saveEvent, userLocale)
      })
      .then(function(result) {
        txt = result;
        return externalApi.saveEvent(senderID, event_id, lat, long)
      })
      .then(function(result) {
        if (result.success == 'true') {
          var message = fbTemplate.textMessage(txt.ifSuccess.textMessage)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              var obj = txt.ifSuccess.quickReplyMessage.qr
              var qr = []
              for (var prop in obj) {
                qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
              }
              var message = fbTemplate.quickReplyMessage(txt.ifSuccess.quickReplyMessage.message, qr)
              return fbTemplate.reply(message, senderID)
            })
        } else {
          var message = fbTemplate.textMessage(txt.ifNotSuccess.textMessage)
          return fbTemplate.reply(message, senderID)
            .then(function(result) {
              return sendLoginButton(senderID)
            })
        }
      })
  }
  var checkLoginStatus = function(senderID) {
    return externalApi.checkLoginStatus(senderID)
      .then(function(result) {
        return result;
      }, function(error) {
        console.error('Error fetching login status for this user : ' + senderID)
      })
  }

  var Logout = function(senderID) {
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.Logout, userLocale)
      })
      .then(function(result) {
        txt = result;
        return externalApi.checkLoginStatus(senderID)
      })
      .then(function(islogged) {
        if (islogged === '0' || islogged === null) {
          var message = fbTemplate.textMessage(txt.ifLoggedOut.textMessage)
          return fbTemplate.reply(message, senderID)
        } else {
          return externalApi.Logout(senderID)
            .then(function(result) {
              if (result) {
                var message = fbTemplate.textMessage(txt.ifLoggedIn.textMessage)
                return fbTemplate.reply(message, senderID)
              }
            })
        }
      })
      .then(function() {
        return sendLoginButton(senderID)
      })
  }
  var showMyCalendar = function(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.showMyCalendar, userLocale);
      })
      .then(function(txt) {
        var qr = []
        var obj = txt.quickReplyMessage.qr
        console.log(obj)
        for (var i = 0; i < obj.length; i++) {
          qr.push(fbTemplate.createQuickReply(obj[i].text, obj[i].payload))
        }
        var message = fbTemplate.quickReplyMessage(txt.quickReplyMessage.message, qr)
        return fbTemplate.reply(message, senderID)
      })
  }

  var showMyCalendarInPersistentMenu = function(senderID) {
    var islogged;
    return checkLoginStatus(senderID)
      .then(function(isloggedin) {
        islogged = isloggedin;
        return messenger.getLocale(senderID)
      })
      .then(function(userLocale) {
        return Adapter.getText(constants.showMyCalendarInPersistentMenu, userLocale)
      })
      .then(function(txt) {
        console.log(txt)
        if (islogged === '0' || islogged === null) {
          btn = (fbTemplate.createAccountLinkingButton(txt.ifNotLoggedIn.buttonMessage.btn.url))
          var message = fbTemplate.buttonMessage(txt.ifNotLoggedIn.buttonMessage.message, [btn])
          return fbTemplate.reply(message, senderID)
        } else {
          showMyCalendar(senderID)
        }
      })
  }

  // after

  var getCalendarEvents = function(senderID, maxDate, minDate) {
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.getCalendarEvents, userLocale);
      })
      .then(function(result) {
        txt = result;
        return externalApi.getProfileWebsite(senderID, maxDate, minDate)
      })
      .then(function(result) {
        console.log('[250]')
        console.log(result)
        var btn = []
        var data = JSON.parse(result).data.timers
        var length = parseInt(data.length)
        var elements = []
        if (length !== 0) {
          console.log(length)
          if (length <= 9) {
            for (var i = 0; i < length; i++) {
              var lat = data[i].latitude
              var long = data[i].longitude
              btn.push(fbTemplate.createPostBackButton(txt.lessEvents.createPostBackButton.text, txt.lessEvents.createPostBackButton.payload + ',' + data[i].id + ',' + lat + ',' + long))
              btn.push(fbTemplate.createShareButton())
              console.log('btn')
                // var btn = [btn1, btn2];
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
              var link = data[i].link;
              var res = link.split('.');
              elements[i] = fbTemplate.createElement(data[i].name + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + res[0] + '_medium.jpg', btn)
            }
          } else if (length > 9) {
            for (var i = 0; i < 9; i++) {
              var lat = data[i].latitude
              var long = data[i].longitude
              btn.push(fbTemplate.createPostBackButton(txt.moreEvents.postBackButton.text, txt.moreEvents.postBackButton.payload + ',' + data[i].id + ',' + lat + ',' + long))
              btn.push(fbTemplate.createShareButton())
                // var btn = [btn1, btn2];
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
              var link = data[i].link;
              var res = link.split('.');
              elements[i] = fbTemplate.createElement(data[i].name + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + res[0] + '_medium.jpg', btn)
            }
            var minDate = parseInt(data[8].time) + 1
            btn = fbTemplate.createPostBackButton(txt.moreEvents.createPostBackButton.text, txt.moreEvents.createPostBackButton.payload + '-' + maxDate + '-' + minDate)
            elements[9] = fbTemplate.createElement(txt.moreEvents.createElement.title, txt.moreEvents.createElement.subtitle, '', txt.moreEvents.createElement.image, btn)
          }

          var message = fbTemplate.genericMessage(elements)
          return fbTemplate.reply(message, senderID)
        } else {
          var message = fbTemplate.textMessage(txt.noEvents.textMessage)
          return fbTemplate.reply(message, senderID)
        }
      })
      .then(function() {
        showMyCalendar(senderID)
      })
  }

  var getCalendarEventsForToday = function(senderID) {
    var date = new Date();
    var min = new Date(date.setHours(0, 0, 0, 0));
    var max = new Date(date.setHours(23, 59, 59));
    var maxDate = (+new Date(max) / 1000)
    var minDate = (+new Date(min) / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  var getCalendarEventsForTomorrow = function(senderID) {
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    console.log(tomorrow.getDate());
    var min = new Date(tomorrow.setHours(0, 0, 0, 0));
    var max = new Date(tomorrow.setHours(23, 59, 59));
    console.log(min, max)
    var maxDate = (+new Date(max) / 1000)
    var minDate = (+new Date(min) / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  function getSundayOfCurrentWeek(d) {
    var day = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? 0 : 7) - day);
  }

  function getSaturdayOfCurrentWeek(d) {
    var day = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (day == 0 ? -1 : 6) - day);
  }

  var getCalendarEventsForThisWeekend = function(senderID) {
    var d = new Date();
    var startDay = d.getDay()
    if (startDay == 5 || startDay == 6 || startDay == 0) {
      var start = +new Date(d)
    } else {
      var e = new Date(new Date(d).setHours(0, 0, 0, 0));
      var start = +new Date(e.setDate(e.getDate() + (12 - e.getDay()) % 7))
    }
    var end = +new Date(getSundayOfCurrentWeek(d)).setHours(23, 59, 59)
    var minDate = parseInt(start / 1000)
    var maxDate = parseInt(end / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  var getCalendarEventsForThisWeek = function(senderID) {
    var d = new Date();
    var startDay = d.getDay()
    if (startDay == 5 || startDay == 6 || startDay == 0) {
      var start = +new Date(d)
    } else {
      var e = new Date(new Date(d).setHours(0, 0, 0, 0));
      var start = +new Date(e.setDate(e.getDate() + (12 - e.getDay()) % 7))
    }
    var end = +new Date(getSundayOfCurrentWeek(d)).setHours(23, 59, 59)
    var minDate = parseInt(start / 1000)
    var maxDate = parseInt(end / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  var getCalendarEventsForNext7Days = function(senderID) {
    var d = new Date();
    var e = d;
    var start = +new Date(d);
    var end = +new Date(e.setDate(e.getDate() + 6)).setHours(23, 59, 59);
    var minDate = parseInt(start / 1000)
    var maxDate = parseInt(end / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  var getCalendarEventsForNext30Days = function(senderID) {
    var d = new Date();
    var e = d;
    var start = +new Date(d);
    var end = +new Date(e.setDate(e.getDate() + 29)).setHours(23, 59, 59);
    var minDate = parseInt(start / 1000)
    var maxDate = parseInt(end / 1000)
    return getCalendarEvents(senderID, maxDate, minDate)
  }

  var sendLoginButton = function(senderID) {
    var islogged;
    return checkLoginStatus(senderID)
      .then(function(isloggedin) {
        islogged = isloggedin;
        return messenger.getLocale(senderID)
      })
      .then(function(userLocale) {
        return Adapter.getText(constants.sendLoginButton, userLocale)
      })
      .then(function(result) {
        var txt = result;
        if (islogged === '0' || islogged === null) {
          var btn = []
          btn.push(fbTemplate.createAccountLinkingButton(txt.ifNotLoggedIn.buttonMessage.button.url))
          var message = fbTemplate.buttonMessage(txt.ifNotLoggedIn.buttonMessage.message, btn)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              var qr = [];
              var tempQR = txt.ifNotLoggedIn.quickReplyMessage.qr;
              for (var i = 0; i < tempQR.length; i++) {
                qr.push(fbTemplate.createQuickReply(tempQR[i].text, tempQR[i].payload));
              }
              var message = fbTemplate.quickReplyMessage(txt.ifNotLoggedIn.quickReplyMessage.message, qr)
              return fbTemplate.reply(message, senderID);
            })
        } else {
          var message = fbTemplate.textMessage(txt.ifLoggedIn.textMessage);
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
        }
      })
  }

  var promptForLogin = function(senderID) {
    /*
      // not required - extra function - can be removed
    */
    var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
    var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
    var message = fbTemplate.quickReplyMessage('So, what do you wanna do ?', [qr1, qr2])
    return fbTemplate.reply(message, senderID)
  }

  var whereToCheckEvents = function(senderID) {
    var islogged;
    return checkLoginStatus(senderID)
      .then(function(isloggedin) {
        islogged = isloggedin
        return messenger.getLocale(senderID)
      })
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.discoverEvents, locale)
      })
      .then(function(txt) {
        if (islogged === '0' || islogged === null) {
          var obj = txt.ifNotLoggedIn.buttonMessage.postback
          var buttons = []
          for (var prop in obj) {
            buttons.push(fbTemplate.createPostBackButton(obj[prop].text, obj[prop].payload))
          }
          var message = fbTemplate.buttonMessage(txt.ifNotLoggedIn.buttonMessage.message, buttons)
        }
        //
        else {
          var obj = txt.ifLoggedIn.buttonMessage.postback
          var buttons = []
          for (var prop in obj) {
            buttons.push(fbTemplate.createPostBackButton(obj[prop].text, obj[prop].payload))
          }
          var message = fbTemplate.buttonMessage(txt.ifLoggedIn.buttonMessage.message, buttons)
        }
        return fbTemplate.reply(message, senderID)
      })
  }

  var promptUserForInputLocation = function(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.promptUserForInputLocation, locale)
      })
      .then(function(txt) {
        var message = fbTemplate.textMessage(txt.message)
        return fbTemplate.reply(message, senderID)
      })
  }

  var promptUserForLocation = function(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.locationMessage, locale)
      })
      .then(function(txt) {
        var message = fbTemplate.locationMessage(txt.message)
        return fbTemplate.reply(message, senderID)
      })
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
    console.log(placeid)
    return externalApi.getCityGeometry(placeid)
      .then(function(result) {
        return result;
      }, function(error) {
        console.log('Error in getting placeid ' + error)
      })
      .then(function(location) {
        console.log(location)
        getEventsByLocation(location.lat, location.lng, 0, senderID)
      })
  }

  var promptCityConfirmationFromUser = function(text, senderID) {
    console.log('hi')
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.getCity, locale)
      })
      .then(function(txt1) {
        txt = txt1
        console.log(txt)
        return getCity(text)
      })
      .then(function(result) {
        console.log(result)
        if (result != undefined) {
          var placeid = result.place_id
          var city = result.description;
          var qr = []
          qr.push(fbTemplate.createQuickReply(txt.quickReplyMessage.qr['0'].text, txt.quickReplyMessage.qr['0'].payload + '-' + placeid))
          qr.push(fbTemplate.createQuickReply(txt.quickReplyMessage.qr['1'].text, txt.quickReplyMessage.qr['1'].payload))
          var message = fbTemplate.quickReplyMessage(txt.quickReplyMessage.message[0] + city + txt.quickReplyMessage.message[1], qr)
          return fbTemplate.reply(message, senderID)
        } else {
          var message = fbTemplate.textMessage(txt.textMessage)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              promptUserForInputLocation(senderID)
            })
        }
      })
  }

  var getEventsByLocation = function(lat, long, offset, senderID) {
    var senderID = parseInt(senderID)
    var txt;
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.getEventsByLocation, userLocale);
      })
      .then(function(result) {
        txt = result;
        return externalApi.getEventsByLocation(lat, long, offset, senderID)
      })
      .then(function(result) {
        var body = JSON.parse(result)
        var data = body.data.nearby;
        var more = body.data.more
        if (data.length <= 0) {
          console.log('No result')
          var message = fbTemplate.textMessage(txt.noEvents.textMessage)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
            .then(function() {
              return lastOptions(senderID)
            })
        } else {
          var offset = body.data.offset
          var elements = [];
          for (var i = 0; i <= data.length; i++) {
            if (i < data.length) {
              var btn = [];

              var is_saved = data[i].is_saved
              btn.push(fbTemplate.createPostBackButton(txt.lessEvents.createPostBackButton.detailsBtn.text, txt.lessEvents.createPostBackButton.detailsBtn.payload + ',' + data[i].id + ',' + lat + ',' + long))
              btn.push(fbTemplate.createShareButton())
              if (is_saved === 0 || is_saved == 0 || is_saved == '0') {
                btn.push(fbTemplate.createPostBackButton(txt.lessEvents.createPostBackButton.saveBtn.text, txt.lessEvents.createPostBackButton.saveBtn.payload + ',' + data[i].id + ',' + data[i].latitude + ',' + data[i].longitude))
                  // var btn = [btn1, btn3, btn2];
              } else {
                // var btn = [btn1, btn2];
              }
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
              var link = data[i].link;
              var res = link.split('.');
              elements[i] = fbTemplate.createElement(data[i].name + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + res[0] + '_medium.jpg', btn)
            }
            //
            else {
              var btn = [];

              if (more === true) {
                console.log(offset + ',' + lat + ',' + long)
                btn.push(fbTemplate.createPostBackButton(txt.moreEvents.createPostBackButton.text, txt.moreEvents.createPostBackButton.payload + ',' + offset + ',' + lat + ',' + long))
                elements[i] = fbTemplate.createElement(txt.moreEvents.createElement.title, txt.moreEvents.createElement.subtitle, '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', btn)
              } else {}
            }
          }
          var message = fbTemplate.genericMessage(elements)
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return lastOptions(senderID)
            })
        }
      })
  }

  var lastOptions = function(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.lastOptions, locale)
      })
      .then(function(txt1) {
        txt = txt1
        console.log(txt)
        return checkLoginStatus(senderID)
      })
      .then(function(islogged) {
        console.log('[imp.js - 602] ' + islogged)
        var qr = []
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
          var obj = txt.ifNotLoggedIn.quickReplyMessage.qr
          for (var prop in obj) {
            qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
          }
          var message = fbTemplate.quickReplyMessage(txt.ifNotLoggedIn.quickReplyMessage.message, qr)
        } else {
          var obj = txt.ifLoggedIn.quickReplyMessage.qr
          for (var prop in obj) {
            qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
          }
          var message = fbTemplate.quickReplyMessage(txt.ifLoggedIn.quickReplyMessage.message, qr)
        }
        return fbTemplate.reply(message, senderID)

      })
  }

  var options = function(senderID) {
    /*
      // not required - extra function - can be removed
    */
    var qr1 = fbTemplate.createQuickReply('Restart', constants.RESTART)
    var qr2 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
      // var qr3 = fbTemplate.createQuickReply('More Features', constants.MORE_FEATURES)
    var message = fbTemplate.quickReplyMessage("What's next ?", [qr2, qr1])
    return fbTemplate.reply(message, senderID)
  }
  var getEventsByUserLocation = function(lat, long, offset, address, senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        var locale = userLocale
        return Adapter.getText(constants.selectedLocation, locale)
      })
      .then(function(txt) {
        console.log(txt)
        var message = fbTemplate.textMessage(txt.message + address)
        return fbTemplate.reply(message, senderID)
      })
      .then(function() {
        getEventsByLocation(lat, long, offset, senderID)
      })
  }

  var getMoreEvents = function(lat, long, offset, senderID) {
    getEventsByLocation(lat, long, offset, senderID)
  }

  var getEventById = function(id, lat, long, offset, senderID) {
    return externalApi.getEventById(id, senderID)
      .then(function(result) {
        console.log(result)
        var result = JSON.parse(result).data
        var body = result.timer
        var timer = body.time
        var isLoggedIn = result.is_logged
        var islogged = result.is_logged
        console.log(isLoggedIn)
        var is_saved = body.is_saved
        console.log(is_saved)
        var date;
        var time;
        var datetimestamp = new Date(timer * 1000)
        var fullDate = datetimestamp.toDateString().split(' ')
        var date = fullDate[2] + ' ' + fullDate[1] + ' ' + fullDate[3];
        var hours = datetimestamp.getHours() > 12 ? datetimestamp.getHours() - 12 : datetimestamp.getHours();
        var am_pm = datetimestamp.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = datetimestamp.getMinutes() < 10 ? "0" + datetimestamp.getMinutes() : datetimestamp.getMinutes();
        // var seconds = datetimestamp.getSeconds() < 10 ? "0" + datetimestamp.getSeconds() : datetimestamp.getSeconds();
        time = hours + ":" + minutes + " " + am_pm;
        var link = body.link
        var res = link.split('.');
        var message = fbTemplate.ImageMessage(baseUrl + res[0] + '_large.jpg')
        return fbTemplate.reply(message, senderID)
          .then(function() {
            var message = fbTemplate.textMessage(body.name + '\n\n📅  ' + date + '\n\n⌚  ' + time + '\n\n🏁  ' + body.location_infos_uni)
            return fbTemplate.reply(message, senderID)
          })
          .then(function() {
            var description = body.description
            var length = description.length
            var desc = description.substr(0, 640)
            var message = fbTemplate.textMessage(desc)
            return fbTemplate.reply(message, senderID)

          })
          .then(function() {
            return checkLoginStatus(senderID)
              .then(function(islogged) {
                if (islogged === '0' || islogged === null) {
                  return downloadLink(senderID)
                } else {}
              })
          })
          .then(function() {
            return messenger.getLocale(senderID)
          })
          .then(function(userLocale) {
            return Adapter.getText(constants.getEventByIdOptions, userLocale)
          })
          .then(function(txt) {
            var islogged = isLoggedIn
            var qr = []
            if (islogged === '0' || islogged === null) {
              var obj = txt.ifNotLoggedIn.quickReplyMessage.qr
              for (prop in obj) {
                if (obj[prop].payload === constants.EVENTS_LIST) {
                  qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload + ',' + lat + ',' + long))
                } else {
                  qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
                }
              }
              var message = fbTemplate.quickReplyMessage(txt.ifNotLoggedIn.quickReplyMessage.message, qr)
            } else {
              var obj = txt.ifLoggedIn.quickReplyMessage.qr
              var saveObject = txt.ifLoggedIn.quickReplyMessage.isNotSaved.qr
              if (is_saved === '1' || is_saved === 1) {} else {
                qr.push(fbTemplate.createQuickReply(saveObject.text, saveObject.payload + ',' + id + ',' + lat + ',' + long))
              }
              for (prop in obj) {
                qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
              }
              var message = fbTemplate.quickReplyMessage(txt.ifLoggedIn.quickReplyMessage.message, qr)
            }
            return fbTemplate.reply(message, senderID)
          })
      })
  }

  function downloadLink(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.downloadLink, userLocale)
      })
      .then(function(txt) {
        console.log(txt)
        var buttons = []
        var obj = txt.buttonMessage.btn
        for (var prop in obj) {
          buttons.push(fbTemplate.createWebUrlButton(obj[prop].text, obj[prop].url))
        }
        var message = fbTemplate.buttonMessage(txt.buttonMessage.message, buttons)
        return fbTemplate.reply(message, senderID)
      })
  }

  function viewApp(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.viewApp, userLocale)
      })
      .then(function(txt) {
        var text = txt
        console.log(txt)
        var buttons = []
        var obj = txt.buttonMessage.btn
        for (var prop in obj) {
          buttons.push(fbTemplate.createWebUrlButton(obj[prop].text, obj[prop].url))
        }
        var message = fbTemplate.buttonMessage(txt.buttonMessage.message, buttons)
        return fbTemplate.reply(message, senderID)
      })
      .then(function() {
        var qr = []
        var obj = text.quickReplyMessage.qr
        for (prop in obj) {
          qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
        }
        var message = fbTemplate.quickReplyMessage(text.quickReplyMessage.message, qr)
        return fbTemplate.reply(message, senderID)
      })
  }

  function Substr(str, size, senderID) {
    var numChunks = Math.ceil(str.length / size),
      chunks = new Array(numChunks);
    for (var i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }
    return chunks
  }

  function sorryMsg(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.sorryMsg, userLocale)
      })
      .then(function(txt) {
        var message = fbTemplate.textMessage(txt)
        return fbTemplate.reply(message, senderID)
      })
      .then(function() {
        whereToCheckEvents(senderID)
      })
  }

  function promptLogout(senderID) {
    return messenger.getLocale(senderID)
      .then(function(userLocale) {
        return Adapter.getText(constants.promptLogout, userLocale)
      })
      .then(function(txt) {
        var qr = []
        var obj = txt.quickReplyMessage.qr
        for (prop in obj) {
          qr.push(fbTemplate.createQuickReply(obj[prop].text, obj[prop].payload))
        }
        var message = fbTemplate.quickReplyMessage(txt.quickReplyMessage.message, qr)
        return fbTemplate.reply(message, senderID)
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
    saveEvent: saveEvent,
    promptForLogin: promptForLogin,
    afterLogin: afterLogin,
    sendLoginButton: sendLoginButton,
    downloadLink: downloadLink,
    options: options,
    Logout: Logout,
    showMyCalendar: showMyCalendar,
    getCalendarEventsForTomorrow: getCalendarEventsForTomorrow,
    getCalendarEventsForToday: getCalendarEventsForToday,
    getCalendarEventsForThisWeek: getCalendarEventsForThisWeek,
    getCalendarEventsForThisWeekend: getCalendarEventsForThisWeekend,
    getCalendarEventsForNext7Days: getCalendarEventsForNext7Days,
    getCalendarEventsForNext30Days: getCalendarEventsForNext30Days,
    getCalendarEvents: getCalendarEvents,
    showMyCalendarInPersistentMenu: showMyCalendarInPersistentMenu,
    lastOptions: lastOptions,
    greetUser: greetUser,
    sayGoodBye: sayGoodBye,
    viewApp: viewApp,
    get_started: get_started,
    promptLogout: promptLogout,
    sorryMsg: sorryMsg
  };
}
