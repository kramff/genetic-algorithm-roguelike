var http = require('http');
var fs = require('fs');
var socketIO = require('socket.io');
var mime = require('mime');



function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

var server = http.createServer(function (req, res) {
	fs.readFile('.' + req.url, function (err, data) {
		if (err)
		{
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write(err.toString());
			res.end();
		}
		else
		{
			//var stats = fs.statSync('.' + req.url);
			var cType = mime.lookup('.' + req.url);
			res.writeHead(200, {'Content-Type': cType});
			res.write(data);
			//res.write(cType.toString());
			res.end();
		}
		
	});
	
	
});
server.listen(8080);

var io = socketIO.listen(server);

io.set('log level', 1);

var something = undefined;

var test1 = undefined;

var test2 = undefined;

io.sockets.on('connection', function (socket) {
	Debug("connected");
	
	socket.on("D", function (data) {
		Debug("D");
		Debug(data);
	});
	socket.on("E", function(data) {
		Debug("E");
		Debug(data);
	});

	AreaCompressor();
	socket.emit("compressedArea", compressedArea);
	EntityCompressor();
	socket.emit("compressedEntities", compressedEntities);

	var clientEntity = undefined;

	//Input
	socket.on("Input", function (data) {
		if (clientEntity)
		{
			//EntityAction(clientEntity, data);
			clientEntity.clientInput = data;
		}
	});

	socket.on("ClientData", function (data) {
		//var clientE = data;//new Entity(data.name, data.image, data.color, 15, 15);
		if (data)
		{
			clientEntity = new Entity(data.name, data.image, data.color, 15, 15);
			clientEntity.isClient = true;
			socket.emit("ClientID", clientEntity.ID);
		}
		else
		{
			Debug("Error when getting client data");
			socket.emit("ResendClientData", undefined);
		}
	});

	socket.on("EntityRequest", function (data) {
		var sendData = GetRequestedEntity(data);
		socket.emit("EntityResponse", sendData);
	});

	socket.on("MessageOut", function (data) {
		socket.broadcast.emit("MessageIn", {text:data, ID:clientEntity.ID});
		new Message(data, clientEntity);
	});
});