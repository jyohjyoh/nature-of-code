function Spring( anc, len ){
	this.anchor = vec2.clone(anc) || vec2.fromValues(0, 0);
	this.length = len;
	this.k = 0.05;
}

Spring.prototype.stretchForce = function(mover){
	var force = vec2.create();
	var pos = vec2.fromValues( mover.x(), mover.y());
	vec2.subtract(force, pos, this.anchor);
	var stretch = vec2.length(force) - this.length;

	vec2.normalize(force, force);
	vec2.scale( force, force, -1*this.k*stretch);
	return force;
	
}