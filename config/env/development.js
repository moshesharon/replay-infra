/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
/*var blueprints = require('.././blueprints').blueprints;
var port = process.env.PORT || 1337;
var baseUrl = 'http://localhost';*/
var MONGO_DATABASE='replay_dev' ;
var STORAGE_PATH='/tmp' ;
var QUEUE_NAME='FinishedVideos' ;

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  mongoDataBase : MONGO_DATABASE ,
  storagePath   : STORAGE_PATH,
  queue_name    : QUEUE_NAME,
  elasticHost   : 'localhost',
  elasticPort   : 9200,
  mongoHost     : 'localhost',
  mongoPort     : 27017,
  redisHost     : 'localhost',
  redisPort     : 6379,
  redisPassword : '',
  jobType       : 'OnVideoFinish'


  /*port: port,

  settings: {
  	baseUrl: baseUrl + ':' + port,
  	apiUrl: baseUrl + ':' + port + blueprints.restPrefix,

    services: {
      kaltura: {
        url: 'http://vod.linnovate.net',
        partner_id: 101,
        
      },
      google: {
        clientID: '726385581494-3te31aa3t09polsm5paeg4eeh9qgbcgl.apps.googleusercontent.com'
      },
      wowza: {
        url: 'http://vod.linnovate.net',
        port: '1935',
        appName: 'weplay',
        contentDirectory: 'kaltura_content'
      }
    }*/

  };

  
  

