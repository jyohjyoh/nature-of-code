
/* Particle system
type: Emitter type, POINT or LINE
emitter_points: xy coordinate point, or start-end points of a line
angle_range: [low high] range of initial force direction angle in angle (not radian)
strength_range: [low high] range of initial force strength
*/
var EM_POINT = 0;
var EM_LINE = 1;
var EM_ATONCE = 0;
var EM_CONTINUOUS = 1;

function ParticleSystem(num_par, par_lfR, par_mass, st_w, st_h, emitter){
	this.type = emitter.type;
	this.emitter_point1 = vec2.fromValues(emitter.points[0], emitter.points[1]) || vec2.fromValues(0, 0);
	if( this.type == EM_LINE)
		this.emitter_point2 = vec2.fromValues(emitter.points[2], emitter.points[3]) || vec2.fromValues(0, 0);
	this.angle_range = emitter.angle_range;
	this.strength_range = emitter.strength_range;
	this.feed_type = emitter.feed_type || EM_ATONCE;

	this.particles = [];
	this.life_range = par_lfR;
	this.mass = par_mass;
	this.stage_w = st_w;
	this.stage_h = st_h;
	if( this.feed_type == EM_ATONCE ){
		for( var i=0; i<num_par; i++){
			var particle_lf = ~~(this.life_range[0]+Math.random()*(this.life_range[1]-this.life_range[0]));
			this.particles[i] = new Particle( particle_lf, par_mass, this.initLocation(), this.stage_w, this.stage_h);
		}
	}
	else{
		this.feedParticle();
	}
}

ParticleSystem.prototype.feedParticle = function(){
	var particle_lf = ~~(this.life_range[0]+Math.random()*(this.life_range[1]-this.life_range[0]));
	var index = this.particles.length;
	this.particles[index] = new Particle( particle_lf, this.mass, this.initLocation(), this.stage_w, this.stage_h);
	this.particles[index].applyForce( this.initForce());
}

ParticleSystem.prototype.start = function(){
	for( var i=0; i<this.particles.length; i++ ){
		this.particles[i].applyForce( this.initForce());
		this.particles[i].update();
	}
}

ParticleSystem.prototype.initLocation = function(){
	if( this.type == EM_POINT ){
		return this.emitter_point1;
	}
	else{
		var sub = vec2.create();
		vec2.subtract( sub, this.emitter_point2, this.emitter_point1);
		var len = vec2.length(sub);

		//normalize the direction vector
		if( len > 0 )
			vec2.scale( sub, sub, 1.0/len);

		//the new particle location is random position along the vector between the emitter_point1 and emitter_point2
		var pos = vec2.create();
		vec2.scale(pos, sub, len*Math.random());
		vec2.add(pos, pos, this.emitter_point1);
		
		return pos;
	}		
};

/* Define initial force range by angle and strength */
ParticleSystem.prototype.initForce = function(){
	var angle = this.angle_range[0] + Math.random()*(this.angle_range[1]-this.angle_range[0]);
	angle = Math.PI*angle/180.;

	var strength = this.strength_range[1] + Math.random()*(this.strength_range[1]-this.strength_range[0]);
	var force = vec2.fromValues( strength*Math.cos(angle), strength*Math.sin(angle));
	return force;
};

ParticleSystem.prototype.getParticle = function(index){
	return this.particles[index];
};

ParticleSystem.prototype.draw = function(drawParticle){
	for(var index=0; index<this.particles.length; index++){
			drawParticle(index, this.particles[index]);
	}
};

ParticleSystem.prototype.update = function(){
	for(var index=0; index<this.particles.length; index++){
		if( this.particles[index].isDead()==false )
			this.particles[index].update();
	}
};

ParticleSystem.prototype.applyForce = function(force){
	for(var index=0; index<this.particles.length; index++){
		if( this.particles[index].isDead()==false )
			this.particles[index].applyForce(force);
	}
};

ParticleSystem.prototype.applyForceForEach = function(forceFunction, arg){
	for(var index=0; index<this.particles.length; index++){
		if(this.particles[index].isDead()==false){
			var force = forceFunction(this.particles[index], arg);
			this.particles[index].applyForce(force);
		}
	}
}

ParticleSystem.prototype.killOutOfContainer = function(){
	for(var index=0; index<this.particles.length; index++){
		if( this.particles[index].isDead()==false )
			this.particles[index].killOutofContainer();
	}
};

