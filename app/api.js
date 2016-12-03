var request = require("request");
var Q = require("q");

function call() {

  this.getEventsByLocation = function(lat, long, page) {
      var deferred = Q.defer();

      var options = {
        method: 'POST',
        url: 'http://api.gotimenote.com/user/get_nearby_chatbot',
        headers: {
          'cache-control': 'no-cache',
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"page":"' + page + '","latitude":"43.700000","longitude":"7.250000"}' }
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
          'cache-control': 'no-cache',
          'content-type': 'multipart/form-data'
        },
        formData: { data: '{"event_id" : '+event_id+' , "password" : "lechevalblanc"}' }
      };

      request(options, function(error, response, body) {
        if (error) {
          deferred.reject(error);

        } else {
          deferred.resolve(body)
        }
      });
      return deferred.promise;
    }
}
module.exports = new call();
