// ADV_NET_3D
// Language module
// Copyright Mark Foster 2013
// All Rights Reserved

// Reads the first message in an entities inMesgQueue and processes it
function ProcessMessage (entity) {

	var mesg = entity.inMesgQueue.shift();
	
	return; // No language processing in this version


	if (mesg == undefined)
	{
		return;
	}
	//Split text using a space as the separator
	var spArray = mesg.text.split(" ");
	var wordArray = [];
	for (var i = 0; i < spArray.length; i++)
	{
		if (spArray[i] != "")
		{
			wordArray.push(spArray[i]);
		}
	}
	var wordCount = wordArray.length;
	if (wordCount < 2)
	{
		Debug("Input message is too short");
		return;
	}
	if (wordArray[0] != entity.name && wordArray[0] != "all" && wordArray[0] != "everyone")
	{
		Debug("Message not directed to this entity");
		return;
	}
	var outputBuild = [];
	//Main switch statement:
	switch (wordArray[1])
	{
		case "follow":
			FindPath(entity, mesg.entity.GetTile());
			//entity.outMesgQueue.push("yes");
			//new Message("yes", entity);
			outputBuild.push("yes");
		break;
		
		case "identify":
			//entity.outMesgQueue.push(mesg.entity.name + " myself name " + entity.name);
			//new Message(mesg.entity.name + " myself name " + entity.name, entity);
			outputBuild.push(mesg.entity.name, "my name is", entity.name);
		break;
		
		case "hello":
			//entity.outMesgQueue.push(mesg.entity.name + " hello");
			//new Message(mesg.entity.name + " hello", entity);
			//new Message("hello", entity);
			outputBuild.push("hello");
		break;
		
		case "say":
			outputBuild = wordArray.slice(2);
		break;
		
		default:
			//new Message("???", entity);
			outputBuild.push("???");
		break;
	}
	//join with separator " "
	var outputStr = outputBuild.join(" ");
	if (outputStr != "")
	{
		entity.outMesgQueue.push(outputStr);
		//new Message(outputStr, entity);
	}
}
