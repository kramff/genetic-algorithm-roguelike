 
var effectImages = ["nothing", "circle1", "circle2", "circle3", "circle4", "circle5", "circle6", "lightning1", "lightning2", "lightning3",
"lightningR1", "lightningR2", "lightningR3", "square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8",
"teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7", "toggle", "triangle1", "triangle2", "triangle3", "triangle4", "triangle5", "triangle6",
"slash1U", "slash2U", "slash3U", "slash4U", "slash5U", "slash1D", "slash2D", "slash3D", "slash4D", "slash5D", 
"slash1L", "slash2L", "slash3L", "slash4L", "slash5L", "slash1R", "slash2R", "slash3R", "slash4R", "slash5R",
"blood1", "blood2", "blood3", "blood4", "blood5", "blood6", "blood7", "blood8", "blood9",
"heal1", "heal2", "heal3", "heal4", "heal5", "heal6", "heal7", "heal8", "heal9",
"quake1", "quake2", "quake3", "quake4",
"explode1", "explode2", "explode3", "explode4", "explode5", "explode6", "explode7"];
var entityImages = ["player", "A", "B", "C", "D", "E"];
var floorImages = ["blocks", "boxes", "bubbles", "checker", "concentric", "cornered", "delete", "detail", "elegant", "faded", "fine", "invalid", "neat", "nice", "null", "ornate", "rim", "simple", "solid"];


var otherImages = ["appear", "ivy", "target", "web"];
var wallImages = ["double", "full", "line", "pattern"];

var imageSources = [];

var loadi = 0;
for (loadi = 0; loadi < effectImages.length; loadi++)
{
	imageSources.push("Images/Effect/" + effectImages[loadi] + ".png");
}
for (loadi = 0; loadi < entityImages.length; loadi++)
{
	imageSources.push("Images/Entity/" + entityImages[loadi] + ".png");
}
for (loadi = 0; loadi < floorImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Floor/" + floorImages[loadi] + ".png");
}
for (loadi = 0; loadi < otherImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Other/" + otherImages[loadi] + ".png");
}
for (loadi = 0; loadi < wallImages.length; loadi++)
{
	imageSources.push("Images/Tilesets/Wall/" + wallImages[loadi] + ".png");
}

var images = [];
var filteredImages = [];

var fCanvas = document.createElement('canvas');
	fCanvas.setAttribute("id", "canvasF");
	fCanvas.width = 1410; // 30 px * 47 tiles
	fCanvas.height = 30;
var fctx = fCanvas.getContext('2d');


for (var i = 0; i < imageSources.length; i += 1) {
	images.push(new Image());
	images[i].src = imageSources[i];
}

function GetEffectImage (name)
{return imageSources.indexOf("Images/Effect/" + name + ".png");}
function GetEntityImage (name)
{return imageSources.indexOf("Images/Entity/" + name + ".png");}
function GetFloorImage (name)
{return imageSources.indexOf("Images/Tilesets/Floor/" + name + ".png");}
function GetOtherImage (name)
{return imageSources.indexOf("Images/Tilesets/Other/" + name + ".png");}
function GetWallImage (name)
{return imageSources.indexOf("Images/Tilesets/Wall/" + name + ".png");}

function GetSNum (name)
{
	return imageSources.indexOf(name);
}

// Creates a FilteredImage object
// Assumes that input is only transparent and white
function FilteredImage (name)
{
	// name: name of image file (from imageSources array)
	this.name = name;
	// base image (from images array)
	this.base = images[GetSNum(name)];
	// add this to filteredImages at correct location
	filteredImages[GetSNum(name)] = this;
	// Image manipulation stuff
	fCanvas.width = this.base.width;
	fCanvas.height = this.base.height;
	fctx.drawImage(this.base, 0, 0);
	//var imgData = fctx.getImageData(0, 0, this.base.width, this.base.height);
	//var d = imgData.data;
	// colors: the array to access to use the filtered images
	this.colors = [];
	
	// GetColor(): Function to get a color-shifted version of an image. saves to colors[] for future use.
	this.GetColor = function (color)
	{
		var num = parseInt("0x" + color.slice(1, 7));
		if (this.colors[num] != undefined)
		{
			//Debug("Bonus!");
			return this.colors[num];
		}
		var r = parseInt(color.slice(1, 3), 16);
		var g = parseInt(color.slice(3, 5), 16);
		var b = parseInt(color.slice(5, 7), 16);

		fCanvas.width = this.base.width;
		fCanvas.height = this.base.height;
		fctx.drawImage(this.base, 0, 0);
		var imgData = fctx.getImageData(0, 0, this.base.width, this.base.height);
		var d = imgData.data;

		var nColor = document.createElement('canvas');
		//this.colors.push(color);
		nColor.width = this.base.width;
		nColor.height = this.base.height;
		var cctx = nColor.getContext('2d');

		for (var i = 0; i < d.length; i+=4)
		{
			if (d[i] != 0)
			{
				d[i] = r;
				d[i+1] = g;
				d[i+2] = b;
			}
		}
		imgData.data = d;
		cctx.putImageData(imgData, 0, 0);
		this.colors[num] = nColor;
		return this.colors[num];
	}

}