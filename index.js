//Doublescreen 0.0.2
// Creating an express server

var express = require('express'),
	app = express();

// This is needed if the app is run on heroku and other cloud providers:

var port = process.env.PORT || 8080;

// Initialize a new socket.io object. It is bound to
// the express app, which allows them to coexist.

var io = require('socket.io').listen(app.listen(port));

// Initialize JSON Web Token Simple module https://www.npmjs.com/package/jwt-simple
var jwt = require('jwt-simple');
var secret = Buffer.from('thisisdoublescreenapp', 'hex');

// App Configuration

// Make the files in the public folder available to the world
app.use(express.static(__dirname + '/public'));
app.use('/reveal/', express.static(__dirname + '/node_modules/reveal/'));


var presentation = io.on('connection', function (socket) {

//Code generator
  socket.on('getToken', function(data){
    socket.emit('token', {
      code: data.code,
      room: data.room,
      token: jwt.encode(data.room, secret)
    });
  });

//Code listener
  socket.on('connectToRoom', function(data){
    var sentToken = jwt.decode(data.token, secret);
    socket.join(sentToken);
    io.to(sentToken).emit('console', {
      msg: 'connected to ' + sentToken + ' as ' + data.role
    });
    if(data.role == 'slave'){
      io.to(sentToken).emit('redirect');
    }
  });

  socket.on('action', function(data){
    var sentToken = jwt.decode(data.token, secret);
    io.to(sentToken).emit('doThat', {
      emitter: data.emitter,
      action: data.action,
      target: data.target
    });
  });

});


// Tell the app is running
console.log('Your presentation is running on http://localhost:' + port);
