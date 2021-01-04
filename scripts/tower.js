class Tower {
    constructor(col, row) {
        // Display
        this.baseOnTop = true;      // render base over barrel
        this.border = [0, 0, 0];    // border color
        this.color = [0, 0, 0];     // main color
        this.drawLine = true;       // draw line to enemy on attack
        this.follow = true;         // follow target even when not firing
        this.hasBarrel = true;
        this.hasBase = true;
        this.length = 0.7;          // barrel length in tiles
        this.radius = 1;            // radius in tiles
        this.secondary = [0, 0, 0]; // secondary color
        this.weight = 2;            // laser stroke weight
        this.width = 0.3;           // barrel width in tiles

        // Misc
        this.alive = true;
        this.name = 'tower';
        this.title = 'Tower';

        // Position
        this.angle = 0;
        this.gridPos = createVector(col, row);
        this.pos = createVector(col*ts + ts/2, row*ts + ts/2);
        
        // Stats
        this.cooldownMax = 0;
        this.cooldownMin = 0;
        this.cost = 0;
        this.damageMax = 20;
        this.damageMin = 1;
        this.range = 3;
        this.type = 'physical';     // damage type
    }

    // Adjust angle to point towards pixel position
    aim(x, y) {
        this.angle = atan2(y - this.pos.y, x - this.pos.x);
    }

    // Deal damage to enemy
    attack(e) {
        var damage = round(random(this.damageMin, this.damageMax));
        e.dealDamage(damage, this.type);
        this.onHit(e);
    }

    // Check if cooldown is completed
    canFire() {
        return this.cd === 0;
    }

    draw() {
        // Draw turret base
        if (this.hasBase && !this.baseOnTop) this.drawBase();
        // Draw barrel
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
        // Draw turret base
        if (this.hasBase && this.baseOnTop) this.drawBase();
    }

    // Draw barrel of tower (moveable part)
    drawBarrel() {
        stroke(this.border);
        fill(this.secondary);
        rect(0, -this.width * ts / 2, this.length * ts, this.width * ts);
    }

    // Draw base of tower (stationary part)
    drawBase() {
        stroke(this.border);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    // Returns damage range
    getDamage() {
        return rangeText(this.damageMin, this.damageMax);
    }

    // Returns average cooldown in seconds
    getCooldown() {
        return (this.cooldownMin + this.cooldownMax) / 120;
    }

    kill() {
        this.alive = false;
    }

    // Functionality once entity has been targeted
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (!this.canFire()) return;
        this.resetCooldown();
        this.attack(e);
        // Draw line to target
        if (!this.drawLine) return;
        stroke(this.color);
        strokeWeight(this.weight);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        strokeWeight(1);
    }

    onCreate() {
        this.cd = 0;                // current cooldown left
        this.totalCost = this.cost;
    }

    onHit(e) {}

    onTarget(entities) {
        entities = this.visible(entities);
        var t = getTaunting(entities);
        if (t.length > 0) entities = t;
        var e = this.target(entities);
        if (typeof e === 'undefined') return;
        this.onAim(e);
    }

    resetCooldown() {
        var cooldown = round(random(this.cooldownMin, this.cooldownMax));
        this.cd = cooldown;
    }

    // Sell price
    sellPrice() {
        return this.totalCost * sellConst;
    }

    // Target enemy closest to exit
    target(entities) {
        var lowestDist = 10000;
        var chosen = entities[0];
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            var t = gridPos(e.pos.x, e.pos.y);
            var dist = dists[t.x][t.y];
            if (dist < lowestDist) {
                lowestDist = dist;
                chosen = e;
            }
        }
        return chosen;
    }

    update() {
        if (this.cd > 0) this.cd--;
    }

    // Use template to set attributes
    upgrade(template) {
        template = typeof template === 'undefined' ? {} : template;
        var keys = Object.keys(template);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this[key] = template[key];
        }
    }

    // Returns array of visible entities out of passed array
    visible(entities) {
        return getInRange(this.pos.x, this.pos.y, this.range, entities);
    }
}
