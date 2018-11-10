(function() {
    var energy_sound = new Audio("energy.wav");
    var gun_sound = new Audio("gun.wav");
    var missile_sound = new Audio("missile.wav");
    missile_sound.volume = 0.3;

    game.projectileType = {
        bullet: {
            velocity: 1,
            velocityFunction: 'easeOut',
            damage: 1,
            color: 'yellow',
            cooldown: 100,
            lifetime: 2000,
            size: 4,
            sound: gun_sound
        },
        miningTool: {
            velocity: 1,
            velocityFunction: 'return',
            damage: 1,
            color: 'cyan',
            cooldown: 75,
            lifetime: 1500,
            size: 3,
            sound: energy_sound
        },
        clawForce: {
            velocity: 2,
            velocityFunction: 'return',
            damage: 1,
            color: 'magenta',
            cooldown: 100,
            lifetime: 1000,
            size: 4,
            rotated: true,
            rotationRate: 1/128,
            sound: energy_sound
        },
        missile: {
            velocity: 1.5,
            velocityFunction: 'easeIn',
            damage: 30,
            color: 'red',
            cooldown: 2000,
            lifetime: 1500,
            size: 8,
            tracer: true,
            sound: missile_sound
        },
        clawMissile: {
            velocity: 1,
            velocityFunction: 'easeIn',
            damage: 60,
            color: 'red',
            cooldown: 2000,
            lifetime: 2500,
            size: 8,
            rotated: true,
            rotationRate: 1/1024,
            tracer: true,
            sound: missile_sound
        },
        SlapMissile: {
            velocity: 1,
            velocityFunction: 'return',
            damage: 40,
            color: 'red',
            cooldown: 2000,
            lifetime: 4000,
            size: 3,
            tracer: true,
            sound: missile_sound
        },
        EMP: {
            velocity: 4,
            velocityFunction: 'easeIn',
            damage: 50,
            color: 'yellow',
            cooldown: 2000,
            lifetime: 750,
            size: 12,
            rotated: true,
            rotationRate: 1/32,
            sound: energy_sound
        }
    };

    game.projectile = function(position, direction, owner, type) {
        this.prototype = type;
        this.time_existing = 0;
        this.owner = owner;
        this.renderable = gameEngine.renderer.createRenderable("RECTANGLE");
        this.renderable.x = position.x;
        this.renderable.y = position.y;
        this.renderable.rotation = direction;
        this.renderable.color = this.prototype.color;
        this.renderable.w = this.prototype.size;
        this.renderable.h = this.prototype.size;

        if(this.prototype.sound) {
            var audio = new Audio(this.prototype.sound.src);
            audio.volume = this.prototype.sound.volume;

            var audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
            var panner = audio_ctx.createStereoPanner();
            panner.pan.value = 2 * ((gameEngine.getWidth()/2 + this.renderable.x) / gameEngine.getWidth() - 1);
            var source = audio_ctx.createMediaElementSource(audio);
            source.connect(panner);
            panner.connect(audio_ctx.destination);

            audio.play();
        }

        if(this.prototype.rotated) {
            this.inversion = Math.floor(Math.random() * 10) % 2 == 0 ? 1 : -1;
            this.renderable.rotation += Math.PI / 2 * this.inversion;
        }

        this.destroy = function() {
            gameEngine.renderer.destroyRenderable(this.renderable);
        };

        this.isExpired = function() {
            return this.time_existing >= this.prototype.lifetime;
        };

        this.tick = function(dt) {
            var velocity = this.prototype.velocity;
            var life_done = this.time_existing / this.prototype.lifetime;
            switch(this.prototype.velocityFunction) {
                case('easeOut'):
                    velocity = this.prototype.velocity - life_done;
                    break;
                case('easeIn'):
                    velocity = this.prototype.velocity * life_done;
                    break;
                case('return'):
                    velocity = this.prototype.velocity - life_done*2;
                    break;
            }

            if(this.prototype.rotated) {
                var deltaTheta = dt * -1 * this.inversion * this.prototype.rotationRate;
                this.renderable.rotation += deltaTheta;
            }

            var vx = velocity * Math.cos(this.renderable.rotation);
            var vy = velocity * Math.sin(this.renderable.rotation);
            
            this.time_existing += dt;
            this.renderable.x += vx * dt;
            this.renderable.y += vy * dt;

            if(this.prototype.tracer) {
                var trail_particle = gameEngine.renderer.createRenderable("RECTANGLE");
                trail_particle.x = this.renderable.x;
                trail_particle.y = this.renderable.y;
                trail_particle.w = 4;
                trail_particle.h = 4;
                trail_particle.rotation = this.renderable.rotation;
                trail_particle.color = Math.floor(Math.random() * 2) % 2 == 0 ? "rgb(255, 128, 0)" : "rgba(255, 128, 0, 0.5)";
                trail_particle.z = -1;
                gameEngine.particleEffects.create(
                    trail_particle,
                    100,
                    function(renderable, dt) {
                        var velocity = 0.1;
                        
                        renderable.rotation += 1/128 * dt;
                        renderable.x += velocity * vx * dt * -1;
                        renderable.y += velocity * vy * dt * -1;
                        renderable.w += Math.random() / 8 * dt;
                        renderable.h += Math.random() / 8 * dt;
    
                        return renderable;
                    }
                );
            }
        };
    };
}());
