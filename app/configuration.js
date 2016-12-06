/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */
const config = require('config');

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) 

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN)

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) 

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL)

exports.APP_SECRET = APP_SECRET;
exports.VALIDATION_TOKEN = VALIDATION_TOKEN;
exports.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
exports.SERVER_URL = SERVER_URL;
