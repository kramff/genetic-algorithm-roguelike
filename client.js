;
//var socket = io.connect('http://130.215.239.82');

//var socket = io.connect('http://localhost:8080');
var socket = io.connect('http://130.215.239.82:8080');


socket.on("a", function (data) {
	Debug("a");
	Debug(data);
});

socket.on("b", function (data) {
	Debug("b");
	Debug(data);
});

socket.on("c", function (data) {
	Debug("c");
	Debug(data);
});

socket.on("map", function (data) {
	area = data;
});


var recievedArea = undefined;
var recievedEntities = undefined;

var areaImported = false;
var entitiesImported = false;

socket.on("compressedArea", function (data) {
	recievedArea = data;
	Debug("Got comp. area");
	ImportArea();
	areaImported = true;
	if (entitiesImported)
	{
		PlaceEntities();
		areaImported = false;
		entitiesImported = false;
	}
});


socket.on("compressedEntities", function (data) {
	recievedEntities = data;
	Debug("Got comp. entities");
	ImportEntities();
	entitiesImported = true;
	if (areaImported)
	{
		PlaceEntities();
		areaImported = false;
		entitiesImported = false;
	}
});

function ImportArea () {
	area = recievedArea;
	for (var i = 0; i < area.length; i++) {
		for (var j = 0; j < area[i].length; j++) {
			var tile = area[i][j];
		
			tile.entities = [];
			tile.effects = [];
			tile.items = [];
			tile.tNumber = -1;
			tile.eDrawn = false;
		}
	}
}

function ImportEntities () {
	entityList = recievedEntities;
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		entity.GetTile = function () {
			return area[this.x][this.y];
		};
	}
}

function PlaceEntities () {
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		entity.GetTile().entities.push(entity);
	}
	SendPlayerData();
	SetUpRender();
}

function SendKeyInput (key) {
	socket.emit("Input", key);
}

function SendPlayerData () {
	Debug(player);
	socket.emit("ClientData", player);
}

socket.on("ResendClientData", function (data) {
	SendPlayerData();
});

var myID = undefined;
var pEntitySet = false;

socket.on("ClientID", function (ID) {
	myID = ID;
	SetPlayerEntity();
});

function SetPlayerEntity () {
	for (var i = 0; i < entityList.length; i++) {
		var entity = entityList[i];
		if (entity.ID == myID)
		{
			player = entity;
			promptMessage = new Message(">_", player);
			pEntitySet = true;
			return;
		}
	};
};

socket.on("EntityUpdate", function (data) {
	GetEntityUpdates(data);
});

function GetEntityUpdates (updateList) {
	for (var i = 0; i < updateList.length; i++) {
		var update = updateList[i];
		if (!update.alive) {
			EntityDieByID(update.ID)
		}
		else
		{
			EntityMoveByID(update.ID, update.x, update.y);
		}
	}
	//New input needed
	needToSendKey = true;
}

function EntityDieByID (deadID) {
	Debug("Somone ded");
	for (var i = 0; i < entityList.length; i++) {
		var entity = entityList[i];
		if (entity.ID == deadID)
		{
			//can use EntityDie() function?
			//EffectDie(entity);

			var tile = entity.GetTile();
			tile.entities.splice(tile.entities.indexOf(entity), 1);
			entityList.splice(entityList.indexOf(entity), 1);
			return;
		}
	}
}

function EntityMoveByID (moveID, toX, toY) {
	//Debug("Someone moved, moveID: " + moveID + ", toX: " + toX + ", toY: " + toY);
	for (var i = 0; i < entityList.length; i++) {
		var entity = entityList[i];
		if (entity.ID == moveID)
		{
			ChangePosition(entity, toX, toY);
			var tile = entity.GetTile();
			return;
		}
	}
	//Not in known list of entities, request this entity
	socket.emit("EntityRequest", moveID);
}

socket.on("EntityResponse", function (data) {
	GetAdditionalEntity(data);
});

function GetAdditionalEntity (entity) {
	entityList.push(entity);
	entity.GetTile = function () {
		return area[this.x][this.y];
	};
	entity.GetTile().entities.push(entity);
	DrawTileContent(entity.GetTile());

	if (!pEntitySet)
	{
		SetPlayerEntity();
	}
}

socket.on("EffectUpdate", function (data) {
	GetEffectUpdates(data);
	//Debug(data);
});

function GetEffectUpdates (updateList) {
	for (var i = 0; i < updateList.length; i++) {
		var getEffect = updateList[i];
		new Effect(getEffect.imageList, getEffect.delay, getEffect.color, getEffect.x, getEffect.y);

	}
}

socket.on("MessageIn", function (data) {
	for (var i = 0; i < entityList.length; i++) {
		var entity = entityList[i];
		if (entity.ID == data.ID)
		{
			new Message(data.text, entity);
			return;
		}
	}
});

function SendMessage (text) {
	socket.emit("MessageOut", messageInput);
}