/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Defense'); // -> 'a thing'
 */

 var followFlagForward = require('createPathFlags');

 //Recorded by how many units we've assigned a harvest spot to in this room.
 function getNeedHarvest(spawn)
 {
	if(spawn.memory.needHarvest0 == null)
	{
		spawn.memory.needHarvest0 = 0;
		spawn.memory.needHarvest1 = 0;
		spawn.memory.needHarvest2 = 0;
		spawn.memory.needHarvest3 = 0;
	}
	return(spawn.memory.needHarvest0);
 }

 //Populate the next non-filled needHarvest, returns null if full.
 //WARNING: This can fail, technically if harvest or gatherer is a >0 value we're still using this spot
 function addNeedHarvest(spawn, value)
 {
	if(spawn.memory.needHarvest0 == null || spawn.memory.needHarvest0 <= 0)
	{
		spawn.memory.needHarvest0 = value;
		spawn.memory.needHarvest1 = 0;
		spawn.memory.needHarvest2 = 0;
		spawn.memory.needHarvest3 = 0;
		return(spawn.memory.needHarvest0);
	}
	else if(spawn.memory.needHarvest1 == null || spawn.memory.needHarvest1 <= 0)
	{
		spawn.memory.needHarvest1 = value;
		spawn.memory.needHarvest2 = 0;
		spawn.memory.needHarvest3 = 0;
		return(spawn.memory.needHarvest1);
	}
	else if(spawn.memory.needHarvest2 == null || spawn.memory.needHarvest2 <= 0)
	{
		spawn.memory.needHarvest2 = value;
		spawn.memory.needHarvest3 = 0;
		return(spawn.memory.needHarvest2);
	}
	else if(spawn.memory.needHarvest3 == null || spawn.memory.needHarvest3 <= 0)
	{
		spawn.memory.needHarvest3 = value;
		return(spawn.memory.needHarvest3);
	}
	return(null);
 }

 function getNeedGather(spawn)
 {
	if(spawn.memory.needGather0 == null)
	{
		spawn.memory.needGather0 = 0;
		spawn.memory.needGather1 = 0;
		spawn.memory.needGather2 = 0;
		spawn.memory.needGather3 = 0;
	}
	return(spawn.memory.needGather0);
 }

 //Populate the next non-filled needGather, returns null if full
 //WARNING: This can fail, technically if harvest or gatherer is a >0 value we're still using this spot
 function addNeedGather(spawn, value)
 {
	if(spawn.memory.needGather0 == null || spawn.memory.needGather0 <= 0)
	{
		spawn.memory.needGather0 = value;
		spawn.memory.needGather1 = 0;
		spawn.memory.needGather2 = 0;
		spawn.memory.needGather3 = 0;
		return(spawn.memory.needGather0);
	}
	else if(spawn.memory.needGather1 == null || spawn.memory.needGather1 <= 0)
	{
		spawn.memory.needGather1 = value;
		spawn.memory.needGather2 = 0;
		spawn.memory.needGather3 = 0;
		return(spawn.memory.needGather1);
	}
	else if(spawn.memory.needGather2 == null || spawn.memory.needGather2 <= 0)
	{
		spawn.memory.needGather2 = value;
		spawn.memory.needGather3 = 0;
		return(spawn.memory.needGather2);
	}
	else if(spawn.memory.needGather3 == null || spawn.memory.needGather3 <= 0)
	{
		spawn.memory.needGather3 = value;
		return(spawn.memory.needGather3);
	}
	return(null);
 }

 function getHarvestId(spawn)
 {
	if(spawn.memory.harvestId0 == null)
	{
		spawn.memory.harvestId0 = -1;
		spawn.memory.harvestId1 = -1;
		spawn.memory.harvestId2 = -1;
		spawn.memory.harvestId3 = -1;
	}
	return(spawn.memory.harvestId0);
 }

 //Returns the most recently added harvestId, if none are found in the list returns null
 function harvestIdInList(spawn, id)
 {
	return(spawn.memory.harvestId3 == id ||
		spawn.memory.harvestId2 == id ||
		spawn.memory.harvestId1 == id ||
		spawn.memory.harvestId0 == id);
 }

 //Populate the next non-filled harvestId, returns null if full
 function addHarvestId(spawn, id)
 {
	if(spawn.memory.harvestId0 == null || spawn.memory.harvestId0 == -1)
	{
		spawn.memory.harvestId0 = id;
		spawn.memory.harvestId1 = -1;
		spawn.memory.harvestId2 = -1;
		spawn.memory.harvestId3 = -1;
		return(spawn.memory.harvestId0);
	}
	else if(spawn.memory.harvestId1 == null || spawn.memory.harvestId1 == -1)
	{
		spawn.memory.harvestId1 = id;
		spawn.memory.harvestId2 = -1;
		spawn.memory.harvestId3 = -1;
		return(spawn.memory.harvestId1);
	}
	else if(spawn.memory.harvestId2 == null || spawn.memory.harvestId2 == -1)
	{
		spawn.memory.harvestId2 = id;
		spawn.memory.harvestId3 = -1;
		return(spawn.memory.harvestId2);
	}
	else if(spawn.memory.harvestId3 == null || spawn.memory.harvestId3 == -1)
	{
		spawn.memory.harvestId3 = id;
		return(spawn.memory.harvestId3);
	}
	return(null);
 }

 //Used to verify if we can safely give the spawn more requests for harvesters and gatherers. Each time everything is pulled from the first
 //slot 0, the requests filter down so slot 1 becomes slot 0 and so on. We can verify if the scouts can safely populate this list if the
 //list is empty (otherwise spawner is still working on a previous set of requests) by checking the harvest0 and gather0 slots
 function harvestEmpty(spawn)
 {
	//If the need for harvesters and gatherers have been populated, check if they've been set to their "I'm empty" values
	//if so return true
	if(spawn != null && spawn.memory != null && spawn.memory.needHarvest0 != null && spawn.memory.needGather0 != null)
	{
		return(spawn.memory.needHarvest0 <= 0 && spawn.memory.needGather0 <= 0);
	}
	else	//otherwise it hasn't been populated, and is empty. Allow scouts to populate the list
	{
		return(true);
	}
 }

 function getRoomForExit(unit, value)
 {
	var roomExits = Game.map.describeExits(unit.room.name);
	if(roomExits != null && roomExits[value] != null)
	{
		//console.log('retrieving exit: ' + roomExits[value]);
		return(roomExits[value]);
	}
	else
	{
		var count = 0;
		for(var x in roomExits)
		{
			if(roomExits[x] != null && count++ == value)
			{
				//console.log('retrieving exit: ' + roomExits[x]);
				return(roomExits[x]);
			}
		}
	}
	return(null);
 }

 function getCurrentExit(unit)
 {
	var currentRoom = unit.room;
	var newExit = getRoomForExit(unit, currentRoom.memory.exitsVisited);
	var routeToExit = Game.map.findExit(currentRoom.name, newExit);
	return(unit.pos.findClosestByRange(routeToExit));
 }

 function removeScout(unit)
 {
	for(var i in Memory.creeps)
	{
		//Assuming the list displayed in memory cycles through the list in the same order on the webpage as
		//in this array. The first found entry should be the oldest and therfore the one that needs deleted.
		if(Memory.creeps[i].role == unit.memory.role && unit.memory.usingSourceId == Memory.creeps[i].usingSourceId)
		{
			//console.log(unit.name + ' attempted to remove memory before death.');
			delete Memory.creeps[i];
			break;
		}
		else if(Memory.creeps[i].role == unit.memory.role)
		{
			//console.log(unit.name + ' was found for deletion, but usingSourceId didnt match, my assumptions were wrong.');
		}
	}
	unit.suicide();
	return('exploreEnd');
 }

 //WARNING: Assumes scouts will be the first in any given room, if any other code changes this
 //		(patrols, etc.) then will need to change this to check for rooms with scout data in it
 //		or other 'scouted' status has been triggered in each room.
 //TO DO: Check room memory instead of or in addition to accessible rooms for more accurate results?
 //Checks the current exitsVisited to see if we're already present there, we don't want to scout a place we've already
 //been and so we denote this room as a invalid candiate to scout and skip to the next exitVisited if this is the case.
 //We should be returning either a valid room name to go to or null
 function findNextRoom(unit, currentRoom)
 {
	if(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax)
	{
		//skip over all exits that go to all rooms we've previously visited
		var roomList = Game.rooms;
		var newExit;
		var roomNotFound;
		while(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax)
		{
			roomNotFound = true;
			newExit = getRoomForExit(unit, currentRoom.memory.exitsVisited);
			for(var rooms in roomList)
			{
				//Check if newExit matches any in this list, move to next exit if we've already been there
				if(roomList[rooms].name != newExit)
				{
					continue;	//Doesn't match this room, check remaining rooms before sending this back
				}
				//Try next exit, we've already been to this room
				else// if(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax-1)
				{
					roomNotFound = false;
					break;
				}
			}
			
			//TO DO: Check memory to see if this room is invalidated because we've already scouted here
			
			if(roomNotFound)
			{
				return(newExit);	//This exit wasn't found in the list of rooms, use this one
			}
			
			if(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax-1)
			{
				currentRoom.memory.exitsVisited++
			}
		}
		console.log(unit.name + ' trying to find exit. weird place ' + unit.room.name);
		if(roomNotFound)
		{
			return(newExit);	//This exit wasn't found in the list of rooms, use this one
		}
		else
		{
			console.log(unit.name + ' no found exit in ' + unit.room.name);
		}
	}
	else if(currentRoom.memory.exitsVisited >= currentRoom.memory.exitMax)
	{
		console.log(unit.name + ' exit visited is higher then exit max in ' + currentRoom.name + ', ' + currentRoom.memory.exitsVisited + ', ' + currentRoom.memory.exitMax);
	}
	else if(currentRoom == null || currentRoom.memory.exitsVisited == null || currentRoom.memory.exitMax == null)
	{
		console.log('find next room was given null values.');
	}
	//return(null);	//All exits lead to rooms we've been to, end of path reached.
	return(getRoomForExit(unit, currentRoom.memory.exitsVisited));
 }
 
 function createPreviousExit()
 {
	if(Game.cpuLimit >= 500)
	{
		var route = getRoute();
		
		var sourceId = route.usingSourceId;
		var currentRoom = route.routeStart.roomName;
		var startPosition = new RoomPosition(unit.memory.startPos.x, unit.memory.startPos.y, unit.memory.startPos.roomName);
		var exit = route.routeEnd;
		//console.log('found exit: ' + sourceId + ' with route ' + routeToExit + ' at destination ' + exit);
		
		//If in room I control, make path from spawns to relevant exit, otherwise from current
		//position to the relevant exit.
		if(currentRoom.controller != null && currentRoom.controller.owner != null && 
			currentRoom.controller.owner.username == 'RaskVann')
		{
			var pathMade = followFlagForward.createPathFromSpawn(exit, currentRoom, sourceId);
			if(pathMade)
			{
				popRoute();
				return(true);
			}
			else
			{
				return(false);
			}
		}
		else if(startPosition != null && exit != null)
		{
			//console.log(currentRoom + ', ' + startPosition + ', ' + exit + ', ' + sourceId);
			var pathMade = followFlagForward.createDefinedPath(currentRoom, startPosition.findPathTo(exit, {maxOps: 4000}), sourceId, false);
			if(pathMade)
			{
				popRoute();
				return(true);
			}
			else
			{
				return(false);
			}
		}
		else
		{
			console.log(unit.name + ' trying to create path in room: ' + unit.room.name + ' with null values.');
		}
	}
	return(false);
 }

 //This unit creates a path in it's current room to the newExit passed in. It links itself to this new
 //path so it can follow it
 function createPathToExit(unit, currentRoom, newExit)
 {
	//If can't find a flag in the room that matches id we're trying to create, create a path
	if(followFlagForward.findFlag(unit, newExit) == null)
	{
		var routeToExit = Game.map.findExit(currentRoom.name, newExit);
		var startPosition = new RoomPosition(unit.memory.startPos.x, unit.memory.startPos.y, unit.memory.startPos.roomName);
		var exit = startPosition.findClosestByRange(routeToExit);
		//console.log('found exit: ' + newExit + ' with route ' + routeToExit + ' at destination ' + exit);
		
		//If in room I control, make path from spawns to relevant exit, otherwise from current
		//position to the relevant exit.
		if(currentRoom.controller != null && currentRoom.controller.owner != null && 
			currentRoom.controller.owner.username == 'RaskVann')
		{
			if(followFlagForward.createPathFromSpawn(exit, currentRoom, newExit))
			{
				//There shouldn't be any scouts for this to send to, unless this is another spawn of mine
				return(newExit);
			}
		}
		else if(startPosition != null && exit != null)
		{
			//console.log(currentRoom + ', ' + startPosition + ', ' + exit + ', ' + newExit);
			if(followFlagForward.createDefinedPath(currentRoom, startPosition.findPathTo(exit, {maxOps: 2000}), newExit, false))
			{
				return(newExit);
			}
		}
		else
		{
			console.log(unit.name + ' trying to create path in room: ' + unit.room.name + ' with null values.');
		}
	}
	else
	{
		console.log(unit.name + ' in room ' + unit.room.name + ' trying to create path to exit but previous flag exists so canceling creation.');
	}
	return(null);
 }

 function evaluateThreat(currentRoom)
 {
	//		-1 threat, friendly room, no enemy creeps
	//		0 threat no enemy creeps found, uncontrolled room
	//		1 threat no enemy creeps found, controlled room
	//		2 threat no enemy attacking body found, no spawning capacity
	//		3 threat no enemy attacking body found, spawning capacity,
	//TODO:	4 threat enemy attacking body found in past, room is in alert (save time and don't lower for +1500 ticks)
	//		5 threat enemy attacking body < 5, does not grow during watch
	//		6 threat enemy attacking body < 10, does not grow during watch
	//		7 threat enemy attacking body < 20, does not grow during watch
	//		8 threat enemy attacking body >= 20, does not grow during watch
	//TODO:	9 threat enemy attacking body < 5, grows during watch
	//TODO:	10 threat enemy attacking body < 10, grows during watch
	//TODO:	11 threat enemy attacking body < 20, grows during watch
	//TODO:	12 threat enemy attacking body >= 20, grows during watch
	var targetCreep = currentRoom.find(FIND_HOSTILE_CREEPS);
	if(targetCreep != null && targetCreep.length > 0)
	{
		var totalHostileBody = 0;
		for(hostileUnit in targetCreep)
		{
			totalHostileBody += targetCreep[hostileUnit].getActiveBodyparts(RANGED_ATTACK);
			totalHostileBody += targetCreep[hostileUnit].getActiveBodyparts(ATTACK);
		}
		
		if(totalHostileBody <= 0)
		{
			var targetSpawns = currentRoom.find(FIND_HOSTILE_SPAWNS);
			if(currentRoom.memory.threat != null && currentRoom.memory.threat >= 4)
			{
				//TO DO: save time and don't lower for +1500 ticks. There was previously a threat and it has disappeared
				return(4);
			}
			else if(targetSpawns.length <= 0)
			{
				//console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with 0 hostile body, no enemy spawns found');
				//Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with 0 hostile body, no enemy spawns found', 10);
				return(2);
			}
			else
			{
				//console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with 0 hostile body, ' + targetSpawns.length + ' spawns found, owned by ' + targetSpawns[0].owner.username);
				//Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with 0 hostile body, ' + targetSpawns.length + ' spawns found, owned by ' + targetSpawns[0].owner.username, 10);
				return(3);
			}
		}
		else if(totalHostileBody < 5)
		{
			console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username);
			Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username, 10);
			if(currentRoom.memory.threat != null && currentRoom.memory.threat < 5)
			{
				if(currentRoom.memory.threat <= 4)
				{
					//TO DO: Previous threat didn't exist, it now does (between 1 and 4)
				}
				return(9);
			}
			return(5);
		}
		else if(totalHostileBody < 10)
		{
			console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username);
			Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username, 10);
			if(currentRoom.memory.threat != null && currentRoom.memory.threat < 6)
			{
				if(currentRoom.memory.threat <= 4)
				{
					//TO DO: Previous threat didn't exist, it now does (between 5-9)
				}
				else if(currentRoom.memory.threat == 5 || currentRoom.memory.threat == 9)
				{
					//TO DO: Previous threat was between 1-4, now grew to 5-9
				}
				return(10);
			}
			return(6);
		}
		else if(totalHostileBody < 20)
		{
			console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username);
			Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username, 10);
			if(currentRoom.memory.threat != null && currentRoom.memory.threat < 7)
			{
				if(currentRoom.memory.threat <= 4)
				{
					//TO DO: Previous threat didn't exist, it now does (between 10-19)
				}
				else if(currentRoom.memory.threat == 5 || currentRoom.memory.threat == 9)
				{
					//TO DO: Previous threat was between 1-4, now grew to 10-19
				}
				else if(currentRoom.memory.threat == 6 || currentRoom.memory.threat == 10)
				{
					//TO DO: Previous threat was between 5-9, now grew to 10-19
				}
				return(11);
			}
			return(7);
		}
		else
		{
			console.log(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username);
			Game.notify(currentRoom + ' has ' + targetCreep.length + ' creeps with ' + totalHostileBody + ' hostile body, first unit owned by ' + targetCreep[0].owner.username, 10);
			if(currentRoom.memory.threat != null && currentRoom.memory.threat < 8)
			{
				if(currentRoom.memory.threat <= 4)
				{
					//TO DO: Previous threat didn't exist, it now does 20+
				}
				else if(currentRoom.memory.threat == 5 || currentRoom.memory.threat == 9)
				{
					//TO DO: Previous threat was between 1-4, now grew to 20+
				}
				else if(currentRoom.memory.threat == 6 || currentRoom.memory.threat == 10)
				{
					//TO DO: Previous threat was between 5-9, now grew to 20+
				}
				else if(currentRoom.memory.threat == 7 || currentRoom.memory.threat == 11)
				{
					//TO DO: Previous threat was between 10-19, now grew to 20+
				}
				return(12);
			}
			return(8);
		}
	}
	else
	{
		if(currentRoom.controller != null && currentRoom.controller.owner != null && currentRoom.controller.owner.username == 'RaskVann')
		{
			//console.log(currentRoom + ' Room controlled by me, no enemy creeps found');
			//Game.notify(currentRoom + ' Room controlled by me, no enemy creeps found', 10);
			return(-1);	//Room controlled by me, no enemy creeps found
		}
		else if(currentRoom.controller == null || (currentRoom.controller != null && currentRoom.controller.owner == null))
		{
			//console.log(currentRoom + ' No enemy creeps found, not controlled');
			//Game.notify(currentRoom + ' No enemy creeps found, not controlled', 10);
			return(0);	//No enemy creeps found, not controlled, threat 0
		}
		else if(currentRoom.controller.owner != null && currentRoom.controller.owner.username != 'RaskVann')
		{
			//console.log(currentRoom + ' No enemy creeps found, controlled by: ' + currentRoom.controller.owner.username);
			//Game.notify(currentRoom + ' No enemy creeps found, controlled by: ' + currentRoom.controller.owner.username, 10);
			return(1);	//No enemy creeps found, controlled by someone else, threat 1
		}
	}
 }
 
 function updateDistanceMoved(unit)
 {
	if(unit.memory.distanceMoved == null)
	{
		unit.memory.distanceMoved = 0;
	}
	if(unit.memory.pathLength != null)
	{
		unit.memory.distanceMoved += unit.memory.pathLength;
	}
 }
 
 function reportInjury(unit)
 {
	if(unit.hits < unit.hitsMax)
	{
		//Report was attacked (and they couldn't insta-kill with damage)
		var rangedTargets = unit.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
		if(rangedTargets.length > 0)
		{
			var owners = '';
			for(var x in rangedTargets)
			{
				owners += rangedTargets[x].owner.username + ', ';
			}
            Game.notify('Enemy found after injuring: ' + unit.name + ' of owners: ' + owners + ' in room: ' + unit.room.name, 10);
		}
		else
		{
			Game.notify('No enemy found after injuring: ' + unit.name + ' in room: ' + unit.room.name + ' at time: ' + Game.time, 10);
		}
	}
 }
 
 function getSpawnId(unit)
 {
	//The scouts throw back requests to spawn other scouts to continue their search. This populates a saved ID
	//to the spawner in the room where this scout came from so this can continue. Also double checks the spawner
	//if it's ready for more requests before the scouts go out and do more work so we don't overload the spawner
	//with requests it can't deal with right now.
	var useSpawn;
	if(unit.memory.spawnID != null)
	{
		useSpawn = Game.getObjectById(unit.memory.spawnID);	//Spawn new units at this spawn
	}
	else	//Populate spawnID
	{
		//For some stupid reason Game.spawns[0] doesn't work, but passing it a aguement from a for(var x in y) does
		for(var x in Game.spawns)
		{
			if(unit.room.name == Game.spawns[x].room.name)
			{
				//console.log(unit.name + ' setting spawn id. ' + Game.spawns[x].id + ' has memory? ' + Game.spawns[x].memory);
				unit.memory.spawnID = Game.spawns[x].id;	//Spawn new units at the last spawn the scout has seen
				useSpawn = Game.spawns[x];
				break;
			}
		}
	}
	
	if(useSpawn == null)
	{
		console.log(unit.name + ' did not find a spawn to use in ' + unit.room.name);
	}
	else if(useSpawn.memory == null)
	{
		console.log(unit.name + ' found spawn, null memory from id ' + unit.memory.spawnID + ' while in room: ' + unit.room.name + '.');
	}
	return(useSpawn);
 }
 
 function getPreviousRoom(unit)
 {
	if(unit.memory.roomName != null && unit.room.name != unit.memory.roomName)
	{
		//If we enter in the function while roomName hasn't updated then memory.roomName is the previousRoom
		return(unit.memory.roomName);
	}
	else if(unit.memory.previousRoom != null && unit.room.name == unit.memory.roomName)
	{
		//Otherwise the previousValue is updated and we can use it.
		return(unit.memory.previousRoom);
	}
	//console.log(unit.name + ' found roomName and previousRoom not defined.');
	return(null);
 }
 
 function scoutsInEachRoom(unit)
 {
	var lastScout = unit;
	var count = 0;
	var limit = 50;
	while(lastScout != null && getPreviousRoom(lastScout) != null && count++ < limit)
	{
		lastScout = scoutFromRoomName(getPreviousRoom(lastScout));
	}
	
	if(lastScout != null)
	{
		if(lastScout.room.controller != null &&
			lastScout.room.controller.owner != null &&
			lastScout.room.controller.owner.username == 'RaskVann')
		{
			//console.log('Starting from ' + unit.name + ' there is a scout in each room ending at ' + lastScout.name + ' in my room');
			return(true);
		}
		else
		{
			//console.log('Starting from ' + unit.name + ' there is a scout in each room ending at ' + lastScout.name + ' in ' + lastScout.room.name);
			return(false);
		}
	}
	else
	{
		//console.log(unit.name + ' in ' + unit.room.name + ' trying to find scout in ' + getPreviousRoom(unit) + ' failed in ' + unit.memory.previousRoom + ' or in subsequent room.');
	}
	
	if(count+1 >= limit)
	{
		console.log(unit.name + ' ran into infinite loop looking through previousRoom');
	}
	return(false);
 }
 
 //We store the last room the scout came from in unit.memory.previousRoom. We pass that value in
 //here to get the room we're trying to do something in and return back a unit from that room
 function scoutFromRoomName(roomName)
 {
	if(roomName != null)
	{
		for(var scouts in Game.creeps)
		{
			if(Game.creeps[scouts].memory.role == 'scout' && 
				Game.creeps[scouts].room.name == roomName)
			{
				return(Game.creeps[scouts]);
			}
		}
		//console.log('scoutFromRoomName: could not find scout in ' + roomName + ' needed for creation of route.');
	}
	return(null);
 }
 
 function getRoute()
 {
	if(Memory.scoutRoute != null && Memory.scoutRoute.scoutRoute0 != null)
	{
		return(Memory.scoutRoute.scoutRoute0);
	}
	return(null);
 }
 
 function popRoute()
 {
	Memory.scoutRoute.scoutRoute0 = Memory.scoutRoute.scoutRoute1;
	Memory.scoutRoute.scoutRoute1 = Memory.scoutRoute.scoutRoute2;
	Memory.scoutRoute.scoutRoute2 = Memory.scoutRoute.scoutRoute3;
	Memory.scoutRoute.scoutRoute3 = Memory.scoutRoute.scoutRoute4;
	Memory.scoutRoute.scoutRoute4 = Memory.scoutRoute.scoutRoute5;
	Memory.scoutRoute.scoutRoute5 = Memory.scoutRoute.scoutRoute6;
	Memory.scoutRoute.scoutRoute6 = Memory.scoutRoute.scoutRoute7;
	Memory.scoutRoute.scoutRoute7 = null;
 }
 
 function isScoutRouteEmpty()
 {
	if(Memory.scoutRoute == null)
	{
		return(true);
	}
	else
	{
		return(Memory.scoutRoute.scoutRoute0 == null && Memory.scoutRoute.scoutRoute1 == null && 
				Memory.scoutRoute.scoutRoute2 == null && Memory.scoutRoute.scoutRoute3 == null && 
				Memory.scoutRoute.scoutRoute4 == null && Memory.scoutRoute.scoutRoute5 == null && 
				Memory.scoutRoute.scoutRoute6 == null && Memory.scoutRoute.scoutRoute7 == null);
	}
 }
 
 function storeRoute(unit, id)
 {
	var routeToExit = Game.map.findExit(unit.room.name, id);
	var startPosition = new RoomPosition(unit.memory.startPos.x, unit.memory.startPos.y, unit.memory.startPos.roomName);
	var exit = startPosition.findClosestByRange(routeToExit);
	
	var route = [ { routeStart: startPosition, routeEnd: exit, usingSourceId: id } ];
	if(Memory.scoutRoute == null || Memory.scoutRoute.scoutRoute0 == null)
	{
		Memory.scoutRoute.scoutRoute0 = route;
		Memory.scoutRoute.scoutRoute1 = null;
		Memory.scoutRoute.scoutRoute2 = null;
		Memory.scoutRoute.scoutRoute3 = null;
		Memory.scoutRoute.scoutRoute4 = null;
		Memory.scoutRoute.scoutRoute5 = null;
		Memory.scoutRoute.scoutRoute6 = null;
		Memory.scoutRoute.scoutRoute7 = null;
	}
	else if(Memory.scoutRoute.scoutRoute1 == null)
	{
		Memory.scoutRoute.scoutRoute1 = route;
	}
	else if(Memory.scoutRoute.scoutRoute2 == null)
	{
		Memory.scoutRoute.scoutRoute2 = route;
	}
	else if(Memory.scoutRoute.scoutRoute3 == null)
	{
		Memory.scoutRoute.scoutRoute3 = route;
	}
	else if(Memory.scoutRoute.scoutRoute4 == null)
	{
		Memory.scoutRoute.scoutRoute4 = route;
	}
	else if(Memory.scoutRoute.scoutRoute5 == null)
	{
		Memory.scoutRoute.scoutRoute5 = route;
	}
	else if(Memory.scoutRoute.scoutRoute6 == null)
	{
		Memory.scoutRoute.scoutRoute6 = route;
	}
	else if(Memory.scoutRoute.scoutRoute7 == null)
	{
		Memory.scoutRoute.scoutRoute7 = route;
	}
	else
	{
		console.log('scout route is full and trying to store another.');
	}
 }

 function scout(unit, scoutsSeen, previousScoutState)
 {
	if(unit.ticksToLive <= 2)
	{	//Unit ran out of time, could still have more room to explore so we're not calling exploreEnd
		//This should be fixed to call removeScout(unit) when the scouts are properly working
		//console.log(unit.name + ' attempted to remove memory ' + Memory.creeps[unit.name] + ' before death.');
		delete Memory.creeps[unit.name];
		unit.suicide();
		return('travel');
	}
	else
	{
		reportInjury(unit);
	}
	 
	if(previousScoutState == 'ready' || previousScoutState == 'travel')
	{
		//Everything going well, continue on with regular scout logic
	}
	else if(previousScoutState == 'exploreEnd')
	{
		//unit.room.memory.exitsVisited++;	//Code tied to visiting room increases exitsVistited for me
		
		//Change the name of the room stored here, this is a cheap way to trigger
		//the 'im in a new room' code below to generate a new route if needed and follow it.
		unit.memory.roomName = 'changeRouteFromDeadEnd';
		//TO DO: If position is messed up or want to make sure startPos is maintained since it's
		//still valid, copy the same code here as the roomChange and remove the uncessary bits
	}
	else if(previousScoutState != null)
	{
		console.log('DEPRECATED, STOP THE SOURCE');
		console.log(unit.name + ' creating path: ' + previousScoutState + ' in ' + unit.room + ' usedCpu: ' + Game.getUsedCpu() + ' limit: ' + Game.cpuLimit);
		//If got this far then we've sent a new id to be implemented in a route, create it and
		//send to the next scout waiting further behind
		return(createPathToExit(unit, unit.room, previousScoutState));
	}
	
	//Here just in case, will overwrite logic so be careful with this flag.
	if(Game.flags.Scout != null)
	{
		unit.moveTo(Game.flags.Scout);
	}

	var currentRoom = unit.room;
	var useSpawn = getSpawnId(unit);
	var scoutsInAllPreviousRooms = scoutsInEachRoom(unit);
	
	//When entering a new room and if the room is the room we intended and there are scouts
	//in all previous rooms for us to send information to.
	//TO DO: Potentially reach a state in that roomName is changed but the path isn't created. May want to check
	//		if the flag isn't found and create a path independent of entering a new room.
	if(((unit.memory.roomName != unit.room.name) || unit.memory.roomName == null) && 
		(unit.room.name == unit.memory.usingSourceId || unit.memory.usingSourceId == null) && 
		scoutsInAllPreviousRooms)
	{
		//Visited all exits from this room, we need to find another room, hopefully down this path
		//and go to that room to continue exploring
		if(unit.memory.roomName != null)
		{
			//Look for scouts here when regressively creating paths
			//By design is empty when in first room (mine) as it's checked for to trigger effects later
			unit.memory.previousRoom = unit.memory.roomName;
		}
		unit.memory.startPos = unit.pos;
		unit.memory.roomName = unit.room.name;
		
		//This will mess up if the scout bounces back and forth between rooms for any length of time
		if(currentRoom.memory.exitMax == null)
		{
			//Find and assign how many exits are in this room
			currentRoom.memory.exitsVisited = 0;
			var roomExits = Game.map.describeExits(unit.room.name);
			var countExits = 0;
			for(var i in roomExits)
			{
				if(roomExits[i] != null)
				{
					countExits++;
				}
			}
			currentRoom.memory.exitMax = countExits;
		}
		//If we're entering into a new room, and this is the lead scout. And we've already
		//been here before. Increment the exitsVisited to go to a new location to explore.
		else if(scoutsSeen == 0)
		{
			//TO DO: We're not differentiating returning scouts because the first one timed out exploring
				//which would trigger these conditions accidently since they're just trying to make it to the front
				//lines again.
				
			//If there are more areas to explore, move on to next exit, otherwise remove this unit
			if(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax-1)
			{
				currentRoom.memory.exitsVisited++;
			}
			else if(useSpawn == null)
			{
				console.log(unit.name + ' has null spawn assigned when finding dead end');
			}
			else
			{
				useSpawn.memory.requestScout = 1;	//Replace the unit with one from spawn
				//var report = removeScout(unit);
				//return(report);
			}
		}
		
		if(currentRoom.memory.exitsVisited < currentRoom.memory.exitMax)
		{
			if(unit.memory.roomsMoved == null)
			{
				unit.memory.roomsMoved = 0;
			}
			else
			{
				unit.memory.roomsMoved++;
			}

			var newExit;
			if(scoutsSeen == 0)	//If lead scout, find a new room
			{
				newExit = findNextRoom(unit, currentRoom);
				if(newExit == null)	//All remaining rooms have been visited, end of this route
				{
					useSpawn.memory.requestScout = 1;	//Replace the unit with one from spawn
					var report = removeScout(unit);
					return(report);
				}
			}
			else	//Otherwise use current exit and follow the lead scout
			{
				newExit = getRoomForExit(unit, currentRoom.memory.exitsVisited);
			}
			
			//All following scouts should find a flag underneath to follow, TO DO: error if not
			var foundFlag = followFlagForward.findFlag(unit, newExit)
			if(newExit == null)
			{
				console.log('Cant find exit: ' + newExit + ', or flag: ' + foundFlag + ', or spawn: ' + useSpawn + ', for scout: ' + unit.name + ', in room: ' + unit.room.name);
				//TO DO: Suicide point for scout?
				//var report = removeScout(unit);
				//return(report);
			}
			else if(foundFlag != null)
			{
				//console.log(unit.name + ' found flag with path: ' + newExit + ' move to this flag and follow it.');
				//Found a existing flag for this path, follow it instead of creating a new one.
				unit.memory.usingSourceId = newExit;
				//This flag may have more up to date information then what we have saved, save it before updating in the next function
				unit.memory.pathLength = foundFlag.memory.pathLength;
				updateDistanceMoved(unit);
				delete unit.memory.direction;	//Shouldn't be needed, but flags are spawning in wrong place, temp fix
			}
			//All lead scouts should not find a flag and so should create a new path to next room
			else if(useSpawn != null)
			{
				//Entering a room of someone else, if the route is to short or a route can't be found
				//the creation of the route fails and this isn't handled in createPathToExit. We don't
				//want to bother other players anyway so we'll kill the scout if this happens to avoid.
				if(currentRoom.controller != null && currentRoom.controller.owner != null && 
					currentRoom.controller.owner.username != 'RaskVann')
				{
					console.log(unit.name + ' entered ' + unit.room.name + ' of user: ' + currentRoom.controller.owner.username + ' aborting scout.');
					useSpawn.memory.requestScout = 1;
					var report = removeScout(unit);
					return(report);
				}
				else
				{
					//console.log(unit.name + ' creating another scout, creating path to ' + newExit);
					//Get another scout on the field. We'll be moving to the next room and we'll need another
					//scout to take up the former location so we can pass new paths to it.
					useSpawn.memory.requestScout = 1;
					updateDistanceMoved(unit);
					
					//First this unit creates a path to sources[x] in currentRoom, then we go to the previousRoom and get a unit
					//there that creates a path going to the current exit/path in the previous room. We keep going to previous rooms
					//and create paths to this new place for as long as there is a new previousRoom 
					var nextSourceId = createPathToExit(unit, currentRoom, newExit);
					//storeRoute(unit, newExit)
					unit.memory.usingSourceId = newExit;
					delete unit.memory.direction;	//Attach self to new route
					
					if(unit.memory.previousRoom != null)
					{
						for(var nextScout = scoutFromRoomName(unit.memory.previousRoom); nextSourceId != null && nextScout != null; nextScout = scoutFromRoomName(nextScout.memory.previousRoom))
						{
							console.log(unit.name + ' creating path in room ' + unit.room.name + ' createPath returned ' + nextSourceId + '. ' + nextScout + ' now creating ' + newExit + ' in ' + nextScout.room);
							//TO DO: Should be able to append information or place new flags onto all places in this room where 
							//		nextScout.memory.usingSourceId is found on flags since a route was previously laid out.
							nextSourceId = createPathToExit(nextScout, nextScout.room, newExit);
							//nextScout.memory.usingSourceId = newExit;
							//Shouldn't need delete direction since this should be the same route as what was origionally followed
						}
						console.log(unit.name + ' creating path in room ' + unit.room.name + ' createPath returned ' + nextSourceId);
					}
					else
					{
						console.log(unit.name + ' was going to create a new path but no found previousRoom. If ' + unit.room.name + ' is home? then fine');
					}
					
					if(nextSourceId == null)
					{
						console.log(unit.name + ' returned null when creating createPathToExit(), there is potential an incomplete path was formed in or closer to ' + unit.room.name);
					}
					
					//TO DO: New code for 'we are creating paths'?
					return('travel');
				}
			}
		}
	}
	//If the scout is in a new room and it's the room we intend to be in and it's 
	//found that there isn't scouts in all the rooms we need, the spawn isn't spawning 
	//anything (not needed, but this ensures it will react within 1 tick), and there 
	//isn't a scout in the spawn room, spawn a scout
	else if(unit.memory.roomName != unit.room.name && 
			(unit.room.name == unit.memory.usingSourceId || unit.memory.usingSourceId == null) && 
			scoutsInAllPreviousRooms == false && useSpawn != null && useSpawn.spawning == null && 
			scoutFromRoomName(useSpawn.room.name) == null)
	{
		useSpawn.memory.requestScout = 1;
	}

	//This unit shouldn't be created until the spawner has the chance to set everything it needs in the core room. This is for every other room the scout visits.
	//Create harvesters and gatherers needed for this room if it hasn't done so already. This only happens once on first entering the room for the first time.
	//if(currentRoom.controller != null && isScoutsReady(useSpawn) && Game.cpuLimit >= 500)
	if(currentRoom.controller != null && scoutsInAllPreviousRooms && Game.cpuLimit >= 500)
	{
		//With how intensive this may be, we delay this procedure until we are at a state
		//where we have a ton of resources so this can complete
		//This first if statement checks if we've found a unclaimed room with energy sources in it and
		//the spawn is in a state it can accept more harvesters/gatherers, it queues up the units and
		//creates the paths in this room for the harvesters/gatherers to use
		if(currentRoom.controller.owner == null)
		{
			//WARNING: If secondary paths in previous rooms aren't being established then it's probably
			//		because we're running out of CPU. may want to move this check elsewhere specifically
			//		for 'later' scouts that are picking up and creating additional paths.
			var sources = currentRoom.find(FIND_SOURCES);
			//console.log('Scout-Room: ' + currentRoom.name + ' with sources: ' + sources.length);
			var pathLength = 1;
			//Only the first scout should be performing the creation of harvesters, gatherers and initial paths
			//TO DO: Only do if passed in status of all scouts is 'ready'
			for(var x = 0; scoutsSeen == 0 && x < sources.length; x++)
			{
				if(harvestIdInList(useSpawn, sources[x].id) ||
					followFlagForward.findFlag(unit, sources[x].id) != null)
				{
					//Found a flag that goes to this source already, ignore creation for this source.
					continue;
				}
				var startPosition = new RoomPosition(unit.memory.startPos.x, unit.memory.startPos.y, unit.memory.startPos.roomName);
				var pathToSource = startPosition.findPathTo(sources[x], {maxOps: 2000});
				pathLength = pathToSource.length + unit.memory.distanceMoved;
				console.log(unit.name + ' has recorded distance: ' + unit.memory.distanceMoved + ' and distance to next source: ' + pathToSource.length);
				//Around length 160-180 we hit twice as much profit as the cost to extract that node, cut off sending harvesters at this point.
				//I'm assuming I'm more then half efficient with harvesting and so this will net a profit. Inefficiency in gatherers going where
				//a harvester isn't or vice versa will create some amount of waste but don't know how much.
				if(pathLength < 160)
				{
					//console.log(unit.name + ' trying to create path to source ' + sources[x].id + ' and add units to spawners list');
					
					followFlagForward.createDefinedPath(currentRoom, pathToSource, sources[x].id, true);
					followFlagForward.updatePathLength(sources[x].id, pathLength);

					addHarvestId(useSpawn, sources[x].id);
					addNeedHarvest(useSpawn, 1);
					//Alternative Gatherer per Harvester= ABSOLUTE(ROUND_UP((HarvestRate*(DistanceToNode*2))/CapacityPerGatherer))
					//A quirk of gatherer capacity with CARRY,MOVE pattern is energy cost/2 is equivalent to their carry capacity
					var gatherAmount = Math.abs(Math.ceil(10.0*2.0*pathLength/(useSpawn.room.energyCapacityAvailable*.5)));
					addNeedGather(useSpawn, gatherAmount);
					
					//console.log(unit.name + ' success, added harvester for: ' + sources[x].id + ' and gatherer(s): ' + gatherAmount + ' to pending list for creation in spawn ' + useSpawn);
					
					//First this unit creates a path to sources[x] in currentRoom, then we go to the previousRoom and get a unit
					//there that creates a path going to the current exit/path in the previous room. We keep going to previous rooms
					//and create paths to this new place for as long as there is a new previousRoom 
					if(unit.memory.previousRoom != null)
					{
						var nextSourceId = 1;
						//WARNING: There is a danger this is cyclical if a previousRoom points to a room we've already created a path in
						//TO DO: Validate first by going through the path, ensuring the last one points at controller.owner.name = 'RaskVann'
						//and isn't endless (end after a few dozen checks)
						for(var nextScout = scoutFromRoomName(unit.memory.previousRoom); nextSourceId != null && nextScout != null; nextScout = scoutFromRoomName(nextScout.memory.previousRoom))
						{
							//TO DO: Should be able to append information or place new flags onto all places in this room where 
							//		nextScout.memory.usingSourceId is found on flags since a route was previously laid out.
							console.log(unit.name + ' creating path in room ' + unit.room.name + ' createPath returned ' + nextSourceId + '. ' + nextScout + ' now creating ' + newExit + ' in ' + nextScout.room);
							nextSourceId = createPathToExit(nextScout, nextScout.room, sources[x].id);
						}
						console.log(unit.name + ' creating path in room ' + unit.room.name + ' createPath returned ' + nextSourceId);
						
						if(nextSourceId == null)
						{
							console.log(unit.name + ' returned null when creating createPathToExit(), there is potential an incomplete path was formed in or closer to ' + unit.room.name);
						}
					}
					else
					{
						console.log(unit.name + ' was going to create a new path but no found previousRoom. If ' + unit.room.name + ' is home? then fine');
					}
					
					return('travel');	//Creating path, may want another code
				}
				else
				{
					console.log(unit.name + ' trying to path to ' + sources[x] + ' but path is to long: ' + pathLength + ' from scout length: ' + unit.memory.distanceMoved);
				}
			}
		}
		else if(currentRoom.controller.owner != null && currentRoom.controller.owner.username == 'RaskVann')
		{
			//Happens when enter a room I control. Moved code above to where unit.memory.spawnID == null it then
			//looks for a spawn that unit shares the same room with and assigns that ID.
			
			//If scout has returned to the spawn room again, reset the distance counter to outer rooms
			if(unit.memory.distanceMoved == null)
			{
				unit.memory.distanceMoved = 0;
			}
			else
			{
				//console.log(unit.name + ' is in ' + currentRoom.name + ' (I control).');
			}
		}
		else if(currentRoom.controller.owner != null)
		{
			console.log('Scout-Room: ' + currentRoom.name + ' with owner: ' + currentRoom.controller.owner.username + ', ignoring it for harvesting.');
			Game.notify('Scout-Room: ' + currentRoom.name + ' with owner: ' + currentRoom.controller.owner.username + ', send message to user about expansion.', 10);
			
			//TO DO: Create another unit type after all exploration is done, he moves to all the stored user occupied rooms and sits there
			//		for a certain amount of time looking for attackers and auto spawning attackers (potentially add a attack/ranged/heal
			//		body to trigger it on purpose. Send back findings and set a threat level accordingly,
			currentRoom.memory.owner = currentRoom.controller.owner.username;
			currentRoom.memory.threat = evaluateThreat(currentRoom);
			useSpawn.memory.requestScout = 1;	//Replace the unit with one from spawn
			var report = removeScout(unit);
			return(report);
		}
		else
		{
			//currentRoom.memory.threat = evaluateThreat(currentRoom);
			console.log('Scout abandoned creating paths, most likely cpu is to high or is traveling');
		}
	}
	else if(currentRoom.controller == null)
	{		//Is evaluated once when a 'no controller' room is entered and defines the threat value and again in the next tick
			//to find if there is a source defined and populates that if needed (more CPU effective this way)
		if(currentRoom.memory.sources == null)
		{
			if(currentRoom.memory.threat == null)
			{
				var threat = evaluateThreat(currentRoom);
				
				console.log('Scout-Room: ' + currentRoom.name + ' no controller in this room with threat: ' + threat);
				Game.notify('Scout-Room: ' + currentRoom.name + ' no controller in this room with threat: ' + threat, 10);
				currentRoom.memory.threat = threat;
			}
			else
			{
				var sources = currentRoom.find(FIND_SOURCES);
				if(sources != null)
				{
					console.log('Scout-Room: ' + currentRoom.name + ' AI Room with sources: ' + sources.length);
					Game.notify('Scout-Room: ' + currentRoom.name + ' AI Room with sources: ' + sources.length, 10);
					currentRoom.memory.sources = sources.length;
					
					//var threat = evaluateThreat(unit.room);
					//unit.room.memory.threat = threat;
					//if(threat > 4)	//Enemy units with attacking body found, we could try to outrun them but we'll skip to the next scout instead
					//{
						//var report = removeScout(unit);
						//return(report);	//This is a defended room, explore another route for now
					//}
				}
				else
				{
					console.log(unit.name + ' no sources found in ' + unit.room.name);
					currentRoom.memory.sources = 0;
				}
			}
		}
		else
		{
			console.log(unit.name + ' already recorded sources in room ' + unit.room.name + ' skipping logic to assign this.');
			//TO DO: Save this room, when have plenty of resources continually send attackers to this room until can explore past it.
		}
	}
	
	//If at edge of map, move until off of edge, 
	//OR
	//If this is the lead scout and it's had a chance to run the 'ive entered a new room' code
	//(leader doesn't fit in the logic we have for 'trail behind the previous unit by 1 room' logic)
	//OR
	//If the spawner isn't trying to spawn anything and we've had a chance to handle 'i am in a new room' 
	//logic. We should be free to travel if there is an appropriate number of scouts alive compared to 
	//the number of rooms this unit has moved. (Need 1 unit in each room, following leader 0).
	if(canScoutMove(unit, useSpawn, scoutsSeen))
	{
		followFlagForward(unit, true);
		//console.log(unit.name + ' moving at scoutAlive: ' + useSpawn.memory.scoutsAlive + ' room moved: ' + unit.memory.roomsMoved + ' above ' + scoutsSeen);
		return('travel');
	}
	else
	{	//Wait for signal to proceed
		//console.log(unit.name + ' harvestEmpty: ' + (useSpawn != null && harvestEmpty(useSpawn)) + ' same room: ' + (unit.memory.roomName != null && unit.memory.roomName == unit.room.name) + 
		//			' move to next room: ' + (useSpawn != null && useSpawn.memory.scoutsAlive != null && unit.memory.roomsMoved != null && useSpawn.memory.scoutsAlive-unit.memory.roomsMoved > scoutsSeen+1));
		return('ready');
	}
	
	return('ready');
 }
 
 //If at edge of map, move until off of edge, 
 //OR
 //If this is the lead scout and it's had a chance to run the 'ive entered a new room' code
 //(leader doesn't fit in the logic we have for 'trail behind the previous unit by 1 room' logic)
 //OR
 //If the spawner isn't trying to spawn anything and we've had a chance to handle 'i am in a new room' 
 //logic. We should be free to travel if there is an appropriate number of scouts alive compared to 
 //the number of rooms this unit has moved. (Need 1 unit in each room, following leader 0).
 ////This isn't used anywhere but followFlagForward but it was so unweildly I seperated into its own function
 function canScoutMove(unit, useSpawn, scoutsSeen)
 {
	var edgeOfMap = (1 > unit.pos.x || unit.pos.x > 48 || 1 > unit.pos.y || unit.pos.y > 48);
	var harvestEmptyAndRoomUpdated = (harvestEmpty(useSpawn) && 
									unit.memory.roomName != null && unit.memory.roomName == unit.room.name);
	var nextRoomMove;
	if(scoutsSeen == 0)	//If the leader
	{
		nextRoomMove = useSpawn.memory.scoutsAlive != null && unit.memory.roomsMoved != null && (useSpawn.memory.scoutsAlive-unit.memory.roomsMoved > scoutsSeen);
	}
	else
	{
		nextRoomMove = useSpawn.memory.scoutsAlive != null && unit.memory.roomsMoved != null && (useSpawn.memory.scoutsAlive-unit.memory.roomsMoved > scoutsSeen+1);
	}
	//console.log(unit.name + ' harvest: ' + harvestEmptyAndRoomUpdated + ' nextRoom: ' + nextRoomMove);
	return(edgeOfMap || (harvestEmptyAndRoomUpdated && nextRoomMove));
 }

 function defendBase(unit)
 {
	if(unit.memory.role == 'defend' && unit.ticksToLive <= 2)
	{
		//A emergency unit has reached end of life, remove it from records.
		//This won't help us for units that die due to fighting.
		console.log(unit.name + ' attempted to remove memory ' + Memory.creeps[unit.name] + ' before death.');
		delete Memory.creeps[unit.name];
		unit.suicide();
		return('death');
	}
	else
	{
		reportInjury(unit);
	}
	 
    if(Game.flags.Attack != null)
    {
        if(unit.attack(Game.flags.Attack) < 0 && Math.abs(unit.pos.getRangeTo(Game.flags.Attack)) > 1)
        {
			unit.moveTo(Game.flags.Attack);
        }
    }
   
    if(unit.getActiveBodyparts(RANGED_ATTACK) > 0)
	{
		var rangedTargets = unit.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
		if(rangedTargets.length > 0)	//Report getting close to a offensive unit (I potentially attacked it) every hour.
		{
			//if(unit.room.mode != 'MODE_SIMULATION')
			//{
				Game.notify('owner: ' + rangedTargets[0].owner.username + ', has ' + rangedTargets.length + 'creeps within range 3, has body length: ' + rangedTargets[0].body.length + ' in room ' + unit.room.name, 60);
			//}
			if(unit.rangedAttack(rangedTargets[0]) == ERR_NOT_IN_RANGE)
			{
				unit.moveTo(rangedTargets[0]);
				return('travel');
			}
		}
	}
	else if(unit.getActiveBodyparts(ATTACK) > 0)
	{
		var targetCreep = unit.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(targetCreep)
		{
			unit.room.memory.requestDefender = 1;
			//if(unit.room.mode != 'MODE_SIMULATION')
			//{
			var rangedAttack = targetCreep.getActiveBodyparts(RANGED_ATTACK);
			var attack = targetCreep.getActiveBodyparts(ATTACK);
			if(rangedAttack > 0 || attack > 0)	//If this unit has offensive capabilities, report in 10 minutes
			{
				Game.notify('owner: ' + targetCreep.owner.username + ', has OFFENSIVE creep, has body length: ' + targetCreep.body.length + ' in room ' + unit.room.name, 10);
				Game.notify('OFFENSIVE target has active MOVE: ' + targetCreep.getActiveBodyparts(MOVE) + ', WORK: ' + targetCreep.getActiveBodyparts(WORK) +
							', CARRY: ' + targetCreep.getActiveBodyparts(CARRY) + ', ATTACK: ' + attack + ', RANGED_ATTACK: ' +
							rangedAttack + ', HEAL: ' + targetCreep.getActiveBodyparts(HEAL) + ', TOUGH: ' +
							targetCreep.getActiveBodyparts(TOUGH), 10);
			}
			else	//If this is a passive unit, report every 24 hours
			{
				Game.notify('owner: ' + targetCreep.owner.username + ', has passive creep, has body length: ' + targetCreep.body.length + ' in room ' + unit.room.name, 1440);
				Game.notify('Passive target has active MOVE: ' + targetCreep.getActiveBodyparts(MOVE) + ', WORK: ' + targetCreep.getActiveBodyparts(WORK) +
							', CARRY: ' + targetCreep.getActiveBodyparts(CARRY) + ', HEAL: ' + targetCreep.getActiveBodyparts(HEAL) + 
							', TOUGH: ' + targetCreep.getActiveBodyparts(TOUGH), 1440);
			}
			//}
			if(unit.attack(targetCreep) == ERR_NOT_IN_RANGE)
			{
				unit.moveTo(targetCreep);
				return('travel');
			}
		}
		else
		{
			unit.room.memory.requestDefender = 0;
			var targetSource = unit.room.find(FIND_HOSTILE_SPAWNS);
			var targetStructure = unit.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
			//TO DO: check if have valid path, ignore if do not
			if(targetSource.length)
			{
				if(unit.attack(targetSource[0]) == ERR_NOT_IN_RANGE)
				{
					unit.moveTo(targetSource[0]);
					return('travel');
				}
			}
			//TO DO: Prioritize lowest health instead of first found, also check if have valid path
			else if(targetStructure != null)
			{
				if(targetStructure.structureType == 'STRUCTURE_RAMPART')
				{
					if(unit.attack(targetStructure) == ERR_NOT_IN_RANGE)
					{
						unit.moveTo(targetStructure);
						return('travel');
					}
				}
				else if(targetStructure.structureType == 'STRUCTURE_WALL')
				{
					if(unit.attack(targetStructure) == ERR_NOT_IN_RANGE)
					{
						unit.moveTo(targetStructure);
						return('travel');
					}
				}
			}
			else if(Game.flags.Guard != null)
			{
				unit.moveTo(Game.flags.Guard);
				return('travel');
			}
		}
	}
	
	if(Game.flags.Hold != null)
	{
		unit.moveTo(Game.flags.Hold);	//Make unit passive, goes to flag and ignores all previous moves, probably won't attack either.
		return('travel');
	}
	return('attack');
 }

