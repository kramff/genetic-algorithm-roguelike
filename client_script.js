// adv roguelike
// Copyright Mark Foster 2013
// All Rights Reserved


// Much work transfered from ADV 3D project

var cursorVisible = true;

var spellsInstruction = false;

function ShowSpellsInstructions () {
	if (spellsInstruction)
	{
		return;
	}
	spellsInstruction = true;
	document.getElementById("how").src = "how_to_play_spells.png";
}

// Canvas and context declaration
var canvas = document.getElementById('Canvas2D');
var ctx = canvas.getContext('2d');
// Size of canvas (pixels)
var CANVAS_WIDTH = 630;
var CANVAS_HEIGHT = 630;

// Size of area (two-dimensional array of Tile objects)
var AREA_SIZE = 35; //both, for when i'm lazy
var AREA_WIDTH = 35;
var AREA_HEIGHT = 35;

// True after doing Init function
var ready = false;
// True after setting up render canvases
var renderReady = false;

// Message input variables
var enterPressed = false;
var writingMessage = false;
var messageInput = "";
var shiftPressed = false;
// Created after player entity is ready
var promptMessage;
// Used to detect when to make promptMessage spiffy
var isPromptMagic = false;
var textGlow = 0;

// Game data arrays
var area = [];
var entityList = [];
var messages = [];
var effectList = [];
var itemList = [];

//Turn based timing stuff
var playerMoved = false;
var npcMoveWait = 0;
var playerMoveWait = 0;

var inputDelay = 10;

//Network input stuff
var lastKeySent = "";
var needToSendKey = true;


// Canvas for Tiles
var tCanvas = document.createElement('canvas');
tCanvas.setAttribute("id", "t canvas");
tCanvas.width = 30 * AREA_WIDTH;
tCanvas.height = 30 * AREA_HEIGHT;
var tctx = tCanvas.getContext('2d');

// Canvas for everything else: Entities, Effects, Items
var eCanvas = document.createElement('canvas');
eCanvas.setAttribute("id", "e canvas");
eCanvas.width = 30 * AREA_WIDTH;
eCanvas.height = 30 * AREA_HEIGHT;
var ectx = this.eCanvas.getContext('2d');

// Camera and target camera positions
var cameraX = 30;
var cameraY = 30;
var targetX = 30;
var targetY = 30;

// Mouse position and movement key booleans

var keyPressedOrder = [];

var mouseX = 250;
var mouseY = 250;
var wKey = false;
var aKey = false;
var sKey = false;
var dKey = false;
var upKey = false;
var downKey = false;
var leftKey = false;
var rightKey = false;
var releasedAttack = false;


// Tile types:
var EMPTY = 0;
var WALL = 1;
var FLOOR = 2;
var OTHER = 3;

// Tile constructor function
// A Tile represents a piece of the world.
function Tile (type, tileset, tNumber, color, x, y) {
	// type: type of tile (EMPTY, WALL, FLOOR, etc)
	this.type = type;
	// tileset: which tileset to use (name of image)
	this.tileset = tileset;
	// tNumber: Which tile in the tileset to use
	this.tNumber = -1;
	// color: What color is this tile
	this.color = color;
	// x, y, : Where is this tile located. (Matches up with area[x][y] coordinates)
	this.x = x;
	this.y = y;
	// content: What entities / other stuff are currently in this tile
	// (Array of Entities)
	// (Other things? ***)
	this.entities = [];
	this.effects = [];
	this.items = [];
	// eDrawn: Indicates if this tile's contents have been drawn already on the e layer
	this.eDrawn = false;
}

// Entity constructor function
// An Entity is a person or creature in the world
function Entity (name, image, color, x, y) {
	this.ID = -1;//Not valid, or something
	/*if (symbol.length != 1)
	{
		Debug("Entity constructor failed: symbol too long/short");
		return;
	}*/
	if (!ready)
	{
		Debug("Entity constructor failed: not ready!");
		return;
	}
	// name: What is the name of this entity. (Example: "Skeleton")
	this.name = name;
	// image: Which image to display for this entity
	this.image = image;
	// color: What color is this entity
	this.color = color;
	// x, y, z: Current coordinates of this entity. (Area coordinates.)
	// (Also, the content of that tile will have this entity in its content array)
	this.x = x;
	this.y = y;

	area[x][y].entities.push(this);
	entityList.push(this);
	// GetTile(): Returns the tile this entity is currently in
	this.GetTile = function () {
		return area[this.x][this.y];
	};

	if (renderReady)
	{
		//DrawTileContent(this.GetTile());
	}
}


// Item types:

// Item: Something for the player collect or interact with
// Uses the images in the Effect folder
function Item (type, image, color, x, y)
{
	if (!CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return;
	}
	this.type = type;
	this.image = image;
	this.color = color;
	this.x = x;
	this.y = y;
	//this.z = z;
	//area[x][y];
	//this.screenX = x * 30 - 4;
	//this.screenY = y * 30 + 30 - 21;

	//this.lctx = layerList[z].ectx;
	
	area[x][y].items.push(this);
	itemList.push(this);
	this.GetTile = function () {
		return area[this.x][this.y];
	};
	//layerList[z].items.push(this);
	//layerList[z].eNeedsUpdate = true;
	//layerList[z].eDrawOn = true;
	if (renderReady)
	{
		DrawTileContent(this.GetTile());
	}
}

function RemoveItem (item) {
	var tile = item.GetTile();
	tile.items.splice(tile.items.indexOf(item), 1);
	itemList.splice(itemList.indexOf(item), 1);
	DrawTileContent(tile);
}


