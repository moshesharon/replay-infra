var BusMQ = require('busmq');

var bus;

/*module.exports = function(){
	// initialize internal bus object

	bus = createBus();
	// exports
	this.consume = consume;
}*/

function createBus(){
	// detect redis host & port	
	process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
	process.env.REDIS_PORT = process.env.REDIS_PORT || 6379;
	process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

	// append '@' if passowrd supplied
	REDIS_PASSWORD = process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD + '@' : process.env.REDIS_PASSWORD;

	var redisUrl = 'redis://' + REDIS_PASSWORD + process.env.REDIS_HOST + ':' +process.env.REDIS_PORT;
	console.log('redisUrl' , redisUrl);
	bus = BusMQ.create({redis: [redisUrl]});
	console.log('Bus was successfuly created.');
	return bus;
}

// connecting to bus, attaching to appropriate queue and perform 
// user callback upon incoming messages
function consume(queueName, callback){
	bus.on('online', function() {
	  var q = bus.queue(queueName);
	  q.on('attached', function() {
	    console.log('Attached consumer to queue ' + queueName + '.');
	  });
	  q.on('message', function(message, id) {
	  	// call the callback, and when it finishes, detach from queue
	  	callback(message);
	  });
	  q.attach();
	  // the 'message' event will be fired when a message is retrieved
	  q.consume(); 
	});

	// connect the redis instances
	bus.connect();
}

// used because some of the consumers are also the producers of another jobs
// connecting to the bus, attaching to a queue and pushing a job
function produce(queueName, job){
	bus.on('online', function() {
	  var q = bus.queue(queueName);
	  q.on('attached', function() {
	    console.log('Attached producer to queue ' + queueName + '.');
	  });
	  q.attach();
	  q.push(job);
	});
	bus.connect();
}
module.exports={
	createBus:createBus,
	consume:consume,
	produce:produce
}