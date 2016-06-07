var BusService = require('../post-processing-consumer/services/BusService'),
    env        = require('../config/env/development'), 
    fs = require('fs'),
    JobsService = require('JobsService'),
    _ = require('lodash');

// notify we're up, and check input
console.log('Post processing producer is up!');
//logEnvironVariables();

// create bus
//BusService = new BusService(env.redisHost, env.redisPort);
BusService.createBus();

//TODO remove after checking

/*var message = {
    type: 'OnVideoFinish',
    params: {
        videoId: 'someVideoId',
        relativePath: 'someVideoId.data',
        method: {
            standard: 'TekenHozi',
            version: 1.0
        }
    }
}
BusService.produce(getFinishedVideosQueueName(),message );*/




// consume the finished videos queue to know when a video has finished
BusService.consume(env.queue_name, handleNewVideoMessages);
//BusService.consume(getFinishedVideosQueueName(), handleNewVideoMessages);

function logEnvironVariables() {
    console.log('Redis host: ', env.redisHost);
    console.log('Redis port: ', env.redisPort);
    console.log('Redis password: ', env.redisPassword);
}






// Although we could hardcode the queue name since the producer consumes
// only one queue, I decided to take it from the queues file so the
// procedure will stay organized in a certain structure.
// If one day the queue name will be changed, it will be changed transparently
// in the queues file, and no code will be affected.
function getFinishedVideosQueueName() {
   // console.log("producer: getFinishedVideosQueueName")
    var queues = JSON.parse(fs.readFileSync('../queues-config/queues.json', "utf8"));
    if (queues.FinishedVideosQueue)
    {
        return queues.FinishedVideosQueue.name;
    }
    else
        throw "Error finding the finished videos queue name.";
}

// Although the producer should consume one job type from queue,
// which is the OnVideoFinish, to keep things arranged, make sure
// that the job is intended to him (also would prevent bugs in the future).
function handleNewVideoMessages(message) {
    console.log("producer handleNewVideoMessages message : " ,message )
    var jobType = 'OnVideoFinish';
    message = JSON.parse(message)
    if (!JobsService.isKnownJobType(jobType) || !JobsService.isKnownJobType(message.type)) {
         console.log("producer: message.type : ",message.type ," jobType : ",jobType);
        console.log('Bad job type was inserted.');
        return;
    }

    // check if message is destinated for us
    if (message.type === jobType) {
        var serviceName = JobsService.getServiceName(message.type);
        service = require('./services/' + serviceName);
        service.env = env;
        if (service)
            service.start(message.params);
        else
            console.log('Bad service name');
        return;
    }
}
