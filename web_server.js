var WebSocket = require('ws'); 
var _ = require('lodash'); //lodash used for getting and setting data

//server
var util = require("util"),
my_http = require("http");

var JSONReq = require('./messages.json');
var entityID = "to be replaced"
var postData = 'empty'
var token = "MmQ1NTQ1MGRkYTY1MmY3YmQ3N2VlNTI5OWFhMzY1Yzc0OWIyZjhjZGJhNDQxZmZlOWU5ZmE0NTI3NTc3ZWFlZQ==" ; //You're Lametric Token
var newdata = JSON.stringify(JSONReq.ackIncidentsMessage);
var newAckData = JSON.stringify(JSONReq.ackIncidentsMessage);
var sendAckData = JSON.stringify(JSONReq.ackIncidentsMessage);
var logData = JSON.stringify(JSONReq.loginRequest);
var ackData = JSON.stringify(JSONReq.ackIncidentsMessage);
var timelineReq = JSON.stringify(JSONReq.timelineRequestFromEnd);

var acknowlege = JSON.stringify({
    "frames": [
      {
          "index": 0,
          "text": "Alert Acknowleged",
          "icon": "i1896"
      }
    ]
    });

my_http.createServer(function(request,response){

    //Code in function is triggered when server is kicked (URL of hosted server)

    var wsACK = new WebSocket('wss://stchat.victorops.com/chat');
    
    wsACK.on('open', function open() {  
      //console.log("sendAckData: \n", sendAckData);
      ws.send(sendAckData);
    });

    ws.on('message', function(data, flags) {
      //console.log("Socket response: \n", data);
    });

    //Acknolege alert
    var request = require('request');
      request({
        url: "https://developer.lametric.com/api/V1/dev/widget/update/com.lametric.a08cdbaae4911c5284268644f32cc852/5",
        method: "POST",   
        headers: {
          'Accept': 'application/json',
          'X-Access-Token': token,
          'Cache-Control': 'no-cache'
        },

         body: acknowlege,
      
    }, function (error, response, body){
        if(error) {
            console.log(error);
     
        } else {
            console.log(response.statusCode, body);   
        }
    });


   console.log("Server Kicked");
    
    response.end();

}).listen(8080); 

var ws = new WebSocket('wss://stchat.victorops.com/chat');
 
ws.on('open', function open() {  
  ws.send(logData);
});
 
ws.on('message', function(data, flags) {

  newdata=JSON.parse(data.slice(data.indexOf('{')));

  var userPaged = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].USERS_PAGED'); 

  var NotifyType = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].NOTIFICATIONTYPE'); 
  var CurrentState = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].CURRENT_STATE'); 
  var IncidentName = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].INCIDENT_NAME'); 
  var CurrentAlertPhase = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].CURRENT_ALERT_PHASE'); 
  var AlertNum = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].ALERT_COUNT'); 
  var EntityID = _.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].ENTITY_ID'); 
  var Notify = (NotifyType + ": " + CurrentState + " " + "Incident #" + IncidentName + " " + AlertNum);


  if (newdata.MESSAGE == "ENTITY_STATE_NOTIFY_MESSAGE" && (userPaged.indexOf(JSONReq.loginRequest.PAYLOAD.USER_ID) > -1) && CurrentAlertPhase == "UNACKED"){
        console.log(_.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST').length);
      newAckData=JSON.parse(ackData.slice(ackData.indexOf('{')));
      _.set(newAckData, 'PAYLOAD.ENTITY_IDS[0]', EntityID);
      sendAckData = JSON.stringify(newAckData);

      var postData = JSON.stringify({
      "frames": [
          {
              "index": 0,
              "text": Notify,
              "icon": "i1897"
          }
        ]
      });

      var request = require('request');
        request({
          url: "https://developer.lametric.com/api/V1/dev/widget/update/com.lametric.a08cdbaae4911c5284268644f32cc852/5",
          method: "POST",   
          headers: {
            'Accept': 'application/json',
            'X-Access-Token': token,
            'Cache-Control': 'no-cache'
          },
           body: postData,
        
      }, function (error, response, body){
          if(error) {
              console.log(error);
          } else {
              console.log(response.statusCode, body);
          }
      });
    }
});

console.log("Server Running on 8080"); 




function reset(){

    var reset = JSON.stringify({
        "frames": [
          {
              "index": 0,
              "text": "victorops",
              "icon": "i1896"
          }
        ]
        });



    var request = require('request');
          request({
            url: "https://developer.lametric.com/api/V1/dev/widget/update/com.lametric.a08cdbaae4911c5284268644f32cc852/5",
            method: "POST",   
            headers: {
              'Accept': 'application/json',
              'X-Access-Token': token,
              'Cache-Control': 'no-cache'
            },

             body: reset,
          
        }, function (error, response, body){
            if(error) {
                console.log(error);
            } else {
                console.log(response.statusCode, body);   
            }
        });

};















