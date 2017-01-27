// 'use strict';

var fbTemplate = require('./fbTemplate'),
  constants = require("./payload"),
  externalApi = require('./api'),
  Q = require("q"),
  fs = require("fs"),
  _ = require("underscore"),
  wit = require('./wit'),
  moment = require('moment')

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
            .then(function() {
              var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
              var message = fbTemplate.quickReplyMessage('Or do you want to explore without login ?', [qr2])
              return fbTemplate.reply(message, senderID)
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
              var text = fbTemplate.textMessage('Use the first social calendar "Timenote"')
              return fbTemplate.reply(text, senderID)
                .then(function() {
                  var qr0 = fbTemplate.createQuickReply('Yes', constants.YES_LOGIN)
                  var qr1 = fbTemplate.createQuickReply('Continue w/o Login', constants.NO_LOGIN)
                    // var qr2 = fbTemplate.createQuickReply('Events List', constants.EVENTS_LIST + '-' + lat + '-' + long)
                  var message = fbTemplate.quickReplyMessage("Do you want to login ?", [qr0, qr1])
                  return fbTemplate.reply(message, senderID)
                })
            })
            // .then(function() {
            //   var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
            //   var message = fbTemplate.quickReplyMessage('Or do you want to explore without login ?', [qr2])
            //   return fbTemplate.reply(message, senderID)
            // })

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

  var greetUser = function(senderID) {
    // return externalApi.getUserProfile(senderID)
    //   .then(function(user) {
    //     var profile = JSON.parse(user)
    //     var name = profile.first_name
    //     var message = fbTemplate.textMessage('Hi ' + name + '.\nTimeNote bot allows you to explore any city in the world as a city guide. ')
    //     return fbTemplate.reply(message, senderID)
    //   })
    //   .then(function() {
    return get_started(senderID)
      //   })

  }
  var sayGoodBye = function(senderID) {
    return externalApi.getUserProfile(senderID)
      .then(function(user) {
        var profile = JSON.parse(user)
        var name = profile.first_name
        var message = fbTemplate.textMessage('See you soon ' + name + '.\nDo remember you can always type HI or HELLO to start the conversation again.')
        return fbTemplate.reply(message, senderID)
      })
  }

  var afterLogin = function(senderID) {
    externalApi.getUserProfile(senderID)
      .then(function(user) {
        var profile = JSON.parse(user)
        var name = profile.first_name
        console.log(name)
        var message = fbTemplate.textMessage('Congratulations ' + name + ' ! \nYou have successfully logged in to your TimeNote account.')
        console.log(message)
        return fbTemplate.reply(message, senderID)
          .then(function() {
            console.log("Congrats")
            return whereToCheckEvents(senderID)
          })
      })
  }

  var saveEvent = function(senderID, event_id, lat, long) {
    return externalApi.saveEvent(senderID, event_id, lat, long)
      .then(function(result) {
        console.log(result)
        if (result.success == 'true') {
          var message = fbTemplate.textMessage('Cool! This event has been saved to your calendar now.')
          fbTemplate.reply(message, senderID)
            .then(function() {
              var qr0 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
              var qr1 = fbTemplate.createQuickReply('My Calendar', constants.MY_CALENDAR)
                // var qr2 = fbTemplate.createQuickReply('Events List', constants.EVENTS_LIST + '-' + lat + '-' + long)
              var message = fbTemplate.quickReplyMessage("What\'s Next ?", [qr0, qr1])
              return fbTemplate.reply(message, senderID)
            })
        } else {
          var message = fbTemplate.textMessage('Please login first to save this event')
          fbTemplate.reply(message, senderID)
            .then(function(result) {
              console.log(result)
              return sendLoginButton(senderID)
                .then(function() {
                  var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
                  var message = fbTemplate.quickReplyMessage('Or do you want to explore without login ?', [qr2])
                  return fbTemplate.reply(message, senderID)
                })
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
    return externalApi.checkLoginStatus(senderID)
      .then(function(islogged) {
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
          var message = fbTemplate.textMessage('You were already logged out')
          fbTemplate.reply(message, senderID)
        } else {
          return externalApi.Logout(senderID)
            .then(function(result) {
              if (result) {
                var message = fbTemplate.textMessage('You have successfully logged out of your TimeNote account')
                fbTemplate.reply(message, senderID)
              }
            })
        }
      })
      .then(function() {
        return sendLoginButton(senderID)
          // })
          .then(function() {
            var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
            var message = fbTemplate.quickReplyMessage('Or do you want to explore without login ?', [qr2])
            return fbTemplate.reply(message, senderID)
          })
      })
  }
  var showMyCalendar = function(senderID) {
    var qr1 = fbTemplate.createQuickReply('Today', constants.TODAY)
      // var qr2 = fbTemplate.createQuickReply('Tomorrow', constants.TOMORROW)
    var qr2 = fbTemplate.createQuickReply('This Week', constants.THIS_WEEK)
      // var qr4 = fbTemplate.createQuickReply('This Weekend', constants.THIS_WEEKEND)
      // var qr3 = fbTemplate.createQuickReply('Next 7 Days', constants.NEXT_7_DAYS)
    var qr5 = fbTemplate.createQuickReply('Next 30 Days', constants.NEXT_30_DAYS)
    var qr6 = fbTemplate.createQuickReply('Back to Menu', constants.BACK_TO_MENU)
    var qr7 = fbTemplate.createQuickReply('View App', constants.VIEW_APP)
    var message = fbTemplate.quickReplyMessage('You want to see events for ', [qr1, qr2, qr5, qr6, qr7])
    return fbTemplate.reply(message, senderID)
  }

  var showMyCalendarInPersistentMenu = function(senderID) {
    console.log('hi')
    return checkLoginStatus(senderID)
      .then(function(islogged) {
        console.log(islogged)
        console.log('[imp.js - 19] ' + islogged)
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
          var otherCity = fbTemplate.createAccountLinkingButton('https://timenotelogin.herokuapp.com/')
          var message = fbTemplate.buttonMessage('Click on login to log into your TimeNote account', [otherCity])
          return fbTemplate.reply(message, senderID)
        } else {
          showMyCalendar(senderID)
        }
      })
  }

  var getCalendarEvents = function(senderID, maxDate, minDate) {
    externalApi.getProfileWebsite(senderID, maxDate, minDate)
      .then(function(result) {
        var data = JSON.parse(result).data.timers
        var length = parseInt(data.length)
        var elements = []
        if (length !== 0) {
          console.log(length)
          if (length <= 9) {
            for (var i = 0; i < length; i++) {
              var lat = data[i].latitude
              var long = data[i].longitude
              var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id + '-' + lat + '-' + long)
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
              var link = data[i].link;
              var res = link.split('.');
              elements[i] = fbTemplate.createElement(data[i].name + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + res[0] + '_medium.jpg', btn)
            }
          } else if (length > 9) {
            for (var i = 0; i < 9; i++) {
              var lat = data[i].latitude
              var long = data[i].longitude
              var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id + '-' + lat + '-' + long)
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
              var link = data[i].link;
              var res = link.split('.');
              elements[i] = fbTemplate.createElement(data[i].name + ', ' + data[i].location_infos_uni, date + ' ' + time, '', baseUrl + res[0] + '_medium.jpg', btn)
            }
            var minDate = parseInt(data[8].time) + 1
            var btn = fbTemplate.createPostBackButton('More Events', constants.MORE_EVENTS + '-' + maxDate + '-' + minDate)
            elements[9] = fbTemplate.createElement('More Events', 'Click to load more events', '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', [btn])
          }

          var message = fbTemplate.genericMessage(elements)
          return fbTemplate.reply(message, senderID)
        } else {
          var message = fbTemplate.textMessage('You have no events for this date.')
          console.log(message)
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
    return checkLoginStatus(senderID)
      .then(function(islogged) {
        console.log('[imp.js - 19] ' + islogged)
        if (islogged === '0' || islogged === null) {
          var otherCity = fbTemplate.createAccountLinkingButton('https://timenotelogin.herokuapp.com/')
          var message = fbTemplate.buttonMessage('Click on login to log into your TimeNote account', [otherCity])
          return fbTemplate.reply(message, senderID)
        } else {
          var message = fbTemplate.textMessage('You are already logged in to  your TimeNote account')
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
        }
      })
  }

  var promptForLogin = function(senderID) {
    var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
    var qr2 = fbTemplate.createQuickReply('Continue w/o Login', constants.EXPLORE_WITHOUT_LOGIN)
    var message = fbTemplate.quickReplyMessage('So, what do you wanna do ?', [qr1, qr2])
    return fbTemplate.reply(message, senderID)
  }

  var whereToCheckEvents = function(senderID) {
    return checkLoginStatus(senderID)
      .then(function(islogged) {
        console.log('[imp.js - 19] ' + islogged)
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
          var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
          var otherCity = fbTemplate.createPostBackButton('ANOTHER CITY', constants.ANOTHER_CITY)
          var message = fbTemplate.buttonMessage('Discover events in the city of your choice', [nearBy, otherCity])
          return fbTemplate.reply(message, senderID)
        }
        //
        else {
          console.log('logged in')
          var nearBy = fbTemplate.createPostBackButton('NEARBY ME', constants.NEARBY_ME)
          var otherCity = fbTemplate.createPostBackButton('ANOTHER CITY', constants.ANOTHER_CITY)
          var myCalendar = fbTemplate.createPostBackButton('MY CALENDAR', constants.MY_CALENDAR)
          var message = fbTemplate.buttonMessage('Discover events in the city of your choice', [nearBy, otherCity, myCalendar])
          return fbTemplate.reply(message, senderID)
        }
      })
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
    var senderID = parseInt(senderID)
    return externalApi.getEventsByLocation(lat, long, offset, senderID)
      .then(function(result) {
        // console.log(result)
        var body = JSON.parse(result)
        var data = body.data.nearby;
        var more = body.data.more
        if (data.length <= 0) {
          console.log('No result')
          var message = fbTemplate.textMessage('Sorry. There are no events near your location.')
          return fbTemplate.reply(message, senderID)
            .then(function() {
              return whereToCheckEvents(senderID)
            })
            .then(function() {
              return lastOptions(senderID)
            })
        } else {
          var offset = body.data.offset
          var btn = [];
          var elements = [];
          for (var i = 0; i <= data.length; i++) {
            if (i < data.length) {
              var is_saved = data[i].is_saved
              var btn1 = fbTemplate.createPostBackButton('DETAILS', constants.DETAILS + '-' + data[i].id + '-' + lat + '-' + long)
              var btn2 = fbTemplate.createShareButton()
              if (is_saved === 0 || is_saved == 0 || is_saved == '0') {
                var btn3 = fbTemplate.createPostBackButton('SAVE', constants.SAVE_EVENT + '-' + data[i].id + '-' + data[i].latitude + '-' + data[i].longitude)
                var btn = [btn1, btn3, btn2];
              } else {
                var btn = [btn1, btn2];
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
              if (more === true) {
                var btn = fbTemplate.createPostBackButton('More Events', constants.MORE + '-' + offset + '-' + lat + '-' + long)
                elements[i] = fbTemplate.createElement('More Events', 'Click to load more events', '', 'https://sweatglow.files.wordpress.com/2014/10/more.jpg', [btn])
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
    return checkLoginStatus(senderID)
      .then(function(islogged) {
        console.log('[imp.js - 19] ' + islogged)
        if (islogged === '0' || islogged === null) {
          console.log('not logged in')
            // var qr1 = fbTemplate.createQuickReply('Restart', constants.RESTART)
          var qr2 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
          var qr3 = fbTemplate.createQuickReply('More Features', constants.MORE_FEATURES)
          var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
          var message = fbTemplate.quickReplyMessage("What's next ?", [qr2, qr3, qr1])
          return fbTemplate.reply(message, senderID)
        } else {
          // var qr1 = fbTemplate.createQuickReply('Restart', constants.RESTART)
          var qr2 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
            // var qr3 = fbTemplate.createQuickReply('More Features', constants.MORE_FEATURES)

          var qr4 = fbTemplate.createQuickReply('My Calendar', constants.MY_CALENDAR)
          var qr5 = fbTemplate.createQuickReply('View App', constants.VIEW_APP)

          var message = fbTemplate.quickReplyMessage("What's next ?", [qr2, qr4, qr5])
          return fbTemplate.reply(message, senderID)
        }
      })
  }

  var options = function(senderID) {
    var qr1 = fbTemplate.createQuickReply('Restart', constants.RESTART)
    var qr2 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
      // var qr3 = fbTemplate.createQuickReply('More Features', constants.MORE_FEATURES)
    var message = fbTemplate.quickReplyMessage("What's next ?", [qr2, qr1])
    return fbTemplate.reply(message, senderID)
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

  var getEventById = function(id, lat, long, offset, senderID) {
    return externalApi.getEventById(id, senderID)
      .then(function(result) {
        console.log(result)
        var result = JSON.parse(result).data
        var body = result.timer
        var timer = body.time
        var isLoggedIn = result.is_logged
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
                console.log('[imp.js - 19] ' + islogged)
                if (islogged === '0' || islogged === null) {
                  console.log('not logged in')
                  return downloadLink(senderID)
                } else {}
              })
          })
          .then(function() {
            console.log(isLoggedIn)
            console.log(lat)
            console.log(long)
            return checkLoginStatus(senderID)
          })
          .then(function(islogged) {
            console.log('[imp.js - 19] ' + islogged)
            if (islogged === '0' || islogged === null) {
              console.log(false)
              var qr0 = fbTemplate.createQuickReply('Change Location', constants.GO_BACK)
              var qr1 = fbTemplate.createQuickReply('Login', constants.LOGIN)
              var qr2 = fbTemplate.createQuickReply('Events List', constants.EVENTS_LIST + '-' + lat + '-' + long)
              var message = fbTemplate.quickReplyMessage("What\'s Next ?", [qr2, qr0, qr1])
              console.log('not logged in')

            } else {
              console.log(true)
              var qr0 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
              var qr1 = fbTemplate.createQuickReply('My Calendar', constants.MY_CALENDAR)
              if (is_saved === '1' || is_saved === 1) {
                var message = fbTemplate.quickReplyMessage("What\'s Next ?", [qr1, qr0])
              } else {
                var qr2 = fbTemplate.createQuickReply('Save this event', constants.SAVE_EVENT + '-' + id + '-' + lat + '-' + long)
                var message = fbTemplate.quickReplyMessage("What\'s Next ?", [qr2, qr1, qr0])
              }
            }
            return fbTemplate.reply(message, senderID)
          })
      })
  }

  function downloadLink(senderID) {
    var button1 = fbTemplate.createWebUrlButton('Get Android App', 'https://play.google.com/store/apps/details?id=timenote.timenote')
    var button2 = fbTemplate.createWebUrlButton('Get iOS App', 'https://appsto.re/il/aICV5.i')
    var message = fbTemplate.buttonMessage('For more details you can download our app from below links. ', [button1, button2])
    return fbTemplate.reply(message, senderID)
  }


  function viewApp(senderID) {
    var button1 = fbTemplate.createWebUrlButton('Android App', 'https://play.google.com/store/apps/details?id=timenote.timenote')
    var button2 = fbTemplate.createWebUrlButton('iOS App', 'https://appsto.re/il/aICV5.i')
    var message = fbTemplate.buttonMessage('You can view the app here', [button1, button2])
    return fbTemplate.reply(message, senderID)
      .then(function() {
        var qr0 = fbTemplate.createQuickReply('Back To Menu', constants.GO_BACK)
        var qr1 = fbTemplate.createQuickReply('My Calendar', constants.MY_CALENDAR)
        var message = fbTemplate.quickReplyMessage('What\'s Next ?', [qr0, qr1])
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
    var message = fbTemplate.textMessage("Sorry, I could't understand you. Here's what you can do with TimeNote Bot. ")
    return fbTemplate.reply(message, senderID)
      .then(function() {
        whereToCheckEvents(senderID)
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
    sorryMsg: sorryMsg
  };
}
