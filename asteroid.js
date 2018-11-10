(function() {
    var spawn_interval = 250;
    game.asteroids = [];

    game.asteroid = function() {
        this.renderable = gameEngine.renderer.createRenderable("IMAGE", "asteroid.png");
        this.velocity = Math.random() + 0.1;
        this.velocity_x = Math.random() - 0.5;
        this.velocity_y = Math.random() - 0.5;
        this.rotationVelocity = (Math.random() - 0.5) * 0.01;
        var scale = Math.random() * 32 + 8;
        this.renderable.w = scale;
        this.renderable.h = scale;
        this.renderable.rotation = Math.random() * 2*Math.PI;
        this.health = scale / 3;
        if(Math.floor(Math.random() * 2) % 2 == 0) {
            if(Math.floor(Math.random() * 2) % 2 == 0) {
                this.renderable.x = 0;
            } else {
                this.renderable.x = gameEngine.getWidth();
            }
            this.renderable.y = Math.random() * gameEngine.getHeight();
        } else {
            if(Math.floor(Math.random() * 2) % 2 == 0) {
                this.renderable.y = 0;
            } else {
                this.renderable.y = gameEngine.getHeight();
            }
            this.renderable.y = Math.random() * gameEngine.getWidth();
        }

        this.destroy = function() {
            gameEngine.renderer.destroyRenderable(this.renderable);
        };
    };

    function createTrail(asteroid) {
        var particle = gameEngine.renderer.createRenderable("RECTANGLE");
        particle.x = asteroid.renderable.x + (Math.random() - 0.5) * asteroid.renderable.w/2;
        particle.y = asteroid.renderable.y + (Math.random() - 0.5) * asteroid.renderable.h/2;
        particle.w = 8;
        particle.h = 8;
        particle.color = "rgba(255, 255, 255, 0.3)";
        particle.z = -1;
        gameEngine.particleEffects.create(particle, 500, function(renderable, dt) {
            renderable.w -= dt * 0.01;
            renderable.h -= dt * 0.01;
            renderable.x += dt * Math.random() * 0.05;
            renderable.y += dt * Math.random() * 0.05;
            return renderable;
        });
    }

    game.handleAsteroids = function(dt, players) {
        if(!this.last_spawn || new Date().getTime() - this.last_spawn > spawn_interval) {
            game.asteroids.push(new game.asteroid());
            this.last_spawn = new Date().getTime();
        }

        for(var i in game.asteroids) {
            var asteroid = game.asteroids[i];
            asteroid.renderable.rotation += asteroid.rotationVelocity * dt;
            asteroid.renderable.x += asteroid.velocity_x * asteroid.velocity * dt;
            asteroid.renderable.y += asteroid.velocity_y * asteroid.velocity * dt;

            createTrail(asteroid);

            var destroy_asteroid = false;
            for(var j in players) {
                var player = players[j];
                if(gameEngine.collision.rectanglesCollide(player.renderable, asteroid.renderable)) {
                    player.health -= asteroid.health;
                    destroy_asteroid = true;
                }
            }

            if(asteroid.health <= 0) {
                destroy_asteroid = true;
                if(Math.random() <= game.collectible_chance) {
                    var collectible_types_count = Object.keys(game.collectible_types).length;
                    var collectible_i = Math.floor(Math.random() * collectible_types_count) % collectible_types_count;
                    game.collectibles.push(new game.collectible(asteroid.renderable, Object.values(game.collectible_types)[collectible_i]));
                }
            }

            if(
                asteroid.renderable.x < 0 || asteroid.renderable.y > gameEngine.getWidth() || 
                asteroid.renderable.y < 0 || asteroid.renderable.y > gameEngine.getHeight() ||
                destroy_asteroid
            ) {
                asteroid.destroy();
                game.asteroids.splice(i, 1);
            }
        }
    };
}());
