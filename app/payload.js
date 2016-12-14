function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("LOGIN", "LOGIN");
define("EXPLORE_WITHOUT_LOGIN", "EXPLORE_WITHOUT_LOGIN");
define("NEARBY_ME", "NEARBY_ME");
define("ANOTHER_CITY", "ANOTHER_CITY");
define("DETAILS", "DETAILS");
define("MORE", "MORE");
define("GET_STARTED", "GET_STARTED");
define("YES_CONFIRMATION_FOR_CITY", "YES_CONFIRMATION_FOR_CITY");
define("NO_CONFIRMATION_FOR_CITY", "NO_CONFIRMATION_FOR_CITY");
define("RESTART", "RESTART");
define("GO_BACK", "GO_BACK");
define("EVENTS_LIST", "EVENTS_LIST");

    
// constants.DETAILS


















    // // If we receive a text message, check to see if it matches any special
    // // keywords and send back the corresponding example. Otherwise, just echo
    // // the text we received.
    // switch (messageText) {
    //   case 'image':
    //     sendImageMessage(senderID);
    //     break;

    //   case 'gif':
    //     sendGifMessage(senderID);
    //     break;

    //   case 'audio':
    //     sendAudioMessage(senderID);
    //     break;

    //   case 'video':
    //     sendVideoMessage(senderID);
    //     break;

    //   case 'file':
    //     sendFileMessage(senderID);
    //     break;

    //   case 'button':
    //     sendButtonMessage(senderID);
    //     break;

    //   case 'generic':
    //     sendGenericMessage(senderID);
    //     break;

    //   case 'receipt':
    //     sendReceiptMessage(senderID);
    //     break;

    //   case 'quick reply':
    //     sendQuickReply(senderID);
    //     break;

    //   case 'read receipt':
    //     sendReadReceipt(senderID);
    //     break;

    //   case 'typing on':
    //     sendTypingOn(senderID);
    //     break;

    //   case 'typing off':
    //     sendTypingOff(senderID);
    //     break;

    //   case 'account linking':
    //     sendAccountLinking(senderID);
    //     break;

    //     // default:
    //     // sendTextMessage(senderID, messageText);

    // }