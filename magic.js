// ADV_NET_3D
// Magic module
// Copyright Mark Foster 2013
// All Rights Reserved

function CastFireball (entity, direction) {
	//FIREBALL: 3-6 damage, circle shape
}

function CastWaterblast (entity, direction) {
	//WATERBLAST: 1-4 damage, cone shape, pushes targets
}

function CastBeam (entity, direction) {
	//BEAM: 2-5 damage, line shape, pierces targets
	NextBeam(entity, entity.x + 1, entity.y, 0, direction);
}

function NextBeam (entity, x, y, i, direction) {
	var type = GetTypeFromXY (x, y);
	if (type == FLOOR || type == EMPTY && CheckBounds(0, AREA_SIZE - 1, [x, y]))
	{
		EffectBeam(entity, x, y, i, direction);
		if (direction == "right")
		{
			NextBeam(entity, x + 1, y, i + 1, direction);
		}
	}

	
	
}

function CastLightning (entity, direction) {
	//LIGHTNING: 2-4 damage, jumps to several targets
}

function CastHeal (entity, direction) {
	//HEAL: recover 1-3 HP, single target
}

function CastQuake (entity, direction) {
	//QUAKE: 3-5 damage, four-directions of lines, destroys walls (walls -> floors)
}

function CastIce (entity, direction) {
	//ICE: 2-4 damage, large square shape, bridges gaps (empty -> floors)
}

function CastWall (entity, direction) {
	//WALL: 0 damage. three tile wall created perpendicular to cast direction, (floors, empty -> wall) fails if entity in tile
}

function CastWeb (entity, direction) {
	//WEB: 0 damage, single tile, prevents movement for three turns
}

function CastSummon (entity, direction) {
	//SUMMON: adds an entity
}

// Takes the speaking entity and the text
function ProcessSpell (entity, text) {
	/*if (entity == player && text == "SWITCH")
	{
		Cast_SWITCH();
	}*/
	switch (text)
	{
		case "FIREBALL":
		CastFireball(entity, "right");
		break;

		case "WATERBLAST":
		CastWaterblast(entity, "right");
		break;

		case "BEAM":
		CastBeam(entity, "right");
		break;

		case "LIGHTNING":
		CastLightning(entity, "right");
		break;

		case "HEAL":
		CastHeal(entity, "right");
		break;

		case "QUAKE":
		CastQuake(entity, "right");
		break;

		case "ICE":
		CastIce(entity, "right");
		break;

		case "WALL":
		CastWall(entity, "right");
		break;

		case "WEB":
		CastWeb(entity, "right");
		break;

		case "SUMMON":
		CastSummon(entity, "right");
		break;
		
	}

	//false: no silly text glow bs
	return false;

	// No need for fancy message splitting in this version

	var spArray = text.split(" ");
	var wordArray = [];
	for (var i = 0; i < spArray.length; i++)
	{
		if (spArray[i] != "")
		{
			wordArray.push(spArray[i]);
		}
	}
	if (wordArray.length != 3)
	{
		return false;
	}
	// If first word isn't all uppercase:
	if (wordArray[0] != wordArray[0].toUpperCase())
	{
		return false;
	}
	// If second "word" isn't a number:
	if (isNaN(wordArray[1]))
	{
		return false;
	}
	//figure out target from this string
	var target = wordArray[2];
	var power = parseInt(wordArray[1]);
	

	switch (wordArray[0])
	{
		case "FIREBALL":
			Debug("Cast FIREBALL");
			return "#FF4000";
		break;
		case "WALL":
			Debug("Cast WALL");
			return "#B08040";
		break;
		case "TELEPORT":
			Debug("Cast TELEPORT");
			return "#80FFFF";
		break;
			
		default:
			return false;
	}
}
var allSpells = ["FIREBALL", "WATERBLAST", "BEAM", "LIGHTNING", "HEAL", "QUAKE", "ICE", "WALL", "WEB", "SUMMON"];
function CheckMagicWord (text)
{
	if (allSpells.indexOf(text) != -1)
	{
		return true;
	}

	return false;

	//none of this fancy word checking bs
	
	var spArray = text.split(" ");
	var wordArray = [];
	for (var i = 0; i < spArray.length; i++)
	{
		if (spArray[i] != "")
		{
			wordArray.push(spArray[i]);
		}
	}
	if (wordArray.length < 1)
	{
		return false;
	}
	if (wordArray[0] != wordArray[0].toUpperCase())
	{
		return false;
	}
	

	switch (wordArray[0])
	{
		case "FIREBALL":
		case "WALL":
		case "TELEPORT":
			return true;
		break;
		
		default:
			return false;
	}
}