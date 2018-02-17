function Particle(x,y){
	this.p = new Point2(x,y);
	this.v = new Point2();
	this.r = 2.5;
	this.m = this.r*this.r;
	this.f = null;
	this.w0 = -0.5;
	this.weight = 0;
	this.pressure = 0;
	this.pressureForce = 0.25;
	this.repelForce = 0.75;
	this.viscousForce = 0.15;
	this.c = "#ffffff80";
}
Particle.prototype.cal = function(n) {
	return Math.max(0,this.pressureForce*(this.w0+n));
};
Particle.prototype.applyForce = function(f, t) {
	var a = Point2.div(f,this.m/t);
	this.v.add(a);
};
Particle.prototype.copy = function() {
	var p = new Particle(this.p.x,this.p.y);
	p.v = this.v.copy();
	p.r = this.r;
	p.f = ff(this.f);
	p.w0 = this.w0;
	p.weight = this.weight;
	p.pressure = this.pressure;
	p.pressureForce = this.pressureForce;
	p.repelForce = this.repelForce;
	p.viscousForce = this.viscousForce;
	p.c = this.c;
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
	if(this.f) this.f();
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
ParticleSystem.prototype.copy = function(){
	var p = new ParticleSystem(this.space);
	for (var i = this.ps.length - 1; i >= 0; i--) {
		p.ps[i] = this.ps[i].copy();
	}
	p.f = ff(this.f);
	p.g = this.g.copy();
	return p;
}
ParticleSystem.prototype.addParticle = function(p) {
	this.ps.push(p);
};
ParticleSystem.prototype.solve = function() {
	if(this.ps.length<1) return;
	// First, get the maxRadius
	this.maxRadius = 0;
	for (var i = this.ps.length - 1; i >= 0; i--) {
		if(this.ps[i].r>this.maxRadius){
			this.maxRadius = this.ps[i].r;
		}
	}
	var D = this.maxRadius*2;
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
	mp.div(D);
	mp.floor();
	// copy the array
	var ps = [];
	for(var i=0;i<this.ps.length;i++){ps[i] = this.ps[i].copy();}
	// put it into all
	for (var i = this.ps.length - 1; i >= 0; i--) {
		var p1 = this.ps[i];
		var x = Math.floor(p1.p.x/D)-mp.x, y = Math.floor(p1.p.x/D)-mp.x;
		if(!this.all[y]) this.all[y] = [];
		if(!this.all[y][x]) this.all[y][x] = [];
		this.all[y][x].push({obj:p1,id:i});
	}
	// blah blah blah
	for (var i = this.ps.length - 1; i >= 0; i--) {
		var p1 = this.ps[i];
		var x = Math.floor(p1.p.x/D)-mp.x, y = Math.floor(p1.p.x/D)-mp.x;
		for(var py=y-1;py<=y+1;py++){
			if(!this.all[py]) continue;
			for(var px=x-1;px<=x+1;px++){
				if(!this.all[py][px]) continue;
				for (var j = this.all[py][px].length - 1; j >= 0; j--) {
					var f = this.all[py][px][j];
					var p2 = f.obj;
					var d = Point2.sub(p2.p,p1.p);
					var R = p1.r+p2.r;
					var m = d.mag();
					if(m<R){
						p1.weight+=1-m/R;
						p2.weight+=1-m/R;
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
		var x = Math.floor(p1.p.x/D)-mp.x, y = Math.floor(p1.p.x/D)-mp.x;
		for(var py=y-1;py<=y+1;py++){
			if(!this.all[py]) continue;
			for(var px=x-1;px<=x+1;px++){
				if(!this.all[py][px]) continue;
				for (var j = this.all[py][px].length - 1; j >= 0; j--) {
					var f = this.all[py][px][j];
					var p2 = f.obj;
					var id = f.id;
					var d = Point2.sub(p2.p,p1.p);
					var R = p1.r+p2.r;
					var m = d.mag();
					var n = Point2.normalize(d);
					if(m<R){
						var tf = (1-m/R)*(p1.pressure+p2.pressure)*(p1.repelForce+p2.repelForce)*(1/2);
						ps[i].applyForce(n, -tf);
						ps[id].applyForce(n, tf);
						var deltaV = Point2.sub(p2.v,p1.v);
						tf = (p1.viscousForce+p2.viscousForce)*(1/2);
						ps[i].applyForce(n, -tf);
						ps[id].applyForce(n, tf);
					}
				}
			}
		}
	}
	for(var i=0;i<ps.length;i++){this.ps[i] = ps[i];}
	for(var i=0;i<this.ps.length;i++){this.ps[i].weight = 0;this.ps[i].pressure = 0;}
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