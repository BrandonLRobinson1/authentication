var db = require('../config');
var Link = require('../models/link');

var Links = new db.Collection();

Links.model = Link;

// console.log(Links);

module.exports = Links;
