var game = (function() {
    var players = {};
    var bg_music = new Audio("ost.wav");
    bg_music.volume = 0.2;
    bg_music.loop = true;
    bg_music.play();

    return new function() {
        this.init = function() {
            players[0] = new game.player();
        };

        this.onTick = function(dt) {
            var scores = [];
            for(var player_i in players) {
                var player = players[player_i];
                scores.push(player.score);
                player.tick(player_i, dt);
            }
            game.showScores(scores);
            game.handleShooting(dt, players);
            game.handleShields(dt);
            game.handleAsteroids(dt, players);
            game.handleCollectibles(dt, players);
        };

        gameEngine.onGamePadConnected(function(index) {
            if(index > 0) {
                players[index] = new game.player();
            }
        });
        gameEngine.onGamePadDisconnected(function(index) {
            if(index != 0) {
                players[index].destroy();
                delete players[index];
            }
        });
    }();
}());
