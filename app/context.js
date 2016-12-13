var fs = require('fs');
var path = require("path");


function addContext(obj) {

  var configFile = fs.readFileSync('./app/location.json');
  var config = JSON.parse(configFile);
  config.push(obj);
  var configJSON = JSON.stringify(config);
  fs.writeFileSync('./app/location.json', configJSON);
  console.log('configJSON '+configJSON)
}

exports.addContext = addContext
