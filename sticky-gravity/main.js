NodeList.prototype.toArray = function() {
	return Array.prototype.slice.call(this);
}

var add = function(a,b) {
	return {
		x : a.x + b.x,
		y : a.y + b.y
	}
}

var subtract = function(a,b) {
	return {
		x : a.x - b.x,
		y : a.y - b.y
	}
}

var multiply = function(a,b) {
	if (typeof b == 'object') {
		return {
			x : a.x * b.x,
			y : a.y * b.y
		}
	}

	return {
		x : a.x * b,
		y : a.y * b
	}
}

var absoluteDist = function(a, b) {
	var up = Math.abs(a.y - b.y);
	var over = Math.abs(a.x - b.x);

	return Math.sqrt((up * up) + (over * over));
}

var dist = function(a, b) {
	var up = a.y - b.y;
	var over = a.x - b.x;

	return Math.sqrt((up * up) + (over * over));
}

var clone = function(a) {
	return {
		x : a.x,
		y : a.y
	}
}

var Mouse = {
	mass : 1,
	x : 1,
	y : 1
}

var fieldSize = document.querySelector('#fieldSize').value;
var particleSize = document.querySelector('#particleSize').value;
var maxK = 0.2;
var maxMass = 10;

var massFactor = maxK / maxMass;

var particleGenerator = function(n) {
	var i = -1;
	var w = window.innerWidth;
	var h = window.innerHeight;
	var c = document.querySelector('.particles');
	while (++i < n) {
		var o = document.createElement('div');
		o.classList.add('particle');
		var pos = {
			x : Math.round(Math.random() * w),
			y : Math.round(Math.random() * h)
		}

		o.style.top = pos.y + 'px';
		o.style.left = pos.x + 'px';

		c.appendChild(o);
	}
}

particleGenerator(document.querySelector('#numParticles').value);

var collect = function() {
	var ps = document.querySelectorAll('.particle').toArray().map(function(o) {
			var updatePosition = function() {
				this.lastPosition = clone(this.position);
				this.position = add(this.position, this.velocity);

				this.node.style.top = this.position.y + 'px';
				this.node.style.left = this.position.x + 'px';
			}

			var pull = function(point, mass) {
				var offset = subtract(point, this.position);

				var g = multiply(offset, (mass * massFactor));

				this.velocity = add(g, this.velocity);
			}

			var damp = function() {
				this.velocity = multiply(this.velocity, 0.8)
			}

			var startRect = o.getBoundingClientRect();

			var particle =  {
				node : o,
				updatePosition : updatePosition,
				pull : pull,
				damp: damp,
				lastPosition : { x : startRect.left, y : startRect.top },
				position : { x : startRect.left, y : startRect.top },
				anchor : { x : startRect.left, y : startRect.top },
				velocity : { x : 0, y : 0 },
				mass : 3
			}

			return particle;
		});
	return ps;
}

var particles = collect();

var tick = new Event('tick');
var tracker = document.querySelector('.tracker');

document.addEventListener('tick', function(e) {
	var o;
	var mouseToAnchor;
	var mouseMassIndex;

	for (var i = 0; i < particles.length; ++i) {
		o = particles[i];
		mouseToAnchor = absoluteDist(Mouse, o.anchor);
		mouseMassIndex = (fieldSize - mouseToAnchor)/fieldSize;
		Mouse.mass = mouseMassIndex * maxMass;
		if (Mouse.mass <= 0)
			Mouse.mass = 0;

		o.pull({x : Mouse.x, y : Mouse.y}, Mouse.mass);
		o.pull(o.anchor, o.mass);
		o.damp();
		o.updatePosition();

		tracker.style.top = Mouse.y + 'px';
		tracker.style.left = Mouse.x + 'px';
	}
});

window.setInterval(function() {
	document.dispatchEvent(tick);
}, 16);

document.addEventListener('mousemove', function(e) {
	Mouse.x = e.clientX;
	Mouse.y = e.clientY;
});

document.querySelector('#fieldSize').addEventListener('input', function(e) {
	fieldSize = this.value;
})

document.querySelector('#particleSize').addEventListener('input', function(e) {
	var p = document.querySelectorAll('.particle').toArray()
	var v = this.value;

	p.forEach(function(o) {
		console.log(this.value);
		o.style.width = v + 'px';
		o.style.height = v + 'px';
	});
});

document.querySelector('#numParticles').addEventListener('input', function(e) {
	var pContainer = document.querySelector('.particles');
	while (pContainer.firstChild) {
		pContainer.removeChild(pContainer.firstChild);
	}

	particleGenerator(this.value);

	particles = collect();
})

