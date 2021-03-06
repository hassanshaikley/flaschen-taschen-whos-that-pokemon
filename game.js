var exec = require('child_process').exec;
var fs = require('fs');
var Jimp = require('jimp');
function puts(error, stdout, stderr) {
    //console.log(stdout)
};

function Game(){
    this.already_asked = [];
    this.state = 0; // 1 means good, can guess
    this.target = "localhost";
    this.current_pokemon = -1;
    this.score_board = {};
    this.players = {};
    this.socket;
};

Game.prototype.start = function(){

    //clear canvas
    str = "./bin/send-image -C -l 5 -h " +this.target +" -g 45x45 ";
    exec(str, puts);

    var str='./bin/send-text -l 10 -o -c FF0000 -f bin/5x5.bdf -g 40x20+0+3 -h '+this.target+ ' "Who\'s That Pokemon!"';
    exec(str, puts);

    var that = this;
    setTimeout(function() {
        that.state = 1;
        that.newPokemon();
    }, 8000);

    setInterval(function() {
        that.loop();
    }, 100);
};

var curr_brightness = -.7;
Game.prototype.loop = function(){
    var str = "./bin/send-image -l 1 -h " +this.target +" -g 45x45 images/";
    str+= "blueray.png";
    exec(str, puts);
    var that = this;
    if (this.current_pokemon != -1){
        var pokemon_file;
        if (this.state == 0){
            pokemon_file =  "images/c_" + (this.current_pokemon-1) +".png";

	    Jimp.read(pokemon_file, function (err, image) {
		if (err){
		  console.log("FAAK " + err);
		}
		image.brightness(curr_brightness);
		curr_brightness+=.1;
		curr_brightness = parseFloat(curr_brightness.toFixed(1));
		if(curr_brightness >= 0){
		  curr_brightness = 0;
		    that.exec_(pokemon_file);
		} else {
		  var brightness_file = "images/c_"+ (that.current_pokemon-1)+"."+curr_brightness+".png";

		  image.write(brightness_file, function(){
		    that.exec_(brightness_file);
		  });
		}
		// do stuff with the image
	    }).catch(function (err) {
		// handle an exception
	    });
        } else {
	  pokemon_file =  "images/_" + (this.current_pokemon-1) +".png";
	  this.exec_(pokemon_file);
      }
    }
};

Game.prototype.exec_ = function(file){
    var str = "./bin/send-image -l 5 -g 25x25+10+5 -h " + this.target +" " + file;
    exec(str, puts);
};

Game.prototype.newPokemon = function(){
    if (this.already_asked.length == 151){
        console.log("\n\n\t\tHAVE ALREADY ASKED ALL POKEMON! D: \n\n");
        this.already_asked =[];
    }
    var num = (Math.floor(Math.random()*151 + 0)); // number between 0 and 150
    this.current_pokemon = num+1;
    if (this.already_asked.indexOf(this.current_pokemon) != -1){
        this.newPokemon();
    }
    //for num 50 the correct answer is 51
    console.log("Pokemon num is " + this.current_pokemon);

    this.already_asked.push(this.current_pokemon);
};

//Given a number checks if the number matches the current pokemon
Game.prototype.checkPokemon = function(pokemon, player_id){
    if (this.state == 0){
        return;
    }
    var that = this;
    get_line('bin/pokemon_list.txt', this.current_pokemon-1, function(err, line){
        if (line.toLowerCase() == pokemon.toLowerCase()){
            that.correctAnswer(pokemon, player_id);
        }
    });

};

Game.prototype.correctAnswer = function(guess, player_id){
    if (this.state === 0){
        return;
    }
    this.state = 0;

    str='./bin/send-text -l 10 -o -c FF0000 -f bin/5x5.bdf -g 40x20+0+3 -h ' + this.target + ' "It\'s ' + guess + '!"';
    exec(str, puts);

    this.loop();
    var that = this;
    this.players[player_id].score = this.players[player_id].score + 1;

    this.updateScoreboard();

    setTimeout(function(){
        that.state = 1;
        that.newPokemon();
	curr_brightness = -.7;
    }, 8000);
};

function get_line(filename, line_no, callback) {
    fs.readFile(filename, function (err, data) {
        if (err) throw err;
        // Data is a buffer that we need to convert to a string
        // Improvement: loop over the buffer and stop when the line is reached
        var lines = data.toString('utf-8').split("\n");

        if(+line_no > lines.length){
            return callback('File end reached without finding line', null);
        }

        return callback(null, lines[+line_no]);
    });
}

Game.prototype.updateScoreboard = function(){
    console.log( "Updating scoreboard " + this.socket);
    for (var id in this.players) {
        console.log(this.players[id].id + "<~");
        this.socket.emit("update scoreboard", {id: this.players[id].id, score: this.players[id].score, name: this.players[id].name });

    }


};

exports.Game = Game;
