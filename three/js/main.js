var scene = new THREE.Scene(),
		cam = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -2000, 2000 ),
		// cam = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
		renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.setClearColor(0x6405FC, 1);
document.body.appendChild(renderer.domElement);

var torusGeometry = new THREE.TorusGeometry(100,10,100,100),
		material = new THREE.MeshLambertMaterial({color: 0xFFFFFF }),
		sphereMaterial = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
		torus = new THREE.Mesh(torusGeometry, material),
		cubeGeometry = new THREE.IcosahedronGeometry(50,0),
		cube = new THREE.Mesh(cubeGeometry, material),
		sphereGeometry = new THREE.BoxGeometry(10,10,10),
		lamp = new THREE.DirectionalLight(0x2E62FF, 0.75),
		base = new THREE.DirectionalLight(0xFF432E, 0.75),
		sun = new THREE.DirectionalLight(0xA6FFF3, 0.75),
		left = new THREE.DirectionalLight(0xD129FF, 0.75),
		right = new THREE.DirectionalLight(0xD129FF, 0.75);

var controls = new THREE.TrackballControls( cam );

controls.rotateSpeed = 3.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

controls.keys = [ 65, 83, 68 ];
torus.receiveShadow = true;
cube.receiveShadow = true;

sun.position.set(0,0,1);
sun.castShadow = true;
left.position.set(1,0,0)
left.castShadow = true;
right.position.set(-1,0,0);
right.castShadow = true;
base.position.set(0,-1,0);
base.castShadow = true;
lamp.position.set(0,1,0);
lamp.castShadow = true;
scene.add(left);
scene.add(right);
scene.add(sun);
scene.add(base);
scene.add(lamp);

scene.add(torus);
scene.add(cube);

function spheres(n) {
	var spheres = [];
	for ( var i = 0; i < n; ++i) {
		sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		sphere.position.y = Math.random() * 800 - 400 ;
		sphere.position.x = Math.random() * 800 - 400;
		sphere.position.z = Math.random() * 800 - 400;
		sphere.castShadow = true;
		sphere.receiveShadow = true;
		sphere.vx = Math.random() * 10 - 5;
		sphere.vy = Math.random() * 10 - 5;
		sphere.vz = Math.random() * 10 - 5;
		sphere.rotation.x = Math.PI/4;
		scene.add(sphere);
		spheres.push(sphere);
	}

	return spheres;
}

var spheres = spheres(4);

cube.rotation.x = Math.PI/4;

cam.position.z = 500;

var dx, dy, dz;

function updateSphere(s) {
	s.pos = s.pos || new THREE.Vector3(s.position.x, s.position.y, s.position.z);

	s.pos.setX(s.position.x);
	s.pos.setY(s.position.y);
	s.pos.setZ(s.position.z);

	s.rotation.y += 0.03;
	s.rotation.x += 0.03;

	s.dist = s.pos.length();

	dx = (-1 * s.pos.x) / s.dist;
	dy = (-1 * s.pos.y) / s.dist;
	dz = (-1 * s.pos.z) / s.dist;

	s.vx += dx;
	s.vy += dy;
	s.vz += dz;

	s.position.x += s.vx;
	s.position.y += s.vy;
	s.position.z += s.vz;
}

function render() {

	requestAnimationFrame(render);

	for(var i = 0; i < spheres.length; ++i) {
		updateSphere(spheres[i]);
	}
	torus.rotation.y += 0.03;
	torus.rotation.x += 0.03;

	cube.rotation.y += 0.1;
	controls.update();
	renderer.render(scene, cam);
}

render();