function AttackTo (attacker, X, Y) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		return;
	}
	var targetTile = area[X][Y];
	if (Math.abs(attacker.x - targetTile.x) + Math.abs(attacker.y - targetTile.y) != 1)
	{
		// Illegal attack (must be orthagonally adjacent)
		//Debug("Bad tile");
		return;
	}
	if (targetTile.entities.length == 1)
	{
		var defender = targetTile.entities[0];
		var damage = Math.floor(Math.random() * 4) + 1;
		var defense = 0;
		if (damage > defense)
		{
			defender.HP -= damage + defense;
			
			UnderAttack(defender, attacker);

			if (defender == player) PlayerAttacked();

			if (defender.HP <= 0)
			{
				if (defender == player)
				{
					new Message("I fight for the letters", attacker);
					document.title = "Tron Legacy";
				}
				else
				{
					new Message("I defeated #" + entityList.indexOf(defender), attacker);
				}
				BloodSplatter(defender);
				EntityLevelUp(attacker);
				EntityDie(defender);
				attacker.state = WANDER;
				attacker.target = undefined;
			}
		}
		return; //Attacked
	}
	//Debug("No target");
}

function SpellAttackTo (x, y, damageMin, damageMax) {
	if (!CheckBounds(0, AREA_SIZE - 1, [X, Y]))
	{
		return;
	}
	var targetTile = area[X][Y];
}

function EntityDie (entity) {
	EffectDie(entity);
	var tile = entity.GetTile();
	tile.entities.splice(tile.entities.indexOf(entity), 1);
	entityList.splice(entityList.indexOf(entity), 1);
	//not needed because EffectDie() does it
	//DrawTileContent(entity);

	//Send death update
	UpdateEntity(entity);
}

function EntityLevelUp (entity) {
	EffectLevelUp(entity);

	entity.MAX_HP += 1;
	entity.HP += 1;
}

function PlayerAttacked () {
	cameraX += Math.random() - 0.5;
	cameraY += Math.random() - 0.5;
	//document.title = "HP: " + player.HP + "/" + player.MAX_HP;
}

function UnderAttack (entity, attacker) {
	entity.state = ATTACK;
	entity.target = attacker;
} 