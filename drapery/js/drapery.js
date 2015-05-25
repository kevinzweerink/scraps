window.palette = {
	black : 0x24252B,
	white : 0xFFFFFF,
	gray : 0x454B57,
	sky : 0x7DC8FA
}

function camera(type) {
	var w = window.innerWidth, h = window.innerHeight;

	if (type == 'orthographic') {
		return new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 1, 10000 );
	}

	if (type == 'perspective') {
		return new THREE.PerspectiveCamera( 75, w / h, 0.1, 10000 );
	}

	throw new Error('No camera with that name');
}

function Cloth(w,h,res) {
	var x = 0, z = 0, points = [], constraints = [];

	res = res || 1;

	function indexOf(x, z) {
		return ((z / res) * Math.ceil(w / res)) + (x / res);
	}

	while ( z <= h ) {

		while ( x <= w ) {
			points.push(new THREE.Vector3(x - w/2, 200, z - h/2));

			if (z != 0) {
				constraints.push([ indexOf(x, z), indexOf(x, z - res) ]);
			}

			if (x != 0) {
				constraints.push([ indexOf(x, z), indexOf(x - res, z) ]);
			}

			x += res;
		}

		x = 0;
		z += res;
	}

	points = points.map(function(p) {
		var geo = new THREE.SphereGeometry(3,32, 32);
		var material = new THREE.MeshBasicMaterial({ color : window.palette.white });

		var sphere = new THREE.Mesh( geo, material );
		sphere.translateX(p.x);
		sphere.translateZ(p.z);
		sphere.translateY(p.y);

		sphere.velocity = new THREE.Vector3(0,0,0);
		sphere.locked = false;
		sphere.castShadow = true;

		return sphere;
	});

	var sticks = constraints.map(function(c) {
		var geo = new THREE.Geometry(),
				material = new THREE.LineBasicMaterial({ color: window.palette.white });

		geo.vertices.push(points[c[0]].position);
		geo.vertices.push(points[c[1]].position);

		var line = new THREE.Line(geo, material);
		line.castShadow = true;

		return line;
	})

	return {
		constraints : constraints,
		points : points,
		dist : res,
		sticks : sticks
	}
}

function Bed(w,h) {
	var bed = new THREE.BoxGeometry(w,30,h + 150),
			material = new THREE.MeshLambertMaterial({color: window.palette.gray});
			bedmesh = new THREE.Mesh(bed, material);

	bedmesh.translateY(-35);
	bedmesh.translateZ(-75);

	bedmesh.receiveShadow = true;

	return bedmesh;
}

function Pillows(w,h) {
	var pillow1 = new THREE.BoxGeometry(w/2 - 20, 30, 140),
			pillow2 = new THREE.BoxGeometry(w/2 - 20, 30, 140),
			material = new THREE.MeshLambertMaterial({color : window.palette.gray}),
			pillowmesh1 = new THREE.Mesh(pillow1, material),
			pillowmesh2 = new THREE.Mesh(pillow1, material);

	pillowmesh1.translateZ(-(h/2 + 80));
	pillowmesh2.translateZ(-(h/2 + 80));

	pillowmesh1.translateX(-(w/4 + 10));
	pillowmesh2.translateX(w/4 + 10);
	
	pillowmesh1.receiveShadow = true;
	pillowmesh2.receiveShadow = true;



	return [pillowmesh1, pillowmesh2];
}

function Window() {
	var windowGeo = new THREE.PlaneGeometry(200,300),
			material = new THREE.MeshBasicMaterial({color : window.palette.sky}),
			mesh = new THREE.Mesh(windowGeo, material);

	mesh.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2);

	return mesh;
}

