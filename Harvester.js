/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Harvester'); // -> 'a thing'
 */
 
 var viewFlags = require('previewRoute');
 var followFlagForward = require('createPathFlags');
 
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
 
 //Reassign the unit to be role = 'to' with the flags To and From created.
 //This will clear and create the first route and move automatically to
 //use ressignFrom
 function reassignTo(unit)
 {
    if(Game.flags.To != null && Game.flags.From != null )
    {
        //This clears (and thus needs to recreate) a new path
        unit.memory.pathTo = null;
        saveAndPathToNew(unit, Game.flags.From.pos, Game.flags.To.pos);
        unit.memory.role = 'from';
        viewFlags(unit);
    }
 }
 
 //Let reassignTo use this, don't call directly. Clears the pathFrom and assigns
 //it a new one, gives the new 'idle' role once complete.
 function reassignFrom(unit)
 {
    if(Game.flags.From != null && Game.flags.To != null)
    {
        //This clears (and thus needs to recreate) a new path
        unit.memory.pathFrom = null;
        saveAndPathFromNew(unit, Game.flags.From.pos, Game.flags.To.pos);
        unit.memory.role = 'idle';
        viewFlags(unit);
    }
 }
 
 function moveToFlag(unit)
 {
     if(Game.flags.Flag1 != null)
     {
        unit.moveTo(Game.flags.Flag1);
     }
 }
 
 //Axillary function, return unit to closest spawn, will have to manually mess with
 //memory by hand from there to reassign.
 function reassignJob(unit)
 {
    if(unit.memory.role != 'idle')
    {
        unit.memory.role = 'idle';
    }
    
    var target = unit.pos.findInRange(FIND_MY_SPAWNS, 1)
    if(target != null)
    {
        //unit.say('Del Mem');
        unit.memory.role = 'idle';  //Perhaps change to something else
    }
    else
    {
        var returnTo = unit.pos.findClosestByRange(FIND_MY_SPAWNS);
        if(returnTo != null)
        {
            unit.moveTo(returnTo.x, returnTo.y);
        }
    }
 }
 
 //This function runs by retrieving which spot is our next 'need to fill this with a
 //harvester' spot which we retrieve with increaseHarvestSpot by saving how many harvesters
 //we've assigned already. We then proceed look at all relevant spots in always the same
 //order in this room, knowing that once we find the spot that matches how many harvesters
 //we've placed +1 this spot needs a harvestor and other code places that harvestor there.
 //Repeatedly this will fill up the first source first and then fill all other sources where
 //possible. maxPerEnergy should equal neededHarvestPerSec/unitHarvestCapability, rounded up.
 //On the base game the energy respawns every 300 seconds, so at 3000 max energy 
 //this is 10/unitHarvestCapability
 //Return the source we'll be using from here on out.
 function getEnergyHarvestLoc(unit, sources)
 {
	var spawnInRoom = findSpawn(unit);
	if(unit.memory.harvestLocation == null && spawnInRoom != null &&
		(unit.memory.role == 'worker' || unit.memory.role == 'lazy'))
	{
		var currentEnergy;
		var currentRoom = unit.room;
		var stopAtSpot = increaseHarvestSpot(unit)-1;   //HavestSpot is saving the 'next' spot, so -1 to get current one
		var totalHarvestSpots = 0;
		for(var i = 0; i < sources.length; i++)
		{
			currentEnergy = sources[i];
			var countHarvestSpots = 0;
			var maxPerEnergy = 3;	//Allow this many harvesters at each energy node, no more
            //Search 1 spot away from the source and store applicable spots for harvest/gather
            for(var x = currentEnergy.pos.x - 1; x <= (currentEnergy.pos.x + 1) && countHarvestSpots < maxPerEnergy; x++)
            {
                for(var y = currentEnergy.pos.y - 1; y <= (currentEnergy.pos.y + 1) && countHarvestSpots < maxPerEnergy; y++)
                {
                    var lookAtRoomPosition = currentRoom.getPositionAt(x, y);
                    var terrain = lookAtRoomPosition.lookFor('terrain');
                    //Just avoiding walls should be enough, but plain's are ideal
                    if(terrain == 'plain' || terrain == 'swamp')
                    {
						if(totalHarvestSpots == stopAtSpot)
						{
							//Assumes harvester was just spawned after needGatherers = 0, otherwise
							//this should be += but this messes up the entire logic of harvester->gatherer*x
							//TO DO: Adjust according to what units we're currently spawning, formula is
							//Alternative Gatherer per Harvester= ROUND_UP((HarvestRate*(DistanceToNode*2))/CapacityPerGatherer)
							//getRangeTo is returning negative values, going to assume its still the range just 'behind', so Abs()'ing the value
							unit.room.memory.needGatherers = Math.abs(Math.ceil(4.0*2.0*(lookAtRoomPosition.findPathTo(spawnInRoom).length)/150.0));
							unit.memory.harvestLocation = lookAtRoomPosition;
							return(currentEnergy);
						}
                        countHarvestSpots++;
						totalHarvestSpots++;
                    }
                }
            }
		}
	}
	else
	{
		//Already populated or wrong role to get this information
		return(null);
	}
	//To many harvesters, most likely cause of this.
	//TO DO: Switch to building gathers, builders, or attackers
	//unit.suicide();
	console.log("couldn't find a place for this harvester");
	return(null);
 }
 
 //This does the same thing as the harvester by searching for a good spot for a harvester
 //that is being paired with this gatherer, then searches a 3x3 grid around that for gatherer
 //spot and places the gatherer there if it's a plain.
 //Assumes right now there is 1 gatherer for every 1 harvester, change logic if this changes
 function getEnergyPickupLoc(unit, sources)
 {
	if(unit.memory.gatherLocation == null && unit.memory.role == 'gather')
	{
		var currentEnergy;
		var currentRoom = unit.room;
		increaseGatherSpot(unit);
		var stopAtSpot = getHarvestSpot(unit)-1;	//HavestSpot is saving the 'next' spot, so -1 to get current one
		var totalHarvestSpots = 0;
		var harvestLocation;
		for(var i = 0; i < sources.length; i++)
		{
			currentEnergy = sources[i];
			var countHarvestSpots = 0;
			var maxPerEnergy = 3;	//Allow this many harvesters at each energy node, no more
            //Search 1 spot away from the source and store applicable spots for harvest/gather
            for(var x = currentEnergy.pos.x - 1; x <= (currentEnergy.pos.x + 1) && countHarvestSpots < maxPerEnergy; x++)
            {
                for(var y = currentEnergy.pos.y - 1; y <= (currentEnergy.pos.y + 1) && countHarvestSpots < maxPerEnergy; y++)
                {
                    var lookAtRoomPosition = currentRoom.getPositionAt(x, y);
                    //Just avoiding walls should be enough, but plain's are ideal
                    var terrain = lookAtRoomPosition.lookFor('terrain');
                    if(terrain == 'plain' || terrain == 'swamp')
                    {
						if(totalHarvestSpots == stopAtSpot)
						{
							//------------------------------------------------------
							//-------Found harvester spot we're pairing with--------
							//------------------------------------------------------
							harvestLocation = lookAtRoomPosition;
							for(var x2 = harvestLocation.x-1; x2 <= (harvestLocation.x + 1); x2++)
							{
								for(var y2 = harvestLocation.y-1; y2 <= (harvestLocation.y + 1); y2++)
								{
									//Don't consider the center as a potential spot, this is where the harvester is
									//Also make sure this is 2 away from the source so the gathers don't get stuck
									if(x2 != harvestLocation.x || y2 != harvestLocation.y)
									{
										var gatherPosition = currentRoom.getPositionAt(x2, y2);
										if(currentEnergy.pos.getRangeTo(gatherPosition.x,gatherPosition.y) < 0)
											console.log('range returned negative: ' + currentEnergy.pos.getRangeTo(gatherPosition.x,gatherPosition.y) + ' pos1: ' + currentEnergy.pos + ' pos2: ' + gatherPosition.x + ', ' + gatherPosition.y);
										//Just avoiding walls should be enough, but plain's are ideal
										var terrain = gatherPosition.lookFor('terrain');
										if((terrain == 'plain' || terrain == 'swamp') &&
									        Math.abs(currentEnergy.pos.getRangeTo(gatherPosition.x,gatherPosition.y)) == 2)
										{
											unit.memory.currentGatherSpot = gatherPosition;
											return(currentEnergy);
										}
									}
								}
							}
							console.log(unit + " never found a gatherer spot, this will cause an issue");
							return(currentEnergy);
						}
                        countHarvestSpots++;
						totalHarvestSpots++;
                    }
                }
            }
		}
	}
	else
	{
		//Already populated or wrong role to get this information
		return(null);
	}
	//To many harvesters, most likely cause of this.
	//TO DO: Switch to building gathers, builders, or attackers
	//unit.suicide();
	console.log("couldn't find a place for this gatherer");
	return(null);
 }
 
 function retrieveSource(unit)
 {
    var activeSource;
    //Record in the worker what source he's working at for using later
    //no need to check for all the sources every frame if we can just retrieve it
    if(unit.memory.usingSourceId)
    {
        activeSource = Game.getObjectById(unit.memory.usingSourceId);
    }
    else
    {
        var sources = unit.room.find(FIND_SOURCES);
		activeSource = getEnergyHarvestLoc(unit, sources);
		if(activeSource == null)
		{
			activeSource = getEnergyPickupLoc(unit, sources);
		}
		if(activeSource != null)
		{
			unit.memory.usingSourceId = activeSource.id;
		}
        var storeId = unit.memory.usingSourceId;

        //Since we've captured this data already, we should record (if not already)
        //the maxSources in the room so we can use it later.
        if(!unit.room.memory.maxSources)
        {
            unit.room.memory.maxSources = Object.keys(sources).length;
        }
    }
    return(activeSource);
 }
 
 //CAUTION: Make sure the flags to move the harvesters into position have at least 1 flag, 1 away from the harvesters, if the
 //harvesters need to return, they'll look for this flag and use it to head back.
 function autoWorker(unit)
 {
    if(!unit.spawning && unit.memory.role == 'worker')
    {
        var activeSource;
        var saveAtSpawn = findSpawn(unit);
        if((unit.carry.energy < unit.carryCapacity || unit.carryCapacity == 0) && saveAtSpawn != null)
        {
            //Harvest by finding based on ID if activeSource == null
            if(unit.memory.usingSourceId != null)
    		{
    		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
    		}
			else
			{
				activeSource = retrieveSource(unit);
			}
            
			var harvestError = unit.harvest(activeSource);
			if(harvestError == ERR_NOT_IN_RANGE)	//-9
			{
				//if(unit.memory.pathTo != null)
				//{
					//The paths to the energy sources will stop 2 spaces away from the energy sources for the gatherers
					//to pick up what they need. When they only need to move 1 more space to be in position, manually move
					//them that last spot.
					if(Math.abs(unit.pos.getRangeTo(activeSource)) == 2)
					{
						if(unit.moveTo(activeSource) == 0)
						{
							delete unit.memory.direction;	//Got to where we need, remove the direction, it's no longer valid.
						}
					}
					else
					{
						followFlagForward(unit, unit.carry.energy < unit.carryCapacity || unit.carryCapacity == 0);
					}
				//}
				//else
				//{
				//	saveAndPathToNew(unit, saveAtSpawn.pos, unit.memory.harvestLocation);
				//}
			}
        }
        else if(saveAtSpawn != null)
        {
            //if(unit.memory.pathTo != null)
            //{
				//The unit is full so move in reverse back towards the spawn for drop-off
				followFlagForward(unit, unit.carry.energy < unit.carryCapacity);
                //saveAndPathFrom(unit, unit.memory.pathTo[0]);
            //}
        	//unit.moveTo(saveAtSpawn);
        	unit.transferEnergy(saveAtSpawn);
        }
    }
 }
 
 function saveAndPathToNew(unit, positionStart, positionEnd)
 {
    if(!unit.memory.pathTo)
    {
        if(positionEnd != null)
        {
            unit.memory.pathTo = positionStart.findPathTo(positionEnd.x, positionEnd.y, {maxOps: 2000, ignoreCreeps: true});
            return(unit.moveTo(unit.memory.pathTo[0].x, unit.memory.pathTo[0].y));
        }
    }
    //No need to move if you're already at the destination
    else if(unit.pos.isEqualTo(positionEnd) == false)
    {
        var errors = unit.moveByPath(unit.memory.pathTo);
        //The storing and using moveByPath code looks for a path once and uses it until completion.
        //the begginings/ends of these paths don't always line up and so we use expensive moveTo
        //when it gets off track since it won't be using it for very long it's not a concern.
        if(errors == -5)
        {
            var error1 = unit.moveTo(positionStart.x, positionStart.y);
            var error2 = unit.moveTo(positionEnd.x, positionEnd.y);
            if( error1 != 0 && error2 != 0)
            {
                unit.say(errors);
            }
        }
        //If can't move, try to go around it, ignore if lost move part or if 'tired'
        else if(errors > -10 && errors != 0)
        {
            var error3 = unit.moveTo(positionStart.x, positionStart.y);
            var error4 = unit.moveTo(positionEnd.x, positionEnd.y);
            if(error3 != 0 && error4 != 0)
            {
                unit.say(errors);
            }
        }
        return(errors);
    }
    return(0);
 }
 
 //Attempting to use this to send in a unit, tell it to go somewhere and have that route saved under 'saveAt' for reuse later
 //Use this in all the other function, tired if rewriting it each time.
 function saveAndPathTo(unit, position)
 {
    return(saveAndPathToNew(unit, unit.pos, position));
 }
 
 function saveAndPathFromNew(unit, positionStart, positionEnd)
 {
    if(!unit.memory.pathFrom)
    {
        if(positionEnd != null && positionStart != null)
        {
            unit.memory.pathFrom = positionStart.findPathTo(positionEnd.x, positionEnd.y, {maxOps: 2000, ignoreCreeps: true});
            return(unit.moveTo(unit.memory.pathFrom[0].x, unit.memory.pathFrom[0].y));
        }
    }
    //No need to move if you're already at the destination
    else if(unit.pos.isEqualTo(positionEnd) == false)
    {
        var errors = unit.moveByPath(unit.memory.pathFrom);
        //The storing and using moveByPath code looks for a path once and uses it until completion.
        //the begginings/ends of these paths don't always line up and so we use expensive moveTo
        //when it gets off track since it won't be using it for very long it's not a concern.
        if(errors == -5)
        {
            var error1 = unit.moveTo(positionStart.x, positionStart.y);
            var error2 = unit.moveTo(positionEnd.x, positionEnd.y);
            if( error1 != 0 && error2 != 0)
            {
                unit.say(errors);
            }
        }
        //If can't move, try to go around it, ignore if lost move part or if 'tired'
        else if(errors > -10 && errors != 0)
        {
            var error3 = unit.moveTo(positionStart.x, positionStart.y);
            var error4 = unit.moveTo(positionEnd.x, positionEnd.y);
            if(error3 != 0 && error4 != 0)
            {
                unit.say(errors);
            }
        }
        return(errors);
    }
    return(0);
 }
 
 function saveAndPathFrom(unit, position)
 {
    return(saveAndPathFromNew(unit, unit.pos, position));
 }
 
 function lazyWorkerFindSource(unit)
 {
	var saveAtSpawn = findSpawn(unit);
    if(unit.memory.role == 'worker' && saveAtSpawn != null)
    {
        var activeSource;
        if(unit.getActiveBodyparts(CARRY) == 0 || unit.carry.energy < unit.carryCapacity)
        {
			//Harvest by finding based on ID if activeSource == null
			if(unit.memory.usingSourceId != null)
    		{
    		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
    		}
			else
			{
				activeSource = retrieveSource(unit);
			}
			
			var harvestSpot = unit.memory.harvestLocation;
			//TO DO: Investigate how activeSource can be null here
			if(harvestSpot == null && activeSource != null)
			{
				harvestSpot = activeSource.pos;
			}
			
			if(unit.pos.isEqualTo(harvestSpot) == false)
			{
				var harvestError = unit.harvest(activeSource);
                if(harvestError == 0)
                {
                    unit.memory.role = 'lazy';
                }
                else
                {
					//if(unit.memory.pathTo != null)
					//{
					    //console.log(unit.pos.getRangeTo(activeSource));
						//The paths to the energy sources will stop 2 spaces away from the energy sources for the gatherers
						//to pick up what they need. When they only need to move 1 more space to be in position, manually move
						//them that last spot.
						if(Math.abs(unit.pos.getRangeTo(activeSource)) <= 2)
						{	//If moveTo Location is farther range then before we don't actually want to delete direction
							//alternatively if we can keep progressing on our path we shouldn't need to delete direction either.
							if(unit.moveTo(activeSource) == 0)
							{
								delete unit.memory.direction;	//Got to where we need, remove the direction, it's no longer valid.
							}
						}
						else
						{
							//unit.moveTo(activeSource);
							followFlagForward(unit, unit.getActiveBodyparts(CARRY) == 0 || (unit.carry.energy < unit.carryCapacity));
						}
					//}
					//else 
					//{
					//	saveAndPathToNew(unit, saveAtSpawn.pos, harvestSpot);
					//}
				}
			}
        }
        else if(unit.transferEnergy(saveAtSpawn) == ERR_NOT_IN_RANGE)
        {
            unit.moveTo(saveAtSpawn);
        }
    }
 }
 
 //As long as a transfer to a link was successful, or it had an attempt to transfer to another link.
 //Return true, otherwise return false so the linking harvester knows to try to search elsewhere.
 function transferBetweenLinks(unit, findLinks)
 {
	//If harvester found links within range 1, transfer to them.
	if(findLinks.length > 0)
	{
		for(var i in findLinks)
		{
			//If transfer is successful, or the link is already full, make the link
			//look for other links to transfer energy to so we have room for subsequent transfers
			var transferCode = unit.transferEnergy(findLinks[i]);
			if(transferCode == 0 || transferCode == ERR_FULL)
			{
				var recievedEnergy = findLinks[i];
				//Look to see if the link is filling up. If so, look for a link 
				//with the lowest amount and send as much energy to it as possible
				if(recievedEnergy.energy/recievedEnergy.energyCapacity > 0.9)
				{
					var links = unit.room.find(FIND_MY_STRUCTURES, { 
						filter: { structureType: STRUCTURE_LINK } 
					});
					var lowestEnergy = recievedEnergy.energy;
					for(var j in links)
					{
						if(links[j].energy < lowestEnergy)
						{
							//Send the first link that has less energy then this one energy
							recievedEnergy.transferEnergy(links[j]);
							break;
						}
					}
				}
				return(true);
			}
		}
	}
	return(false);
 }
 
 function lazyHarvest(unit)
 {
    if(unit.memory.role == 'lazy')
    {
        var activeSource = retrieveSource(unit);
		
		//If we've capped out on energy, look around for a gather to drop off on and transfer
        if(unit.carry.energy == unit.carryCapacity)
        {
			var neighbors;
			//TO DO: Once we completely seperate gathers from spawning if harvesters have links we may
			//want to change the below neighbors == null check into an else that way only 1 possible search
			//around the harvester is done per tick. This is a great hybrid solution that uses both.
			if(unit.room.controller != null &&
				unit.room.controller.owner != null &&
				unit.room.controller.owner.username == 'RaskVann' &&
				unit.room.controller.level >= 5)	//Links are available
			{
				var findLinks = unit.pos.findInRange(FIND_MY_STRUCTURES, 1, {
					filter: { structureType: STRUCTURE_LINK }
				});
				
				if(transferBetweenLinks(unit, findLinks) == true)
				{
					neighbors = findLinks;	//Disable transfer to gather, already sent to link, can't do 2+ at once
				}
			}
			
			//If we don't find any links, populate with any gathers in range
			if(neighbors == null || neighbors.length <= 0)
			{
				neighbors = unit.pos.findInRange(FIND_MY_CREEPS, 1, {
					function(object) {
						return(object.memory != null && object.memory.role == 'gather');
					}
				});
				
				//Try to transfer to anything in range from lists populated above
				if(neighbors.length)
				{
					for(var i in neighbors)
					{
						if(unit.transferEnergy(neighbors[i]) == 0)
							break;
					}
				}
			}
        }
		else
		{
			//In preparation for having links by the harvesters, sooner or later we're going to drop energy
			//on the ground which won't be picked up and syphoned into links once the gathers are gone. If the
			//harvest has space, pickup energy that way every other tick we can pickup, move to link, etc.
			var target = unit.pos.lookFor('energy');
			if(target.length > 0)
				unit.pickup(target[0]);
		}
		
		//Harvest by finding based on ID if activeSource == null
		if(activeSource == null)
		{
		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
		}
		//If can't harvest, assume need to become worker to get back to the spot.
		//ERR_INVALID_TARGET happens when targeting a source not in this room
		var harvestCode = unit.harvest(activeSource);
        if(harvestCode == ERR_NOT_IN_RANGE || harvestCode == ERR_INVALID_TARGET)
        {
            unit.memory.role = 'worker';
        }
		else if(harvestCode < 0 && harvestCode != -6)
		{
			//console.log(unit.name + ' can not harvest, harvest error code: ' + harvestCode);
		}
    }
 }
 
 function creepAtDirection(unit)
 {
    if(unit != null && unit.memory.direction != null)
    {
        var posX = unit.pos.x;
        var posY = unit.pos.y;
        if(unit.memory.direction == TOP)
        {
            posY++;
        }
        else if(unit.memory.direction == TOP_RIGHT)
        {
            posX++;
            posY++;
        }
        else if(unit.memory.direction == RIGHT)
        {
            posX++;
        }
        else if(unit.memory.direction == BOTTOM_RIGHT)
        {
            posX++;
            posY--;
        }
        else if(unit.memory.direction == BOTTOM)
        {
            posY--;
        }
        else if(unit.memory.direction == BOTTOM_LEFT)
        {
            posX--;
            posY--;
        }
        else if(unit.memory.direction == LEFT)
        {
            posX--;
        }
        else if(unit.memory.direction == TOP_LEFT)
        {
            posX--;
            posY++;
        }
        else
        {
            return(null);
        }
        //Only search if in bounds, not valid when on boundary
		if(posX >= 0 && posX <= 49 && posY >= 0 && posY <= 49)
		{
			return(unit.room.lookForAt('creep', posX, posY));
		}
    }
	return(null);
 }
 
 //If unit we're passing in is full of energy, and we've found a unit with no energy, try to transfer to them
 function transferAround(unit)
 {
	var xMax = Math.min(49,unit.pos.x+1);
	var xMin = Math.max(0, unit.pos.x-1);
	var yMax = Math.min(49,unit.pos.y+1);
	var yMin = Math.max(0, unit.pos.y-1);
	for(var x = xMax; unit.carry.energy > unit.carryCapacity*.01 && x >= xMin; x--)
	{
		for(var y = yMax; y >= yMin; y--)
		{
			var unitAt = unit.room.lookForAt('creep', x, y);
			if(unitAt != null && unitAt[0] != null && 
				unitAt[0].memory != null && 
				unitAt[0].memory.role == 'builder')
			{
				if(unit.transferEnergy(unitAt[0]) == 0)
					return(true);
			}
		}
	}
	return(false);
 }
 
 //Similar to the builder's buildRoad() in that it looks for a road underneath the gather and if none exists creates it.
 //Runs right before gatherers move along their task. Searches for a existing road and a construction site for a road
 //under the gatherer, if none exists the unit creates one for the builders to get to later.
 function findRoadOrCreate(unit)
 {
	var workComponents = unit.getActiveBodyparts(WORK);
	if(workComponents > 0)
	{
		var findStructure = unit.pos.lookFor('structure');
		var foundRoad = -1;
		var lowCpuUsage = (Game.getUsedCpu() < 5);
		for(var x = 0; findStructure != null && x < findStructure.length; x++)
		{
			if(findStructure[x].structureType == STRUCTURE_ROAD)
			{
				//Go through all structures at current builder's spot, if they have less hits then what the builder
				//would repair, repair the structure
				if(workComponents > 0 && 
					findStructure[x].hits < (findStructure[x].hitsMax - (workComponents*100)) &&
					unit.carry.energy >= workComponents)
				{
					unit.repair(findStructure[x]);
					return(true);
				}
				foundRoad = x;
			}
		}
		//If we found a road on this spot and we don't need to repair it, we have extra time to try to repair roads nearby
		//Also don't do this unless we're really low on cpuUsage as this is a convienance feature, not needed.
		if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
		{
			var repairInRange = unit.pos.findInRange(FIND_STRUCTURES, 3);
			for(var z in repairInRange)
			{
				if(repairInRange[z] != null && repairInRange[z].structureType == STRUCTURE_ROAD &&
					repairInRange[z].hits < (repairInRange[z].hitsMax - (workComponents*100)) && 
					unit.repair(repairInRange[z]) == 0)
				{
					return(true);
				}
			}
		}

		var findConstruction = unit.pos.lookFor('constructionSite');
		for(var y = 0; findConstruction != null && y < findConstruction.length; y++)
		{
			if(findConstruction[y].structureType == STRUCTURE_ROAD)
			{
				if(unit.carry.energy > 0 && workComponents > 0)
				{
					unit.build(findConstruction[y]);
				}
				return(true);	//Road is already being built, ignore
			}
		}
		//If we found a road on this spot and we don't need to repair or build it, we have extra time to try to build any roads nearby
		//Also don't do this unless we're really low on cpuUsage as this is a convienance feature, not needed.
		if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
		{
			var constructionInRange = unit.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
			for(var w in constructionInRange)
			{
				if(constructionInRange[w] != null && 
					constructionInRange[w].structureType == STRUCTURE_ROAD &&
					unit.build(constructionInRange[w]) == 0)
				{
					return(true);
				}
			}
		}

		//We searched through all structures at this spot, no road was found, so build one.
		if(unit.pos.createConstructionSite(STRUCTURE_ROAD) == 0)
		{
			return(true);
		}
	}
	return(false);
 }
 
 function gatherFrom(unit)
 {
    var returnResources = findSpawn(unit);
	//Going to try to grab any energy the unit can and immediately try a drop off instead of waiting for it to fill up
	//since it seems like all energy sits in the gatherers if I wait until they are full.
    //if(unit.carry.energy < unit.carryCapacity)
	if(unit.carry.energy == 0 && returnResources != null)
    {
        var activeSource;
		//TO DO: GoTo by finding based on ID if activeSource == null
		if(unit.memory.usingSourceId != null)
		{
		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
		}
		else
		{
			activeSource = retrieveSource(unit);
		}
		//Legacy code, creates a path that goes to creates pathTo which at the moment is more accurate then
		//the path created in followFlagForward, this is used in followFlagForward which helps for gatherers
		//made for the spawn room
		//if(returnResources != null && unit.memory.currentGatherSpot != null && unit.memory.pathTo == null)
		//{
		//	saveAndPathToNew(unit, returnResources.pos, unit.memory.currentGatherSpot);
		//}
		//else
		//{
			findRoadOrCreate(unit);
			followFlagForward(unit, unit.carry.energy < unit.carryCapacity);
		//}
		
		if(returnResources != null)
		{
            //unit.transferEnergy(returnResources);	//Only here if unit.carry.energy == 0 changes back to < unit.carryCapacity
		}
    }
    else if(returnResources != null)
    {
        //unit.say(unit.carry.energy + "/" + unit.carryCapacity);
        var transferEnergyReturn = unit.transferEnergy(returnResources);
		//If make it back to the drop off and its full go and fill up a extension instead, delete the direction so when it finishes
		//the drop off it finds the start of the path again and resumes the path.
		if(transferEnergyReturn == ERR_FULL || unit.memory.direction == null)
        {
            var transferTargets = unit.room.find(FIND_MY_STRUCTURES);
			var transferTarget;
			var transferRange = 999999;
			for(var drained in transferTargets)
			{
                if(transferTargets[drained].energy != null && 
					transferTargets[drained].energy < transferTargets[drained].energyCapacity)
    			{
					var transfer = unit.transferEnergy(transferTargets[drained]);
    				if(transfer == ERR_NOT_IN_RANGE)
					{
						var tempRange = unit.pos.getRangeTo(transferTargets[drained]);
						if(tempRange < transferRange)
						{
							transferRange = tempRange;
							transferTarget = transferTargets[drained];
							//console.log(unit.name + ' found new range: ' + transferRange + ' to ' + transferTargets[drained]);
						}
						
						if(unit.memory.direction != null)
						{
							//If you find a extension that needs energy, move to it. This takes you off the route the gatherer
							//was on, so delete the direction now so it will search for the beginning of the route afterwards.
							delete unit.memory.direction;
						}
    				}
					else if(transfer == 0)
					{
						transferTarget = null;
						break;
					}
    			}
				else if(transferTargets[drained].energy != null && 
					transferTargets[drained].energy < transferTargets[drained].energyCapacity && 
					Math.abs(unit.pos.getRangeTo(transferTargets[drained])) == 1 &&
					unit.transferEnergy(transferTargets[drained]) == 0)
				{	//Don't look for any more structures to transfer to, successfully filled one.
					transferTarget = null;
					break;
				}
			}
			findRoadOrCreate(unit);
			if(transferTarget != null && returnResources.room.energyAvailable < returnResources.room.energyCapacityAvailable)
			{	//As long as there is a target to go to and the room isn't full of energy, move to the target
				var cpu = Game.getUsedCpu();
				//unit.moveTo(transferTarget);
				unit.moveByPath(unit.pos.findPathTo(transferTarget), {maxOps: 100, ignoreCreeps: false});
				cpu = Game.getUsedCpu()-cpu;
				//console.log(unit.name + ' moving to capacitor costs: ' + cpu);
			}
			else if(returnResources.room.energyAvailable >= returnResources.room.energyCapacityAvailable)
			{	//If room is full, send back to retrieve what energy they can, until full.
				followFlagForward(unit, unit.carry.energy < unit.carryCapacity);
			}
        }
        else if(transferEnergyReturn == ERR_NOT_IN_RANGE)
        {
			findRoadOrCreate(unit);
			//As long as half full, move to store energy back at base.
			if(returnResources.room != null)
			{
				//If room is full, send back to retrieve what energy they can.
				followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5 || 
								returnResources.room.energyAvailable >= returnResources.room.energyCapacityAvailable);
			}
			else
			{
				followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5);
			}
    	    //When we move there is a chance someone is ahead of us that is blocking our path. unit.move doesn't detect
    	    //this however we can use the stored direction to check the position it's trying to move and if they're is a
    	    //unit that direction, transfer the energy if possible. This will hopefully fill the requirement of the unit
    	    //ahead of it and let it move along, otherwise the gatherer will be not full again and will go back to retreive
    	    //more energy
			if(unit.carry.energy == unit.carryCapacity)
			{
				var unitOnPath = creepAtDirection(unit);
				if(unitOnPath != null && unitOnPath[0] != null && unitOnPath[0].memory != null &&
					unitOnPath[0].memory.role == 'builder' && unitOnPath[0].carry.energy <= 0)
				{	//If transfer fails, attempt to transfer to all possible units in range
					if(unit.transferEnergy(unitOnPath[0] < 0))
					{
						//transferAround(unit);
					}
				}
				else	//Was unable to transfer to path
				{
					//transferAround(unit);
				}
			}
        }
    }
    
    if(unit.carry.energy < unit.carryCapacity)
    {
        var target = unit.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if(target.length > 0)
    	{
            unit.pickup(target[0]);
        }
    }
 }
 
 function getHarvestSpot(unit)
 {
    var thisRoom = unit.room;
	if(thisRoom.memory.currentHarvestSpot == null)
	{
		thisRoom.memory.currentHarvestSpot = 0;
	}
	return(thisRoom.memory.currentHarvestSpot);
 }
 
 function increaseHarvestSpot(unit)
 {
    var thisRoom = unit.room;
	if(thisRoom.memory.currentHarvestSpot == null)
	{
		thisRoom.memory.currentHarvestSpot = 0;
	}
	else
	{
		thisRoom.memory.currentHarvestSpot += 1;
	}
	return(thisRoom.memory.currentHarvestSpot);
 }
 
 function increaseGatherSpot(unit)
 {
    var thisRoom = unit.room;
	if(thisRoom.memory.currentGatherSpot == null)
	{
		thisRoom.memory.currentGatherSpot = 0;
	}
	else
	{
		thisRoom.memory.currentGatherSpot += 1;
	}
	return(thisRoom.memory.currentGatherSpot);
 }
 
 function increaseBuilders(unit)
 {
	var thisRoom = unit.room;
	if(thisRoom.memory.currentBuilders == null)
	{
		thisRoom.memory.currentBuilders = 0;
	}
	else
	{
		thisRoom.memory.currentBuilders += 1;
	}
	return(thisRoom.memory.currentBuilders);
 }
 
 //Tries to find a ideal location, 1-2 spaces away from anchor, not in the way of anything in use and add construction site for link
 function constructLink(anchor)
 {
	var closeSpawn = anchor.pos.findClosestByRange(FIND_MY_SPAWNS);
	var closestLocation;
	var success;
	for(var x = Math.max(0, anchor.pos.x-1); x <= Math.min(49, anchor.pos.x+1); x++)
	{
		for(var y = Math.max(0, anchor.pos.y-1); y <= Math.min(49, anchor.pos.y+1); y++)
		{
			var findTerrain = closeSpawn.room.lookForAt('terrain', x, y);
			if(findTerrain.length > 0 && (findTerrain[0] == 'plain' || findTerrain[0] == 'swamp') &&
				(closestLocation == null || closeSpawn.pos.getRangeTo(closestLocation) > closeSpawn.pos.getRangeTo(findTerrain)))
				//closestLocation > closeSpawn.pos.getRangeTo(x, y))
			{
				closestLocation = findTerrain;
				//closestLocation = closeSpawn.pos.getRangeTo(x, y);
			}
		}
	}
	
	//Closest location should be where the builder/harvester is sitting at either upgrading the controller or
	//harvesting a source. We want a link 1 away from this location. That isn't disruptive (isn't in a path,
	//isn't in a wall
	if(closestLocation != null)
	{
		for(var x = Math.max(0, closestLocation.pos.x-1); x <= Math.min(49, closestLocation.pos.x+1); x++)
		{
			for(var y = Math.max(0, closestLocation.pos.y-1); y <= Math.min(49, closestLocation.pos.y+1); y++)
			{
				if(x == closestLocation.pos.x && y == closestLocation.pos.y)
				{
					continue; //Skip over the location the harvester/builder should be sitting at that this link is for.
				}
				
				var findTerrain = closeSpawn.room.lookForAt('terrain', x, y);
				var findFlag = closeSpawn.room.lookForAt('flag', x, y);
				var findCreep = closeSpawn.room.lookForAt('creep', x, y);
				var findStructure = closeSpawn.room.lookForAt('structure', x, y);
				var findConstruction = closeSpawn.room.lookForAt('constructionSite', x, y);
				//Terrain should be movable (not constructable otherwise), if there is a flag, structure
				//or creep this area is being used for something important (usually travel) and so this
				//should only construct within 2 range of anchor in a buildable, unused spot.
				if(findTerrain.length > 0 && (findTerrain[0] == 'plain' || findTerrain[0] == 'swamp') &&
					findFlag.length == 0 && findCreep.length == 0 && findStructure.length == 0 && findConstruction.length == 0)
				{
					success = findTerrain[0].pos.createConstructionSite(STRUCTURE_LINK);
					if(success == 0)
					{
						return(success);
					}
					else
					{
						//If fail construction for whatever reason, try again in another location.
						console.log('Trying to construct link failed, trying another location.');
					}
				}
			}
		}
	}
	else
	{
		console.log('Unable to find closest location for link at ' + anchor);
	}
	return(success);	//Send back last attempted createConstructionSite error, if any was attempted
 }
 
