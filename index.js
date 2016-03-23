var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

var Game = require('./game').Game;
var Player = require('./player').Player;

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
    app.game.socket = io;
});

io.on('connection', function(socket){
    console.log('a user connected');
    app.game.players[socket.id] = new Player(socket.id);
    app.game.updateScoreboard();
    socket.emit('init', { id: socket.id});
    socket.on('disconnect', function(){
        delete app.game.players[this.id];
        console.log("Fuckar disconnected " + app.game.players + "---" + this.id);
        app.game.updateScoreboard();
        this.broadcast.emit("disconnect player", {id: this.id });
    });
    socket.on('guess', function(data){
        console.log("Guess received: "+data.guess);
	var guess = data.guess;
	guess.trim();//remove trailing whitespac
        app.game.checkPokemon(data.guess.trim(), this.id);
	if(guess.indexOf("<") != -1){
	  return;
	}

        this.emit('guess', { guess: guess });
        this.broadcast.emit('guess', { guess: guess });
    });
});
