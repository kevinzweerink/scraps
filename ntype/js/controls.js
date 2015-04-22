NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.reduce = Array.prototype.reduce;

var controlsToggle = document.querySelector('#controls-toggle');
var controlPanel = document.querySelector('#controls');
var planeSelectors = document.querySelectorAll('.plane-selector');
var speed = document.querySelector('#speed');
var pause = document.querySelector('.button--pause');
var play = document.querySelector('.button--play');
var reset = document.querySelector('.button--reset');

var speedCache = 0;

function gatherPlanes() {
	ntype.setMatrix(planeSelectors.reduce(
		function(planes, ps) {
			if (ps.checked)
				planes.push(ps.getAttribute('id'));

			return planes;
		}, [])
	)
}

controlsToggle.addEventListener('click', function(e) {
	e.preventDefault();
	controlPanel.classList.toggle('open');
	this.classList.toggle('open');
});

planeSelectors.forEach(function(ps){
	ps.addEventListener('change', function(e) {
		e.preventDefault;
		gatherPlanes();
	});
});

speed.addEventListener('input', function(e) {
	ntype.setSpeed(this.value);
})

pause.addEventListener('click', function(e) {
	if (this.classList.contains('pressed'))
		return

	this.classList.add('pressed');
	play.classList.remove('pressed');
	speedCache = ntype.speed;
	ntype.setSpeed(0);
});

play.addEventListener('click', function(e) {
	if (this.classList.contains('pressed'))
		return

	this.classList.add('pressed');
	pause.classList.remove('pressed');
	ntype.setSpeed(speedCache);
});

reset.addEventListener('click', function(e) {
	ntype.reset();
});