module.exports.attack = function(unit, attackersSeen)
{
    if((unit.memory.role == 'attack' || unit.memory.role == 'defend') && !unit.spawning)
    {
        return(defendBase(unit));
    }
	return(null);
}

 //If consecutiveReady > scoutSpawn.memory.maxScouts then all scouts have been ready for at least 1 round
 function trackScoutReadiness(unit, previousScoutState)
 {
	if(unit.memory.spawnID != null)
	{
		var scoutSpawn = Game.getObjectById(unit.memory.spawnID);
		if(previousScoutState != 'ready')
		{
			scoutSpawn.memory.consecutiveReady = 0;
		}
		else if(scoutSpawn.memory.consecutiveReady == null)
		{
			scoutSpawn.memory.consecutiveReady = 1;
		}
		else
		{
			scoutSpawn.memory.consecutiveReady++;
		}
	}
 }

 //Used to determine if all scouts are ready for major moves (next room, path creation, etc.)
 function isScoutsReady(scoutSpawn)
 {
	if(scoutSpawn == null || scoutSpawn.memory == null)
	{
		console.log(scoutSpawn + ' is trying to check for scouts being ready but scoutSpawn is null or undefined.');
		return(false);
	}
	//First run of this goes before trackScoutReadiness which normally populates consecutiveReady
	//we populate the entry in this first instance so we have something to reference below.
	else if(scoutSpawn.memory.consecutiveReady === undefined || scoutSpawn.memory.consecutiveReady === null)
	// !scoutSpawn.memory.consecutiveReady) scoutSpawn.memory.consecutiveReady === "undefined"
	{
		scoutSpawn.memory.consecutiveReady = 0;
	}
	
	//console.log(scoutSpawn + ' isScoutReady, ' + scoutSpawn.memory.consecutiveReady);
	if(scoutSpawn.memory.scoutsAlive != null)
	{
		//Because every scout checks for the readiness and you retrieve the readiness after the scout is complete
		//we send in a 'ready' for the first scout so he doesn't stall since he won't have any valid readiness to
		//pull from for the first tick. So we'll tell all scouts they are ready if they go through 2 full cycles
		//of all scouts reporting ready to ensure we've retrieved a valid 'ready' status from all scouts.
		
		//If all scouts reported 'ready', give a go ahead for any advanced functionality.
		return(scoutSpawn.memory.consecutiveReady > (scoutSpawn.memory.scoutsAlive));
	}
	return(false);	//one of the checks we need haven't been made yet.
 }

module.exports.scout = function(unit, scoutsSeen, previousScoutState)
{
	if(unit.memory.role == 'scout' && !unit.spawning)
	{
		var pastState = scout(unit, scoutsSeen, previousScoutState);
		trackScoutReadiness(unit, pastState);
		return(pastState);
	}
	return(null);
}