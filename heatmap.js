function HeatMap(canvas, options) {
	var self = this;

	var opts = options || {};
	self.canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

	self.ctx = canvas.getContext('2d');
	self.width = canvas.width;
	self.height = canvas.height;
	self.max = opts.max || 1;
	self.blur = opts.blur || 25;
	self.radius = opts.radius || 35;
	self.palette = opts.gradient || {
		0.4: 'blue',
		0.6: 'cyan',
		0.7: 'lime',
		0.8: 'yellow',
		1.0: 'red'
	};
	self.data = opts.data || [];
	self.blurredRadius = self.radius + self.blur;
	self.gradient;
	self.opacity = opts.opacity || .03;
	self.radialCanvas;

	return self;
}

HeatMap.prototype.color = function(pixels, gradient) {
	for (var i = 0; i < pixels.length; i += 4) {
		var j = pixels[i + 3] * 4;
		if (j) {
			pixels[i] = gradient[j];
			pixels[i + 1] = gradient[j + 1];
			pixels[i + 2] = gradient[j + 2];
		}
	}

};

HeatMap.prototype.addPoint = function(point) {
	this.data.push(point);
};

HeatMap.prototype.fillRadius = function() {
	this.radialCanvas = document.createElement('canvas');
	var ctx = this.radialCanvas.getContext('2d');

	this.radialCanvas.width = this.radialCanvas.height = this.blurredRadius * 2;

	ctx.shadowOffsetX = ctx.shadowOffsetY = this.blurredRadius * 2;
	ctx.shadowBlur = this.blur;
	ctx.shadowColor = 'black';

	ctx.beginPath();
	ctx.arc(-this.blurredRadius, -this.blurredRadius, this.radius, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();
};

HeatMap.prototype.setGradient = function() {

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, 0, 256);

	canvas.width = 1;
	canvas.height = 256;
	for (var o in this.palette) {
		gradient.addColorStop(+o, this.palette[o]);
	}

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 1, 256);

	this.gradient = ctx.getImageData(0, 0, 1, 256).data;
};

HeatMap.prototype.draw = function() {

	if (!this.radialCanvas) {
		this.fillRadius();
	}
	if (!this.gradient) {
		this.setGradient();
	}

	var ctx = this.ctx;
	ctx.clearRect(0, 0, this.width, this.height);
	for (var i = 0; i < this.data.length; i++) {
		var pnt = this.data[i];
		ctx.globalAlpha = Math.max(pnt[2] / this.max, this.opacity);
		ctx.drawImage(this.radialCanvas, pnt[0] - this.blurredRadius, pnt[1] - this.blurredRadius);
	}

	var colored = ctx.getImageData(0, 0, this.width, this.height);
	this.color(colored.data, this.gradient);
	ctx.putImageData(colored, 0, 0);
};
