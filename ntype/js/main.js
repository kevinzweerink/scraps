window.cos = Math.cos;
window.sin = Math.sin;

var SimpleDimensionalObject = function() {
	this.vertices = [];
	this.joins = [];
}

var NType = function(el) {
	// Logistics
	this.scene = new THREE.Scene();
	this.w = window.innerWidth;
	this.h = window.innerHeight;
	this.ORTHO = new THREE.OrthographicCamera( this.w / - 2, this.w / 2, this.h / 2, this.h / - 2, -2000, 2000 );
	this.PERSP = new THREE.PerspectiveCamera( 75, this.w / this.h, 0.1, 1000 );
	this.camera = this.PERSP;
	this.renderer = new THREE.WebGLRenderer({
		antialias : true
	});
	this.sourceShape = [];
	this.extrusion = [];
	this.vertices = [];
	this.joins = [];
	this.projection = [];
	this.lines = [];

	this.speed = Math.PI/200;

	// Props
	this.matrix = new THREE.Matrix4();

	this.setup = function() {
		this.camera.position.z = 500;
		this.camera.position.y = 200;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.renderer.setSize(this.w,this.h);
		this.renderer.setClearColor(0xFFFFFF);
		document.body.appendChild(this.renderer.domElement);
		this._matrices.update(this.speed);
		this.setMatrix(['xw','yz','yw','zw']);
	}

	this.addLines = function() {
		var that = this;
		this.lines = this.joins.map(function(j, i) {
			var lineGeo = new THREE.Geometry();
			lineGeo.vertices = j.map(function(v) {
				return that.projection[v];
			});

			var lineMaterial = that.materials.line;

			var line = new THREE.Line(lineGeo, lineMaterial);
			that.scene.add(line);

			return line;
		});
	}

	this.setMatrix = function(planes) {
		var that = this;
		this.matrix = planes.reduce(function(m, p) {
			if ( that._matrices[p] )
				m.multiply( that._matrices[p] );

			return m;
		}, new THREE.Matrix4());
	}

	this.clear = function() {
		var that = this;
		this.lines.forEach(function(l) {
			that.scene.remove(l);
		});

		this.lines = [];
	}

	this.setShape = function(vertices) {
		this.sourceShape = vertices;
		this.clear();
		this.extrude();
	}

	this.updateLines = function() {
		if (this.lines.length == 0)
			this.addLines();

		var that = this;

		this.lines.forEach(function(l, i) {
			// each vertex corresponds to part of the joins array at the
			// same position as this iteration
			l.geometry.vertices = that.joins[i].reduce(function(a, j) {
				a.push(that.projection[j]);
				return a;
			}, []);
			l.geometry.verticesNeedUpdate = true;
		});
	}

	this.extrude = function() {
		this.extrusion = this.utils.extrude4(this.sourceShape);
		this.vertices = this.extrusion.vertices.map(function(v) {
			return new THREE.Vector4(
				v[0] - 0.5,
				v[1] - 0.5,
				v[2] - 0.5,
				v[3] - 0.5
			)
		});
		this.joins = this.extrusion.joins;
	}

	this.rotate = function() {
		var that = this;
		this.vertices.forEach(function(v) {
			v.applyMatrix4(that.matrix)
		});

		this.projection = this.vertices.map(function(v) {
			return that.utils.projectW(v).multiplyScalar(100);
		});
	}

	this.begin = function() {
		window.requestAnimationFrame(this.begin.bind(this));
		this.rotate();
		this.updateLines();
		this.renderer.render(this.scene, this.camera);
	}

	this.setup();
}

// Libs
NType.prototype.materials = {
	wireframe : new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: true}),
	face : new THREE.MeshBasicMaterial({color: 0xFFFFFF, opacity: .1, transparent: true, side: THREE.DoubleSide}),
	line : new THREE.LineBasicMaterial({color: 0x0000FF, linewidth : 2})
}

