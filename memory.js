// ADV_NET_3D
// Memory module
// Copyright Mark Foster 2013
// All Rights Reserved

function Memory (entity)
{
	this.entity = entity;
	
}

function EntityMem (name)
{
	this.name = name;
	this.reliable = 0;
}

function LocationMem (name, xCoord, yCoord)
{
	this.name = name;
	this.xCoord = xCoord;
	this.yCoord = yCoord;
}