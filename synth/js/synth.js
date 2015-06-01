var ctx;

var keyMap = {
	65 : 261.63,
	83 : 293.66,
	68 : 329.63,
	70 : 349.23,
	71 : 392,
	72 : 440,
	74 : 493.88,
	75 : 523.25
}

var keysPressed = 0;

if (typeof AudioContext !== "undefined") {
    ctx = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    ctx = new webkitAudioContext();
}

var oscillator = ctx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 300;
oscillator.start();

var lfo = ctx.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 100;
lfo.start();

var lfo2 = ctx.createOscillator();
lfo2.type = 'sine';
lfo2.frequency.value = 1;
lfo2.start();

var lfoGain = ctx.createGain();
lfoGain.gain.value = 1000;

var modulator = ctx.createGain();
lfo.connect(modulator.gain);

var filter = ctx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 1000;

var gate = ctx.createGain();
gate.gain.value = 0;

var masterVolume = ctx.createGain();
masterVolume.gain.value = 1;

oscillator.connect(modulator);
modulator.connect(filter);
filter.connect(gate);
gate.connect(masterVolume);
masterVolume.connect(ctx.destination);

lfo2.connect(lfoGain);
lfoGain.connect(filter.frequency);

window.addEventListener('keydown', function(e) {
	if (keyMap[e.keyCode]) {
		oscillator.frequency.value = keyMap[e.keyCode];

		keysPressed++;

		if (keysPressed > 0) {
			gate.gain.value = 0.3;
		}
	}

	if (e.keyCode == 32) {
		gate.gain.value = 0;
		keysPressed = 0;
	}
});

window.addEventListener('keyup', function(e) {
	if (keyMap[e.keyCode]) {
		keysPressed--;
		if (keysPressed == 0) {
			gate.gain.value = 0;
		}
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
 
		document.querySelector('#x').style.top = e.clientY + 'px';
		document.querySelector('#y').style.left = e.clientX + 'px';
		document.querySelector('#target').style.top = e.clientY + 'px';
		document.querySelector('#target').style.left = e.clientX + 'px';
	}
})