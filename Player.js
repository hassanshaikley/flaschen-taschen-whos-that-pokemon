var Moniker = require('moniker');
var names = Moniker.generator([Moniker.noun, Moniker.noun]);

function Player(id){
  this.score = 0;
  this.id = id;
  this.name = names.choose();
};

exports.Player = Player;
