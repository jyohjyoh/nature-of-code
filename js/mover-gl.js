/*Physics-based Mover Class, basic, no angular motion*/

/* initialize the Mover with mass, location, and bounding box width and height*/
function Mover(imass, iloc, w, h){
	this.mass = imass || 1;
	this.location = vec2.clone(iloc) || vec2.fromValues(0,0);
	this.velocity = vec2.fromValues(0,0)
	this.acceleration = vec2.fromValues(0,0);
	this.width = w || 2000;
	this.height = h || 1000;
}

Mover.prototype.x = function(){
	return this.location[0];
};

Mover.prototype.y = function(){
	return this.location[1];
};

Mover.prototype.applyForce = function(force){
	if( this.mass == 0 ) return;

	var f = vec2.fromValues( force[0], force[1]);
	var s = 1.0/this.mass;
	vec2.scaleAndAdd( this.acceleration, this.acceleration, f, s);
};

Mover.prototype.constrain = function(){
	if( this.location[0] <0 ) this.location[0] = 0;
	if( this.location[1] <0 ) this.location[1] = 0;
	if( this.location[0] > this.width) this.location[0] = this.width;
	if( this.location[1] > this.height) this.location[1] = this.height;
};

Mover.prototype.update = function(){
	vec2.add( this.velocity, this.velocity, this.acceleration);
	vec2.scale(this.velocity, this.velocity, 0.995); //add damping
	vec2.add( this.location, this.location, this.velocity);
	this.acceleration = vec2.fromValues(0,0);
};

Mover.prototype.bounceOnEdge = function(){
	if( this.location[0] > this.width){
		this.location[0] = this.width;
		 this.velocity[0] *= -1;

	}
	else if( this.location[0] < 0){
		this.location[0] = 0;
		this.velocity[0] *= -1;
	}

	if( this.location[1] >= this.height){
		this.location[1] = this.height;
		this.velocity[1] *= -1;
	}
	else if( this.location[1] < 0){
		this.location[1] = 0;
		this.velocity[1] *= -1;
	}
};

Mover.prototype.applyFriction = function( friction_mag ){
	var friction = vec2.fromValues(-this.velocity[0], -this.velocity[1]);
	var nfriction = vec2.create();
	vec2.normalize( nfriction, friction );

	vec2.scale( friction, nfriction, friction_mag);
	this.applyForce(friction);
};


Mover.prototype.isInBox = function( wleft, wtop, wright, wbottom){
	if( this.location[0] > wleft && this.location[0] < wright 
		&& this.location[1] > wtop && this.location[1] < wbottom )
		return true;
	else return false;
};

Mover.prototype.applyDrag = function(drag_coef){
	var fdrag = vec2.create();
	var len = vec2.length(this.velocity);
	vec2.normalize( fdrag, this.velocity );
	vec2.scale( fdrag, fdrag, -1*len*drag_coef);
	this.applyForce( fdrag );
};

/*return angle of the velocity*/
Mover.prototype.heading = function(){
	if( vec2.length(this.velocity) < 2 ){
	 	return 0;
	}
	else return Math.atan2(this.velocity[0], this.velocity[1]);
};