
function AI (entity) {
	this.entity = entity;
	this.brain = [];
	this.FireN = function (neuronNum, time) {
		return this.brain[neuronNum].Fire(time);
	}

	//List of sight inputs neurons to check
	this.sightInputs = [];
	//List of pain input neurons to try when hit
	this.painInputs = [];
	//List of levelUp input neurons to try after a kill
	this.levelUpInputs = [];
	//List of delay neurons to fire again
	this.delayNeurons = [];

	//List of outputs this turn: most common is used
	// Up, Down, Left, Right, W, A, S, D
	this.outputs = [0, 0, 0, 0, 0, 0, 0, 0];
	//Reference for outputs
	this.outputInfo = ["up", "down", "left", "right", "w", "a", "s", "d"];

	this.ResetOutput = function () {
		this.outputs = [0, 0, 0, 0, 0, 0, 0, 0];
	}

	//Currently has incorrect tiebreaking
	this.DetermineOutput = function () {
		var key = "";
		var count = 0;
		for (var i = 0; i < this.outputs.length; i++) {
			if (this.outputs[i] > count)
			{
				key = this.outputInfo[i]
				count = this.outputs[i];
			}
		}
		this.ResetOutput();
		return key;
	}

	this.FireNeurons = function () {
		var i = 0;
		for (i = 0; i < this.painInputs.length; i++)
		{
			if (this.painInputs[i].triggered)
			{
				this.painInputs[i].Fire();
			}
		}
		for (i = 0; i < this.sightInputs.length; i++)
		{
			var sightNeuron = this.sightInputs[i];
			var tileX = this.entity.x + sightNeuron.x;
			var tileY = this.entity.y + sightNeuron.y;
			if (CheckBounds(0, AREA_SIZE - 1, [tileX, tileY]))
			{
				var tile = area[tileX][tileY];
				if (sightNeuron.type == ENTITY_SN && tile.entities.length == 1)
				{
					sightNeuron.Fire();
				}
				if (sightNeuron.type == WALL_SN && tile.type == WALL)
				{
					sightNeuron.Fire();
				}
			}
			else if (sightNeuron.type == WALL_SN)
			{
				//Wall sightn neuron fires when out of bounds
				sightNeuron.Fire();
			}
		}
		for (i = 0; i < this.delayNeurons.length; i++)
		{
			this.delayNeurons[i].Fire();
		}
		for (var i = this.delayNeurons.length - 1; i >= 0; i--)
		{
			if (this.delayNeurons[i].toBeRemoved)
			{
				this.delayNeurons.splice(i, 1);	
			}
		}
	}
}

//Default neuron: Fires when triggered on
//DO NOT USE, WAS JUST PRACTICE
/*function Neuron (target, ai) {
	this.target = target;
	this.ai = ai;
	this.lastFired = 0;
	
	this.Fire = function (time) {
		if (this.lastFired >= time)
		{
			return "";
		}
		this.lastFired = time;
		if (typeof(this.target) == "number")
		{
			return this.ai.brain[this.target].Fire(time);
		}
		if (typeof(this.target) == "string")
		{
			return this.target;
		}
		return "";
	}
}*/

//Input Neurons
// Target Neuron - Neuron # to trigger when fired
// AI - AI core this neuron is located in



