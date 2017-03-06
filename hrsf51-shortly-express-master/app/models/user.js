var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true
  // setPassword: function(unencryptedPassword) {
  //   bcrypt.hash(unencryptedPassword, null, null, (function(err, hash) {
  //     this.save('password', hash);
  //   }).bind(this));
  // }
});

module.exports = User;