var Promise = require('bluebird'),
	fs = Promise.promisifyAll(require('fs')),
  , path = require('path');
	_ = require('lodash'),
	VideoMetadata = require('../../../schemas/VideoMetadata');

module.exports.start = function(params){
	console.log('MetadataParserService started. params' , params);
	// extract params and handle metadata
	var relativePathToData = params.relativePath;
	var method = params.method;

	//console.log('Relative path is: ', relativePathToData);
	//console.log('Method is: ', method);

	// validate params

	if(!relativePathToData || !service.env.storagePath ||
		!method || !method.standard || !method.version){
		console.log('Consumer : Some vital parameters are missing. ',
			        '\n relativePathToData', relativePathToData);
		return;
	}
var pathToData= getFileWithPartialName(params.relativePath, params.videoId)
/*fs.readfile(mytxtfilepath, function(err,data) {
  console.log(data);
});*/
	// concat full path
	//var pathToData = service.env.storagePath + '/' + relativePathToData;

	readDataAsString(pathToData)
	.then(function(data){
		return dataToObjects(method, data);
	})
	.then(function(xmls){
		return saveToDatabases(xmls, params);
	})
	.catch(handleErrors);
}

function readDataAsString(path){
	return fs.readFileAsync(path, "utf8");
}

function dataToObjects(method, data){
	return new Promise(function(resolve, reject){
		
		var standardHandler;
		if(method.standard == 'TekenHozi' && method.version == 0.9)
			standardHandler = require('./Standards/TekenHozi/0.9');
		else if(method.standard == 'TekenHozi' && method.version == 1.0)
			standardHandler = require('./Standards/TekenHozi/1.0');
		else
			reject('Unsupported standard and version');

		resolve(standardHandler.parse(data));
	});
}

// async save to databases
// I do not want to stop everything if one save has failed,
// so I resolve anyway, and log errors to console.
function saveToDatabases(xmls, params){
	return new Promise(function(resolve, reject){
		console.log('Saving to databases.');

		saveToMongo(xmls, params);
		saveToElastic(xmls, params);

		resolve();
	});
}

function handleErrors(err){	
	if(err) console.log(err);
}

function saveToMongo(xmls, params){
	// convert xmls to list of VideoMetadata
	var videoMetadatas = xmlObjectsToVideoMetadata(xmls, params);
	
	VideoMetadata.insertMany(videoMetadatas, function(err, objs){
		if(err)
			console.log(err);
		else
			console.log('Bulk insertion to mongo succeed.');
	});
}

function xmlObjectsToVideoMetadata(xmls, params){
	return _.map(xmls, function(xml){
		return new VideoMetadata({
			sourceId: xml.VideoSource.PlatformID,
			videoId: params.videoId,
			receivingMethod: params.method,
			data: xml
		})
	});
}

function saveToElastic(xmls, params){
	// convert xmls to bulk request object for elastic
	var bulkRequest = xmlObjectsToElasticBulkRequest(xmls, params);

	global.elasticsearch.bulk({
	    body : bulkRequest
	}, function (err, resp) {
	  if(err)
	  	console.log(err);
	  else
	  	console.log('Bulk insertion to elastic succeed.');
	});
}

function xmlObjectsToElasticBulkRequest(xmls, params){
	var bulkRequest = [];

	videoMetadatas = xmlObjectsToVideoMetadata(xmls, params);

	videoMetadatas.forEach(function(videoMetadata){
		// efficient way to remove auto generated _id
		videoMetadata['_id'] = undefined;

		// push action
		bulkRequest.push({
			index: {
				_index: 'videometadatas',
				_type: 'videometadata'
			}
		});

		// push document
		bulkRequest.push(videoMetadata);
	});

	return bulkRequest;
}



function getFileWithPartialName(dir, entryId) {
  var videoFiles = [];
  fs.readdir(dir, function(files){
    for (var i = 0; i < files.length; i++) {
      if (path.basename(files[i]).indexOf(entryId) !== -1 + ext)
        videoFiles[] = files[i];
    }
  });
}





}