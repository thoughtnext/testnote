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
function createAccountLinkingButton(url) {
  return {
    "type": "account_link",
    "url": url
  }
}

function createWebViewButton(url, title, ratio) {
  return {
    "type": "web_url",
    "url": url,
    "title": title,
    "webview_height_ratio": ratio,
    "messenger_extensions": true,  
    "fallback_url" : url
  }
}

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
exports.createWebUrlButton = createWebUrlButton;
exports.buttonMessage = buttonMessage;
exports.locationMessage = locationMessage;
exports.createElement = createElement;
exports.genericMessage = genericMessage;
exports.createShareButton = createShareButton;
exports.reply = reply;
exports.createAccountLinkingButton = createAccountLinkingButton;
exports.ImageMessage = ImageMessage;
