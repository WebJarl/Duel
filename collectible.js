(function() {
    game.collectible_chance = 0.25;
    game.collectibles = [];
    var life_time = 8500;

    game.collectible_types = {
        score: {
            color: "yellow",
            onCollect: function(player) {
                player.score += Math.floor(Math.random() * 25);
            },
            tick: function(collectible, dt) {
                var renderable = collectible.renderable;
                if(!collectible.last_spawn || new Date().getTime() - collectible.last_spawn > 1500) {
                    var particle = gameEngine.renderer.createRenderable("CIRCLE");
                    particle.color = "rgba(255, 255, 255, 0.2)";
                    particle.radius = renderable.radius;
                    particle.x = renderable.x;
                    particle.y = renderable.y;
                    gameEngine.particleEffects.create(particle, 300, function(renderable, dt) {
                        renderable.radius += dt * 0.1;
                        return renderable;
                    });
                    collectible.last_spawn = new Date().getTime();
                }
            }
        },
        health: {
            color: "limegreen",
            onCollect: function(player) {
                player.health = Math.min(player.health + Math.floor(Math.random() * 25), game.max_health);
            },
            tick: function(collectible, dt) {
                var renderable = collectible.renderable;
                if(!collectible.last_spawn || new Date().getTime() - collectible.last_spawn > 1500) {
                    var particle = gameEngine.renderer.createRenderable("CIRCLE");
                    particle.color = "rgba(255, 255, 255, 0.2)";
                    particle.radius = renderable.radius;
                    particle.x = renderable.x;
                    particle.y = renderable.y;
                    gameEngine.particleEffects.create(particle, 300, function(renderable, dt) {
                        renderable.radius += dt * 0.1;
                        return renderable;
                    });
                    collectible.last_spawn = new Date().getTime();
                }
            }
        }
    };

    game.collectible = function(position, type) {
        this.prototype = type;
        this.renderable = gameEngine.renderer.createRenderable("CIRCLE");
        this.renderable.color = this.prototype.color;
        this.renderable.radius = 8;
        this.renderable.x = position.x;
        this.renderable.y = position.y;
        this.time_alive = 0;
        this.tick = function(dt) {
            this.prototype.tick(this, dt);
        };
        this.destroy = function() {
            gameEngine.renderer.destroyRenderable(this.renderable);
        };
        game.collectibles.push(this);
    };

    game.handleCollectibles = function(dt, players) {
        for(var i in game.collectibles) {
            var collectible = game.collectibles[i];
            if(collectible.time_alive > life_time) {
                collectible.destroy();
                game.collectibles.splice(i, 1);
            } else {
                collectible.tick(dt);
                collectible.time_alive += dt;

                for(var j in players) {
                    var player = players[j];
                    if(gameEngine.collision.rectanglesCollide(player.renderable, {
                        x: collectible.renderable.x,
                        y: collectible.renderable.y,
                        w: collectible.renderable.radius,
                        h: collectible.renderable.radius
                    })) {
                        collectible.prototype.onCollect(player);
                        collectible.destroy();
                        game.collectibles.splice(i, 1);
                    }
                }
            }
        }
    };
}());
