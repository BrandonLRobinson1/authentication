
//                                      .        `                                         
//                                     `sy+++/+shoooooo+:.                                 
//                                 `./osyyyyhyooy-../:-:+ys:.:-                            
//                              .:ohmdysoo++oyyhNmhyd+.:ohdhmy-                            
//                           `:+o/-ohyo+/////dMNmo.:. -NNy/-/hs`                           
//                         -os/.`   `-:/+oooo+/-.     `yd++sdmMh-                          
//                       .os-`         ``..----...```  `+syymNNmh-                         
//                     `oy:       `o.-+syyyssso++++oo+o+:`.-::-.:d.                        
//                    `sh.        `do````     `+oo++/::/syo-     oy                        
//                    oy`          .`          `.--:/oyy+-oho.   -m.                       
//                   .m.                               ``  -my.  .m.                       
//                   -m`                                    -so  .N-                       
//                   .m:                                         :d`                       
//                    +h.                                        ss                        
//                     /h-                                      .m.                        
//                      -y+`                                   `so                         
//                       `oy-`                                `o+                          
//                         -ys-`                             -s-                           
//                           .oy+.     `./s+               .o+`                            
//                             .omh+oyhso+mm`           `:so.                              
//                        .:+shdmdhssys+oodMho+////++++os+.                                
//                   .:oyddyo/-.`        `oMhN+....``                                      
//               `:oyhs+:``               +M+sm:                                           
//              :dy/.`                    /M/`+do`                                         
//             /m+`                       .No  .yy.                                        
//           `om:                          hd`  `od+`                                      
//           +d-                           :N/    -hh-                                     
//          /d-                            `hd`    `+ds.                                   
//         oh-                              -my      .+ys:.                                
//       `+y.                                +N/       `:oyyo:.`                           
//      -yd.                                 .Nd`         `./syyo+:.`                      
//    `+mMNyo/.                               sM/             `.-/oyyyo:.`                 
//   :dNymd//sd+`                             .md`                 ``-/sydy/.              
//  /mhm.sh` `:h/                              oMo                      -mmNm+`            
// `do:N/.yy/`                                 .mN-                     sh-mdm/            
// .m- /y.`:y/                                  /Ny`                    o+.m/ys            
// `:`  `                                       `hN:                      `:`::            
//                                               .o/                                       
//                      _     _ _                  ____                
//                     | |   (_) | _____    __ _  | __ )  ___  ___ ___ 
//                     | |   | | |/ / _ \  / _` | |  _ \ / _ \/ __/ __|
//                     | |___| |   <  __/ | (_| | | |_) | (_) \__ \__ \
//                     |_____|_|_|\_\___|  \__,_| |____/ \___/|___/___/ 
                                                        

var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

// **
var session = require('express-session');
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
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
  // cookie: { secure: true } //why does this mess up my auth?????
}));

// Starting Bcrypt session ************************************
var bcrypt = require('bcrypt-nodejs');

// console.log(bcrypt, ' daddy');
// console.log(salt, ' zaddy')
// ************************************


//app.use(util.checkUserSession);

//tester*********************************

// app.get('/', function(req, res, next) {
//   var sess = req.session
//   if (sess) {
//     sess.views++
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>views: ' + sess.views + '</p>')
//     res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
//     res.end()
//   } else {
//     sess.views = 1
//     res.end('welcome to the session demo. refresh!')
//   }
// })

app.get('/', util.checkUserSession,
function(req, res) {
  res.render('index');
});

app.get('/create', util.checkUserSession,
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', util.checkUserSession,
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
      
      if (!user) {
        console.log('user doesnt exist')
        res.send('quit makin shit up')
        // res.redirect('/signup')
      } else {

      bcrypt.compare(password, user.get('password'), (err, match ) => {
        // console.log(err, ' err')
        if (!match){
          res.send('ahh ahh ahh not without the password')
        } else {
          req.session.regenerate( function(){
            req.session.name = username;
            //console.log(req.session.name, ' req session name for log in xx')
            console.log('log in successful, sending to root and session name is: ', req.session.name)
            res.redirect("/")
          } );
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

  //let salt = bcrypt.genSaltSync(10);
  //let hashedPW = bcrypt.hashSync(password, salt);

  //next up is how to store this information and verify in knex and bookshelf

  new User({username: username}).fetch()
    .then(function( user ){
    if (!user) {
      console.error('creating user')
      bcrypt.hash(password, null, null, function(err, hash) {
        // Store hash in your password DB.
        new User({username: username, password:hash })
        .save()
        .then(function( newUser ){
          req.session.regenerate( function() {
          req.session.name = username;
          console.log(req.session, ' req session name for new user xx')
          res.redirect("/");
        } );
        
      });
      });
    } else {
      console.log('its already here');
      res.redirect('/login')
    }
  })
});

app.get('/logout', function(req, res, next){
  res.render('logout');
});

app.post('/logout', function(req, res, next){
  console.log(req.session, ' logout before destroy')
  req.session.destroy(function() {
    console.log(req.session, ' deleted session')
    res.redirect('/login');
});
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
        linkId: link.get('id');
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
