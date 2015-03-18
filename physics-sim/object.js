var Particle = {
	x : 0,
	y : 0,
	vx : 0,
	vy : 0,
	mass : 1,
	radius : 5,
	inert : false,
	age : 0,

	create : function(x, y, speed, direction, mass, radius) {
		var p = Object.create(this),
				vReqs = (speed !== undefined && direction !== undefined);

		p.x = x;
		p.y = y;
		p.vx = vReqs ? speed * Math.cos(direction) : 0;
		p.vy = vReqs ? speed * Math.sin(direction) : 0;
		p.mass = mass || 0;
		p.radius = radius || 5;

		return p;
	},

	update : function() {
		this.x += this.vx;
		this.y += this.vy;
		this.age++;
	},

	collide : function(p1) {

		var p0 = this;
				dvx = (p1.x + p1.vx) - (p0.x + p0.vx),
				dvy = (p1.y + p1.vy) - (p0.y + p0.vy),
				dist = Math.sqrt(dvx * dvx + dvy * dvy);

		if (dist > p1.radius + p0.radius + 5)
			return;

		var p0speed = Math.sqrt(p0.vx * p0.vx + p0.vy * p0.vy),
				p1speed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy),
				incidence = Math.atan2(dvy, dvx),
				p0heading = Math.atan2(p0.vy, p0.vx),
				p1heading = Math.atan2(p1.vy, p1.vx),
				p0vx = p0speed * Math.cos(p0heading - incidence),
				p0vy = p0speed * Math.sin(p0heading - incidence),
				p1vx = p1speed * Math.cos(p1heading - incidence),
				p1vy = p1speed * Math.sin(p1heading - incidence),
				p0newvx = ((p0.mass - p1.mass) * p0vx + (p1.mass + p1.mass) * p1vx)/(p0.mass + p1.mass),
				p1newvx = ((p0.mass + p0.mass) * p0vx + (p1.mass - p0.mass) * p1vx)/(p0.mass + p1.mass),
				p0newvy = p0vy,
				p1newvy = p1vy;

				p0.vx = Math.cos(incidence) * p0newvx + Math.cos(incidence + Math.PI/2) * p0newvy;
				p0.vy = Math.sin(incidence) * p0newvx + Math.sin(incidence + Math.PI/2) * p0newvy;
				p1.vx = Math.cos(incidence) * p1newvx + Math.cos(incidence + Math.PI/2) * p1newvy;
				p1.vy = Math.sin(incidence) * p1newvx + Math.sin(incidence + Math.PI/2) * p1newvy;
	},

	wall : function(x, y) {
		if (this.x + this.vx < 0 + this.radius) {
			this.x = this.radius;
			this.vx *= -CONST.friction;
		}

		if (this.x + this.vx > x - this.radius) {
			this.x = x - this.radius;
			this.vx *= -CONST.friction;
		}

		if (this.y + this.vy < 0 + this.radius) {
			this.y = this.radius;
			this.vy *= -CONST.friction
		}

		if (this.y  + this.vy > y - this.radius) {
			this.y = y - this.radius;
			this.vy *= -CONST.friction;
		}
	},

	damp : function() {
		this.vx *= CONST.friction;
		this.vy *= CONST.friction;
	},

	pull : function(p1) {
		if (this.inert)
			return;

		var dvx = p1.x - this.x,
				dvy = p1.y - this.y,
				dvLength = Math.sqrt(dvx * dvx + dvy * dvy),
				gravity = (p1.mass * CONST.g) / (dvLength),
				dx = gravity * (dvx / dvLength),
				dy = gravity * (dvy / dvLength);

		this.vx += dx;
		this.vy += dy;
	}
}