var request = require("request");
var Q = require("q");

function call() {
  var API_KEY = 'AIzaSyCQE0-Edwf7xDQA4Qi-hYMdV9yxISERcRE'
  this.getEventsByLocation = function(lat, long, offset) {
      var deferred = Q.defer();

      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_nearby_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"offset":"' + offset + '","latitude":"'+lat+'","longitude":"'+long+'"}' }
        // formData: { data: '{"offset":"' + offset + '","latitude":"' + 43.700000 + '","longitude":"' + 7.250000 + '"}' }
      };

      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getEventById = function(event_id) {
      console.log(event_id)
      var deferred = Q.defer();
      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_event_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"event_id" : ' + event_id + ' , "password" : "lechevalblanc"}' }
      };

      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    },
    this.getAddress = function(lat, lng) {
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
    }
}
module.exports = new call();
