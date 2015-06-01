var ctx;

var noon = [109, 173, 247];
var evening = [237, 155, 104];

var noonWater = [59,128,118];
var eveningWater = [67,55,87];

var noonSun = [240,237,72];
var eveningSun = [250,90,57];

var keyMap = {
	65 : 261.63,
	83 : 293.66,
	68 : 329.63,
	70 : 349.23,
	71 : 392,
	72 : 440,
	74 : 493.88,
	75 : 523.25,
	76 : 587.33,
	186 : 659.26,
	222 : 698.46
}

if (typeof AudioContext !== "undefined") {
    ctx = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    ctx = new webkitAudioContext();
}

var oscillator = ctx.createOscillator();
oscillator.type = 'sawtooth';
oscillator.frequency.value = 261.63;
oscillator.start();

var lfo = ctx.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 0.95 * 200;
lfo.start();

var lfo2 = ctx.createOscillator();
lfo2.type = 'sine';
lfo2.frequency.value = 0.02 * 20;
lfo2.start();

var lfoGain = ctx.createGain();
lfoGain.gain.value = 1000;

var modulator = ctx.createGain();
lfo.connect(modulator.gain);

var filter = ctx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000;

var gate = ctx.createGain();
gate.gain.value = 0.3;

var masterVolume = ctx.createGain();
masterVolume.gain.value = 1;

var analyser = ctx.createAnalyser();
analyser.fftSize = 256;

oscillator.connect(modulator);
modulator.connect(filter);
filter.connect(gate);
gate.connect(masterVolume);
masterVolume.connect(analyser);
analyser.connect(ctx.destination);

lfo2.connect(lfoGain);
lfoGain.connect(filter.frequency);

window.addEventListener('keydown', function(e) {
	if (keyMap[e.keyCode]) {
		oscillator.frequency.value = keyMap[e.keyCode];
	}
});

window.addEventListener('mousedown', function(e) {
	window.mouseDown = true;
}); 

window.addEventListener('mouseup', function(e) {
	window.mouseDown = false;
})

window.addEventListener('mousemove', function(e) {
	if (window.mouseDown) {
		var x = e.clientX / window.innerWidth,
				y = e.clientY / window.innerHeight;

		lfo.frequency.value = 200 * x;
		lfo2.frequency.value = 20 * y;

		window.sunPos = y;

		document.querySelector('#target').style.background = rgbLerp(noonSun, eveningSun, y);
 
		document.querySelector('#x').style.top = e.clientY + 'px';
		document.querySelector('#y').style.left = e.clientX + 'px';
		document.querySelector('#target').style.top = e.clientY + 'px';
		document.querySelector('#target').style.left = e.clientX + 'px';
	}
});

function rgbLerp(a,b,value) {
	var c = [];

	for (var i = 0; i < 3; ++i) {
		c[i] = ((b[i] - a[i]) * value) + a[i];
	}

	return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')';
}

var vis = document.querySelector('#vis');
vis.style.width = '100%';
vis.style.height = '100vh';
vis.style.position = 'absolute';
vis.width = window.innerWidth;
vis.height = window.innerHeight;
vis.style.zIndex = -5;

visCtx = vis.getContext('2d');

function draw() {
	window.requestAnimationFrame(draw);
	var bufferLength = analyser.frequencyBinCount;
	var dataArray = new Float32Array(bufferLength);
	analyser.getFloatFrequencyData(dataArray);

	visCtx.fillStyle = rgbLerp(noon,evening,window.sunPos || 0);
  visCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

	visCtx.fillStyle = rgbLerp(noonWater, eveningWater, window.sunPos || 0);

	slice = window.innerWidth / bufferLength;
	for (var i = 0; i < bufferLength; i++) {

		var barHeight = window.innerHeight/2 + dataArray[i];

		visCtx.fillRect(i * slice, window.innerHeight - barHeight , slice, barHeight);
	}

	visCtx.stroke();

}
draw();