function Mover(imass, iloc, w, h){
	this.mass = imass || 1;
	this.location = iloc || [0,0];
	this.velocity = [0,0];
	this.acceleration = [0,0];
	this.width = w || 2000;
	this.height = h || 1000;
}

Mover.prototype.x = function(){
	return this.location[0];
}

Mover.prototype.y = function(){
	return this.location[1];
}

Mover.prototype.applyForce = function(force){
	this.acceleration[0] += force[0]/this.mass;
	this.acceleration[1] += force[1]/this.mass;
};


Mover.prototype.update = function(){
	this.velocity[0] += this.acceleration[0];
	this.velocity[1] += this.acceleration[1];
	this.location[0] += this.velocity[0];
	this.location[1] += this.velocity[1];

	this.acceleration = [0,0];
}

Mover.prototype.bounceOnEdge = function(){
	if( this.location[0] > this.width){
		this.location[0] = this.width;
		this.velocity[0] *= -1;
	}
	else if( this.location[0] < 0){
		this.location[0] = 0;
		this.velocity[0] *= -1;
	}

	if( this.location[1] > this.height){
		this.location[1] = this.height;
		this.velocity[1] *= -1;
	}
	else if( this.location[1] < 0){
		this.location[1] = 0;
		this.velocity[1] *= -1;
	}
}

Mover.prototype.applyFriction = function( friction_mag ){
	var friction = [-this.velocity[0], -this.velocity[1]];
	var dot = Math.sqrt(friction[0]*friction[0] + friction[1]*friction[1]);

	if( dot!=0){
		var idot = 1.0/dot;
		friction[0] = friction[0]*idot*friction_mag;
		friction[1] = friction[1]*idot*friction_mag;
		this.applyForce(friction);
	}
}