var canvas = document.querySelector('#grid'),
		context = canvas.getContext('2d'),
		w = window.innerWidth,
		h = window.innerHeight,
		unit = 50;

canvas.width = w;
canvas.height = h;

canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = w + 'px';
canvas.style.height = h + 'px';
canvas.style.zIndex = -1;

for (var i = 0; i < h; ++i) {
	for (var j = 0; j < w; ++j) {
		context.moveTo(j,i);
		context.beginPath();
		context.arc(j, i, 2, 0, Math.PI * 2, false);
		context.fillStyle = '#000';
		context.fill();

		j+=unit
	}

	i+=unit;
}