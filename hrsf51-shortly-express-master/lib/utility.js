var request = require('request');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/

//checking session before its created *******
exports.checkUserSession = function(req, res, next){
  console.log(req.session, ' session test before middleware runs')
  // req.session.name = user.get('username')
  console.log(req.session.name, ' testycalls')
  if (req.session !== undefined) {

       //if (!!req.session.name){ // why the double bang
        next();
      // } else {
      //   console.log(req.session, ' session test after middleware runs')
      //   res.send('hmm222')
      // }
    //console.log(req.session, ' session test after middleware runs')
    // next();
  }
   else {
    req.session.error = 'Access denied!';
    //req.session.name = ""
    console.log(req.session, ' session test after middleware runs')
    res.render('/login')
    //res.redirect('/login');
  }

}