// for decorative effects that the player doesn't interact with
// NEEDS FIXITUPS? OR IS IT OKAY NOW
function Effect (imageList, delay, color, x, y)
{
	/*
	if (Math.abs(x - cameraX) > 12 || Math.abs(y - cameraY) > 12)
	{
		if (Math.abs(x - player.x) > 12 || Math.abs(y - player.y) > 12)
		{
			//Too far away too see, skip doing anything
			return;
		}
	}*/
	if (!CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return;
	}
	this.imageList = imageList;
	this.delay = delay;
	this.MAX_DELAY = delay;
	this.color = color;
	this.x = x;
	this.y = y;

	
	
	area[x][y].effects.push(this);
	effectList.push(this);
	this.GetTile = function () {
		return area[this.x][this.y];
	};
	//layerList[z].effects.push(this);
	//layerList[z].eNeedsUpdate = true;
	//layerList[z].eDrawOn = true;
	if (renderReady)
	{
		DrawTileContent(this.GetTile());
	}
}

// Message constructor function
// Used to display text boxes 
function Message (text, entity)
{
	if (text.length == 0)
	{
		Debug("Message constructor failed: text too short");
		return;
	}
	if (!ready)
	{
		Debug("Message constructor failed: not ready!");
		return;
	}
	// text: the content of the message
	this.text = text;
	// entity: the entity associated with this message (who said it)
	this.entity = entity;
	// fade: time (frames) until gone. (Decremented)
	// (0 through -50 are partially transparent. after that, it is removed from the messages array)
	this.fade = 200;
	// x, y, boxWidth, boxHeight: display position and size of the textbox
	// (x and y do smooth-ish movement to targetX and targetY)
	this.x = EntityScreenX(entity) + 8;
	this.y = EntityScreenY(entity) - 0;
	this.boxWidth = text.length * 10 + 6;
	this.boxHeight = 16;
	// color: What color is the text & textbox. (based on entity's color)
	this.color = entity.color;
	// This section: add the message to the messages array, while maintaining the promptMessage's position.
	var prompt = messages.pop();
	messages.push(this);
	if (prompt)
	{
		messages.push(prompt);
	}
	// Functions for determining update positions
	this.FixPosX = function () {
		this.targetX = EntityScreenX(entity) + 8;
	};
	this.FixPosY = function () {
		this.targetY = EntityScreenY(entity) - 0;
	};
	// targetX, targetY: "real" screen positions
	this.targetX = this.x;
	this.targetY = this.y;
	// send message to all entities
	/*for (var i = 0; i < entityList.length; i++)
	{
		var toEntity = entityList[i];
		if (toEntity != entity)
		{
			toEntity.inMesgQueue.push(this);
		}
	}*/
	this.glow = false;
	this.glowColor = "#000000";
}

// Fills the area array with tiles, and does basic map-making.
// Then, calls SetUpConnections() on each tile
function SetUpArea () {
	var i;
	var j;
	var k;
	for (i = 0; i < AREA_WIDTH; i++)
	{
		area.push(new Array());
		
		for (j = 0; j < AREA_HEIGHT; j++)
		{
			area[i].push(new Tile(FLOOR, "nice", 1, BlendColors("#404040", "#808080", (i + j) % 2 ), i, j));
		}
	}
}

var player;

// Make a bunch of entities.
// Also, create promptMessage.
function SetUpEntities () {
	
	player = new Entity("Player", "player", RandomColor(), 15, 15);
	cameraX = 15.5;
	cameraY = 15.5;
	//cameraZ = player.z;
	targetX = 15.5;
	targetY = 15.5;
	//targetZ = player.z;
	promptMessage = new Message(">_", player);
	//new Item(0, "circle3", "#00FF00", 18, 19);
	//new Effect(["circle1", "circle2", "circle3"], 10, "#FF00FF", 19, 19);

}


// Test if all of an array of numbers are within a range
// Inclusive is okay (4 is within the bounds of 4 to 8)
// True if within the limits
function CheckBounds (botLimit, topLimit, testArray) {
	for (var i = 0; i < testArray.length; i ++)
	{
		if (testArray[i] < botLimit || testArray[i] > topLimit)
		{
			return false;
		}
	}
	return true;
}

// Test if a color is valid for use.
// ( "#123456" format)
function ColorValid (color) {
	//I didn't make this
	//http://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
	var test = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
	if (test)
	{
		return true;
	}
	return false;
}

