// (function() {
//   console.log('hi')
// var app = angular.module('myApp')
//   // app.controller('Ctrl', function($scope, $http, $route, $window) {
//   //   console.log('hi1')
//   //   $scope.lat = undefined;
//   //   $scope.lng = undefined;
//   //   var searchObject = $route.current.params.userid
//   //   console.log(searchObject)
//   //   $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
//   //     var location = $scope.autocomplete.getPlace().geometry.location;

//   //     $scope.address = $scope.autocomplete.getPlace().formatted_address
//   //     $scope.lat = location.lat();
//   //     $scope.lng = location.lng();
//   //     // $scope.lng = location.getPlace();
//   //     console.log($scope.address)

//   //     $scope.$apply();

//   //   });

//   //   $scope.show = function() {
//   //     if (navigator.geolocation) {
//   //       navigator.geolocation.getCurrentPosition(onPositionUpdate);
//   //     }
//   //   }

//   //   function onPositionUpdate(position) {
//   //     var lat = position.coords.latitude;
//   //     var lng = position.coords.longitude;
//   //     $scope.lat = lat
//   //     $scope.lng = lng
//   //     var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=true";
//   //     $http.get(url)
//   //       .then(function(result) {
//   //         var address = result.data.results[2].formatted_address;
//   //         $scope.autocomplete = address;
//   //         $scope.address = address;
//   //       });
//   //   }
//   //   $scope.sendLocation = function() {
//   //     var offset = 0;
//   //     var lat = $scope.lat;
//   //     var lng = $scope.lng
//   //     var address = $scope.address;
//   //     var req = {
//   //       method: 'POST',
//   //       url: 'https://e6179aa4.ngrok.io/getLocation/' + searchObject,
//   //       data: { 'data': '{"offset":' + offset + ',"latitude":' + lat + ',"longitude":' + lng + ',"address":"' + address + '"}' }
//   //     }
//   //     $http(req).success(function(response) {
//   //       console.log(response)
//   //       window.top.close();
//   //     });

//   //   }
//   // });
// })()
