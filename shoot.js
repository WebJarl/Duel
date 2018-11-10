(function() {
    var player_cooldowns = {};
    var projectiles = [];

    game.shoot = function(source_position, direction, player_index, type) {
        if(!player_cooldowns[player_index] || player_cooldowns[player_index] <= 0) {
            projectiles.push(new game.projectile(source_position, direction, player_index, type));
            player_cooldowns[player_index] = type.cooldown;
        }
    };

    game.handleShooting = function(dt, players) {
        for(var i in player_cooldowns) {
            player_cooldowns[i] -= dt;
        }
        for(var i in projectiles) {
            var projectile = projectiles[i];
            
            projectile.tick(dt);
            var projectile_destroyed = false;

            for(var j in game.shields) {
                var shield = game.shields[j];
                if(gameEngine.collision.pointWithinCircle(projectile.renderable, shield)) {
                    projectile.destroy();
                    projectiles.splice(i, 1);
                    projectile_destroyed = true;
                    break;
                }
            }

            if(!projectile_destroyed) {
                for(var j in game.asteroids) {
                    var asteroid = game.asteroids[j];
                    if(gameEngine.collision.pointWithinCircle(projectile.renderable, {
                        x: asteroid.renderable.x,
                        y: asteroid.renderable.y,
                        radius: asteroid.renderable.w
                    })) {
                        asteroid.health -= projectile.prototype.damage;
                        projectile.destroy();
                        projectiles.splice(i, 1);
                        projectile_destroyed = true;
                        break;
                    }
                }
            }

            if(!projectile_destroyed) {
                for(var j in players) {
                    var player = players[j];
                    if(gameEngine.collision.rectanglesCollide({
                        x: player.renderable.x,
                        y: player.renderable.y,
                        w: player.renderable.w,
                        h: player.renderable.h
                    }, {
                        x: projectile.renderable.x,
                        y: projectile.renderable.y,
                        w: projectile.renderable.w,
                        h: projectile.renderable.h
                    })) {
                        if(projectile && j != projectile.owner) {
                            players[projectile.owner].score += projectile.prototype.damage;
                            player.health -= projectile.prototype.damage;
                            projectile.destroy();
                            projectiles.splice(i, 1);
                            projectile_destroyed = true;
                            break;
                        }
                    }
                }
            }

            if(projectile.isExpired() && !projectile_destroyed) {
                projectile.destroy();
                projectiles.splice(i, 1);
            }
        }
    };
}());
