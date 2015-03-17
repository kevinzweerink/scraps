// document.addEventListener('click', function(e) {

// 	var x = e.clientX,
// 			y = e.clientY,
// 			o = Particle.create(x, y, 0, 0, 1, 5);

// 	w.objects.push(o);

// });

var ax, ay, bx, by, dragging;

document.querySelector('#world').addEventListener('mousedown', function(e) {
	console.log(e.clientX, e.clientY);
	ax = e.clientX;
	ay = e.clientY;

	w.startDragHandler(ax, ay);
});

document.querySelector('#world').addEventListener('mouseup', function(e) {
	bx = e.clientX;
	by = e.clientY;

	w.endDragHandler(bx, by);
});

document.querySelector('#k').addEventListener('input', function(e) {
	CONST.g = parseFloat(this.value);
	console.log(CONST.g);
});

document.querySelector('#friction').addEventListener('input', function(e) {
	CONST.friction = parseFloat(this.value);
});

document.querySelector('#numParticles').addEventListener('input', function(e) {
	w.emitter.max = this.value;
});

document.querySelector('#connectors').addEventListener('change', function(e) {
	w.showRanges = this.checked;
});

document.querySelector('#vectors').addEventListener('change', function(e) {
	w.showVectors = this.checked;
});

document.querySelector('#smbh').addEventListener('change', function(e) {
	w.centralGravity = this.checked;
})

