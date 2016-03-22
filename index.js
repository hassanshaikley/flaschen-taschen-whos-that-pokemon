var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

var Game = require('./game').Game;


app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.set("view options", {layout: false});
app.use(express.static(__dirname + '/lib/views'));



app.get('/', function (req, res) {
    res.render('index.html');
});

app.post('/guess', function (req, res) {
    res.redirect('/');
});

http.listen(3000, function () {
    console.log('Who\'s that Pokemon listening on port 3000!');
    app.game = new Game();
    var args = process.argv.slice(2);
    if (args[0]){
        app.game.target = args[0];
    }
    app.game.start();
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('guess', function(data){
        console.log("Guess received: "+data.guess);
	var guess = data.guess;
	guess.trim();//remove trailing whitespac
        app.game.checkPokemon(data.guess.trim());
	if(guess.indexOf("<") != -1){
	  return;
	}

        this.emit('guess', { guess: guess });
        this.broadcast.emit('guess', { guess: guess });
    });
});