ParticleSystem.prototype.bounceOnEdge = function(){
	for(var index=0; index<this.particles.length; index++){
		if( this.particles[index].isDead()==false )
			this.particles[index].bounceOnEdge();
	}
};

/* Particle class
lifespan: should have a lifespan

Random parameters
 velocity: Initial velocity created by randomly generated force
 acceleration: Acceleration can be randomly assigned intially and then gets added per force applied
 location: Initial location should be assigned per emitter geometry
*/


function Particle(lf, imass, iloc, w, h){
	this.lifespan = lf;
	this.mass = imass || 1;
	this.location = vec2.clone(iloc) || vec2.fromValues(0,0);
	this.velocity = vec2.fromValues(0,0);
	this.acceleration = vec2.fromValues(0,0);
	this.width = w || 2000;
	this.height = h || 1000;
};

Particle.prototype.x = function(){
	return this.location[0];
};

Particle.prototype.y = function(){
	return this.location[1];
};

Particle.prototype.applyForce = function(force){
	if( this.mass == 0 ) return;

	var f = vec2.fromValues( force[0], force[1]);
	var s = 1.0/this.mass;
	vec2.scaleAndAdd( this.acceleration, this.acceleration, f, s);
};

Particle.prototype.constrain = function(){
	if( this.location[0] <0 ) this.location[0] = 0;
	if( this.location[1] <0 ) this.location[1] = 0;
	if( this.location[0] > this.width) this.location[0] = this.width;
	if( this.location[1] > this.height) this.location[1] = this.height;
};

Particle.prototype.update = function(){
	this.lifespan --;
	vec2.add( this.velocity, this.velocity, this.acceleration);
	vec2.scale(this.velocity, this.velocity, 0.995); //add damping
	vec2.add( this.location, this.location, this.velocity);
	this.acceleration = vec2.fromValues(0,0);
};

Particle.prototype.isDead = function(){
	return (this.lifespan==0);
};

Particle.prototype.killOutofContainer = function(){
	if( this.location[0] <=0 ) this.lifespan = 0;
	if( this.location[1] <=0 ) this.lifespan = 0;
	if( this.location[0] >= this.width) this.lifespan = 0;
	if( this.location[1] >= this.height) this.lifespan = 0;
};

Particle.prototype.restOnBottom = function(){
	if( this.location[1] > this.height){
		this.location[1] = this.height;
		this.velocity = vec2.fromValues(0, 0);
	}
}

Particle.prototype.bounceOnEdge = function(){
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

Particle.prototype.applyFriction = function( friction_mag ){
	var friction = vec2.fromValues(-this.velocity[0], -this.velocity[1]);
	var nfriction = vec2.create();
	vec2.normalize( nfriction, friction );

	vec2.scale( friction, nfriction, friction_mag);
	this.applyForce(friction);
};


Particle.prototype.isInBox = function( wleft, wtop, wright, wbottom){
	if( this.location[0] > wleft && this.location[0] < wright 
		&& this.location[1] > wtop && this.location[1] < wbottom )
		return true;
	else return false;
};

Particle.prototype.applyDrag = function(drag_coef){
	var fdrag = vec2.create();
	var len = vec2.length(this.velocity);
	vec2.normalize( fdrag, this.velocity );
	vec2.scale( fdrag, fdrag, -1*len*drag_coef);
	this.applyForce( fdrag );
};

/*return angle of the velocity*/
Particle.prototype.heading = function(){
	if( vec2.length(this.velocity) < 2 ){
	 	return 0;
	}
	else return Math.atan2(this.velocity[0], this.velocity[1]);
};

function repel(particle, arg){
	var force = vec2.fromValues(arg.location[0], arg.location[1]);
	vec2.subtract(force, force, particle.location);

	var dist = vec2.length(force);
	if( dist < 10) dist = 10;

	vec2.normalize(force, force);
	vec2.scale( force, force, -arg.g/(dist*dist));
	return force;
};

function attract(particle, arg){
	var force = vec2.fromValues(arg.location[0], arg.location[1]);
	vec2.subtract(force, force, particle.location);

	var dist = vec2.length(force);
	if( dist < 10) dist = 10;

	vec2.normalize(force, force);
	vec2.scale( force, force, arg.g/(dist*dist));
	return force;
};