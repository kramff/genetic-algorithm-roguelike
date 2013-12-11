
	
var effectImages = ["die1", "die2", "die3", "die4", "die5", "die6", "levelup1", "levelup10", "levelup11", "levelup12", "levelup13", "levelup14", "levelup15", "levelup2", "levelup3", "levelup4", "levelup5", "levelup6", "levelup7", "levelup8", "levelup9", "slash1D", "slash1L", "slash1R", "slash1U", "slash2D", "slash2L", "slash2R", "slash2U", "slash3D", "slash3L", "slash3R", "slash3U", "slash4D", "slash4L", "slash4R", "slash4U", "slash5D", "slash5L", "slash5R", "slash5U"];
var entityImages = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var floorImages = ["floor1", "floor2", "floor3", "floor4"];
var otherImages = [];
var wallImages = ["wall1", "wall2", "wall3"];

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