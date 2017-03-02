var db = require('../config');
var User = require('../models/user');
var Users = new db.Collection();
console.log(User, ' player')

Users.model = User;

module.exports = Users;
