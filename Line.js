function Line(x1,y1,x2,y2){
	this.p1 = new Point2(x1,y1);
	this.p2 = new Point2(x2,y2);
	this.f = null;
}
Line.prototype.update = function() {
};