//Sight
// X pos (in relation to neuron)
// Y pos (in relation to neuron)
// Type (1: Entity, 2: Wall)
var ENTITY_SN = 1;
var WALL_SN = 2;
function SightInputNeuron (x, y, type, target, ai) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.target = target;
	this.ai = ai;
	this.lastFiredTime = -20;
	this.Fire = function () {
		if (this.lastFiredTime >= currentTime)
		{
			return; //fizzles
		}
		this.lastFiredTime = currentTime;
		this.ai.brain[this.target].Fire();
	}
	ai.sightInputs.push(this);

	//Makes a copy of this neuron
	//newAI: the new AI to put this into
	//targetAdjust: in case of putting a group of neurons after some pre-existing ones
	this.CopyPerfect = function (newAI, targetAdjust) {
		var newNeuron = new SightInputNeuron (this.x, this.y, this.type, this.target + targetAdjust, newAI);
		return newNeuron;
	}
	//Makes a copy of the neuron with possible mutations
	//mutateFactor: (mF/1) chance of mutating
	//if mutating, (mF/1) chance of entire new neuron of any type (else just mutate values)
	//each value: (mF/1) chance of mutating (new random value)
	this.CopyMutate = function (newAI, size, targetAdjust, mutateFactor) {
		//Chance to mutate
		if (mutateFactor > Math.random())
		{
			//Chance of new neuron
			if (mutateFactor > Math.random())
			{
				//RandomNeuron()
			}
			else
			{
				var newNeuron = new SightInputNeuron (this.x, this.y, this.type, this.target + targetAdjust, newAI);
				var randomNeuron = new RandomSightInputNeuron();
				if (mutateFactor > Math.random()) newNeuron.x = randomNeuron.x;
				if (mutateFactor > Math.random()) newNeuron.y = randomNeuron.y;
				if (mutateFactor > Math.random()) newNeuron.type = randomNeuron.type;
				if (mutateFactor > Math.random()) newNeuron.target = randomNeuron.target;
				return newNeuron;
			}
		}
		return this.CopyPerfect(newAI, targetAdjust);
	}
}

function RandomSightInputNeuron (ai, size) {
	var neuron = new SightInputNeuron(Math.round(Math.random() * 10) - 5, Math.round(Math.random() * 10) - 5, Math.ceil(Math.random() * 2), Math.floor(Math.random() * size), ai);
	return neuron;
}

//Pain
//Direction (1: Up, 2: Down, 3: Left, 4: Right)
function PainInputNeuron (dir, target, ai) {
	this.dir = dir;
	this.target = target;
	this.ai = ai;
	this.triggered = false;
	this.lastFiredTime = -20;
	this.Fire = function () {
		if (this.lastFiredTime >= currentTime)
		{
			return; //fizzles
		}
		this.lastFiredTime = currentTime;
		this.ai.brain[this.target].Fire();
	}
	this.ai.painInputs.push(this);
}

function RandomPainInputNeuron (ai, size) {
	var neuron = new PainInputNeuron(Math.ceil(Math.random() * 4), Math.floor(Math.random() * size), ai);
	return neuron;
}

//LevelUp
function LevelUpInputNeuron (target, ai) {
	this.target = target;
	this.ai = ai;
	this.triggered = false;
	this.lastFiredTime = -20;
	this.Fire = function () {
		if (this.lastFiredTime >= currentTime)
		{
			return; //fizzles
		}
		this.lastFiredTime = currentTime;
		this.ai.brain[this.target].Fire();
	}
	ai.levelUpInputs.push(this);
}

function RandomLevelUpInputNeuron (ai, size) {
	var neuron = new LevelUpInputNeuron(Math.floor(Math.random() * size), ai);
	return neuron;
}

//Process Neurons

//Wait
// timer (turns before it can fire again)
function WaitProcessNeuron (timer, target, ai) {
	this.timer = timer;
	this.target = target;
	this.ai = ai;
	this.lastFiredTime = -20;
	
	this.Fire = function () {
		if (this.lastFiredTime + this.timer >= currentTime)
		{
			return; //fizzles
		}
		this.lastFiredTime = currentTime;
		this.ai.brain[this.target].Fire();
	}
}

function RandomWaitProcessNeuron (ai, size) {
	var neuron = new WaitProcessNeuron(Math.ceil(Math.random() * 10), Math.floor(Math.random() * size), ai);
	return neuron;
}

