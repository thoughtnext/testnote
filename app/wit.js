'use strict';
var configuration = require('./configuration'),
  fbTemplate = require('./fbTemplate')

let Wit = null;
let log = null;
// try {
//   // if running from repo
//   Wit = require('../').Wit;
//   log = require('../').log;
// } catch (e) {
Wit = require('node-wit').Wit;
log = require('node-wit').log;
// }
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = { fbid: fbid, context: {} };
  }
  return sessionId;
};


const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Our bot actions
const actions = {
  send({ sessionId }, text ) {
    console.log(sessionId)
      // Our bot has something to say!
      // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      console.log(recipientId)
      console.log(text)

      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      var message = fbTemplate.textMessage(text)
      return fbTemplate.reply(message, recipientId)
        .then(() => null)
        .catch((err) => {
          console.error(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err.stack || err
          );
        });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  getForecast({context, entities}) {
    var location = firstEntityValue(entities, 'location');
    if (location) {
      context.forecast = 'rain in ' + location; // we should call a weather API here
      console.log(context)
      console.log(entities)
      delete context.missingLocation;
    } else {
      context.missingLocation = true;
      delete context.forecast;
    }
    return context;
  },
};
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
// };
const WIT_TOKEN = process.env.WIT_TOKEN || configuration.WIT_TOKEN;

// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

exports.findOrCreateSession = findOrCreateSession;
exports.wit = wit
 