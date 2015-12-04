/*
* Server and WebSocket to add VictorOps functionality to the LaMetric
*
*/

//STILL FREAKS OUT WHEN ALERTS COME IN REALLY FAST

var WebSocket = require('ws'); 
var _ = require('lodash'); //lodash used for getting and setting data

//server
var util = require("util"),
my_http = require("http");

var JSONReq = require('./messages.json');
var token = "MmQ1NTQ1MGRkYTY1MmY3YmQ3N2VlNTI5OWFhMzY1Yzc0OWIyZjhjZGJhNDQxZmZlOWU5ZmE0NTI3NTc3ZWFlZQ==" ; //The Lametric Token
var newdata = JSON.stringify(JSONReq.ackIncidentsMessage);
var newAckData = JSON.stringify(JSONReq.ackIncidentsMessage);
var sendAckData = JSON.stringify(JSONReq.ackIncidentsMessage);
var logData = JSON.stringify(JSONReq.loginRequest);
var ackData = JSON.stringify(JSONReq.ackIncidentsMessage);
var timelineReq = JSON.stringify(JSONReq.timelineRequestFromEnd);
var acknowledge = JSON.stringify(JSONReq.acknowledge);
var reset = JSON.stringify(JSONReq.reset);

var EntityID=[];

my_http.createServer(function(request,response){

    //Code in function is triggered when server is kicked (URL of hosted server)

    var wsACK = new WebSocket('wss://stchat.victorops.com/chat');
    
    wsACK.on('open', function open() {  
      ws.send(sendAckData);
    });

    ws.on('message', function(data, flags) {
      //console.log("Socket response: \n", data);
    });

    pushData(acknowledge);

    setTimeout(function(){pushData(reset);}, 3000); //reset to VictorOps

  EntityID =[]; //reset the the IDs since all alerts are acknowleged


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


  if (newdata.MESSAGE == "ENTITY_STATE_NOTIFY_MESSAGE" && (userPaged.indexOf(JSONReq.loginRequest.PAYLOAD.USER_ID) > -1) && CurrentAlertPhase == "UNACKED"){
      newAckData=JSON.parse(ackData.slice(ackData.indexOf('{')));
      console.log(_.get(newdata, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST').length); //number of alerts

      EntityID.push(newdata.PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].ENTITY_ID); 

      console.log(EntityID);

      _.set(newAckData, 'PAYLOAD.ENTITY_IDS', EntityID);

      sendAckData = JSON.stringify(newAckData);

      var Notify;
      if(EntityID.length == 1){
        Notify = (NotifyType + ": " + CurrentState + " " + "Incident #" + IncidentName);
      }
      else{
        Notify = ((EntityID.length) + " " + NotifyType + "s: " + CurrentState + " " + "Incident #" + IncidentName);
      }

      var notifyData = JSON.stringify({
      "frames": [
          {
              "index": 0,
              "text": Notify,
              "icon": "i1897"
          }
        ]
      });

      pushData(notifyData);

    }
});

console.log("Server Running on 8080"); 

function pushData(data){

    var request = require('request');
          request({
            url: "https://developer.lametric.com/api/V1/dev/widget/update/com.lametric.a08cdbaae4911c5284268644f32cc852/5",
            method: "POST",   
            headers: {
              'Accept': 'application/json',
              'X-Access-Token': token,
              'Cache-Control': 'no-cache'
            },

             body: data,
          
        }, function (error, response, body){
            if(error) {
                console.log(error);
            } else {
                console.log(response.statusCode, body);   
            }
        });

};