//Counter
// amount (times to be triggered before it fires)
function CounterProcessNeuron (amount, target, ai) {
	this.amount = amount;
	this.target = target;
	this.ai = ai;
	this.lastFiredTime = -20;
	this.lastTriggeredTime = -20;
	this.counter = 0;
	
	this.Fire = function () {
		if (this.lastFiredTime >= currentTime)
		{
			return; //fizzles
		}
		if (this.lastTriggeredTime != currentTime)
		{
			this.counter = 1;
		}
		else
		{
			this.counter ++;
		}
		if (this.counter > this.amount)
		{
			this.lastFiredTime = currentTime;
			this.ai.brain[this.target].Fire();
		}
	}
}

function RandomCounterProcessNeuron (ai, size) {
	var neuron = new CounterProcessNeuron(Math.ceil(Math.random() * 5), Math.floor(Math.random() * size), ai);
	return neuron;
}

//Delay
// timer (turns before it fires - delayed reaction)
function DelayProcessNeuron (timer, target, ai) {
	this.timer = timer;
	this.target = target;
	this.ai = ai;
	this.triggeredTime = -20;
	this.lastFiredTime = -20;
	this.toBeRemoved = false;
	
	this.Fire = function () {
		//debugger;
		this.triggeredTime = Math.min(this.triggeredTime, currentTime);
		if (this.triggeredTime <= 0)
		{
			this.triggeredTime = currentTime;
		}
		if (this.lastFiredTime + timer >= currentTime)
		{
			return; //fizzles
		}
		if (this.triggeredTime + this.timer <= currentTime)
		{
			this.lastFiredTime = currentTime;
			this.ai.brain[this.target].Fire();
			this.toBeRemoved = true;
			//this.ai.delayNeurons.splice(this.ai.delayNeurons.indexOf(this), 1);
			this.triggeredTime = -20;
		}
		else if (this.ai.delayNeurons.indexOf(this) == -1)
		{
			this.ai.delayNeurons.push(this);
		}
	}
}

function RandomDelayProcessNeuron (ai, size) {
	var neuron = new DelayProcessNeuron(Math.ceil(Math.random() * 10), Math.floor(Math.random() * size), ai);
	return neuron;
}

//Output Neurons
// Up, Down, Left, Right, W, A, S, D
function OutputNeuron (key, ai) {
	this.key = key;
	this.ai = ai;
	this.keyIndex = ai.outputInfo.indexOf(this.key);
	this.Fire = function () {
		ai.outputs[this.keyIndex] ++;
	}
}

function RandomOutputNeuron (ai, size) {
	var neuron = new OutputNeuron(ai.outputInfo[Math.floor(Math.random() * ai.outputInfo.length)], ai);
	return neuron;
}

function randomBrain (ai, size) {
	ai.brain = [];
	//ai.brain = [new Neuron("w"), new Neuron("a"), new Neuron("s"), new Neuron("d"), new Neuron("up"), new Neuron("down"), new Neuron("left"), new Neuron("right")];
	while (ai.brain.length < size)
	{
		var neuron;
		switch(Math.floor(Math.random() * 7))
		{
			case 0:
			neuron = new SightInputNeuron(Math.round(Math.random() * 10) - 5, Math.round(Math.random() * 10) - 5, Math.ceil(Math.random() * 2), Math.floor(Math.random() * size), ai);
			break;
			case 1:
			neuron = new PainInputNeuron(Math.ceil(Math.random() * 4), Math.floor(Math.random() * size), ai);
			break;
			case 2:
			neuron = new LevelUpInputNeuron(Math.floor(Math.random() * size), ai);
			break;
			case 3:
			neuron = new WaitProcessNeuron(Math.ceil(Math.random() * 10), Math.floor(Math.random() * size), ai);
			break;
			case 4:
			neuron = new CounterProcessNeuron(Math.ceil(Math.random() * 5), Math.floor(Math.random() * size), ai);
			break;
			case 5:
			neuron = new DelayProcessNeuron(Math.ceil(Math.random() * 10), Math.floor(Math.random() * size), ai);
			break;
			case 6:
			neuron = new OutputNeuron(ai.outputInfo[Math.floor(Math.random() * ai.outputInfo.length)], ai);
			break;
		}
		ai.brain.push(neuron);
	}
}


