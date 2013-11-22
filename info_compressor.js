var compressedArea = [];

function AreaCompressor () {
	compressedArea = [];
	for (var i = 0; i < area.length; i++)
	{
		compressedArea.push([]);
		for (var j = 0; j < area[i].length; j++)
		{
			var tile = area[i][j];
			compressedArea[i].push({type:tile.type, tileset:tile.tileset, color:tile.color, x:i, y:j});
		}
	}
}

var compressedEntities = [];

function EntityCompressor () {
	compressedEntities = [];
	for (var i = 0; i < entityList.length; i++)
	{
		var entity = entityList[i];
		compressedEntities.push({ID:entity.ID, name:entity.name, image:entity.image, color:entity.color, x:entity.x, y:entity.y});
	}
}

var compressedItems = [];

//do this eventually
function ItemCompressor () {
	compressedItems = [];
}


//For updates, only send needed details

var entityUpdateList = [];

function UpdateEntity (entity) {
	entityUpdateList.push({ID:entity.ID, x:entity.x, y:entity.y, alive:(entity.HP > 0)});
}

function SendEntityUpdates () {
	io.sockets.emit("EntityUpdate", entityUpdateList);
	entityUpdateList = [];
}

function GetRequestedEntity (reqID) {
	for (var i = 0; i < entityList.length; i++) {
		var entity = entityList[i];
		if (entity.ID == reqID)
		{
			var sendData = {ID:entity.ID, name:entity.name, image:entity.image, color:entity.color, x:entity.x, y:entity.y};
			return sendData;
		}
	};
}

var effectUpdateList = [];

//Implement shortcuts so the whole imagelist isn't transmitted each time?
function UpdateEffect (effect) {
	effectUpdateList.push({imageList:effect.imageList, delay:effect.delay, color:effect.color, x:effect.x, y:effect.y});
}

function SendEffectUpdates () {
	io.sockets.emit("EffectUpdate", effectUpdateList);
	effectUpdateList = [];
}

function SendMessage (mesgText) {
	io.sockets.emit("MessageIn", {text:mesgText, ID:player.ID});
}