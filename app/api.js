var request = require("request"),
  Q = require("q"),
  configuration = require('./configuration')

function call() {
  var API_KEY = 'AIzaSyCQE0-Edwf7xDQA4Qi-hYMdV9yxISERcRE'
  var PAGE_ACCESS_TOKEN = configuration.PAGE_ACCESS_TOKEN
  this.getEventsByLocation = function(lat, long, offset, user_id) {
      var deferred = Q.defer();

      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_nearby_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id": "' + user_id + '","offset":"' + offset + '","latitude":"' + lat + '","longitude":"' + long + '"}' }
        // formData: { data: '{"offset":"' + offset + '","latitude":"' + 43.700000 + '","longitude":"' + 7.250000 + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getEventById = function(event_id, user_id) {
      console.log(event_id)
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_event_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id": "' + user_id + '","event_id" : "' + event_id + '" , "password" : "lechevalblanc"}' }
      };
      console.log(options.formData)


      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          console.log(options.formData)
          console.log('api.js =>>>' + JSON.parse(body).data.is_logged)

          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getAddress = function(lat, lng) {
      console.log(lat, lng)
      var deferred = Q.defer();
      var options = {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: { latlng: lat + ',' + lng, sensor: 'true' }
      };

      request(options, function(error, response, body) {
        if (error) {
          console.log(error)
          deferred.reject(error);
        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getCity = function(city) {
      var deferred = Q.defer();
      var options = {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + city + '&types=(cities)&language=en&key=' + API_KEY //,
      };

      request(options, function(error, response, body) {
        if (error) {
          console.log(error)
          deferred.reject(error);
        } else {
          var result = JSON.parse(body).predictions[0]
          deferred.resolve(result)
        }
      });
      return deferred.promise;
    },
    this.getCityGeometry = function(placeid) {
      var deferred = Q.defer();
      var options = {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + placeid + '&key=' + API_KEY //,
      };

      request(options, function(error, response, body) {
        if (error) {
          console.log(error)
          deferred.reject(error);
        } else {
          var result = JSON.parse(body).result.geometry.location
          deferred.resolve(result)
        }
      });
      return deferred.promise;
    },
    this.getUserProfile = function(userID) {
      var deferred = Q.defer();
      var options = {
        method: 'GET',
        url: 'https://graph.facebook.com/v2.6/' + userID + '?access_token=' + PAGE_ACCESS_TOKEN
      };

      request(options, function(error, response, body) {
        if (error) {
          console.log(error)
          deferred.reject(error);
        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.checkBotUsers = function(username, user_fb_id) {
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'https://api.gotimenote.com/user/check_bot_users',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"username":"' + username + '","user_fb_id":"' + user_fb_id + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getProfileWebsite = function(user_fb_id, max_date, min_date) {
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'https://api.gotimenote.com/user/get_profile_website',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id":"' + user_fb_id + '","max_date":"' + max_date + '","min_date":"' + min_date + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          // console.log(body)
          // console.log(JSON.parse(body.data))
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.saveEvent = function(user_fb_id, event_id) {
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'https://api.gotimenote.com/user/keep_timenote_website',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id":"' + user_fb_id + '","event_id":"' + event_id + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          // console.log(body)
          // console.log(JSON.parse(body.data))
          var result = JSON.parse(body)
          deferred.resolve(result)
        }
      });
      return deferred.promise;
    }
  this.checkLoginStatus = function(user_fb_id) {
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'https://api.gotimenote.com/user/is_logged_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id":"' + user_fb_id + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          // console.log(body.data)
          // console.log(JSON.parse(body.data))
          var result = JSON.parse(body).data.is_logged
            // console.log(result.data.is_logged)
          deferred.resolve(result)
        }
      });
      return deferred.promise;
    },
    this.Logout = function(user_fb_id) {
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/logout_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"user_fb_id":"' + user_fb_id + '"}' }
      };
      console.log(options.url)
      console.log(options.formData)
      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          // console.log(body.data)
          // console.log(JSON.parse(body.data))
          var result = JSON.parse(body).success
            // console.log(result.data.is_logged)
          deferred.resolve(result)
        }
      });
      return deferred.promise;
    }
}
module.exports = new call();