function CustomBrainA (entity) {
	var ai = new AI(entity);
	entity.ai = ai;
	ai.brain.push(new OutputNeuron("up", ai));
	ai.brain.push(new OutputNeuron("down", ai));
	ai.brain.push(new OutputNeuron("left", ai));
	ai.brain.push(new OutputNeuron("right", ai));
	ai.brain.push(new OutputNeuron("w", ai));
	ai.brain.push(new OutputNeuron("s", ai));
	ai.brain.push(new OutputNeuron("a", ai));
	ai.brain.push(new OutputNeuron("d", ai));
	//Extra inputs for attacking because priority (right now is x4)
	ai.brain.push(new SightInputNeuron(0, -1, 1, 0, ai));
	ai.brain.push(new SightInputNeuron(0, 1, 1, 1, ai));
	ai.brain.push(new SightInputNeuron(-1, 0, 1, 2, ai));
	ai.brain.push(new SightInputNeuron(1, 0, 1, 3, ai));
	ai.brain.push(new SightInputNeuron(0, -1, 1, 0, ai));
	ai.brain.push(new SightInputNeuron(0, 1, 1, 1, ai));
	ai.brain.push(new SightInputNeuron(-1, 0, 1, 2, ai));
	ai.brain.push(new SightInputNeuron(1, 0, 1, 3, ai));
	ai.brain.push(new SightInputNeuron(0, -1, 1, 0, ai));
	ai.brain.push(new SightInputNeuron(0, 1, 1, 1, ai));
	ai.brain.push(new SightInputNeuron(-1, 0, 1, 2, ai));
	ai.brain.push(new SightInputNeuron(1, 0, 1, 3, ai));
	ai.brain.push(new SightInputNeuron(0, -1, 1, 0, ai));
	ai.brain.push(new SightInputNeuron(0, 1, 1, 1, ai));
	ai.brain.push(new SightInputNeuron(-1, 0, 1, 2, ai));
	ai.brain.push(new SightInputNeuron(1, 0, 1, 3, ai));
	//moving toward enemies - distance 2
	ai.brain.push(new SightInputNeuron(0, -2, 1, 4, ai));//w
	ai.brain.push(new SightInputNeuron(0, 2, 1, 5, ai));//s
	ai.brain.push(new SightInputNeuron(-2, 0, 1, 6, ai));//a
	ai.brain.push(new SightInputNeuron(2, 0, 1, 7, ai));//d

	ai.brain.push(new SightInputNeuron(1, -1, 1, 4, ai));//wd
	ai.brain.push(new SightInputNeuron(-1, 1, 1, 5, ai));//sa
	ai.brain.push(new SightInputNeuron(-1, -1, 1, 6, ai));//wa
	ai.brain.push(new SightInputNeuron(1, 1, 1, 7, ai));//sd

}


//Testing delay neurons
function CustomBrainB (entity) {
	var ai = new AI(entity);
	entity.ai = ai;
	ai.brain.push(new OutputNeuron("up", ai));
	ai.brain.push(new OutputNeuron("down", ai));
	ai.brain.push(new OutputNeuron("left", ai));
	ai.brain.push(new OutputNeuron("right", ai));
	
	ai.brain.push(new DelayProcessNeuron(4, 0, ai));
	ai.brain.push(new DelayProcessNeuron(4, 1, ai));
	ai.brain.push(new DelayProcessNeuron(4, 2, ai));
	ai.brain.push(new DelayProcessNeuron(4, 3, ai));

	ai.brain.push(new DelayProcessNeuron(4, 4, ai));


	//ai.brain.push(new SightInputNeuron(0, -1, 1, 4, ai));
	//ai.brain.push(new SightInputNeuron(0, 1, 1, 5, ai));
	//ai.brain.push(new SightInputNeuron(-1, 0, 1, 6, ai));
	//ai.brain.push(new SightInputNeuron(1, 0, 1, 7, ai));

}