// Set up the canvas layer for each Z layer
function SetUpRender () {
	tctx.clearRect(0, 0, 30 * AREA_WIDTH, 30 * AREA_HEIGHT);
	for (var im = 0; im < imageSources.length; im ++)
	{
		new FilteredImage(imageSources[im]);
	}
	for (var i = 0; i < AREA_WIDTH; i++)
	{
		for (var j = 0; j < AREA_HEIGHT; j++)
		{
			var tile = area[i][j];
			/*if (tile.color != color)
			{
				color = tile.color;
				newCtx.fillStyle = color;
			}*/
			tile.previousType = tile.type;
			GetTileNumber(tile);
			if (tile.type == FLOOR)
			{
				tctx.drawImage(filteredImages[GetFloorImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			else if (tile.type == WALL)
			{
				tctx.drawImage(filteredImages[GetWallImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			else if (tile.type == OTHER)
			{
				tctx.drawImage(filteredImages[GetOtherImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
			tile.previousTNumber = tile.tNumber;
			tile.previousType = tile.type;
			tile.previousTileset = tile.tileset;
			tile.previousColor = tile.color;
		}
	}
	RenderLayerE();
	renderReady = true;
}

// Clears then re-draws the tile on the correct canvas layer
function RenderTile (tile) {
	if (!tile)
	{
		return;
	}
	//ClearTile(tile);
	DrawTile(tile);
}

function RenderAdjacentTiles (tile) {
	if (tile.y > 0)
	{
		RenderTile(area[tile.x][tile.y-1]);
	}
	if (tile.y < AREA_HEIGHT - 1)
	{
		RenderTile(area[tile.x][tile.y+1]);
	}
	if (tile.x > 0)
	{
		RenderTile(area[tile.x-1][tile.y]);
		if (tile.y > 0)
		{
			RenderTile(area[tile.x-1][tile.y-1]);
		}
		if (tile.y < AREA_HEIGHT - 1)
		{
			RenderTile(area[tile.x-1][tile.y+1]);
		}
	}
	if (tile.x < AREA_WIDTH - 1)
	{
		RenderTile(area[tile.x+1][tile.y]);
		if (tile.y > 0)
		{
			RenderTile(area[tile.x+1][tile.y-1]);
		}
		if (tile.y < AREA_HEIGHT - 1)
		{
			RenderTile(area[tile.x+1][tile.y+1]);
		}
	}
}

// Erases the tile's rendering on it's canvas layer
function ClearTile (tile) {
	if (!tile)
	{
		return;
	}
	tctx.clearRect(tile.x * 30, tile.y * 30, 30, 30);
}

// Draws the tile on its corresponding canvas layer
function DrawTile (tile) {
	//Debug("test");
	if (!tile)
	{
		return;
	}
	GetTileNumber(tile);
	if (tile.tNumber != tile.previousTNumber || tile.type != tile.previousType || tile.tileset != tile.previousTileset || tile.color != tile.previousColor)
	{
		ClearTile(tile);
		if (tile.type == FLOOR)
		{
			tctx.drawImage(filteredImages[GetFloorImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		else if (tile.type == WALL)
		{
			tctx.drawImage(filteredImages[GetWallImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		else if (tile.type == OTHER)
		{
			tctx.drawImage(filteredImages[GetOtherImage(tile.tileset)].GetColor(tile.color), tile.tNumber * 30, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
		}
		if (tile.previousType != tile.type)
		{
			RenderAdjacentTiles(tile);
		}
		tile.previousTNumber = tile.tNumber;
		tile.previousType = tile.type;
		tile.previousTileset = tile.tileset;
		tile.previousColor = tile.color;
	}
	return;
}

// Draws all entitites, items, and effects on this tile
function DrawTileContent (tile)
{
	ectx.clearRect(30 * tile.x, 30 * tile.y, 30, 30);

	if (tile.items.length != 0)
	{
		for (var c = 0; c < tile.items.length; c ++)
		{
			var xDraw = 30 * tile.x;
			var yDraw = 30 * tile.y;
			var item = tile.items[c];
			ectx.drawImage(filteredImages[GetEffectImage(item.image)].GetColor(item.color), 0, 0, 30, 30, xDraw, yDraw, 30, 30);
		}
	}
	if (tile.entities.length != 0)
	{
		for (var c = 0; c < tile.entities.length; c ++)
		{
			var xDraw = 30 * tile.x;
			var yDraw = 30 * tile.y;
			var entity = tile.entities[c];
			ectx.drawImage(filteredImages[GetEntityImage(entity.image)].GetColor(entity.color), 0, 0, 30, 30, xDraw, yDraw, 30, 30);
		}
	}
	if (tile.effects.length != 0)
	{
		for (var c = 0; c < tile.effects.length; c ++)
		{
			var effect = tile.effects[c];
			if (effect.imageList[0] != "")
			{
				ectx.drawImage(filteredImages[GetEffectImage(effect.imageList[0])].GetColor(effect.color), 0, 0, 30, 30, 30 * tile.x, 30 * tile.y, 30, 30);
			}
		}
	}
}

// Draw stuff
function RenderLayerE ()
{
	for (var i = 0; i < entityList.length; i++)
	{
		DrawTileContent(entityList[i].GetTile());
		//turnLayerOff = false;
	}
	for (var i = 0; i < effectList.length; i++)
	{
		DrawTileContent(effectList[i].GetTile());
		//turnLayerOff = false;
	}
	for (var i = 0; i < itemList.length; i++)
	{
		DrawTileContent(itemList[i].GetTile());
		//turnLayerOff = false;
	}
}


// Initializer function
function Init () {
	ready = true;
	SetUpArea();
	SetUpEntities();
	SetUpRender();

	// Render and update loop
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
	})();
	requestAnimFrame(Update);

}

// Main update loop
function Update () {
	if (!ready)
	{
		return;
	}
	Control();
	//Action();
	//ItemAction(); //Only use for glowing items?
	ProcessEffects();
	Render();
	requestAnimFrame(Update);
	VolumeAdjust();
};

// Player movement with WASD
function Control () {
	var keyToSend = "";
	if (keyPressedOrder.length > 0)
	{
		keyToSend = keyPressedOrder[0];
	}
	else
	{
		keyToSend = "";
	}
	SendKeyInput(keyToSend);
	/*
	if (needToSendKey || lastKeySent != keyToSend)
	{
		needToSendKey = false;
		lastKeySent = keyToSend;
		SendKeyInput(keyToSend);
	}*/
}




// Iterate through entities, do movement and other per-frame interactions
// NOW TURN BASED
function Action () {
	return;
	//It's all in the host script
}

function ItemAction () {
	return; // not now
	//Only use for glowing items?
	/*for (var i = 0; i < itemList.length; i++)
	{
		var item = itemList[i];
		if (item.type == FALL)
		{
			var curTile = item.GetTile();
			if (curTile.type == FLOOR || curTile.type == WALL || item.z == AREA_DEPTH - 1)
			{
				// Dissapear and "splash"
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].items.splice(layerList[item.z].items.indexOf(item), 1);
				item.GetTile().items.splice(item.GetTile().items.indexOf(item), 1);
				itemList.splice(i, 1);
				i --;
			}
			else
			{
				// Fall down one layer
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].items.splice(layerList[item.z].items.indexOf(item), 1);
				item.GetTile().items.splice(item.GetTile().items.indexOf(item), 1);
				item.z ++;
				layerList[item.z].eNeedsUpdate = true;
				layerList[item.z].eDrawOn = true;
				layerList[item.z].items.push(item);
				item.GetTile().items.push(item);
			}
		}
	}*/
}



// Actually move an entity to a location.
// (Assumes new position is valid)
// (Updates tile content data correctly)
function ChangePosition (entity, newX, newY)
{
	if (!CheckBounds(0, AREA_SIZE - 1, [newX, newY]))
	{
		Debug("ChangePosition failed: outside bounds");
		return;
	}

	var prevTile = area[entity.x][entity.y];
	var newTile = area[newX][newY];
	var index = prevTile.entities.indexOf(entity);
	if (index == -1)
	{
		Debug("Change position failed: entity not in previous location?");
		return;
	}

	prevTile.entities.splice(index, 1);
	newTile.entities.push(entity);
	entity.x = newX;
	entity.y = newY;
	DrawTileContent(prevTile);
	DrawTileContent(newTile);

	//RenderTile(prevTile);
	//RenderTile(newTile);
}


// Go through all the effects
function ProcessEffects () {
	for (var i = 0; i < effectList.length; i++)
	{
		var effect = effectList[i];
		effect.delay --;
		if (effect.delay <= 0)
		{
			effect.delay = effect.MAX_DELAY;
			effect.imageList.shift();
			if (effect.imageList.length == 0)
			{
				//layerList[effect.z].eNeedsUpdate = true;
				//layerList[effect.z].effects.splice(layerList[effect.z].effects.indexOf(effect), 1);
				var tile = effect.GetTile();
				tile.effects.splice(tile.effects.indexOf(effect), 1);
				effectList.splice(i, 1);
				i--;
				//RenderTile(tile);
				DrawTileContent(tile);
			}
			else
			{
				DrawTileContent(effect.GetTile())
				//layerList[effect.z].eNeedsUpdate = true;
			}
		}
	}
	return;
}

// Clear the canvas
function Clear () {
	// Clear screen
	ctx.clearRect(0, 0, 630, 630);
	//canvas.width = canvas.width;
	return;
	//Headache mode
	SetColor("#000000");
	SetAlpha(0.5);
	ctx.fillRect(0, 0, 630, 630);
}

// Set Color State function
// Changes ctx's color only if necessary
var ctxColor = "#000000";
function SetColor(color)
{
	if (color != ctxColor)
	{
		ctxColor = color;
		ctx.fillStyle = color;
	}
}

// Set Alpha State function
// Changes ctx's alpha only if necessary
var ctxAlpha = 1;
function SetAlpha(alpha)
{
	if (alpha != ctxAlpha)
	{
		ctxAlpha = alpha;
		ctx.setAlpha(alpha);
	}
}

var myX = 1;
var myY = 30;
// Rendering function.
// 1. Clear screen
// 2. Adjust camera
// 3. Draw 3D grid of tiles
// 4. Reposition text boxes
// 5. Draw text boxes
var ff = 0;
function Render () {
	if (ff <= -6)
	{
		ff = 6;
		//return;
	}
	ff -= 0.1;
	
	if (!ready)
	{
		return;
	}
	Clear();
	
	// Camera Adjustment
	// targetX = player.x + 0.25;
	// targetY = player.y + 0.75;
	// targetZ = player.z;


	targetX = (player.x + 0.5 + targetX * 4) * 0.2;
	targetY = (player.y + 0.5 + targetY * 4) * 0.2;
	

	cameraX = (targetX + cameraX * 4) * 0.2;
	cameraY = (targetY + cameraY * 4) * 0.2;
	
	//targetX = player.x + 0.5;
	//targetY = player.y + 0.5;
/*
	if (targetX > cameraX)
	{
		cameraX += 1 / 30;
		if (cameraX > targetX)
		{
			cameraX = targetX;
		}
	}
	if (targetX < cameraX)
	{
		cameraX -= 1 / 30;
		if (cameraX < targetX)
		{
			cameraX = targetX;
		}
	}
	if (targetY > cameraY)
	{
		cameraY += 1 / 30;
		if (cameraY > targetY)
		{
			cameraY = targetY;
		}
	}
	if (targetY < cameraY)
	{
		cameraY -= 1 / 30;
		if (cameraY < targetY)
		{
			cameraY = targetY;
		}
	}*/

	//Draw 3D grid of tiles - canvas layer method
	//for (var zi = Math.min(AREA_DEPTH - 1, Math.floor(cameraZ) + 18); zi > Math.max(-1, Math.floor(cameraZ) - 18); zi--)
	//{
		//var layer = layerList[zi];
		//if (layer.tDrawOn || layer.eDrawOn)
		//{
			//SetAlpha((player.z == zi) ? 1 : Math.max(1 - Math.abs(zi - cameraZ) * .05 - 0.15, 0));
			//SetAlpha(Math.max(1 - Math.abs(zi - cameraZ) * .05 - 0.15, 0));
			SetAlpha(1);
			//var canvDraw = layerList[zi].tCanvas;
			var clipW = 630;//30000 / (50 - zi + cameraZ);
			var clipH = clipW;
			var baseClipW = clipW;
			var baseClipH = clipH;
			var clipX = Math.round(cameraX * 30) / 30 * 30 - clipW / 2;
			var clipY = Math.round(cameraY * 30) / 30 * 30 - clipH / 2;
			var drawX = 0;
			var drawY = 0;
			var drawW = 630;
			var drawH = 630;
			
			if (clipX < 0)
			{
				drawX -= clipX * 630 / baseClipW;
				drawW += clipX * 630 / baseClipW;
				clipW += clipX;
				clipX = 0;
			}
			if (clipY < 0)
			{
				drawY -= clipY * 630 / baseClipH;
				drawH += clipY * 630 / baseClipH;
				clipH += clipY;
				clipY = 0;
			}
			var overR = clipX + clipW - tCanvas.width;
			if (overR > 0)
			{
				drawW -= overR * 630 / baseClipW;
				clipW -= overR;
			}
			var overB = clipY + clipH - tCanvas.height;
			if (overB > 0)
			{
				drawH -= overB * 630 / baseClipH;
				clipH -= overB;
			}
			//if (layer.tDrawOn)
			//{
				ctx.drawImage(tCanvas, clipX, clipY, clipW, clipH, drawX, drawY, drawW, drawH);
			//}
			//if (layer.eDrawOn)
			//{
				//if (layer.eNeedsUpdate)
				//{
					//ectx.clearRect(0, 0, eCanvas.width, eCanvas.height);
					//RenderLayerE();
					//layer.eNeedsUpdate = false;
				//}
				ctx.drawImage(eCanvas, clipX, clipY, clipW, clipH, drawX, drawY, drawW, drawH);
			//}
		//}
	//}
	// Stuff for promptMessage
	if (writingMessage)
	{
		promptMessage.fade = 200;
		promptMessage.text = ">" + messageInput + "_";
		promptMessage.boxWidth = promptMessage.text.length * 10 + 6;
		if (isPromptMagic)
		{
			textGlow ++;
			if (textGlow >= 50)
			{
				textGlow = 0;
			}
		}
		else if (textGlow > 0)
		{
			textGlow --;
		}
		promptMessage.color = BlendColors("#FFFFFF", player.color, Math.abs(textGlow - 25) / 25);
	}
	else
	{
		promptMessage.fade = -49;
		promptMessage.text = "";
		promptMessage.boxWidth = promptMessage.text.length * 10 + 6;
		textGlow = 0;
	}
	// Reposition text boxes
	var m;
	for (m = 0; m < messages.length; m++)
	{
		messages[m].FixPosX();
		messages[m].FixPosY();
	}
	var reCheckList = messages.slice(0);
	reCheckList.pop();
	while (reCheckList.length > 0)
	{
		var mesg = reCheckList.pop();
		var m = messages.indexOf(mesg);
		var m2;
		for (m2 = 0; m2 < m; m2++)
		{
			var mesg2 = messages[m2];
			if ((Math.abs(mesg.targetY - mesg2.targetY) < 16) && (Math.abs(mesg.targetX - mesg2.targetX) < (mesg.boxWidth + mesg2.boxWidth) / 2))
			{
				mesg2.targetY = mesg.targetY - 16;
				if (reCheckList.indexOf(mesg2) == -1)
				{
					reCheckList.push(mesg2);
				}
			}
		}
		var n = -1;
		if (writingMessage)
		{
			n = 0;
		}
		for (m2 = m + 1; m2 < messages.length + n; m2++)
		{
			var mesg2 = messages[m2];
			if ((Math.abs(mesg.targetY - mesg2.targetY) < 16) && (Math.abs(mesg.targetX - mesg2.targetX) < (mesg.boxWidth + mesg2.boxWidth) / 2))
			{
				mesg.targetY = mesg2.targetY - 16;
				if (reCheckList.indexOf(mesg) == -1)
				{
					reCheckList.push(mesg);
				}
			}
		}
	}
	// Draw text boxes
	ctx.font = "bold 16px Courier New";
	for (var m = 0; m < messages.length; m ++)
	{
		var mesg = messages[m];
		var entity = mesg.entity;
		mesg.x = (mesg.x + mesg.targetX) / 2;
		mesg.y = (mesg.y + mesg.targetY) / 2;
		DrawTextBox(mesg);
		
		mesg.fade --;
		if (mesg.fade < -51)
		{
			messages.splice(m, 1);
			m --;
		}
	}
	/*
	if (newLevel)
	{
		levelTransition ++;
		SetAlpha(Math.min(levelTransition * 0.05, 1));
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 600, 600);
	}
	else if (levelTransition > 0)
	{
		levelTransition --;
		SetAlpha(Math.min(levelTransition * 0.05, 1));
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 600, 600);
	}
	*/
	/*
	SetAlpha(1);
	SetColor("#000000");
	ctx.strokeRect(0, 0, 600, 600);
	ctx.strokeStyle = "#00FFFF";
	ctx.strokeRect(600, 0, 200, 600);
	DrawTextRaw("HP: " + player.HP, "#FF0000", 700, 20);
	DrawTextRaw("MP: " + player.MP, "#0040FF", 700, 40);
	DrawTextRaw("STAMINA: " + StaminaDisplay(player.STAMINA) + "%", "#FFFFFF", 700, 60);
	DrawTextRaw("Weapon:   ", "#FFFFFF", 700, 100);
	DrawTextRaw("Armor:   ", "#FFFFFF", 700, 120);
	DrawTextRaw("Hat:   ", "#FFFFFF", 700, 140);
	DrawTextRaw("Spells:", "#0040FF", 700, 180);
	DrawTextRaw("FIREBALL", "#FF4000", 700, 200);
	DrawTextRaw("WALL", "#B08040", 700, 220);
	DrawTextRaw("TELEPORT", "#80FFFF", 700, 240);
	*/
	//FilterScreen();
	
	// Centering boxes
	/*
	SetAlpha(1);
	SetColor("#00FFFF");
	ctx.strokeRect(0, 0, 630, 630);
	ctx.strokeRect(0, 0, 315, 315);
	ctx.strokeRect(315, 315, 315, 315);
	*/
	//DrawTextRaw("1: SWITCH", "#00FFFF", 50, 590);
	if (!cursorVisible)
	{
		SetAlpha(1);
		ctx.save();
		//ctx.strokeRect(mouseX - 5, mouseY - 5, 10, 10);
		ctx.strokeStyle = "#00FFFF";
		//ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(mouseX, mouseY - 7);
		ctx.lineTo(mouseX + 7, mouseY);
		ctx.lineTo(mouseX, mouseY + 7);
		ctx.lineTo(mouseX - 7, mouseY);
		ctx.lineTo(mouseX, mouseY - 7);

		ctx.moveTo(mouseX, mouseY - ff);
		ctx.lineTo(mouseX + ff, mouseY);
		ctx.lineTo(mouseX, mouseY + ff);
		ctx.lineTo(mouseX - ff, mouseY);
		ctx.lineTo(mouseX, mouseY - ff);

		var tcx = (TileFromMouseX() + 10.5 - cameraX) * 30;
		var tcy = (TileFromMouseY() + 10.5 - cameraY) * 30;
		//ctx.moveTo
		/*ctx.moveTo(tcx + 14.5, tcy + 4 + ff);
		ctx.lineTo(tcx + 26 - ff, tcy + 14.5);
		ctx.lineTo(tcx + 14.5, tcy + 26 - ff);
		ctx.lineTo(tcx + 4 + ff, tcy + 14.5);
		ctx.lineTo(tcx + 14.5, tcy + 4 + ff);
		*/

		ctx.stroke();
		ctx.strokeRect(tcx, tcy, 30, 30);

		ctx.restore();
	}
}

// Do not use, is only for example (Serious lag)
function FilterScreen () {
	var data = ctx.getImageData(0, 0, 50, 50);
	for (var i = 0; i < data.data.length; i+= 4) {
		var r = data.data[i];
		var g = data.data[i+1];
		var b = data.data[i+2];
		data.data[i] = r * 0.5;
		data.data[i+1] = g * 0.5;
		data.data[i+2] = b * 0.5;
	}
	ctx.putImageData(data, 0, 0);
}

// Appends 0's to stamina number
function StaminaDisplay (stamina)
{
	if (stamina < 10)
	{
		return "  " + stamina;
	}
	if (stamina < 100)
	{
		return " " + stamina;
	}
	return stamina;
}

// Blend two colors together.
// weight is 1 if completely color2, 0.5 if halfway between 1 and 2
function BlendColors (color1, color2, weight)
{
	//Debug(color2);
	//Debug(player.color);
	var r1 = parseInt(color1.slice(1, 3), 16);
	var g1 = parseInt(color1.slice(3, 5), 16);
	var b1 = parseInt(color1.slice(5, 7), 16);
	var r2 = parseInt(color2.slice(1, 3), 16);
	var g2 = parseInt(color2.slice(3, 5), 16);
	var b2 = parseInt(color2.slice(5, 7), 16);
	var oWeight = 1 - weight;
	var rm = Math.round(r1 * oWeight + r2 * weight);
	var rms = rm.toString(16)
	rms = (rms.length == 1) ? "0" + rms : rms
	var gm = Math.round(g1 * oWeight + g2 * weight);
	var gms = gm.toString(16)
	gms = (gms.length == 1) ? "0" + gms : gms
	var bm = Math.round(b1 * oWeight + b2 * weight);
	var bms = bm.toString(16)
	bms = (bms.length == 1) ? "0" + bms : bms
	return "#" + rms + gms + bms;
}

// Draw a text box, given a message.
// Does fade out stuff
function DrawTextBox (message) {
	SetColor("#000000");
	var mColor = (message.glow && message.glowColor) ? BlendColors(message.color, message.glowColor, Math.random()) : message.color;
	ctx.strokeStyle = mColor;
	var alpha;
	if (message.fade > 0)
	{
		alpha = 1;
	}
	else
	{
		alpha = Math.max(0, (1 + (message.fade) * 0.02));
	}
	SetAlpha(0.85 * alpha);
	ctx.fillRect(message.x - message.boxWidth / 2, message.y - 12, message.boxWidth, message.boxHeight);
	ctx.strokeRect(message.x - message.boxWidth / 2, message.y - 12, message.boxWidth, message.boxHeight);
	SetAlpha(alpha);
	SetColor(mColor);
	//ctx.fillText(message.text, message.x + 3 - message.boxWidth / 2, message.y);
	DrawText(message.text, message.x + 3 - message.boxWidth / 2, message.y);
}

// Draw a text box, given a string, color, and position
// Does fade out stuff
function DrawTextRaw (text, color, x, y) {
	SetColor("#000000");
	ctx.strokeStyle = color;
	var boxWidth = text.length * 10 + 6
	SetAlpha(0.85);
	ctx.fillRect(x - boxWidth / 2, y - 12, boxWidth, 16);
	ctx.strokeRect(x - boxWidth / 2, y - 12, boxWidth, 16);
	SetAlpha(1);
	SetColor(color);
	DrawText(text, x + 3 - boxWidth / 2, y);
}

// Draws text, after rounding down (floor) to nearest x, y
function DrawText (text, x, y)
{
	ctx.fillText(text, (0.5 + x) | 0, (0.5 + y) | 0);
}

// Determines the X position on the screen for an entity
function EntityScreenX (entity) {
	return 315 + (entity.x - cameraX) * 30;// * (50 - entity.z + cameraZ) * 0.6;
	// 0.6 is 30/50
}

// Determines the Y position on the screen for an entity
function EntityScreenY (entity) {
	return 315 + (entity.y - cameraY) * 30;// * (50 - entity.z + cameraZ) * 0.6;
}

function TileFromMouseX () {
	return Math.min(AREA_WIDTH - 1, Math.max(0, Math.round(mouseX / 30 + cameraX - 11)));
}

function TileFromMouseY () {
	return Math.min(AREA_HEIGHT - 1, Math.max(0, Math.round(mouseY / 30 + cameraY - 11)));
}

// Mouse position
function MousePos (e) {
	mouseX = e.clientX - 8;
	mouseY = e.clientY - 8;
	if (cursorVisible)
	{
		cursorVisible = false;
		document.getElementById("game_canvas").style.cursor = "none";
		//Debug("Backup cursro hide")
	}
}


function hoverOn (e) {
	document.getElementById("game_canvas").style.cursor = "none";
	//Debug("Hover On");
	cursorVisible = false;
}
function hoverOff (e) {
	document.getElementById("game_canvas").style.cursor = "";
	//Debug("hover Off");
	cursorVisible = true;
}

// Mouse down listener
window.addEventListener('mousedown', DoMouseDown, true);

// Mouse down event
function DoMouseDown (e) {
	if (!cursorVisible)
	{
		//Cheat mode only
		//ChangePosition(player, TileFromMouseX(), TileFromMouseY());
	}
	
}

// Keyboard event listeners
window.addEventListener('keypress', DoKeyPress, true);
window.addEventListener('keydown', DoKeyDown, true);
window.addEventListener('keyup', DoKeyUp, true);

// Character input function
// Writing messages - only allows character and number input
// Capital letters is taken care of with magics
function DoKeyPress (e) {
	if (writingMessage)
	{
		if (e.keyCode == 13 && !enterPressed)
		{
			if (messageInput.length == 0)
			{
				writingMessage = false;
				isPromptMagic = false;
				return;
			}
			var mesg = new Message(messageInput, player);
			SendMessage(messageInput);
			if (isPromptMagic)
			{
				var result = ProcessSpell(player, messageInput);
				if (result)
				{
					//mesg.glow = true;
					//mesg.glowColor = result;
				}
			}
			messageInput = "";
			writingMessage = false;
			isPromptMagic = false;
			return;
		}
		var letter = String.fromCharCode(e.keyCode);
		letter = letter.replace(/[^a-zA-Z0-9 ]/g, '');
		messageInput += letter;
		isPromptMagic = CheckMagicWord(messageInput);
		return;
	}
}

// "w", "a", "s", "d", "up", "down", "left", "right"
function TrackKeyOn (key) {
	for (var i = 0; i < keyPressedOrder.length; i++)
	{
		if (keyPressedOrder[i] == key)
		{
			return;
		}
	}
	//put key at front of list: most recently pressed
	keyPressedOrder.unshift(key);
}
function TrackKeyOff (key) {
	for (var i = 0; i < keyPressedOrder.length; i++)
	{
		if (keyPressedOrder[i] == key)
		{
			keyPressedOrder.splice(i, 1);
			return;
		}
	}
}

//Micro version of magic.js
var allSpells = ["FIREBALL", "WATERBLAST", "BEAM", "LIGHTNING", "HEAL", "QUAKE", "ICE", "WALL", "WEB", "SUMMON"];
function CheckMagicWord (text)
{
	if (allSpells.indexOf(text) != -1)
	{
		return true;
	}

	return false;
}

function ProcessSpell (entity, text) {
	return;
}


// Key Down event:
// Does key input (sets booleans to true)
// Prevents Back key from going back a page
function DoKeyDown (e) {
	if (writingMessage)
	{
		if (e.keyCode == 8)
		{
			messageInput = messageInput.slice(0, messageInput.length - 1);
			e.preventDefault();
			isPromptMagic = CheckMagicWord(messageInput);
		}
		return;
	}
	else if (e.keyCode == 8)
	{
		e.preventDefault();
	}
	if (e.keyCode == 13)
	{
		if (!enterPressed)
		{
			writingMessage = true;
			wKey = false;
			aKey = false;
			sKey = false;
			dKey = false;
		}
		enterPressed = true;
		return;
	}
	if (e.keyCode == 87)
	{
		TrackKeyOn("w");
		//wKey = true;
		return;
	}
	if (e.keyCode == 65)
	{
		TrackKeyOn("a");
		//aKey = true;
		return;
	}
	if (e.keyCode == 83)
	{
		TrackKeyOn("s");
		//sKey = true;
		return;
	}
	if (e.keyCode == 68)
	{
		TrackKeyOn("d");
		//dKey = true;
		return;
	}
	if (e.keyCode == 38)
	{
		TrackKeyOn("up");
		//upKey = true;
		return;
	}
	if (e.keyCode == 40)
	{
		TrackKeyOn("down");
		//downKey = true;
		return;
	}
	if (e.keyCode == 37)
	{
		TrackKeyOn("left");
		//leftKey = true;
		return;
	}
	if (e.keyCode == 39)
	{
		TrackKeyOn("right");
		//rightKey = true;
		return;
	}

	if (e.keyCode == 81) {
		//q
		//SetTile(player.x, player.y, EMPTY, "", "#000000");
		//Debug("Q: All entities say the # of their target");
		//for (var i = 0; i < entityList.length; i++) {if (entityList[i].target) new Message("Target is #" + entityList.indexOf(entityList[i].target), entityList[i]); else new Message("No target", entityList[i]);}
	}
	if (e.keyCode == 69)
	{
		//e
		// All entities speak their number
		//Debug("E: All entities say their own #");
		//for (var i = 0; i < entityList.length; i++) {new Message("I am #" + i, entityList[i]);}
	}
	if (e.keyCode == 90)
	{
		//z
		//Debug("X: " + player.x + ", Y: " + player.y);
		//Debug("Z: All entities say their HP / MAX_HP");
		//for (var i = 0; i < entityList.length; i++) {new Message("My HP is " + entityList[i].HP + "/" + entityList[i].MAX_HP, entityList[i]);}
	}
	if (e.keyCode == 49)
	{
		// 1

		// "respawn"
		//player = new Entity("Player2", "player", RandomColor(), 17, 17);
	}
	//Debug(e.keyCode);
}
//var pstartX = undefined;
//var pstartY = undefined;
//var pstartZ = undefined;

// Key Up event:
// Does key input (sets booleans to false)
function DoKeyUp (e) {
	if (e.keyCode == 87)
	{
		TrackKeyOff("w");
		//wKey = false;
		return;
	}
	if (e.keyCode == 65)
	{
		TrackKeyOff("a");
		//aKey = false;
		return;
	}
	if (e.keyCode == 83)
	{
		TrackKeyOff("s");
		//sKey = false;
		return;
	}
	if (e.keyCode == 68)
	{
		TrackKeyOff("d");
		//dKey = false;
		return;
	}
	if (e.keyCode == 38)
	{
		TrackKeyOff("up");
		//upKey = false;
		return;
	}
	if (e.keyCode == 40)
	{
		TrackKeyOff("down");
		//downKey = false;
		return;
	}
	if (e.keyCode == 37)
	{
		TrackKeyOff("left");
		//leftKey = false;
		return;
	}
	if (e.keyCode == 39)
	{
		TrackKeyOff("right");
		//rightKey = false;
		return;
	}
	if (e.keyCode == 13)
	{
		enterPressed = false;
		return;
	}
}



// Generates a random color
// Code from http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function RandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

// MAGIC ARRAY FIXES YOUR PROBLEMS
var T_NUM_FIX = [ 0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				 13, 14, 13, 14, 15, 16, 15, 17, 13, 14, 13, 14, 15, 16, 15, 17, 18, 19, 18, 19, 20, 21, 20, 22, 18, 19, 18, 19, 23, 24, 23, 25,
				 13, 14, 13, 14, 15, 16, 15, 17, 13, 14, 13, 14, 15, 16, 15, 17, 26, 27, 26, 27, 28, 29, 28, 30, 26, 27, 26, 27, 31, 32, 31, 33,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				  0,  1,  0,  1,  2,  3,  2,  4,  0,  1,  0,  1,  2,  3,  2,  4,  5,  6,  5,  6,  7,  8,  7,  9,  5,  6,  5,  6, 10, 11, 10, 12,
				 13, 34, 13, 34, 15, 35, 15, 36, 13, 34, 13, 34, 15, 35, 15, 36, 18, 37, 18, 37, 20, 38, 20, 39, 18, 37, 18, 37, 23, 40, 23, 41,
				 13, 34, 13, 34, 15, 35, 15, 36, 13, 34, 13, 34, 15, 35, 15, 36, 26, 42, 26, 42, 28, 43, 28, 44, 26, 42, 26, 42, 31, 45, 31, 46]

// Determines the tile number (tileset position) to use, based on the surrounding tiles.
function GetTileNumber(tile) {
	var t = tile.type;
	if (t == EMPTY || t == OTHER)
	{
		tile.tNumber = 0;
		return;
	}
	var x = tile.x;
	var y = tile.y;
	
	if (t == FLOOR)
	{
		var tNumA = MtTyp(x, y-1, t, 1) + MtTyp(x+1, y-1, t, 2) + MtTyp(x+1, y, t, 4) + MtTyp(x+1, y+1, t, 8) + 
			MtTyp(x, y+1, t, 16) + MtTyp(x-1, y+1, t, 32) + MtTyp(x-1, y, t, 64) + MtTyp(x-1, y-1, t, 128);
		tile.tNumber = T_NUM_FIX[tNumA];
		return;
	}
	else if (t == WALL)
	{
		tile.tNumber = MtTyp(x, y-1, t, 1) + MtTyp(x+1, y, t, 2) + MtTyp(x, y+1, t, 4) + MtTyp(x-1, y, t, 8);
		return;
	}
	tile.tNumber = 0;
	return; // Unknown
}

function GetTypeFromXY(x, y) {
	if (CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		return area[x][y].type;
	}
	else
	{
		return 0;
	}
}

function MtTyp(x, y, type, A) {
	if (GetTypeFromXY(x, y) == type)
	{
		return A;
	}
	else
	{
		return 0;
	}
}



// Prints a line to the console
function Debug (message) {
	window.console.log(message);
}