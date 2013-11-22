
function EffectDie (entity) {
	new Effect(["triangle1", "triangle2", "triangle3", "triangle4", "triangle5", "triangle6"], 3, entity.color, entity.x, entity.y);
}

function EffectLevelUp(entity) {
	new Effect(["square1", "square2", "square3", "square4", "square5", "square6", "square7", "square8", 
		"teleport1", "teleport2", "teleport3", "teleport4", "teleport5", "teleport6", "teleport7", ], 3, entity.color, entity.x, entity.y);
}

function EffectSlashUp (entity) {
	new Effect(["slash1U", "slash2U", "slash3U", "slash4U", "slash5U"], 3, entity.color, entity.x, entity.y - 1);
}
function EffectSlashDown (entity) {
	new Effect(["slash1D", "slash2D", "slash3D", "slash4D", "slash5D"], 3, entity.color, entity.x, entity.y + 1);
}
function EffectSlashLeft (entity) {
	new Effect(["slash1L", "slash2L", "slash3L", "slash4L", "slash5L"], 3, entity.color, entity.x - 1, entity.y);
}
function EffectSlashRight (entity) {
	new Effect(["slash1R", "slash2R", "slash3R", "slash4R", "slash5R"], 3, entity.color, entity.x + 1, entity.y);
}

function EffectItemGlow (item) {
	new Effect([item.image, item.image, item.image, "", item.image, "", item.image, "", item.image], 3, BlendColors(item.color, "#FFFFFF", 0.5), item.x, item.y);
}

function EffectLightningOld (entity) {
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y - 1);
	new Effect(["lightning1", "lightning2", "lightning3", "lightning2", "lightning1"], 3, entity.color, entity.x, entity.y + 1);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x - 1, entity.y);
	new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, entity.color, entity.x + 1, entity.y);
}

function EffectRegen (entity) {
	new Effect(["square1", "square2", "square3", "square2", "square1"], 3, entity.color, entity.x, entity.y);
}

function BloodSplatter (entity) {
	var randBlood = "blood" + Math.ceil(Math.random() * 9);
	var bloodColor = BlendColors("#CC0000", "#600000", Math.random());
	new Item(0, randBlood, bloodColor, entity.x, entity.y);
	//new Effect([randBlood], 1000, bloodColor, entity.x, entity.y);
}

function EffectHeal (caster) {
	new Effect(["heal1", "heal2", "heal3", "heal4", "heal5", "heal6", "heal7", "heal8", "heal9"], 3, caster.color, caster.x, caster.y);
}

function EffectQuake (caster, direction) {
	if (direction == "right")
	{
		new Effect(["lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, caster.color, caster.x + 1, caster.y);
		new Effect(["nothing", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, caster.color, caster.x + 2, caster.y);
		new Effect(["nothing", "nothing", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, caster.color, caster.x + 3, caster.y);
		new Effect(["nothing", "nothing", "nothing", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1", "lightningR2", "lightningR3", "lightningR2", "lightningR1"], 3, caster.color, caster.x + 4, caster.y);
	}
}

function EffectBeam (caster, x, y, delay) {
	var animate = ["quake1", "quake2", "quake3", "quake4", "quake3", "quake2", "quake1", "nothing", "explode1", "explode2", "explode3", "explode4", "explode5", "explode6", "explode7"];
	for (var i = 0; i < delay; i++)
	{
		animate.unshift("nothing");
	}
	new Effect(animate, 3, caster.color, x, y);
}

