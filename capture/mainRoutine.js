// requires
var mongoose = require('mongoose'),
    fs = require('fs'),
    VideoParams = require('./schemas/VideoParams'),
    FFmpegService = require('./services/FFmpegService'),
    Event = require('./services/EventService'),
    FileWatcher = require('./services/FileWatcherService'),
    PortListener = require('./services/PortListenerService');

module.exports = function() {
    console.log("Video recorder service is up.");
    console.log('Mongo host:', process.env.MONGO_HOST);
    console.log('Mongo port:', process.env.MONGO_PORT);
    console.log('Mongo database:', process.env.MONGO_DATABASE);
    console.log('Files storage path: ', process.env.STORAGE_PATH);

    // index used to find my videoParams object in the DB collection
    var videoParamsIndex = process.env.INDEX;

    getVideoParams(videoParamsIndex)
        .then(handleVideoSavingProcess)
        .catch(function(err) {
            if (err) console.log(err);
        });
};

// fetches videoParam object from DB
function getVideoParams(index) {

    mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE);

    return VideoParams.find()
        .then(function(videoParams) {
            // make sure videoParams exist and also our object at the specified index
            if (!videoParams)
                return Promise.reject("VideoParams does not exist in DB");
            else if (!videoParams[index])
                return Promise.reject("VideoParams has no object at index ", index);

            return Promise.resolve(videoParams[index]);
        })
};

/*
    Here all the process begin to run.
    first he will listen to the address, when he catch data streaming he will run the ffmpeg command and file watcher.
    when the ffmpeg finish his progress or the file watcher see that the file is not get bigger it will start the whole process again.
*/
function handleVideoSavingProcess(videoParam) {

    var FileWatcherTimer;

    console.log('Start listen to port: '); // still not finished.

    // Starting Listen to the address.
    PortListener.StartListenToPort({ Port: 1234, Ip: '225.0.0.1' }); /*Just For now HardCoded address*/

    /*
        +++++++++++++++++++++++++++++++++++++
                    Events Section
        +++++++++++++++++++++++++++++++++++++
    */

    // When Error eccured in one of the services.
    Event.on('error', function(err) {

        /*
            TODO: Handle the error.
        */
        console.log('the file Stoped grow');
    });

    // When the PortListenerService found some streaming data in the address.
    Event.on('StreamingData', function() {

        var CurrentPath = PathBuilder(videoParam);

        // First build are path for our new file.

        // Check if the path is exist.(our path: 'STORAGE_PATH/SourceID/CurrentDate(dd-mm-yyyy)/')
        try {

            console.log('Check if the path: ', CurrentPath, ' exist...');
            fs.accessSync(CurrentPath, fs.F_OK);
            console.log('The path is exist');

        } catch (err) {

            // if throw error then the dir is not exist.
            console.log('The path not exist...');

            // create new path.
            fs.mkdirSync(CurrentPath);
            console.log('new path create at: ', CurrentPath);

        }

        CurrentPath += '/' + GetCurrentTime() + '.ts';

        // Starting the ffmpeg process.
        console.log('Record new video at: ', CurrentPath);
        /*
            TODO: Call the ffmpeg function.
        */

        // Start to watch the file that the ffmpeg will create.
        FileWatcherTimer = FileWatcher.StartWatchFile({ Path: CurrentPath });

    });

    // When FFmpeg done his progress.
    Event.on('FFmpegDone', function() {

        // Stop the file watcher.
        console.log('ffmpeg done his progress.');
        FileWatcher.StopWatchFile(FileWatcherTimer);

        // Start the whole process again by listening to the address again.
        console.log('Start to listen the address again');
        PortListener.StartListenToPort({ Port: 1234, Ip: '225.0.0.1' }); /*Just For now HardCoded address*/

    });

    // When the source stop stream data.
    Event.on('FileWatchStop', function() {

        // Kill The FFmpeg Process.
        console.log('The Source stop stream data, Killing the ffmpeg process');
        /*
            TODO: Kill the ffmpeg process.
        */

        // Start the whole process again by listening to the address again.
        console.log('Start to listen the address again');
        PortListener.StartListenToPort({ Port: 1234, Ip: '225.0.0.1' }); /*Just For now HardCoded address*/

    });

    /*
        ++++++++++++++++++++++++++++++++++++
        ++++++++++++++++++++++++++++++++++++
    */

};



/*
    ========================================================================================
                                        Helper Methods
    ========================================================================================
*/

// build new path in the current date. e.g: STORAGE_PATH/27-05-1996
function PathBuilder(VideoObject) {
    return process.env.STORAGE_PATH + '/' + VideoObject.KaronId + '/' + GetCurrentDate();
};

// get the current date and return format of dd-mm-yyyy
function GetCurrentDate() {

    var today = new Date(),
        dd = checkTime(today.getDate()),
        mm = checkTime(today.getMonth() + 1), //January is 0!
        yyyy = today.getFullYear();

    return dd + '-' + mm + '-' + yyyy;
};

// get the current time and return format of hh-MM-ss
function GetCurrentTime() {
    var today = new Date(),
        h = checkTime(today.getHours()),
        m = checkTime(today.getMinutes()),
        s = checkTime(today.getSeconds());

    return h + '-' + m + '-' + s;
};

// helper method for the GetCurrentDate function and for the GetCurrentTime function.
function checkTime(i) {

    // Check if the num is under 10 to add it 0, e.g : 5 - 05.
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

/*
    =======================================================================================
    =======================================================================================
*/
