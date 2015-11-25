/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('createPathFlags'); // -> 'a thing'
 */

 var spawnFrom;
 
 //TO DO: Use the spawn that this unit came from. This currently just sends back the first
 //spawn that is in the same room as the unit.
 function findSpawn(unit)
 {
	var useSpawn;
	if(unit.memory.spawnID != null)
	{
		useSpawn = Game.getObjectById(unit.memory.spawnID);	//A spawn this unit can dump resources to
	}
	else
	{
		for(var x in Game.spawns)
		{
			if(unit.room.name == Game.spawns[x].room.name)
			{
				useSpawn = Game.spawns[x].id
				unit.memory.spawnID = useSpawn;
			}
		}
	}
	return(useSpawn);
 }

 function findFlagAtUnit(unit, findSourceId)
 {
	var groupedFlags = unit.pos.lookFor('flag');
	for(var currentFlag in groupedFlags)
	{
		//console.log('dir: ' + groupedFlags[currentFlag]);
		if(groupedFlags[currentFlag].name.startsWith('dir'))
		{
			if(groupedFlags[currentFlag].memory.usingDestinationId != null && findSourceId != null)
			{
				if(groupedFlags[currentFlag].memory.usingDestinationId != findSourceId)
				{
					//If usingDestinationId is populated, and it doesn't match the Id we're using, ignore it. If there
					//is a diverging path, mark it with the matching ID. Anything that doesn't match will continue on
					//the same path, if multiple paths change direction, stack flags with several relevant IDs.
					//WARNING: This divergence is not used in the code, has to be manually entered if paths overlapped
					//since no path knows of any other paths existing.
					continue;
				}
				else
				{
					//console.log(unit.name + ' found flag ' + groupedFlags[currentFlag]);
					return(groupedFlags[currentFlag]);
				}
			}
			else
			{
				//console.log('looking for matching flag at ' + unit.name + ' doesnt have SourceId: ' + findSourceId + ' or flag doesnt have destinationId: ' + groupedFlags[currentFlag].memory.usingDestinationId);
			}
		}
	}
	//console.log('No flag at ' + unit.name + ' with SourceId: ' + findSourceId);
	return(null);
 }

 //Goes through the room and finds a flag that matches the findSourceId, if no flag exists, returns null
 function findFlagInRoom(unit, findSourceId)
 {
	var atFlag = findFlagAtUnit(unit, findSourceId);
	if(atFlag != null)
	{
		return(atFlag);
	}
	else
	{
		//TO DO: Replace with only look at flags within range X if faster. (unit.pos.findInRange(FIND_FLAGS, range)), both listed as 'average'
		var flagsInRoom = unit.room.find(FIND_FLAGS);
		if(findSourceId != null && flagsInRoom.length)
		{
			for(var currentFlag in flagsInRoom)
			{
				if(flagsInRoom[currentFlag].memory.usingDestinationId != null &&
					flagsInRoom[currentFlag].memory.usingDestinationId == findSourceId)
				{
					//console.log(unit.name + ' found flag ' + flagsInRoom[currentFlag]);
					return(flagsInRoom[currentFlag]);
				}
			}
		}
		//console.log(unit.name + ' in room ' + unit.room.name + ' found no flag matching: ' + findSourceId);
	}
	return(null);
 }
 
 //Note: Technically we shouldn't need to copy over a new pathLength every time we pass
 //over a valid flag, however this in place so if a unit is retooled in any way. Especially
 //scouts who create and update routes all the time
 //WARNING: Scouts don't edit old paths and so these older paths that were created to go to 
 //further rooms may not have completely valid path lengths, pathLength in certain instances
 //may be inaccurate with the actual length, depending on the route chosen.
 //WARNING: I don't delete pathLength like I do with .direction so often. So when a unit might
 //discard a path, potentially to go somewhere else, this doesn't mean the pathLength matches
 //what they're currently doing
 function copyPathLength(unit, foundFlag)
 {
	if(unit != null && foundFlag != null &&
		foundFlag.memory.usingDestinationId == unit.memory.usingSourceId &&
		foundFlag.memory.pathLength != null && 
		(unit.memory.pathLength == null || foundFlag.memory.pathLength > unit.memory.pathLength))
	{
		unit.memory.pathLength = foundFlag.memory.pathLength;
		return(unit.memory.pathLength);
	}
	else
	{
		//console.log(unit.name + ' not copying path. Flag id: ' + foundFlag.memory.usingDestinationId + ' vs ' + unit.memory.usingSourceId);
	}
	return(null);
 }
 
 //When a unit at the edge of a map doesn't have enough fatigue to make it through it
 //will attempt to move when on the wrong side of the map, constantly fatiguing itself
 //without going anywhere, this disables movement if the direction won't go anywhere
 //to combat this useless movement.
 function disableMovementEdgeOfMap(unitPos, direction)
 {
	var lowEdge = 0;
	var highEdge = 49;
	//If ON edge of map, transition imminent
	if(unitPos.x == lowEdge || unitPos.y == lowEdge || unitPos.x == highEdge || unitPos.y == highEdge)
	{
		if(unitPos.x == lowEdge && (direction == LEFT || direction == TOP_LEFT || direction == BOTTOM_LEFT))
		{
			return(true);
		}
		else if(unitPos.y == lowEdge && (direction == TOP || direction == TOP_LEFT || direction == TOP_RIGHT))
		{
			return(true);
		}
		else if(unitPos.x == highEdge && (direction == RIGHT || direction == TOP_RIGHT || direction == BOTTOM_RIGHT))
		{
			return(true);
		}
		else if(unitPos.y == highEdge && (direction == BOTTOM || direction == BOTTOM_LEFT || direction == BOTTOM_RIGHT))
		{
			return(true);
		}
	}
	return(false);
 }

 function followPathToFlags(unit, forward)
 {
	if(unit.memory.usingSourceId == null)
	{
		//console.log(unit.name + ' does not have a usingSourceId, needs to be assigned before following/creating path.');
		return(false);
	}

	//var foundFlag = findFlagAtUnit(unit, unit.memory.usingSourceId)
	if(unit.memory.direction != null)// || foundFlag != null)
	{
		//I assumed when creating the direction system that when the unit was created
		//it'd go to the origin of the path before getting a direction, it will go in
		//a predetermined bad direction if it retains its direction through death.
		if(unit.spawning)
		{
			delete unit.memory.direction;
			//console.log('look at unit: ' + unit.name + ' remove the direction');
		}
		
	    var foundFlag = findFlagAtUnit(unit, unit.memory.usingSourceId);
		if(foundFlag != null)
		{
			if(forward == false && foundFlag.memory.returnDirection != null)
			{
				//console.log(unit.name + ' dir: ' + foundFlag.memory.returnDirection);
				unit.memory.direction = foundFlag.memory.returnDirection;
				copyPathLength(unit, foundFlag);
			}
			else
			{
				//console.log(unit.name + ' dir: ' + foundFlag.memory.direction);
			    unit.memory.direction = foundFlag.memory.direction;
				copyPathLength(unit, foundFlag);
			}
		}
		if(disableMovementEdgeOfMap(unit.pos, unit.memory.direction) == false)
		{
			unit.move(unit.memory.direction);
		}
		//console.log(unit.name + ' dir: ' + unit.memory.direction);
		return(true);
	}
	//Can't find/follow the flags, go to the beginning of one we need and failing
	//that create a path with the information we have.
	return(findPathToFlags(unit, forward));
 }

 //Tries to find a path that matches the SourceId the unit has. If none are in the
 //flags present, create a path to the location using the pathTo already created
 function findPathToFlags(unit, forward)
 {
	var findFlag = findFlagInRoom(unit, unit.memory.usingSourceId);
	if(findFlag != null)
	{
		//console.log(unit.name + ' found flag ' + findFlag + ' and attempting to move to it.');
		if(unit.pos.isEqualTo(findFlag.pos) == false)
		{
			if(unit.moveTo(findFlag) == 0)
				return(true);
		}
		else if(forward == false && findFlag.memory.returnDirection != null)
		{
			//console.log(unit.name + ' moves backward dir: ' + findFlag.memory.returnDirection);
			unit.memory.direction = findFlag.memory.returnDirection;
			copyPathLength(unit, findFlag);
			unit.move(unit.memory.direction);
			return(true);
		}
		else if(forward == true && findFlag.memory.direction != null)
		{
			//console.log(unit.name + ' moves forward dir: ' + findFlag.memory.direction);
			unit.memory.direction = findFlag.memory.direction;
			copyPathLength(unit, findFlag);
			unit.move(unit.memory.direction);
			return(true);
		}
		//If trying to return on the path and we're at a 'endOfPath' flag, use the
		//.direction move, since it's the only valid direction
		else if(forward == false && findFlag.memory.returnDirection == null)
		{
			unit.memory.direction = findFlag.memory.direction;
			copyPathLength(unit, findFlag);
			unit.move(unit.memory.direction);
			return(true);
		}
		return(false);
    }
	
	var newPath;
	if(unit.memory.pathTo != null)
	{
		newPath = unit.memory.pathTo;
	}
	else if(unit.memory.usingSourceId != null)
	{
		spawnFrom = findSpawn(unit);
		//If unit is in the same room as the spawner, create the beggining at the spawner going to the sourceId found
		var sourcePos = Game.getObjectById(unit.memory.usingSourceId);
		//If unit is in the same room as the source, which is the same room as the spawn, path from spawn
		if(sourcePos != null && unit.room.name == sourcePos.room.name && spawnFrom != null && spawnFrom.room.name == sourcePos.room.name)
		{
			newPath = spawnFrom.pos.findPathTo(sourcePos.pos.x, sourcePos.pos.y, {maxOps: 2000, ignoreCreeps: true});
			//console.log(spawnFrom.name + ', ' + newPath.length + ', ' + sourcePos);
		}
		else if(sourcePos != null && unit.room.name == sourcePos.room.name)	//Otherwise go from the current units position to the destination
		{
			newPath = unit.pos.findPathTo(sourcePos.pos.x, sourcePos.pos.y, {maxOps: 2000, ignoreCreeps: true});
		}
		else
		{
			//console.log(unit.name + ' trying to path flags to ' + sourcePos + ' from room ' + unit.room.name + ' is different source room stopping creation.');
			return(false);
		}
		//console.log(unit.name + ' does not have pathTo saved, using current position and usingSourceId to create a path to create flags');
	}
	else
	{
		console.log(unit.name + ' attempting to path but does not have pathTo to use or usingSourceId to use for path');
		return(false);
	}
	//If can't find a valid flag to go to, create one to match the SourceId
	return(createPathToFlags(unit.room, newPath, unit.memory.usingSourceId, true));
 }

 //Has problems related to TODO in createPathFlags()
 function findNewFlag(unit, newFlagName, x, y)
 {
    var flagsHere = unit.room.lookForAt('flag', x, y);
    for(var flag in flagsHere)
    {
        //console.log(flagsHere[flag].name + ', ' + newFlagName);
        if(flagsHere[flag].name == newFlagName)
        {
            console.log('HUGE SUCCESS: ' + flagsHere[flag].name + ', ' + newFlagName);
            return(flagsHere[flag]);
        }
    }
    return(null);
 }

 //If we're going to a new room we don't want the last flag being created to push the unit automatically
 //backwards but going to the source we do. If a gatherer is being used with this path this function is
 //run, otherwise this isn't used.
 function capPathEnd(currentRoom, currentPath, currentSourceId, endOfPath)
 {
	if(currentPath.length > 0 && spawnFrom.memory.currentFlags != null)
    {
		var backwards;
        var flagName = 'dir';
		flagName += spawnFrom.memory.currentFlags++;
        var endFlag = currentRoom.createFlag(currentPath[endOfPath].x, currentPath[endOfPath].y, flagName, COLOR_BLUE);
        if(endFlag < 0)
    	{
    		console.log('error creating flag: ' + endFlag);
    	}
		else
		{
			var endPathDirection = currentPath[endOfPath].direction;
			if(endPathDirection > 4)
			{
				backwards = endPathDirection - 4;
			}
			else
			{
				backwards = endPathDirection + 4;
			}
			if(backwards != null && currentSourceId != null)
			{
				Memory.flags[endFlag] = {direction: backwards, usingDestinationId: currentSourceId, pathLength: currentPath.length};
			}
			else
			{
				console.log('flag capping found null: ' + backwards + ', ' + currentSourceId);
			}
		}
    }
 }

 //When recieving a path checks if the 'start' of the path is valid, if not returns the first point that can be moved through,
 //otherwise returns end of the list (won't go through the subsequent function)
 function clampStartPos(currentRoom, currentPath)
 {
	for(var x = 0; currentRoom != null && currentPath != null && x < ((currentPath.length)-1); x++)
	{
		if(currentPath[x] != null)
		{
    		var roomPos = currentRoom.getPositionAt(currentPath[x].x, currentPath[x].y);
			var structure = roomPos.lookFor('structure');
			var terrain = roomPos.lookFor('terrain');
			//Only allow structures that can be moved through
			if(structure.length && (structure[0].structureType == STRUCTURE_RAMPART || structure[0].structureType == STRUCTURE_ROAD))
			{	//Assuming structures don't stack other then roads and ramparts which both can be moved though
				return(x);
			}
			if(terrain == 'plain' || terrain == 'swamp')
			{
				return(x);
			}
		}
	}
	return(currentPath.length-2);
 }

 //When recieving a path checks if the 'end' of the path is valid, if not returns the furthest point that can be moved through,
 //otherwise returns start of the list (won't go through the subsequent function)
 function clampEndPos(currentRoom, currentPath)
 {
	for(var x = (currentPath.length-1); currentPath != null && x >= 0; x--)
	{
		if(currentPath[x] != null)
		{
		    var roomPos = currentRoom.getPositionAt(currentPath[x].x, currentPath[x].y);
			var structure = roomPos.lookFor('structure');
			var terrain = roomPos.lookFor('terrain');
			//Only allow structures that can be moved through
			if(structure.length && (structure[0].structureType == STRUCTURE_RAMPART || structure[0].structureType == STRUCTURE_ROAD))
			{	//Assuming structures don't stack other then roads and ramparts which both can be moved though
				return(x);
			}
			if(terrain == 'plain' || terrain == 'swamp')
			{
				return(x);
			}
		}
	}
	return(0);
 }
 
 function onEdgeOfMap(currentPos)
 {
	return(currentPos.x <= 1 || currentPos.x >= 48 || currentPos.y <= 1 || currentPos.y >= 48);
 }
 
 function edgeOfMapDirection(currentPos, defaultDirection, movingInside)
 {
	if(onEdgeOfMap(currentPos) && movingInside == true)
	{
		if(currentPos.x <= 1)
		{
			return(RIGHT);
		}
		else if(currentPos.x >= 48)
		{
			return(LEFT);
		}
		if(currentPos.y <= 1)
		{
			return(BOTTOM);
		}
		else if(currentPos.y >= 48)
		{
			return(TOP);
		}
	}
	else if(onEdgeOfMap(currentPos) && movingInside == false)
	{
		if(currentPos.x <= 1)
		{
			return(LEFT);
		}
		else if(currentPos.x >= 48)
		{
			return(RIGHT);
		}
		if(currentPos.y <= 1)
		{
			return(TOP);
		}
		else if(currentPos.y >= 48)
		{
			return(BOTTOM);
		}
	}
	return(defaultDirection);
 }

 //Direction: If following path forward is true, it's moving this direction, if it's returning it moves in returnDirection's direction.
 //usingDestinationId is used to know where the end of this path is going (unit pairs up their destination with what is stored here)
 //TO DO: pathLength is for the future where measuring the length of all the paths (get 1 flag with same usingDestinationId and pathLength
 //		from each room) with the same id in each room gives you the travel length of that path. If greater then 1500 then this route
 //		can't be scouted further, harvesting costs will be offset by this to determine if a source is profitable or not.
 //TO DOx2: Profit of route: Possible Repeats = Math.floor(1500/(TotalLength*2)), Repeat*CarryCapacity=Profit, Must 1HarvestCost+1GatererCost < Profit.
 //		If that succeeds can do algorithm in Harvester.js to determine how many gatherers can fit and can check that inflated cost vs profit.
 //		If profit isn't over threshold (25%?) don't bother, since there will be inefficiencies I'm not going to compute for.
 function createPathToFlags(currentRoom, currentPath, currentSourceId, capEnd)
 {
	if(currentPath == null || currentSourceId == null || currentPath.length == 0)
	{
		console.log('Path: ' + currentPath + ' or source ' + currentSourceId + ' is null, abandon creating path');
		return(false);
	}
	
	var previousDirection = -1;
	if(spawnFrom.memory.currentFlags == null)
	{
	    spawnFrom.memory.currentFlags = 0;
	}
	var backwards;
	//We remove any starting or ending locations that we can't move through, the remaining locations recieve flags where appropriate
	var start = clampStartPos(currentRoom, currentPath);
	var end = clampEndPos(currentRoom, currentPath);
	var flagCreationSuccess = false;
	
    for(var position = start; position < end; position++)
	{
        if(currentPath != null && currentPath[position+1] != null && currentPath[position] != null &&
            currentPath[position+1].direction != null && spawnFrom.memory.currentFlags != null)
        {
			var newFlag;
			//The first, last, and every flag that would change the direction needs to spawn for
			//this to work. Does the last flag have the correct direction away from the previous?
			//For end-2, we're making sure we have a few redundant flags at the end of the trails
			//sources need a flag 2 spots away, as does controllers so gatherers can go back and
			//forth while harvesters and builders need to get right next to the source in question
			if(previousDirection != currentPath[position+1].direction || position >= end-1)
			{
				previousDirection = currentPath[position+1].direction;
				var flagName = 'dir';
				flagName += spawnFrom.memory.currentFlags++;

        		var previousFlagDirection = currentPath[position].direction;
        		
        		var foundFlags = currentRoom.getPositionAt(currentPath[position].x, currentPath[position].y).lookFor('flag');
        		for(var x in foundFlags)
        		{
        		    if(foundFlags[x].memory.usingDestinationId == currentSourceId)
        		    {
        		        console.log('Already a flag at this location with id: ' + currentSourceId + ' disabling generation of new flags at position: ' + position);
        		        return(false);
        		    }
        		}
        		
				var createdFlag = currentRoom.createFlag(currentPath[position].x, currentPath[position].y, flagName, COLOR_BLUE);
				if(createdFlag < 0)
				{
				    console.log('error creating flag: ' + createdFlag);
					return(false);
				}
				else
				{
					flagCreationSuccess = true;
					if(position == start)
					{
						if(previousDirection != null && currentSourceId != null && currentPath != null)
						{
							if(onEdgeOfMap(currentPath[position]))
							{
								console.log('When creating path, first flag at edge of map reports posX: ' + currentPath[position].x + ', posY: ' + currentPath[position].y);
								var forward = edgeOfMapDirection(currentPath[position], previousDirection, true);
								var backward = edgeOfMapDirection(currentPath[position], previousDirection, false);
								Memory.flags[createdFlag] = {direction: forward, returnDirection : backwards, usingDestinationId: currentSourceId, pathLength: currentPath.length};
							}
							else
							{
								Memory.flags[createdFlag] = {direction: previousDirection, usingDestinationId: currentSourceId, pathLength: currentPath.length};
							}
						}
						else
						{
							console.log('one or all arguments null in flag creation ' + previousDirection + ', ' + currentSourceId + ', ' + currentPath);
						}
					}
					else
					{
						if(previousFlagDirection > 4)
						{
							backwards = previousFlagDirection - 4;
						}
						else
						{
							backwards = previousFlagDirection + 4;
						}
						
						if(previousDirection != null && currentSourceId != null && currentPath != null && backwards != null)
						{
							if(onEdgeOfMap(currentPath[position]) && position+1 == end)
							{
								var forward = edgeOfMapDirection(currentPath[position], previousDirection, false);
								var backward = edgeOfMapDirection(currentPath[position], previousDirection, true);
								Memory.flags[createdFlag] = {direction: forward, returnDirection : backwards, usingDestinationId: currentSourceId, pathLength: currentPath.length};
							}
							else
							{
								Memory.flags[createdFlag] = {direction: previousDirection, returnDirection : backwards, usingDestinationId: currentSourceId, pathLength: currentPath.length};
							}
						}
						else
						{
							console.log('Arguments null in flag creation, both directions: ' + previousDirection + ', ' + currentSourceId + ', ' + currentPath + ', ' + backwards);
						}
					}
				}
			}
        }
        else
        {
            console.log('error in flag creation code.');
        }
    }
	
    if(currentRoom != null && currentPath != null && currentSourceId != null && capEnd)
	{
		capPathEnd(currentRoom, currentPath, currentSourceId, end);
	}
	return(flagCreationSuccess);
 }
 
 function updatePathLength(sourceId, newLength)
 {
	for(var y in Memory.flags)
	{
		if(Memory.flags[y].usingDestinationId == sourceId)
		{
			Memory.flags[y].pathLength = newLength;
		}
	}
 }

 function createPathFromFlags(unit)
 {
	var previousDirection = -1;
    for(var position in unit.memory.pathFrom)
	{
        if(unit.memory.pathFrom)
        {
			//The first, last, and every flag that would change the direction needs to spawn for
			//this to work. Does the last flag have the correct direction away from the previous?
			if(previousDirection != unit.memory.pathFrom[position].direction)// ||
				//position >= unit.memory.pathFrom.length-1)
			{
				previousDirection = unit.memory.pathFrom[position].direction;
				var newFlag = unit.room.createFlag(unit.memory.pathFrom[position].x, unit.memory.pathFrom[position].y, 'dir'+(spawnFrom.memory.currentFlags++), COLOR_BLUE);
				newFlag.memory.direction = previousDirection;
			}
        }
    }
 }

 //Flag from main (fromRoom) is placed at exit/entrance to spawn room and paths are generated from here to all the spawns in the room.
 //It then calls pathSpawnToExit to path the spawn Room's path to go to this exit marked by toRoom flag.
 //WARNING: Change the entrance direction to point towards the source and the returnDirection towards the room exit
 //Will assign to the unit passed in, usingSourceId to the last source found in the next room
 function pathToEnergy(findFlag, unit)
 {
	//Add flag named 'fromRoom' and it will generate a path from this location to all of the sources and delete that flag afterwards
	//TO DO: Add this in main or somewhere relevant, it won't need the parameters passed in but will use the main functions in this file
	if(findFlag != null)
	{
		var inRoom = findFlag.room;
		//console.log(findFlag + ', ' + findFlag.name + ', ' + findFlag.roomName);
		if(inRoom != null)
		{
    		var sources = inRoom.find(FIND_SOURCES);
    		for(var i = 0; sources != null && i < sources.length; i++)
    		{
    			
				(inRoom, findFlag.pos.findPathTo(sources[i].pos.x, sources[i].pos.y, {maxOps: 2000, ignoreCreeps: true}), sources[i].id, true);
    			console.log('creating path in room-' + inRoom.name + ' to go to energy source with id: ' + sources[i].id);
    			pathSpawnToExit(Game.flags.toRoom, sources[i].id);	//Trigger the flag in the spawn room to path here
    			unit.memory.usingSourceId = sources[i].id;
    			if(unit.memory.direction != null)
    			{
    				delete unit.memory.direction;	//Remove the direction so the unit will auto move to the new path.
    			}
    		}
    		findFlag.remove();
		}
	}
 }

 //Takes id from pathToEnergy with the toRoom flag placed in the spawnRoom to make a path from spawn to the exit of the room, this will
 //pair with the path just created in pathToEnergy to get a full path from the spawn to the adjoining rooms spawns.
 //WARNING: Change the entrance direction to point towards the exit and the returnDirection towards the spawn
 function pathSpawnToExit(exitPos, currentRoom, pathId)
 {
	if(exitPos != null)
	{
		var selectSpawn = currentRoom.find(FIND_MY_SPAWNS);
		for(var i = 0; selectSpawn != null && i < selectSpawn.length; i++)
		{
			console.log('creating path in room-' + exitPos.roomName + ' to go to exit source with id: ' + pathId);
			return(createPathToFlags(currentRoom, selectSpawn[i].pos.findPathTo(exitPos.x, exitPos.y, {maxOps: 4000, ignoreCreeps: true}), pathId, false));
		}
		//exitPos.remove();
	}
	else
	{
		console.log('TO DO: multiple energy spawns were found in adjoining room, create flag at spawn with \nusingDestinationId: ' + pathId +
					' to use the same path that will diverge in the next room.');
	}
	return(false);
 }

 //TO USE:
 //uses flags 'betweenStart' and 'betweenEnd', works by running pathToEnergy to get the start and end rooms complete.
 //Then take the returned id, plug it into the function below and place the 2 flags in the same 'between' room.
 //This will run this function, create the path, and delete the flags when complete
 //TO DOx3: Scan uncontrolled rooms every 1500 ticks for enemies and send patrols to these rooms, have requests grow
 //		over time, so that every 1500 ticks that a enemy is found, request goes up by 1, if not, request goes down. The requests
 //		go in order so if squad is big enough it overflows into the next request.
 //TO DOx4: Need a way of determining how many units can be supported with this to not bankrupt myself.  These requests go after
 //		everything, only when harvesting, gathering, builders and defenders are taken care of do patrols get sent.
 //TO DOx5: When no idle defending requests are being made, requests for closest controlled room will be made. Scan the room for
 //		potential attackers, if can't produce a number greater then this, attempt next controlled room. Send alert to myself.
 function inBetweenRoom(startFlag, endFlag, spawnId)
 {
	if(startFlag != null && endFlag != null &&
		startFlag.room != null && startFlag.room == endFlag.room)
	{
		var inRoom = startFlag.room;
		createPathToFlags(inRoom, startFlag.pos.findPathTo(endFlag.pos.x, endFlag.pos.y, {maxOps: 2000, ignoreCreeps: true}), spawnId, false);
    	console.log('creating path in room-' + inRoom.name + ' to go to energy source with id: ' + spawnId);
		
		startFlag.remove();
		endFlag.remove();
	}
 }

 //WARNING: Manually enter usingDestinationId if paths overlap or need to diverge at diverging point. This flag will be
 //ignored if a unit crosses over the area and it's id doesn't match the flags.
 //Look for a path with spawnId and follow that path if it is found. If
 //not found search in the room and go to that location and follow the path.
 //If the path doesn't exist, look for a energy spawn with this ID and attempt
 //to make a path to that source for a gatherer or harvester to follow
 module.exports = function(unit, reverse)
 {
	//TO DO: Has a lot of spawnFrom references all over the place from when we only had 1 spawn.
	//Fix so it always checks for the spawn saved in/retreived from the unit first and when not possible
	//send through spawnFrom from a more root function.
	spawnFrom = findSpawn(unit);
	
	//Place a call in main or relevant and either pass in a (unit, reverse) to get a unit to move along this path or have
	//the flags referenced below placed in two rooms for new paths to adjoining rooms
	if(Game.flags.fromRoom != null && Game.flags.toRoom != null)
	{
	    //console.log(Game.flags.fromRoom + ', ' + Game.flags.fromRoom.name + ', ' + Game.flags.fromRoom.room + ', ' + Game.flags.fromRoom.roomName);
		//Make sure flags fromRoom is placed at entrance of new room and flag toRoom is placed at exit of spawn room
		//then run pathToEnergy, it will create as many paths as energy sources in the next room.
		//A harvester and gatherer will have to have their direction deleted and id's from console assigned manually
		//to take this path to do their jobs (TO DO: Support harvester taking path)
		//WARNING: Depricated, changed how pathSpawnToExit works with this
		//pathToEnergy(Game.flags.fromRoom, unit);
	}
	else if(Game.flags.betweenStart != null && Game.flags.betweenEnd != null)
	{
		//inBetweenRoom(Game.flags.betweenStart, Game.flags.betweenEnd, "test");	//See TO USE: above, plug in ID from pathToEnergy()
	}
	else
	{
		return(followPathToFlags(unit, reverse));
	}
 }

 //Creates a path from the spawn to exit location, replaced later by scout logic
 module.exports.createPathFromSpawn = function(exit, currentRoom, spawnId)
 {
	return(pathSpawnToExit(exit, currentRoom, spawnId));
 }

 //Used if we're using a enterance and exit flag to create a custom path
 //through a room, but createDefinedPath was generated to automatically create
 //these paths with scouts instead. Not used for anything
 module.exports.createPath = function(entrance, exit, spawnId)
 {
	inBetweenRoom(startFlag, endFlag, spawnId);
 }

 //creates path by using the passed in path, in the room and assigns the spawnId as the id
 //the unit needs to follow this path. capEnd is used to determine if we're automatically
 //adding the last flag as a 'return only' flag, useful when going to energy spawns but not
 //when traveling between rooms since the path will continue beyond the room the path is being
 //generated in
 module.exports.createDefinedPath = function(inRoom, path, spawnId, capEnd)
 {
	return(createPathToFlags(inRoom, path, spawnId, capEnd));
 }

 module.exports.findFlag = function(unit, findSourceId)
 {
	//Look for a relevant flag at the current units position, if that fails look
	//for a flag in the whole room (that matches the findSourceId)
	var flag = findFlagAtUnit(unit, findSourceId);
	if(flag == null)
	{
		flag = findFlagInRoom(unit, findSourceId);
	}
	return(flag);
 }
 
 //Goes through all flags with this ID and assigns the passed in length. Allows retrospective flags to be updated
 //with real lengths that were previously incomplete.
 module.exports.updatePathLength = function(sourceId, newLength)
 {
	updatePathLength(sourceId, newLength);
 }