module.exports.link = function()
{
	if(Game.getUsedCpu() < 5)
	{
		//Look through all the rooms we have access to
		for(var eachRoom in Game.rooms)
		{
			var nextRoom = Game.rooms[eachRoom];
			//If the room is mine and has access to links, look for applicable link locations
			if(nextRoom.controller != null &&
				nextRoom.controller.owner != null &&
				nextRoom.controller.owner.username == 'RaskVann' &&
				nextRoom.controller.level >= 5)
			{
				var sources = nextRoom.find(FIND_SOURCES);
				//Make sure there is a link within 2 spaces of every source, and create one if there isn't.
				for(var i in sources)
				{
					var allLinks = sources[i].pos.findInRange(FIND_MY_STRUCTURES, 2, {
						filter: { structureType: STRUCTURE_LINK }
					});
					
					if(allLinks.length <= 0)
					{
						var allConstructLinks = sources[i].pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
							filter: { structureType: STRUCTURE_LINK }
						});
						//No link within 2 spaces, create one.
						if(allConstructLinks.length <= 0)
						{
							//Construct link, nothing exists.
							//constructLink(sources[i]);
						}
					}
				}
				
				//Look at the controller and make sure there is a link within 2 spaces of it
				var controllerLink = nextRoom.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
					filter: { structureType: STRUCTURE_LINK }
				});
				
				if(controllerLink.length <= 0)
				{
					var controllerConstructLinks = nextRoom.controller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
						filter: { structureType: STRUCTURE_LINK }
					});
					//No link within 2 spaces, create one.
					if(controllerConstructLinks.length <= 0)
					{
						//Construct link, nothing exists.
						//constructLink(nextRoom.controller);
					}
				}
			}
		}
	}
}
 
