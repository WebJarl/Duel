(function() {
    var shield_sound = new Audio("shield.wav");
    var shield_down_sound = new Audio("shield_down.wav");
    var shield_ready_sound = new Audio("shield_ready.wav");
    var shield_size = 142;
    shield_sound.volume = 0.3;
    shield_down_sound.volume = 0.5;
    shield_ready_sound.volume = 0.3;
    game.shields = [];
    game.shield_time = 700;
    game.shield_cooldown = 3000;

    function playShieldSound(pos_x, sound) {
        var audio = new Audio(sound.src);
        audio.volume = sound.volume;
        var audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
        var panner = audio_ctx.createStereoPanner();
        panner.pan.value = 2 * ((gameEngine.getWidth()/2 + pos_x) / gameEngine.getWidth() - 1);
        var source = audio_ctx.createMediaElementSource(audio);
        source.connect(panner);
        panner.connect(audio_ctx.destination);
        audio.play();
        this.last_play = new Date().getTime();
    }

    function createParticleEffect(position) {
        for(var i = 0; i < 8; ++i) {
            var particle = gameEngine.renderer.createRenderable("CIRCLE");
            particle.x = position.x;
            particle.y = position.y;
            particle.radius = 64 - i*8;
            particle.color = "royalblue";
            particle.z = -1;
            gameEngine.particleEffects.create(
                particle,
                500,
                function(renderable, dt) {
                    renderable.radius -= 0.05 * i * dt;
                    return renderable;
                }
            );
        }
        var particle = gameEngine.renderer.createRenderable("CIRCLE");
        particle.x = position.x;
        particle.y = position.y;
        particle.radius = shield_size;
        particle.color = "cyan";
        particle.z = -1;
        gameEngine.particleEffects.create(
            particle,
            500,
            function(renderable, dt) {
                return renderable;
            }
        );
    }

    game.engageShield = function(player) {
        playShieldSound(player.renderable.x, shield_sound);
        createParticleEffect(player.renderable);
        player.can_shoot = false;
        var shield = {
            x: player.renderable.x,
            y: player.renderable.y,
            radius: shield_size,
            time_left: game.shield_time,
            player: player
        };
        game.shields.push(shield);
        setTimeout(function() {
            playShieldSound(player.renderable.x, shield_ready_sound);
        }, game.shield_cooldown);
    };

    game.handleShields = function(dt) {
        for(var i in game.shields) {
            var shield = game.shields[i];
            shield.time_left -= dt;
            if(shield.time_left <= 0) {
                playShieldSound(shield.x, shield_down_sound);
                shield.player.can_shoot = true;
                game.shields.splice(i, 1);
            }
        }
    };
}());
