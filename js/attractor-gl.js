function Attractor(imass, iloc){
	this.g = 1;
	this.mass = imass || 1;
	this.location = vec2.clone(iloc) || vec2.fromValues(0,0);
}

Attractor.prototype.x = function(){
	return this.location[0];
};

Attractor.prototype.y = function(){
	return this.location[1];
};

Attractor.prototype.attract = function(mover, min_dist){
	var force = vec2.create();
	vec2.subtract(force, this.location, mover.location);

	var dist = vec2.length(force);
	if( dist < min_dist) dist = min_dist;

	vec2.normalize(force, force);
	vec2.scale( force, force, (this.g*this.mass*mover.mass)/(dist*dist));
	return force;
}
