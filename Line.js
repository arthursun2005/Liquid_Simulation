function Line(x1,y1,x2,y2){
	this.p1 = new Point2(x1,y1);
	this.p2 = new Point2(x2,y2);
	this.f = null;
}
Line.prototype.update = function() {
	this.d = Point2.sub(this.p2,this.p1);
	this.a = this.d.heading();
	this.m = this.d.mag();
	this.c = new Point2((this.p1.x+this.p2.x)/2,(this.p1.y+this.p2.y)/2);
};
Line.prototype.draw = function(c) {
	var d = c.getContext("2d");
	d.beginPath(); 
	d.lineWidth = 1;
	d.strokeStyle = "#fff";
	d.moveTo(this.p1.x,this.p1.y);
	d.lineTo(this.p2.x,this.p2.y);
	d.stroke();
};