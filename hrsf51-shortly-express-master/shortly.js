var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

// **
var session = require('express-session')
//**

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); 
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: "I am getting the hang of this",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))

// Starting Bcrypt session ************************************
var bcrypt = require('bcrypt-nodejs');

// console.log(bcrypt, ' daddy');
// console.log(salt, ' zaddy')
// ************************************

console.log(session, ' session object')


app.get('/', 
function(req, res) {
  res.render('index');
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', function(req, res, next){
  res.render('login');
});

app.post('/login', function(req, res, next){
  let username = req.body.username;
  let password = req.body.password;

  new User({username: username}).fetch()
    .then(function( user ){

      console.log(user.get('username'), ' userrrrr', user.get('password'), ' userrrrr')
      
      if (!user) {
        console.log('user doesnt exist')
        res.send('quit makin shit up')
        // res.redirect('/signup')
      } else {

      bcrypt.compare(password, user.get('password'), (err, match ) => {
        console.log(err, ' err')

        if (password !== user.get('password')){
          res.send('ahh ahh ahh not without the password')
        } else {
          req.session.regenerate( ()=>{
            req.session.name = username;
          } );
          res.redirect("/")
        }

      });

   

        
      }
})
});

app.get('/signup', function(req, res, next){
  res.render('signup');
  // console.log(req, ' logging req in shortly js line 85')
});

app.post('/signup', function(req, res, next){
  let username = req.body.username;
  let password = req.body.password;
  let salt = bcrypt.genSaltSync(10);
  let hashedPW = bcrypt.hashSync(password, salt);

  //next up is how to store this information and verify in knex and bookshelf

  new User({username: username}).fetch()
    .then(function( user ){
    if (!user) {
      console.error('creating user')
      new User({username: username, password:password })
        .save()
        .then(function( newUser ){
        //console.log(newUser, ' newUser')
        req.session.regenerate( ()=>{
          req.session.name = username;
        } );
        res.redirect("/")
      });
    } else {
      console.log('its already here');
      res.redirect('/login')
    }
  })
  //.then(function(test){console.log(test)})
  // res.send('jo')
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});


app.listen(4568, () => console.log('Fire on 4568') );
