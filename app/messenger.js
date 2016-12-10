var configuration = require('./configuration'),
  fbTemplate = require('./fbTemplate'),
  crypto = require('crypto'),
  foo = require('./implementation'),
  implement = foo(),
  Handler = require("./Handler")
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
  console.log(JSON.stringify(message));

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
    console.log("\nReceived echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("\nQuick reply for message %s with payload %s", messageId, quickReplyPayload);

    Handler.HandlePayload(quickReplyPayload, senderID)
    return;
  }

  if (messageText) {
    if (messageText.toString().toUpperCase() == 'HEY' ||
      messageText.toString().toUpperCase() == 'HELLO' ||
      messageText.toString().toUpperCase() == 'HI') {
      implement.welcome(senderID);
    } else {
      
    }

  } else if (messageAttachments) {
    var attachmentType = messageAttachments[0].type
    var attachmentPayload = messageAttachments[0].payload
      // console.log(attachmentPayload)
    if (attachmentType == 'location') {
      // console.log(attachmentPayload.coordinates)
      Handler.HandlePayload(attachmentPayload, senderID)
    }
    // var message = fbTemplate.textMessage('Message with attachment received')
    // return fbTemplate.reply(message, senderID)
  }
}

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
}


// export { verifyRequestSignature };
exports.verifyRequestSignature = verifyRequestSignature;
exports.receivedAuthentication = receivedAuthentication;
exports.receivedMessage = receivedMessage;
exports.receivedMessageRead = receivedMessageRead;
exports.receivedDeliveryConfirmation = receivedDeliveryConfirmation;
exports.receivedPostback = receivedPostback;
exports.receivedAccountLink = receivedAccountLink;