function Drapery(w,h) {
	this.origin = new THREE.Vector3(0,0,0);

	this.cloth = new Cloth(w,h,30);
	this.gravity = new THREE.Vector3(0, -1, 0);

	this.bed = new Bed(w,h);

	this.pillows = new Pillows(w,h);

	this.window = new Window();

	this.setScene = function() {
		var _ = this;

		this.scene = new THREE.Scene();
		this.camera = camera('orthographic');
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(window.palette.black);
		this.renderer.shadowMapEnabled = true;

		this.camera.translateX(500);
		this.camera.translateY(500);
		this.camera.translateZ(500);
		this.camera.lookAt(this.origin);
		this.camera.translateY(150);

		var plight = new THREE.DirectionalLight(window.palette.white, 1);
		plight.position.set(0,1000,0);
		plight.castShadow = true;
		plight.shadowDarkness = 1;
		this.scene.add(plight);

		this.pillows.forEach(function(p) {
			_.scene.add(p);
		});

		this.window.translateY(150);
		this.window.translateX(100);
		this.window.translateZ(-400);

		this.scene.add(this.window);

		this.scene.add(this.bed);
		
		document.body.appendChild(this.renderer.domElement);
	}

	this.addStaticCloth = function() {
		var _ = this;

		this.cloth.points.forEach(function(o) {
			_.scene.add(o);
		});

		this.cloth.sticks.forEach(function(s) {
			_.scene.add(s);
		})
	}

	this.pin = function(i) {
		this.cloth.points[i].locked = true;
	}

	this.unpin = function(i) {
		this.cloth.points[i].locked = false;
	}

	this.applyGravityForce = function() {
		var _ = this;
		this.cloth.points.forEach(function(p) {
			if (p.locked)
				return;

			p.velocity.add(_.gravity);

			if (p.position.y > 0) {
				p.position.add(p.velocity);
			} else {
				p.position.setY(0);
			}
		});
	}

	this.windResistance = function(v) {
		v.add(new THREE.Vector3(0, Math.random() * .5, 0));
	}

	this.solve = function() {
		var _ = this,
				d = this.cloth.dist;

		this.cloth.constraints.forEach(function(c) {
			var p0 = _.cloth.points[c[0]],
					p1 = _.cloth.points[c[1]];
					
			var v = new THREE.Vector3().subVectors(p1.position, p0.position),
					offset = v.length();
			
			if (!p0.locked && !p1.locked) {
				var delta = (offset - d) / 2;
			
				v.setLength(delta);

				p0.velocity.add(v);
				p1.velocity.sub(v);
			}

			if (p1.locked) {
				var delta = offset - d;
				v.setLength(delta);
				p0.velocity.add(v);
			}

			if (p0.locked) {
				var delta = offset - d;
				v.setLength(delta);
				p1.velocity.sub(v);
			}
		});

		this.cloth.points.forEach(function(p) {
			p.velocity.multiplyScalar(0.9);
			p.velocity.add(_.gravity);
			_.windResistance(p.velocity);

			if (p.position.y + p.velocity.y < 0)
				p.velocity.y = 0;

			if (!p.locked)
				p.position.add(p.velocity);
		});

		this.cloth.sticks.forEach(function(s) {
			s.geometry.verticesNeedUpdate = true;
		})
	}

	this.movePoint = function(index, v) {
		this.cloth.points[index].translateX(v.x);
		this.cloth.points[index].translateY(v.y);
		this.cloth.points[index].translateZ(v.z);
	}

	this.render = function() {
		window.requestAnimationFrame(this.render.bind(this));

		this.solve();

		this.renderer.render(this.scene, this.camera);
	}
}

var drapery = new Drapery(500,500);
drapery.setScene();

drapery.render();
drapery.addStaticCloth();

window.addEventListener('mousemove', function(e) {

	if (window.MOUSEDOWN) {

		for (var i = 0; i < 17; ++i) {
			drapery.pin(i);
		}

		for (var i = 0; i < 17; ++i) {
			drapery.cloth.points[i].position.setY(
				window.innerHeight - e.clientY
			);

			drapery.cloth.points[i].position.setZ(
				-(e.clientX - (window.innerWidth/2))
			)
		}
	}
});

window.addEventListener('mousedown', function(e) {
	window.MOUSEDOWN = true;
});

window.addEventListener('mouseup', function(e) {
	window.MOUSEDOWN = false;
	for (var i = 0; i < 17; ++i) {
		drapery.unpin(i);
	}
})