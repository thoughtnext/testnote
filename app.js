/* @author Kritika Rastogi
 * Dated - 30th Nov 2016
 */

'use strict';

const
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  fbTemplate = require('./app/fbTemplate'),
  configuration = require('./app/configuration'),
  routes = require('./app/messengerApi'),
  messenger = require('./app/messenger'),
  moment = require('moment'),
  app = express();


  var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, Accept,Content-Length, X-Requested-With, X-PINGOTHER');
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

app.set('port', process.env.PORT || 9000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));


/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

if (!(configuration.APP_SECRET && configuration.VALIDATION_TOKEN && configuration.PAGE_ACCESS_TOKEN )) {
  console.error("Missing config values");
  process.exit(1);
}

// Call FB Apis here
app.use(allowCrossDomain);
routes.configure(app);

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
