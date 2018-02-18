function Particle(x,y){
	this.p = new Point2(x,y);
	this.v = new Point2();
	this.r = 2.7;
	this.m = this.r*this.r;
	this.w0 = 36;
	this.weight = 0;
	this.pressure = 0;
	this.pressureForce = 0.025;
	this.repelForce = 1;
	this.viscousForce = 0.075;
	this.c = "#ddddffaa";
	this.friction = 1;
	this.fixed = false;
	this.mixColor = false;
}
Particle.prototype.cal = function(n) {
	return Math.max(0,this.pressureForce*(this.w0+n));
};
Particle.prototype.applyForce = function(f, t) {
	var a = Point2.mult(f,t/this.m);
	this.v.add(a);
};
Particle.prototype.copy = function() {
	var p = new Particle();
	p.p = this.p.copy();
	p.v = this.v.copy();
	p.r = this.r;
	p.m = this.m;
	p.w0 = this.w0;
	p.weight = this.weight;
	p.pressure = this.pressure;
	p.pressureForce = this.pressureForce;
	p.repelForce = this.repelForce;
	p.viscousForce = this.viscousForce;
	p.c = this.c;
	p.fixed = this.fixed;
	p.mixColor = this.mixColor;
	return p;
};
Particle.prototype.draw = function(c) {
	var d = c.getContext("2d");
	d.beginPath();
	d.arc(this.p.x,this.p.y,this.r,0,Math.PI*2);
	d.fillStyle = this.c;
	d.fill();
};
Particle.prototype.update = function() {
	if(this.fixed) this.v = new Point2();
	this.v.mult(this.friction);
	this.p.add(this.v);
};
function ParticleSystem(space){
	this.ps = [];
	this.g = new Point2();
	this.maxRadius = null;
	this.all = [];
	this.f = null;
	this.space = space;
}
ParticleSystem.prototype.addParticle = function(p) {
	this.ps.push(p);
};
ParticleSystem.prototype.solve = function() {
	if(this.ps.length<1) return;
	// First, get the maxRadius
	this.maxRadius = this.ps[0].r;
	this.all = [];
	for (var i = this.ps.length - 1; i >= 1; i--) {
		if(this.ps[i].r>this.maxRadius){
			this.maxRadius = this.ps[i].r;
		}
	}
	var maxD = this.maxRadius*2;
	// Then get the minium this.p
	var mp = this.ps[0].p.copy();
	for (var i = this.ps.length - 1; i >= 1; i--) {
		if(this.ps[i].p.x<mp.x){
			mp.x = this.ps[i].p.x;
		}
		if(this.ps[i].p.y<mp.y){
			mp.y = this.ps[i].p.y;
		}
	}
	mp.div(maxD);
	mp.floor();
	// put it into all
	for (var i = this.ps.length - 1; i >= 0; i--) {
		var p1 = this.ps[i];
		var x = Math.floor(p1.p.x/maxD)-mp.x, y = Math.floor(p1.p.y/maxD)-mp.y;
		if(!this.all[y]) this.all[y] = [];
		if(!this.all[y][x]) this.all[y][x] = [];
		this.all[y][x].push({obj:p1,id:i});
	}
	// copy an array
	var ps = [];
	for(var i=0;i<this.ps.length;i++){
		ps[i] = this.ps[i].copy();
	}
	// blah blah blah
	for (var i = this.ps.length - 1; i >= 0; i--) {
		var p1 = this.ps[i];
		var x = Math.floor(p1.p.x/maxD)-mp.x, y = Math.floor(p1.p.y/maxD)-mp.y;
		for(var py=y-1;py<=y+1;py++){
			if(!this.all[py]) continue;
			for(var px=x-1;px<=x+1;px++){
				if(!this.all[py][px]) continue;
				for (var j = this.all[py][px].length - 1; j >= 0; j--) {
					var f = this.all[py][px][j];
					var p2 = f.obj;
					var id = f.id;
					var d = Point2.sub(p2.p,p1.p);
					var D = p1.r+p2.r;
					var m = d.mag();
					if(m<D){
						p1.weight+=1-m/D;
						p2.weight+=1-m/D;
					}
				}
			}
		}
	}
	for (var i = this.ps.length - 1; i >= 0; i--) {
		this.ps[i].pressure = this.ps[i].cal(this.ps[i].weight);
	}
	for (var i = this.ps.length - 1; i >= 0; i--) {
		var p1 = this.ps[i];
		var x = Math.floor(p1.p.x/maxD)-mp.x, y = Math.floor(p1.p.y/maxD)-mp.y;
		for(var py=y-1;py<=y+1;py++){
			if(!this.all[py]) continue;
			for(var px=x-1;px<=x+1;px++){
				if(!this.all[py][px]) continue;
				for (var j = this.all[py][px].length - 1; j >= 0; j--) {
					var f = this.all[py][px][j];
					var p2 = f.obj;
					var id = f.id;
					var d = Point2.sub(p2.p,p1.p);
					var D = p1.r+p2.r;
					var m = d.mag();
					var n = Point2.normalize(d);
					if(m<D){
						var tf = (1-m/D)*(p1.pressure+p2.pressure)*(p1.repelForce+p2.repelForce)*(1/2);
						ps[i].applyForce(n, -tf);
						ps[id].applyForce(n, tf);
						var deltaV = Point2.sub(p2.v,p1.v);
						tf = (p1.viscousForce+p2.viscousForce);
						ps[i].applyForce(deltaV, tf);
						ps[id].applyForce(deltaV, -tf);
					}
				}
			}
		}
	}
	for(var i=0;i<ps.length;i++){
		this.ps[i] = ps[i].copy();
	}
	for(var i=0;i<this.ps.length;i++){
		this.ps[i].weight = 0;
		this.ps[i].pressure = 0;
	}
};
ParticleSystem.prototype.update = function() {
	if(this.f) this.f();
	this.solve();
	for (var i = this.ps.length - 1; i >= 0; i--) {
		this.ps[i].v.add(this.g);
	}
	for (var i = this.ps.length - 1; i >= 0; i--) {
		this.ps[i].update();
	}
};
ParticleSystem.prototype.draw = function() {
	for (var i = this.ps.length - 1; i >= 0; i--) {
		this.ps[i].draw(this.space);
	}
};