NType.prototype.utils = {
	projectW : function(v4) {
		var skew = (v4.w * .9) + 1.9;
		return new THREE.Vector3(
			v4.x * skew,
			v4.y * skew,
			v4.z * skew
		)
	},

	normalizeVertices : function(arr) {
		var max = 1;
		var newArr = arr.map( function(a) {
			max = Math.max(max, Math.max.apply(null, a))
			return a;
		});

		newArr = newArr.map(function(a) {
			return a.map(function(v) {
				return v/max;
			});
		});

		return newArr;
	},

	loopRange : function(n, start) {
		if (start == undefined)
			start = 0;

		var i = start - 1,
				loop = [];

		while (++i < n - 1) {
			loop.push([i, i+1]);
		}

		loop.push([n - 1, start]);
		return loop;
	},

	connectCrosses : function(faceLength) {
		var i = -1,
				joins = [];

		while (++i < faceLength) {
			joins.push([i, i + faceLength]);
		}

		return joins;
	},

	extrude3 : function(vertices) {
		var extruded = new SimpleDimensionalObject(),
				verts0 = vertices.map(function(v) {
					var vertex = v.slice(0);
					vertex.push(0)
					return vertex;
				}),
				verts1 = vertices.map(function(v) {
					var vertex = v.slice(0);
					vertex.push(1)
					return vertex;
				}),
				combinedVertices = verts0.concat(verts1),
				joins0 = this.loopRange(vertices.length),
				joins1 = joins0.map(function(j) { 
					return j.map(function(v) { 
						return v + vertices.length 
					}); 
				}),
				crosses = this.connectCrosses(vertices.length),
				combinedJoins = joins0.concat(joins1).concat(crosses);

		extruded.vertices = combinedVertices;
		extruded.joins = combinedJoins;

		return extruded;
	},

	extrude4 : function(vertices) {
		var extrusion0 = this.extrude3(vertices),
				extrusion1 = this.extrude3(vertices),
				extruded = new SimpleDimensionalObject();

		extrusion0.vertices.forEach(function(v) {
			v.push(0);
		});

		extrusion1.vertices.forEach(function(v) {
			v.push(1);
		});

		extrusion1.joins.forEach(function(v) {
			v[0] += vertices.length * 2;
			v[1] += vertices.length * 2;
		});

		extruded.vertices = extrusion0.vertices.concat(extrusion1.vertices);

		extruded.joins = extrusion0.joins.concat(extrusion1.joins);
		extruded.joins = extruded.joins.concat( this.connectCrosses( vertices.length * 2 ) );

		return extruded;
	}
}

NType.prototype._matrices = {
	zw : new THREE.Matrix4(),
	yw : new THREE.Matrix4(),
	xw : new THREE.Matrix4(),
	xy : new THREE.Matrix4(),
	yz : new THREE.Matrix4(),
	zx : new THREE.Matrix4(),
	update : function(t) {

		this.xy.set(
 cos(t), sin(t),      0,      0,
-sin(t), cos(t),      0,      0,
			0,      0,      1,			0,
			0,      0,  		0,			1
		);

		this.yz.set(
			1,      0,      0,      0,
			0, cos(t), sin(t),      0,
			0,-sin(t), cos(t),			0,
			0,      0,  		0,  		1
		);

		this.zx.set(
 cos(t), 			0,-sin(t),      0,
			0, 			1,      0,      0,
 sin(t),      0, cos(t),			0,
			0,      0,  		0,			1	
		)

		this.zw.set(
			1,      0,      0,      0,
			0,      1,      0,      0,
			0,      0,  cos(t),-sin(t),
			0,      0,  sin(t),  cos(t)
		);

		this.xw.set(
		 cos(t),      0,      0, sin(t),
					0,      1,      0,      0,
					0,      0,      1,      0,
		-sin(t),      0,      0,  cos(t)
		);

		this.yw.set(
	      1,      0,      0,      0,
				0, cos(t),      0,-sin(t),
				0,      0,      1,      0,
				0, sin(t),      0,  cos(t)
		)
	}
}

var a = [
	[0,0],
	[2,6],
	[3,6],
	[5,0],
	[4,0],
	[3.4, 2],
	[1.6, 2],
	[1,0]
]


var unitA = NType.prototype.utils.normalizeVertices(a);
var unitB = NType.prototype.utils.normalizeVertices(window.TYPE.B);
var unitM = NType.prototype.utils.normalizeVertices(window.TYPE.M);
var unitK = NType.prototype.utils.normalizeVertices(window.TYPE.K);

var ntype = new NType(window);
ntype.setShape(unitK);
ntype.begin();

window.addEventListener('keyup', function(e) {
	var key = String.fromCharCode(e.keyCode);
	if (window.TYPE[key] && window.TYPE[key].length > 0) {
		var letter = NType.prototype.utils.normalizeVertices(window.TYPE[key]);
		ntype.setShape(letter);
	}
});
