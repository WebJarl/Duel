(function(){
    var speed = 0.25;
    game.max_health = 100;
    var engine_sound = new Audio("engine.wav");
    engine_sound.volume = 0.1;

    game.player = function() {
        this.renderable = gameEngine.renderer.createRenderable("IMAGE", "ship.png");
        this.renderable.w = 64;
        this.renderable.h = 64;
        this.health = game.max_health;
        this.selected_weapon = 0;
        this.health_bar = new game.progressBar();
        this.health_bar.color = "red";
        this.can_shoot = true;
        this.renderable.x = gameEngine.getWidth() / 2;
        this.renderable.y = gameEngine.getHeight() / 2;
        this.score = game.max_health;

        this.destroy = function() {
            gameEngine.renderer.destroyRenderable(this.renderable);
            this.health_bar.destroy();
        };

        function playEngineSound(pos_x) {
            if(!this.last_play || new Date().getTime() - this.last_play > 100) {
                var audio = new Audio(engine_sound.src);
                audio.volume = engine_sound.volume;
                var audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
                var panner = audio_ctx.createStereoPanner();
                panner.pan.value = 2 * ((gameEngine.getWidth()/2 + pos_x) / gameEngine.getWidth() - 1);
                var source = audio_ctx.createMediaElementSource(audio);
                source.connect(panner);
                panner.connect(audio_ctx.destination);
                audio.play();
                this.last_play = new Date().getTime();
            }
        }

        var prevWeapon = (function() {
            --this.selected_weapon;
            if(this.selected_weapon < 0) {
                this.selected_weapon = Object.keys(game.projectileType).length - 1;
            }
        }).bind(this);

        var nextWeapon = (function() {
            ++this.selected_weapon;
            this.selected_weapon = this.selected_weapon % Object.keys(game.projectileType).length;
        }).bind(this);

        var shoot = (function(player_i) {
            if(this.can_shoot) {
                game.shoot(
                    {x: this.renderable.x, y: this.renderable.y},
                    this.renderable.rotation,
                    player_i,
                    game.projectileType[Object.keys(game.projectileType)[this.selected_weapon]]
                );
            }
        }).bind(this);

        var createEngineEffects = (function() {
            var engine_particle = gameEngine.renderer.createRenderable("CIRCLE");
            engine_particle.x = this.renderable.x;
            engine_particle.y = this.renderable.y;
            engine_particle.radius = 4;
            engine_particle.color = Math.floor(Math.random() * 2) % 2 == 0 ? "white" : "gray";
            engine_particle.z = -1;
            gameEngine.particleEffects.create(
                engine_particle,
                200,
                function(renderable, dt) {
                    var velocity = 0.1;
                    
                    renderable.radius -= 0.2;
                    renderable.x += (Math.random() - 0.5) * velocity * dt;
                    renderable.y += (Math.random() - 0.5) * velocity * dt;

                    return renderable;
                }
            );
        }).bind(this);

        var handleHealth = (function() {
            if(this.health < 0) {
                this.health = game.max_health;
                this.score -= game.max_health;
                this.renderable.x = gameEngine.getWidth() / 2;
                this.renderable.y = gameEngine.getHeight() / 2;
                engageShield();
            }

            this.health_bar.progress = this.health / game.max_health;
            this.health_bar.x = this.renderable.x - 42/2;
            this.health_bar.y = this.renderable.y + 42/2 + 8;
            this.health_bar.w = 42;
            this.health_bar.h = 8;
            this.health_bar.update();
        }).bind(this);

        var engageShield = (function() {
            if(!this.last_shield || new Date().getTime() - this.last_shield > game.shield_cooldown) {
                game.engageShield(this);
                this.last_shield = new Date().getTime();
            }
        }).bind(this);

        gameEngine.onKeyDown('q', prevWeapon);
        gameEngine.onKeyDown('e', nextWeapon);
        gameEngine.onKeyDown(' ', engageShield);
        var handleControls = (function(player_i, dt) {
            var gamepad = gameEngine.getGamePad(player_i);
            if(gamepad.isConnected()) {
                var movement_horizontal_axis = gamepad.axisValue(gameEngine.gamePadType.XBOX360.AXIS_LEFT_HORIZONTAL);
                var movement_vertical_axis = gamepad.axisValue(gameEngine.gamePadType.XBOX360.AXIS_LEFT_VERTICAL);
                var rotation_horizontal_axis = gamepad.axisValue(gameEngine.gamePadType.XBOX360.AXIS_RIGHT_HORIZONTAL);
                var rotation_vertical_axis = gamepad.axisValue(gameEngine.gamePadType.XBOX360.AXIS_RIGHT_VERTICAL);
                var used_axis = false;
                
                if(Math.abs(movement_horizontal_axis) > 0.1) {
                    this.renderable.x += movement_horizontal_axis * speed * dt;
                    used_axis = true;
                }
                if(Math.abs(movement_vertical_axis) > 0.1) {
                    this.renderable.y += movement_vertical_axis * speed * dt;
                    used_axis = true;
                }
                
                if(!used_axis) {
                    if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_UP)) {
                        this.renderable.y -= speed * dt;
                    }
                    if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_DOWN)) {
                        this.renderable.y += speed * dt;
                    }
                    if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_LEFT)) {
                        this.renderable.x -= speed * dt;
                    }
                    if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_RIGHT)) {
                        this.renderable.x += speed * dt;
                    }
                }

                if(Math.abs(rotation_horizontal_axis) > 0.1 || Math.abs(rotation_vertical_axis) > 0.1) {
                    var correction = rotation_horizontal_axis > 0 ? 0 : Math.PI;
                    var angle = Math.atan(rotation_vertical_axis / rotation_horizontal_axis);
                    this.renderable.rotation = angle + correction;
                }

                if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_RT)) {
                    shoot(player_i);
                }
                if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_LT)) {
                    engageShield();
                }

                if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_LB)) {
                    prevWeapon();
                }
                if(gamepad.buttonIsPressed(gameEngine.gamePadType.XBOX360.BUTTON_RB)) {
                    nextWeapon();
                }

            } else if(player_i == 0) {
                // No gamepad? KB+Mouse controls!

                if(gameEngine.keyIsDown('ArrowUp') || gameEngine.keyIsDown('w')) {
                    this.renderable.y -= speed * dt;
                }
                if(gameEngine.keyIsDown('ArrowDown') || gameEngine.keyIsDown('s')) {
                    this.renderable.y += speed * dt;
                }
                if(gameEngine.keyIsDown('ArrowLeft') || gameEngine.keyIsDown('a')) {
                    this.renderable.x -= speed * dt;
                }
                if(gameEngine.keyIsDown('ArrowRight') || gameEngine.keyIsDown('d')) {
                    this.renderable.x += speed * dt;
                }

                var correction = (gameEngine.mouse.position().x - this.renderable.x) > 0 ? 0 : Math.PI;
                var angle = Math.atan(
                    (gameEngine.mouse.position().y - this.renderable.y) / 
                    (gameEngine.mouse.position().x - this.renderable.x)
                );
                this.renderable.rotation = angle + correction;
                
                if(gameEngine.mouse.isDown()) {
                    shoot(player_i);
                }
            }
        }).bind(this);

        this.tick = function(player_i, dt) {
            handleControls(player_i, dt);
            handleHealth();
            createEngineEffects();
            playEngineSound(this.renderable.x);
        };
    };
}());
