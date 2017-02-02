'use strict';
var configuration = require('./configuration'),
  fbTemplate = require('./fbTemplate'),
  crypto = require('crypto'),
  foo = require('./implementation'),
  implement = foo(),
  externalApi = require('./api'),
  Handler = require("./Handler"),
  constants = require("./payload"),
  json = require('./location.json'),
  _ = require("underscore"),
  fs = require('fs'),
  Wit = require('node-wit').Wit;


// ,
// session = require("./wit").findOrCreateSession,
// wit = require("./wit").wit
/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', configuration.APP_SECRET)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  // sendTextMessage(senderID, "Authentication successful");
  var message = fbTemplate.textMessage('Authentication successful')
  fbTemplate.reply(message, senderID)
}

/*
 * Message Event
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("\nReceived message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  // console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    // console.log("\nReceived echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("\nQuick reply for message %s with payload %s", messageId, quickReplyPayload);

    Handler.HandlePayload(quickReplyPayload, senderID)
    return;
  }

  if (messageText) {
    if (messageText.toString().toUpperCase() == 'NO' || messageText.toString().toUpperCase() == 'START' || messageText.toString().toUpperCase() == 'RESTART') {
      implement.get_started(senderID)
    }
    else if(messageText.toString().toUpperCase() == 'SURE'){
      implement.sendLoginButton(senderID)
    } else {
      const sessionId = findOrCreateSession(senderID);
      console.log('session id is ==' + sessionId)

      const context0 = {};
      client.runActions(sessionId, messageText, context0)
        .then((context1) => {
          console.log('The session state is now: === ' + JSON.stringify(context1));
          // if (context1 == 'location') {
          //   implement.sorryMsg(senderID);
          // }
          //return client.runActions(sessionId,messageText , context1);
        })
        .then((context2) => {
          // console.log('The session state is now: ' + JSON.stringify(context2));
        })

      .catch((e) => {
        console.log('Oops! Got an error: ' + e);
        implement.sorryMsg(senderID);
      });
      // const context = "location";
      // var configFile = fs.readFileSync('./app/location.json');
      // var config = JSON.parse(configFile);
      // var text = messageText.toString()
      // console.log(text)

      // var isLocationContext = _.where(config, { 'userId': senderID, 'context': 'location' }).length
      // if (isLocationContext > 0) {
      //   implement.promptCityConfirmationFromUser(text, senderID)

      // } else {
      //   implement.sorryMsg(senderID)
    }


  } else if (messageAttachments) {
    var attachmentPayload = messageAttachments[0].payload
    console.log('\n')
    var attachmentType = messageAttachments[0].type
    if (attachmentType === 'location') {
      if (attachmentPayload.coordinates.lat !== undefined) {
        // console.log(typeof(attachmentPayload))
        if (typeof(attachmentPayload) === 'object') {
          console.log(attachmentPayload)
          Handler.HandlePayload(attachmentPayload.coordinates, senderID)
        }
      }
    }
    // var message = fbTemplate.textMessage('Message with attachment received')
    // return fbTemplate.reply(message, senderID)
  }
}

/*wit config*/

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

// Our bot actions
const actions = {
  send(request, response) {
    return new Promise(function(resolve, reject) {
      console.log(JSON.stringify(request.entities.intent[0].value))
      console.log(JSON.stringify(response));
      const recipientId = sessions[request.sessionId].fbid;
      var text = response.text
      var quick_reply = response.quickreplies
      if (text && quick_reply) {
        var en = request.entities.intent[0].value
        console.log(text)
        console.log(quick_reply)
        if (en === 'logout') {
          var qr = []
          var i = 0;
          for (i = 0; i < quick_reply.length; i++) {
            qr[i] = fbTemplate.createQuickReply(quick_reply[i], quick_reply[i] + '_LOGOUT')
          }
          var message = fbTemplate.quickReplyMessage(text, qr)
          fbTemplate.reply(message, recipientId)
        }
      }
      if (text && !quick_reply) {
        console.log(text)
      }
      return Promise.resolve();
    });
  },
  GetLocation({ sessionId, context, entities }) {
    const senderID = sessions[sessionId].fbid;
    console.log('senderID is == ' + senderID);
    if (senderID) {
      var en = entities.location[0].value
        // Yay, we found our recipient!
        // Let's forward our bot response to her.
        // We return a promise to let our bot know when we're done sending
      console.log('context')
      console.log(context)
      console.log('entities')
      console.log(en)
      implement.promptCityConfirmationFromUser(en, senderID)

    }
  },
  GreetUser({ sessionId, context, entities }) {
    const senderID = sessions[sessionId].fbid;
    console.log('senderID is == ' + senderID);
    if (senderID) {
      // var message = fbTemplate.textMessage('Hi User. TimeNote')
      implement.greetUser(senderID)

    }
  },
  sayGoodBye({ sessionId, context, entities }) {
    const senderID = sessions[sessionId].fbid;
    console.log('senderID is == ' + senderID);
    if (senderID) {
      // var message = fbTemplate.textMessage('Hi User. TimeNote')
      implement.sayGoodBye(senderID)

    }
  }
};

const client = new Wit({
  accessToken: 'KEQCELLJWURLA7KXMUS5ACLEYBU6MIQX',
  actions
  // logger: new log.Logger(log.INFO)
});



/*
 * Delivery Confirmation Event
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  Handler.HandlePayload(payload, senderID)
    // sendTextMessage(senderID, "Postback called");
    // var message = fbTemplate.textMessage('Postback called')
    // return fbTemplate.reply(message, senderID)
}

/*
 * Message Read Event
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;
  console.log("Received account link event with for user %d with status %s and auth code %s ", senderID, status, authCode);
  if (status == "linked") {
    var payload = constants.AFTER_LOGIN
    Handler.HandlePayload(payload, senderID)
  }
}

exports.verifyRequestSignature = verifyRequestSignature;
exports.receivedAuthentication = receivedAuthentication;
exports.receivedMessage = receivedMessage;
exports.receivedMessageRead = receivedMessageRead;
exports.receivedDeliveryConfirmation = receivedDeliveryConfirmation;
exports.receivedPostback = receivedPostback;
exports.receivedAccountLink = receivedAccountLink;
