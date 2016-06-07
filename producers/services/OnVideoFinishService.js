var BusService = require('../../post-processing-consumer/services/BusService'),
fs = require('fs');

module.exports.start = function(params) {

    // used later to push jobs to this queue
    var postProcessingQueueName = getPostProcessingQueueName();
    // extract params


    var videoId = params.videoId;
    var relativePathToVideo = params.relativePath;
    var relativePathToData = params.dataRelativePath; // metadata path
    var method = params.method;

    // log params
    console.log(params);

    // validate crucial params
    if (!method || !method.standard || !method.version) {
        console.log('Some vital parameters are missing.');
        return;
    }

    //BusService = new BusService(this.env.redisHost, service.env.redisPort);
    BusService.createBus()
    produceJobs(postProcessingQueueName, params);
}

function getPostProcessingQueueName() {
    var queues = JSON.parse(fs.readFileSync('../queues-config/queues.json', "utf8"));
    if (queues.PostProcessingQueue)
    {
        console.log(queues.PostProcessingQueue.name)
        return queues.PostProcessingQueue.name;
    }
    else
        throw "Error finding the finished videos queue name.";
}


// produce all jobs here
function produceJobs(queueName, params) {
    produceMetadataParserJob(queueName, params);
}

function produceMetadataParserJob(queueName, params) {
    /*var message = {
        type: "MetadataParser",
        videoId: params.videoId,
        relativePath: params.dataRelativePath,
        method: params.method
    };*/
    var message ={type: "MetadataParser"};
    message.params = params;
    console.log("OnVideo :",message ,queueName);
    BusService.produce(queueName, message);
}
