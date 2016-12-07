var request = require("request");
var Q = require("q");

function call() {

  this.getEventsByLocation = function(lat, long, offset) {
      var deferred = Q.defer();

      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_nearby_chatbot',
        headers: {
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"offset":"' + offset + '","latitude":"'+lat+'","longitude":"'+long+'"}' }
      };

      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          console.log(body)
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
    }
}
module.exports = new call();
