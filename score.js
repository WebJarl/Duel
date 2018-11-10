(function() {
    var score_boards = [];

    function score_board() {
        this.renderable = gameEngine.renderer.createRenderable("TEXT");
        this.renderable.x = 0;
        this.renderable.y = 24 + 24*score_boards.length;

        this.set = function(score, player) {
            this.renderable.text = "Player " + player + ": " + score;
        };
    }

    game.showScores = function(scores) {
        if(scores.length > score_boards.length) {
            score_boards.push(new score_board());
        }

        for(var i in scores) {
            score_boards[i].set(scores[i], Number(i)+1);
        }
    };
}());
