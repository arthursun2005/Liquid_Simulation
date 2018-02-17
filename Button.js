function Button(x,y,dx,dy,t,f){
	this.v = new Point2();
	this.p = new Point2(x,y);
	this.d = new Point2(dx,dy);
	this.t = t;
	this.df = null;
	this.f = f;
	this.c = "#66DD00";
	this.tc = "#000000";
	this.s = Math.min(this.d.x,this.d.y)/4;
	this.space = null;
}
Button.prototype.draw = function() {
	if(!this.space) return null;
	var px = this.p.x, py = this.p.y;
	var x = px-this.d.x/2, y = py-this.d.y/2;
	var r = 15, w = this.d.x, h = this.d.y;
	var d = this.space.getContext("2d");
	d.beginPath();
	d.moveTo(x+r, y);
	d.lineTo(x+w-r, y);
	d.quadraticCurveTo(x+w, y, x+w, y+r);
	d.lineTo(x+w, y+h-r);
	d.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	d.lineTo(x+r,y+h);
	d.quadraticCurveTo(x, y+h, x, y+h-r);
	d.lineTo(x, y+r);
	d.quadraticCurveTo(x,y,x+r,y);
	d.lineWidth = 1;
	d.fillStyle = this.c;
	d.strokeStyle = this.tc;
	d.stroke();
	d.fill();
	d.beginPath();
	d.fillStyle = this.tc;
	d.textAlign = "center";
	d.font = this.s+"px monospace";
	d.fillText(this.t, px, py);
};
Button.prototype.in = function(x,y) {
	return x>this.p.x-this.d.x/2 && x<this.p.x+this.d.x/2 && y>this.p.y-this.d.y/2 && y<this.p.y+this.d.y/2;
};
Button.prototype.interact1 = function(event) {
	var e = event || window.event;
	e.preventDefault();
};
Button.prototype.run = function() {
	if(this.df) this.df();
	this.p.add(this.v);
	this.draw();
};