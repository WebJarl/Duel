(function() {
    game.progressBar = function() {
        this.progress = 0;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.padding = 2;
        this.outer_renderable = gameEngine.renderer.createRenderable("RECTANGLE");
        this.inner_renderable = gameEngine.renderer.createRenderable("RECTANGLE");
        this.outer_renderable.color = "black";
        this.inner_renderable.color = "white";

        this.destroy = function() {
            gameEngine.renderer.destroyRenderable(this.outer_renderable);
            gameEngine.renderer.destroyRenderable(this.inner_renderable);
        };

        this.update = function() {
            this.outer_renderable.x = this.x;
            this.outer_renderable.y = this.y;
            this.outer_renderable.w = this.w;
            this.outer_renderable.h = this.h;
            this.inner_renderable.w = (this.outer_renderable.w - this.padding*2) * this.progress;
            this.inner_renderable.h = this.outer_renderable.h - this.padding*2;
            this.inner_renderable.x = this.outer_renderable.x + this.padding;
            this.inner_renderable.y = this.outer_renderable.y + this.padding;
            this.inner_renderable.color = this.color;
        };
    };
}());
