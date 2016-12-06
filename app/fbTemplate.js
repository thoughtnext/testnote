var request = require("request");
var Q = require("q");
var configuration = require('./configuration')

function textMessage(message) {
  return {
    "text": message
  }
}

function createQuickReply(title, payload) {
  return {
    "content_type": "text",
    "title": title,
    "payload": payload
  }
}

function createPostBackButton(title, payload) {
  return {
    "type": 'postback',
    "title": title,
    "payload": payload
  }
}

function createWebUrlButton(title, url) {
  return {
    "type": "web_url",
    "title": title,
    "url": url
  }
}

function createWebViewButton(url, title, ratio) {
  return {
    "type": "web_url",
    "url": url,
    "title": title,
    "webview_height_ratio": ratio
    // "messenger_extensions": true,  
    // "fallback_url" : url
  }
}

              // {
              //   "type":"web_url",
              //   "url":"https://petersfancyapparel.com/criteria_selector",
              //   "title":"Select Criteria",
              //   "webview_height_ratio": "full",
              //   "messenger_extensions": true,  
              //   "fallback_url": "https://petersfancyapparel.com/fallback"
              // }


function buttonMessage(text, buttons) {
  return {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: text,
        buttons: buttons
      }
    }
  }
}

function quickReplyMessage(title, quick_replies) {
  return {
    "text": title,
    "quick_replies": quick_replies
  }
}

function locationMessage() {
  return {
    "text": "Please share your location:",
    "quick_replies": [{
      "content_type": "location",
    }]
  }
}

function createElement(title, subtitle, item_url, image_url, buttons) {
  return {
    title: title,
    subtitle: subtitle,
    item_url: item_url,
    image_url: image_url,
    buttons: buttons
  }
}

function genericMessage(elements) {
  return {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: elements
      }
    }
  }
}

function createShareButton() {
  return {
    "type": "element_share"
  }
}

function ImageMessage(url) {
  return {
    "attachment": {
      "type": "image",
      "payload": {
        "url": url
      }
    }
  }
}

// /*
//  * Send a Gif using the Send API.
//  *
//  */
// function GifMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "image",
//         payload: {
//           url: SERVER_URL + "/assets/instagram_logo.gif"
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send audio using the Send API.
//  *
//  */
// function AudioMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "audio",
//         payload: {
//           url: SERVER_URL + "/assets/sample.mp3"
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a video using the Send API.
//  *
//  */
// function VideoMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "video",
//         payload: {
//           url: SERVER_URL + "/assets/allofus480.mov"
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a file using the Send API.
//  *
//  */
// function FileMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "file",
//         payload: {
//           url: SERVER_URL + "/assets/test.txt"
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a text message using the Send API.
//  *
//  */
// function TextMessage(recipientId, messageText) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       text: messageText,
//       metadata: "DEVELOPER_DEFINED_METADATA"
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a button message using the Send API.
//  *
//  */
// function ButtonMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "button",
//           text: "This is test text",
//           buttons: [{
//             type: "web_url",
//             url: "https://www.oculus.com/en-us/rift/",
//             title: "Open Web URL"
//           }, {
//             type: "postback",
//             title: "Trigger Postback",
//             payload: "DEVELOPER_DEFINED_PAYLOAD"
//           }, {
//             type: "phone_number",
//             title: "Call Phone Number",
//             payload: "+16505551234"
//           }]
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a Structured Message (Generic Message type) using the Send API.
//  *
//  */
// function GenericMessage(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [{
//             title: "rift",
//             subtitle: "Next-generation virtual reality",
//             item_url: "https://www.oculus.com/en-us/rift/",
//             image_url: SERVER_URL + "/assets/rift.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/rift/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for first bubble",
//             }],
//           }, {
//             title: "touch",
//             subtitle: "Your Hands, Now in VR",
//             item_url: "https://www.oculus.com/en-us/touch/",
//             image_url: SERVER_URL + "/assets/touch.png",
//             buttons: [{
//               type: "web_url",
//               url: "https://www.oculus.com/en-us/touch/",
//               title: "Open Web URL"
//             }, {
//               type: "postback",
//               title: "Call Postback",
//               payload: "Payload for second bubble",
//             }]
//           }]
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a receipt message using the Send API.
//  *
//  */
// function ReceiptMessage(recipientId) {
//   // Generate a random receipt ID as the API requires a unique ID
//   var receiptId = "order" + Math.floor(Math.random() * 1000);

