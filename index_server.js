//https://github.com/felixge/node-formidable
var formidable = require('formidable'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    qs = require('qs');
var app=http.createServer(handler).listen(6500);
var  io = require('socket.io').listen(app);
var url = require("url");
var spawn = require('child_process').spawn;

// var socket_clientID

var script_ffmpeg_probe='/cygdrive/c/users/alex/videos/script/ffmpeg_probe.sh'
var cygwin='c:/cygwin/bin/bash.exe'
var workDir='c:/users/alex/videos/'


         var g_socket
         
  io.sockets.on('connection', function (socket) {
                g_socket=socket;
                //console.log("### Client id: "+g_socket.id)
                //users_id=socket.id
                var welcome = {
                    status:'ready',
                    statusMessage: 'Server ready to uploading!',
                    clientID:socket.id 
                    };
                socket.emit('welcome', JSON.stringify(welcome));
                });//io.sockets.on('connection  

function handler(req, res) {
      // global var for one client
       var url_parts = url.parse(req.url, true);
       socket_clientID=url_parts.query.clientID
        console.log("=>> POST: "+url_parts.pathname)
        console.log("=> socket_clientID: "+socket_clientID)
      var fullBody = '';
      var g_format
      var g_quality

//parseFormidable(req,res);


  

 





if (url_parts.pathname == '/upload' && req.method.toLowerCase() == 'post') {
  console.log("=> POST: "+req.url)
  // var isFileBeginUpload=false;
//function parseFormidable(m_req,m_res){
// req.on('data', function(chunk) {
//       fullBody += chunk.toString();
// });//on data

// req.on('end', function() {
//   if(isFileBeginUpload==false){
//       var m_parts = qs.parse(fullBody, true);
//       console.log("=> form fullBody: "+fullBody)
//       console.log("=> Select format: "+m_parts.file)
//       console.log("=> Select format: "+m_parts.format)
//       console.log("=> Select format: "+m_parts.quality)
//     }//if isFileBeginUpload
// res.end();
// });



  var form = new formidable.IncomingForm({ uploadDir: __dirname + "/../"+'/uploads',maxFieldsSize:10000*1024*1024 });
    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    }//parse
    );//parse

form.on('field', function(name, value) {
switch(name){
    case "format": g_format=value; break;
    case "quality": g_quality=value; break;
}//switch
console.log("=> format: "+g_format+" \n => quality: "+g_quality);
});

form.on('progress', function(bytesReceived, bytesExpected) {
     var val=parseInt((bytesReceived/bytesExpected)*100);
     var progress = {
                    percent: val,
                    bytesReceived: bytesReceived,
                    bytesExpected: bytesExpected
                    };
//io.sockets.socket(socket_clientID).emit('progress_bar', JSON.stringify(progress));
//io.sockets.emit('progress_bar', JSON.stringify(progress));
//if(typeof g_socket !== "undefined"){
//g_socket.emit('progress_bar', JSON.stringify(progress));
//}//if typeof
io.sockets.on('connection', function (socket) {
socket.emit('progress_bar', JSON.stringify(progress));
});//coonnect

});// on form progress

form.on('fileBegin', function(name, file) {
  // isFileBeginUpload=true;
  console.log('=>fileBegin: \n file.name: '+file.name+'\n file.path: '+file.path+'\n file.type: '+file.type )
  var durstion=checkConvertInStreamAvailable(file.path)
});//fileBegin

form.on('error', function(err) {
  console.log('=> File upload error: '+err)
});//err

form.on('aborted', function() {
    console.log('=> File upload aborted!!!')
});

form.on('end', function() {
     console.log('=> File upload end.') 
});

//}//parseFormidable
}//if /upload

}//handler function

function checkConvertInStreamAvailable(m_path){

 var   m_ffmpeg_probe    = spawn(cygwin,['-li',script_ffmpeg_probe,'-i',m_path],{cwd:workDir});

m_ffmpeg_probe.stdout.on('data', function (data) {
    console.log('=>checkConvertInStreamAvailable: DATA: '+data)
   var json_data=JSON.parse(data)
   var m_videoInfo={
                  duration:json_data.Duration
                }//m_videoInfo
                //console.log(g_socket.id)
     io.sockets.emit('duration',JSON.stringify(m_videoInfo))
   //if(typeof g_socket !== "undefined"){
        //socket.emit('duration',JSON.stringify(m_videoInfo))
     // }//if typeof
    return JSON.stringify(m_videoInfo)
});//m_ffmpeg_probe.stdout

m_ffmpeg_probe.stderr.on('data', function (data) {
    console.log('=>checkConvertInStreamAvailable: ERROR: '+data)
});//m_ffmpeg_probe.stdout



}//checkConvertInStreamAvailable