module.exports.work = function(unit, harvestersSeen)
{
	//TO DO: Refill builders from harvesters. Possible new unit role.
    if(unit.memory.role == 'worker')
    {
        if(Object.keys(Game.creeps).length < 2)
        {
            autoWorker(unit);              //Sends blindly to selected source (don't leave it on this mode)
        }
        else
        {
            lazyWorkerFindSource(unit);    //Switch to lazyWorker when the initial 2-3 harvesters are up.
        }
    }
    else if(unit.memory.role == 'lazy')
    {
        lazyHarvest(unit);
    }
}

module.exports.gather = function(unit, gatherersSeen)
{
	if(unit.memory.role == 'gather')
    {
        gatherFrom(unit);
        //customize the x,y position to be where they create a path, 
        //goto and sit, making continuous trips from their spawn 
        //location and this spot
    }
}
 
//module.exports = function(unit, harvestersSeen, gatherersSeen)
//{
//	if(unit.memory.role == 'idle')
//    {
//        reassignJob(unit);
//    }
//    else if(unit.memory.role == 'flag')
//    {
//        moveToFlag(unit);
//    }
//    else if(unit.memory.role == 'to' || unit.memory.role == 'To')
//    {
//        //Have flags 'To' and 'From' created, assigns 'idle' role when complete
//        reassignTo(unit);
//    }
//    else if(unit.memory.role == 'from' || unit.memory.role == 'From')
//    {
//        //Have flags 'To' and 'From' created, assigns 'idle' role when complete
//        reassignFrom(unit);
//    }
//    //reassignJob(Game.creeps.Worker12);
//}