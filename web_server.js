/*
* Server and WebSocket to add VictorOps functionality to the LaMetric
* Copyright 2014 VictorOps, Inc.
* https://github.com/victorops/lametric/blob/master/LICENSE
*
* Author: Paige Johnson <paige.l.johns@gmail.com>
*/

var WebSocket = require('ws'); 
var _ = require('lodash'); //lodash used for getting and setting data

//server
var util = require("util"),
my_http = require("http");

var JSONReq = require('./messages.json');
var token = "MmQ1NTQ1MGRkYTY1MmY3YmQ3N2VlNTI5OWFhMzY1Yzc0OWIyZjhjZGJhNDQxZmZlOWU5ZmE0NTI3NTc3ZWFlZQ==" ; //Update to your token
var sendAckData = "to be replaced";
var EntityIDsToAck=[];
var ws = new WebSocket('wss://stchat.victorops.com/chat');

my_http.createServer(function(request,response){

    //Code in function is triggered when server is requested (URL of hosted server)
    ws.send(sendAckData);
  
    ws.on('message', function(data, flags) {
      //console.log("Socket response: \n", data);
    });

    var acknowledgeToLM = JSON.stringify(JSONReq.acknowledge);
    postLMData(acknowledgeToLM);

    setTimeout(function(){

      postLMData(JSON.stringify(JSONReq.reset));

      }, 3000); //reset to VictorOps

  EntityIDsToAck =[]; //reset the the IDs since all alerts are acknowleged
    
    response.end();

}).listen(8080); 

 
ws.on('open', function open() {  
  ws.send(JSON.stringify(JSONReq.loginRequest));
});
 
ws.on('message', function(data, flags) {

  var newData = parse(data);
  var userPaged = _.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].USERS_PAGED'); 
  var NotifyType = _.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].NOTIFICATIONTYPE'); 
  var CurrentState = _.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].CURRENT_STATE'); 
  var IncidentName = _.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].INCIDENT_NAME'); 
  var CurrentAlertPhase = _.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].CURRENT_ALERT_PHASE'); 

  if (newData.MESSAGE == "ENTITY_STATE_NOTIFY_MESSAGE" && (userPaged.indexOf(JSONReq.loginRequest.PAYLOAD.USER_ID) > -1) && CurrentAlertPhase == "UNACKED"){

      console.log(_.get(newData, 'PAYLOAD.SYSTEM_ALERT_STATE_LIST').length); //number of alerts

      //ENTITY_STATE_NOTIFY_MESSAGE.PAYLOAD.SYSTEM_ALERT_STATE_LIST always returns an array of length 1
      EntityIDsToAck.push(newData.PAYLOAD.SYSTEM_ALERT_STATE_LIST[0].ENTITY_ID); 

      console.log(EntityIDsToAck);

      var ackData = JSONReq.ackIncidentsMessage;
      _.set(ackData, 'PAYLOAD.ENTITY_IDS', EntityIDsToAck);

      sendAckData = JSON.stringify(ackData);

      var notifyString;
      if(EntityIDsToAck.length == 1){
        notifyString = (NotifyType + ": " + CurrentState + " " + "Incident #" + IncidentName);
      }
      else{
        notifyString  = ((EntityIDsToAck.length) + " " + NotifyType + "s: " + CurrentState + " " + "Incident #" + IncidentName);
      }
      var lemetricNotifyData = JSON.stringify({
      "frames": [
          {
              "index": 0,
              "text": notifyString,
              "icon": "i1897"
          }
        ]
      });

      postLMData(lemetricNotifyData);

    }
});

console.log("Server Running on 8080"); 



function postLMData(data){

    var request = require('request');
          request({
            url: "https://developer.lametric.com/api/V1/dev/widget/update/com.lametric.a08cdbaae4911c5284268644f32cc852/5", //Update to your URL
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
                console.log("PUSH DATA:", data);
  
            }
        });

};

function parse(str) {
    return JSON.parse(str.slice(str.indexOf('{')))
}









