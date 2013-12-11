function EffectDie (entity) {
	new Effect(["die1", "die2", "die3", "die4", "die5", "die6"], 1, entity.color, entity.x, entity.y);
}
function EffectLevelUp(entity) {
	new Effect(["levelup1", "levelup2", "levelup3", "levelup4", "levelup5", "levelup6", "levelup7", "levelup8", "levelup9", "levelup10", "levelup12", "levelup13", "levelup14", "levelup15"], 1, entity.color, entity.x, entity.y);
}
function EffectSlashUp (entity) {
	new Effect(["slash1U", "slash2U", "slash3U", "slash4U", "slash5U"], 1, entity.color, entity.x, entity.y - 1);
}
function EffectSlashDown (entity) {
	new Effect(["slash1D", "slash2D", "slash3D", "slash4D", "slash5D"], 1, entity.color, entity.x, entity.y + 1);
}
function EffectSlashLeft (entity) {
	new Effect(["slash1L", "slash2L", "slash3L", "slash4L", "slash5L"], 1, entity.color, entity.x - 1, entity.y);
}
function EffectSlashRight (entity) {
	new Effect(["slash1R", "slash2R", "slash3R", "slash4R", "slash5R"], 1, entity.color, entity.x + 1, entity.y);
}