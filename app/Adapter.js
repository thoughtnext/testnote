var firebase = require('firebase');
var Q = require("q");

var config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};

firebase.initializeApp(config);
var ref = firebase.database().ref('messages');

function getText(key, locale) {
var deferred = Q.defer();
  ref.child(key).on("child_added", function(snapshot, prevChildKey) {
    var newPost = snapshot.val();
    var text = newPost[locale]
    deferred.resolve(text)
  });
  return deferred.promise;
}

exports.getText = getText;
