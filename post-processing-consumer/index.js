var BusService = require('./services/BusService'),
    env        = require('../config/env/development'), 
    mongoose = require('mongoose'),
    elasticsearch = require('elasticsearch'),
    JobsService = require('JobsService'),
    _ = require('lodash');

//console.log(Object.getOwnPropertyNames(BusService))

console.log(Object.getOwnPropertyNames(BusService))

BusService.createBus()

// notify we're up, and check input
console.log('Post processing consumer is up!');
if (!isInputValid()) {
    return "Bad input was received.";
}
// connect to our databases once so the service won't have to re-create connection each time
connectDatabases();

// create bus
BusService.consume("PostProcessing", handleMessage);

/*handleMessage({
    type: 'MetadataParser',
    params: {
        videoId: 'someVideoId',
        relativePath: 'someVideoId.data',
        method: {
            standard: 'TekenHozi',
            version: 1.0
        }
    }
});
*/

// enforces basic validations on the environment input passed to process,
// such as mandatory parameters.
// later on, specific functions should enforce specific validations on their inputs
function isInputValid() {
 /*   console.log('Job type is: ', env.jobType);
    console.log('Redis host: ', env.redisHost);
    console.log('Redis port: ', env.redisPort);
    console.log('Redis password: ',env.redisPassword);
    console.log('Mongo host: ', env.mongoHost);
    console.log('Mongo port: ', env.mongoPort);
    console.log('Mongo database: ', env.mongoDataBase);
    console.log('Elastic host: ', env.elasticHost);
    console.log('Elastic port: ', env.elasticPort);
    console.log('Files storage path: ', env.storagePath);
    console.log('Queue is: ', env.queue_name);*/

    // check mandatory parameter we can't continue without
    if (!env.queue_name || !env.mongoDataBase || !env.storagePath)
        return false;
 
    return true;
}

function handleMessage(message) {

    console.log("consumer: handleMessage message : ",message)
    // detect service job type
    var jobType = "MetadataParser";
    message = JSON.parse(message);
    // JOB_TYPE can be empty (handle all jobs), or a specific known JOB TYPE.
    // message.type must be a known specific job.
    if ((jobType && !JobsService.isKnownJobType(jobType)) ||
        !JobsService.isKnownJobType(message.type)) {       
        console.log('Bad job type was inserted');
        return;
    }

    // in case we are handling all job types, or,
    // the job type is of our type
    if (!jobType || message.type === jobType) {       
        var serviceName = JobsService.getServiceName(message.type);
        service = require('./services/ProcessingServices/' + serviceName);
        service.env = env;
        console.log("consumer handleMessage" , message)
        if (service)
            service.start(message.params);
        else
            console.log('Bad service name');
        return;
    }
}

function connectDatabases() {
    connectMongo();
    connectElasticSearch();
}

function connectMongo() {
    var host = env.mongoHost;
    var port = env.mongoPort;

    var keepAliveInSeconds = 60 * 60 * 24 * 30; // 30 days
    // initialize options
    var options = {
        server: {
            socketOptions: {
                keepAlive: keepAliveInSeconds
            }
        },
        replset: {
            socketOptions: {
                keepAlive: keepAliveInSeconds
            }
        }
    };

    var uri = 'mongodb://' + host + ':' + port + '/' + env.mongoDataBase;
    // connect to mongo
    mongoose.connect(uri, options);
    global.mongoose = mongoose;
}

function connectElasticSearch() {
    var host = env.elasticHost;
    var port = env.elasticPort;

    var uri = host + ':' + port;
    // connect to elastic
    // keep-alive is true by default, which means forever
    global.elasticsearch = new elasticsearch.Client({
        host: uri,
        log: ['error', 'warning']
    });
}
