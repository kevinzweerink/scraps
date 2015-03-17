window.CONST = {
	g : 0.05,
	friction : 0.99,
	x : 0,
	y : 0
}

document.addEventListener('mousemove', function(e) {
	CONST.x = e.clientX,
	CONST.y = e.clientY
})