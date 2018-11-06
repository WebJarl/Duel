var game = (function() {
    var player = {};

    return new function() {
        this.init = function() {
            player.renderable = gameEngine.renderer.createRenderable("RECTANGLE");
            player.renderable.w = 32;
            player.renderable.h = 32;
        };

        this.onTick = function(dt) {
            

            if(gameEngine.keyIsDown('ArrowUp') || gameEngine.keyIsDown('w')) {
                player.renderable.y -= 0.1 * dt;
                player.renderable.sprite = 0;
            }
            if(gameEngine.keyIsDown('ArrowDown') || gameEngine.keyIsDown('s')) {
                player.renderable.y += 0.1 * dt;
                player.renderable.sprite = 1;
            }
            if(gameEngine.keyIsDown('ArrowLeft') || gameEngine.keyIsDown('a')) {
                player.renderable.x -= 0.1 * dt;
                player.renderable.sprite = 2;
            }
            if(gameEngine.keyIsDown('ArrowRight') || gameEngine.keyIsDown('d')) {
                player.renderable.x += 0.1 * dt;
                player.renderable.sprite = 3;
            }
            if(gameEngine.keyIsDown('e')) {
                gameEngine.renderer.zoomCamera(0.99);
                console.log(player.renderable);
            }
            if(gameEngine.keyIsDown('q')) {
                gameEngine.renderer.zoomCamera(1.01);
            }
        };
    }();
}());