//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "receipt",
//           recipient_name: "Peter Chang",
//           order_number: receiptId,
//           currency: "USD",
//           payment_method: "Visa 1234",
//           timestamp: "1428444852",
//           elements: [{
//             title: "Oculus Rift",
//             subtitle: "Includes: headset, sensor, remote",
//             quantity: 1,
//             price: 599.00,
//             currency: "USD",
//             image_url: SERVER_URL + "/assets/riftsq.png"
//           }, {
//             title: "Samsung Gear VR",
//             subtitle: "Frost White",
//             quantity: 1,
//             price: 99.99,
//             currency: "USD",
//             image_url: SERVER_URL + "/assets/gearvrsq.png"
//           }],
//           address: {
//             street_1: "1 Hacker Way",
//             street_2: "",
//             city: "Menlo Park",
//             postal_code: "94025",
//             state: "CA",
//             country: "US"
//           },
//           summary: {
//             subtotal: 698.99,
//             shipping_cost: 20.00,
//             total_tax: 57.67,
//             total_cost: 626.66
//           },
//           adjustments: [{
//             name: "New Customer Discount",
//             amount: -50
//           }, {
//             name: "$100 Off Coupon",
//             amount: -100
//           }]
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a message with Quick Reply buttons.
//  *
//  */
// function QuickReply(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       text: "What's your favorite movie genre?",
//       quick_replies: [{
//         "content_type": "text",
//         "title": "Action",
//         "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
//       }, {
//         "content_type": "text",
//         "title": "Comedy",
//         "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
//       }, {
//         "content_type": "text",
//         "title": "Drama",
//         "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
//       }]
//     }
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a read receipt to indicate the message has been read
//  *
//  */
// function ReadReceipt(recipientId) {
//   console.log("Sending a read receipt to mark message as seen");

//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     er_action: "mark_seen"
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Turn typing indicator on
//  *
//  */
// function TypingOn(recipientId) {
//   console.log("Turning typing indicator on");

//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     er_action: "typing_on"
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Turn typing indicator off
//  *
//  */
// function TypingOff(recipientId) {
//   console.log("Turning typing indicator off");

//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     er_action: "typing_off"
//   };

//   callSendAPI(messageData);
// }

// /*
//  * Send a message with the account linking call-to-action
//  *
//  */
// function AccountLinking(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "button",
//           text: "Welcome. Link your account.",
//           buttons: [{
//             type: "account_link",
//             url: SERVER_URL + "/authorize"
//           }]
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */

function reply(message, senderID) {
  var deferred = Q.defer();
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: configuration.PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderID
      },
      message: message,
      metadata: "DEVELOPER_DEFINED_METADATA"

    }
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var senderID = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("\nSuccessfully sent message with id %s to recipient %s", messageId, senderID);
        deferred.resolve(body);
      } else {
        console.log("\nSuccessfully called Send API for recipient %s", senderID);
        deferred.resolve(body);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
      deferred.reject(body);

    }
  });
  return deferred.promise;

}

exports.textMessage = textMessage;
exports.createQuickReply = createQuickReply;
exports.quickReplyMessage = quickReplyMessage;
exports.createPostBackButton = createPostBackButton;
exports.createWebViewButton = createWebViewButton;
// exports.createWebViewButton = createWebViewButton;
exports.buttonMessage = buttonMessage;
exports.locationMessage = locationMessage;
exports.createElement = createElement;
exports.genericMessage = genericMessage;
exports.createShareButton = createShareButton;
exports.reply = reply;
exports.ImageMessage = ImageMessage;
