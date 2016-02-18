/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Harvester'); // -> 'a thing'
 */
 
 //var viewFlags = require('previewRoute');
 var followFlagForward = require('createPathFlags');
 
 //TO DO: Use the spawn that this unit came from. This currently just sends back the first
 //spawn that is in the same room as the unit.
 function findSpawn(unit)
 {
	var useSpawn;
	if(unit.memory.spawnId != null)
	{
		useSpawn = Game.getObjectById(unit.memory.spawnId);	//A spawn this unit can dump resources to
	}
	else
	{
		for(var x in Game.spawns)
		{
			if(unit.room.name == Game.spawns[x].room.name)
			{
				useSpawn = Game.spawns[x].id
				unit.memory.spawnId = useSpawn;
			}
		}
	}
	return(useSpawn);
 }
 
 //Reassign the unit to be role = 'to' with the flags To and From created.
 //This will clear and create the first route and move automatically to
 //use ressignFrom
// function reassignTo(unit)
// {
//    if(Game.flags.To != null && Game.flags.From != null )
//    {
//        //This clears (and thus needs to recreate) a new path
//        unit.memory.pathTo = null;
//        saveAndPathToNew(unit, Game.flags.From.pos, Game.flags.To.pos);
//        unit.memory.role = 'from';
//        viewFlags(unit);
//    }
// }
 
 //Let reassignTo use this, don't call directly. Clears the pathFrom and assigns
 //it a new one, gives the new 'idle' role once complete.
// function reassignFrom(unit)
// {
//    if(Game.flags.From != null && Game.flags.To != null)
//    {
//        //This clears (and thus needs to recreate) a new path
//        unit.memory.pathFrom = null;
//        saveAndPathFromNew(unit, Game.flags.From.pos, Game.flags.To.pos);
//        unit.memory.role = 'idle';
//        viewFlags(unit);
//    }
// }
 
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
							var moveCode = unit.moveTo(activeSource);
							if(moveCode == 0)
							{
								delete unit.memory.direction;	//Got to where we need, remove the direction, it's no longer valid.
							}
							else if(unit.pos.getRangeTo(activeSource) == 2 && moveCode == ERR_NO_PATH)
							{	//If unit is in position to move into a harvesting position but can't get a valid path. Look for a harvester that is next to the source
								//already doing the job of this unit. If we find one suicide the older of the two that way the younger one can take over.
								//This is a hack to fix this situation. The spawner is sending more harvesters then this source can handle due to we don't have enough
								//work at this source but we can't fit more units then we already have. The energy or energy capacity isn't sufficient yet to fully
								//take care of this source.
								var blockingHarvest = activeSource.pos.findInRange(FIND_MY_CREEPS, 1, {
									filter: function(object) {
										return(object.memory != null && object.memory.role == 'lazy' && object.memory.usingSourceId == unit.memory.usingSourceId);
									}
								});
								
								if(blockingHarvest.length <= 0)
								{
									//console.log('Something is blocking ' + unit.name + ' in ' + unit.room.name + ' check and delete and fix lazyWorkerFindSource()');
								}
								else
								{
									//We favor whoever is the youngest and except if the older creep has more work
									var blockWork = blockingHarvest[0].getActiveBodyparts(WORK) * (blockingHarvest[0].ticksToLive/1500);
									var currentWork = unit.getActiveBodyparts(WORK) * (unit.ticksToLive/1500);
									if(blockWork < currentWork)
									{
										console.log('Killing harvester ' + blockingHarvest[0].name + ' that was ' + blockingHarvest[0].ticksToLive + ' in the way of ' + unit.name + '(' + unit.ticksToLive + ') fix spawn code. ' + blockWork + ' vs ' + currentWork);
										blockingHarvest[0].suicide();
									}
									else
									{
										console.log('Killing harvester ' + unit.name + ' that is ' + unit.ticksToLive + ' but trying to replace ' + blockingHarvest[0].name + '(' + blockingHarvest[0].ticksToLive + ') fix spawn code. ' + currentWork + ' vs ' + blockWork);
										unit.suicide();
									}
								}
							}
							else
							{
								console.log(unit.name + ' error: ' + moveCode);
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
			if(findLinks[i].cooldown > 0)
			{
				continue;
			}
			
			//If transfer is successful, or the link is already full, make the link
			//look for other links to transfer energy to so we have room for subsequent transfers
			var transferCode = unit.transferEnergy(findLinks[i]);
			if(transferCode == 0 || transferCode == ERR_FULL)
			{
				var recievedEnergy = findLinks[i];
				//Look to see if the link is filling up. If so, look for a link 
				//with the lowest amount and send as much energy to it as possible
				if(recievedEnergy.cooldown <= 0 && recievedEnergy.energy/recievedEnergy.energyCapacity > 0.9)
				{
					var links = unit.room.find(FIND_MY_STRUCTURES, { 
						filter: { structureType: STRUCTURE_LINK } 
					});
					
					var lowestEnergy = recievedEnergy.energy;
					var transferHere;
					for(var j in links)
					{
						//Prepare to transfer here if it has the lowest yet found
						//energy and it has at least 25% we can fill
						if(links[j].energy < lowestEnergy && 
							links[j].energy/links[j].energyCapacity < .75)
						{
							//Send the link that has the least energy
							transferHere = links[j];
							lowestEnergy = links[j].energy;
						}
					}
					
					if(transferHere != null && recievedEnergy.transferEnergy(transferHere) == 0)
					{
						return(true);
					}
				}
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
		//TO DO: This will spawn attackers endlessly for as long as the unit survives. Spawn 1 needed unit and that's it.
		if(unit.hits < unit.hitsMax)
		{
			var spawner = require('Spawner');
			spawner.createTempCreep('attack', {'role': 'attack', 'usingSourceId': activeSource.room.name, 'spawnId': unit.memory.spawnId}, activeSource.room.name);
		}
		
		//If we've capped out on energy, look around for a gather to drop off on and transfer
        if(unit.carry.energy == unit.carryCapacity || unit.carryCapacity == 0)
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
					filter: function(object) {
						return(object.carry.energy < object.carryCapacity && object.memory != null && object.memory.role == 'gather');
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
		else if(harvestCode < 0 && harvestCode != ERR_BUSY && harvestCode != ERR_NOT_ENOUGH_RESOURCES)
		{
			console.log(unit.name + ' can not harvest, harvest error code: ' + harvestCode);
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
	if(unit.carry.energy > 0)
	{	//We should at least have enough energy to use all work components for the lowest cost (repair) task
		var workComponents = unit.getActiveBodyparts(WORK);
		if(0 < workComponents && workComponents <= unit.carry.energy)
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
			//if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
            //
			//{
			//	var repairInRange = unit.pos.findInRange(FIND_STRUCTURES, 3);
			//	for(var z in repairInRange)
            //
			//	{
			//		if(repairInRange[z] != null && repairInRange[z].structureType == STRUCTURE_ROAD &&
			//			repairInRange[z].hits < (repairInRange[z].hitsMax - (workComponents*100)) && 
			//			unit.repair(repairInRange[z]) == 0)
            //
			//		{
			//			return(true);
            //
            //
            //
			//		}
			//	}
			//}

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
			//if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
            //
			//{
			//	var constructionInRange = unit.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
			//	for(var w in constructionInRange)
            //
			//	{
			//		if(constructionInRange[w] != null && 
			//			constructionInRange[w].structureType == STRUCTURE_ROAD &&
			//			unit.build(constructionInRange[w]) == 0)
            //
			//		{
			//			return(true);
            //
            //
            //
			//		}
			//	}
			//}

			//We searched through all structures at this spot, no road was found, so build one.
			if(unit.pos.createConstructionSite(STRUCTURE_ROAD) == 0)
			{
				return(true);
			}
		}
	}
	return(false);
 }
 
 //Returns the storage object that it assigned this unit to.
 function uniqueStorage(unit, findStorage)
 {
	//Use this on storage structure if creeps keep lining up trying to store the same thing.
	if(findStorage != null && findStorage.length > 0)
	{
		var storeId;
		var currentStorage;
		for(var x in findStorage)
		{
			currentStorage = findStorage[x];
			for(var i in Game.creeps)
			{
				if(Game.creeps[i] != null && Game.creeps[i].memory.extraStorage != null &&
					Game.creeps[i].memory.extraStorage == currentStorage.id)
				{
					//Check all creeps stored in memory, if id is taken, return false and reject assignment
					storeId = null;
					break;
				}
				else
				{
					storeId = currentStorage.id;
				}
			}
			
			//No creeps/units are using this storage, use this ID and exit
			if(storeId != null)
			{
				//console.log('store for ' + unit.name + ' where found: ' + currentStorage.id);
				//delete unit.memory.direction;
				unit.memory.extraStorage = storeId;
				return(currentStorage);
			}
		}
	}
	//Couldn't find a unassigned storage or all storage was full
	return(null);
 }
 
 //Moves unit to the target provided (within same room)
 function unitByPath(unit, target)
 {
	if(unit.room.name == target.room.name)
	{
		var newPath;
		if(unit.memory._move == null)
		{
			newPath = unit.pos.findPathTo(target, {maxOps: 500, serialize: true});//, ignoreCreeps: true
		}
		else
		{
			newPath = unit.memory._move.path;
		}
		//var moveCode = unit.moveByPath(newPath);
		var moveCode = unit.moveTo(target, {serializeMemory: true, reusePath: 5});
		if(moveCode < 0)
		{
			delete unit.memory._move;
			newPath = unit.pos.findPathTo(target, {maxOps: 500, serialize: true});
			var newCode = unit.moveByPath(newPath);
			if(newCode < 0)
				console.log(unit.name + ' was expected to move via ' + newPath + ' but returned move code: ' + moveCode + ' new saved move. New code: ' + newCode);
		}
		return(moveCode);
	}
	console.log('Attempted to move ' + unit.name + ' to ' + target + ' but they are in different rooms.');
	return(ERR_INVALID_ARGS);//ERR_NOT_FOUND
 }
 
 //ReturnResources being the spawn the unit came from
 function fillUpRoomWithEnergy(unit, returnResources)
 {
	if(unit.room.name != returnResources.room.name)
	{
		findRoadOrCreate(unit);
		//As long as half full, move to store energy back at base.
		if(returnResources.room != null)
		{
			//If room is full, send back to retrieve what energy they can.
			followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5 || 
							(returnResources.room.energyAvailable >= returnResources.room.energyCapacityAvailable &&
							unit.carry.energy < unit.carryCapacity*.9));
		}
		else
		{
			followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5);
		}
	}
	else
	{
		var unitDirection = unit.memory.direction;
		//If make it back to the drop off and its full go and fill up a extension instead, delete the direction so when it finishes
		//the drop off it finds the start of the path again and resumes the path.
		if(unit.carry.energy > 0 && 
			((returnResources.energy >= returnResources.energyCapacity && unit.pos.getRangeTo(returnResources) <= 1) || 
			unit.memory.extraStorage != null))
		{
			if(returnResources.room.energyAvailable < returnResources.room.energyCapacityAvailable)
			{
				//var cpu2 = Game.getUsedCpu();
				var transferExtension;
				if(unit.memory.extraStorage == null)
				{
					//var findExtension = unit.pos.findClosestByRange(FIND_MY_STRUCTURES, {
					var findExtension = unit.room.find(FIND_MY_STRUCTURES, {
						filter: function(object) {
							return(object.energy < object.energyCapacity && 
									(object.structureType == STRUCTURE_SPAWN || object.structureType == STRUCTURE_EXTENSION));
						}
					});
					
					//unit.memory.extraStorage = findExtension.id;
					transferExtension = uniqueStorage(unit, findExtension);
				}
				else
				{
					transferExtension = Game.getObjectById(unit.memory.extraStorage);
					if(transferExtension.energy >= transferExtension.energyCapacity)
					{
						delete unit.memory.extraStorage;
						return(false);	//Nothing will be done this tick while we wait to get another object in the next tick. This object was filled by another unit.
					}
				}
				
				//cpu2 = Game.getUsedCpu()-cpu2;
				//console.log(unit.name + ' finding closest (need filled) ' + transferExtension + ' costs: ' + cpu2);
				
				if(transferExtension != null)//transferExtension.length > 0
				{
					var transferTarget = transferExtension;
					var transferRange = unit.pos.getRangeTo(transferTarget);

					if(transferRange > 1)
					{
						if(unitDirection != null)
						{
							//If you find a extension that needs energy, move to it. This takes you off the route the gatherer
							//was on, so delete the direction now so it will search for the beginning of the route afterwards.
							delete unit.memory.direction;
						}
						
						findRoadOrCreate(unit);
						if(transferTarget != null)
						{	//As long as there is a target to go to and the room isn't full of energy, move to the target
							var nearExtension = unit.pos.findInRange(FIND_MY_STRUCTURES, 1, {
								filter: function(object) {
									return(object.energy < object.energyCapacity && 
											(object.structureType == STRUCTURE_SPAWN || object.structureType == STRUCTURE_EXTENSION));
								}
							});
							if(nearExtension.length > 0 && unit.transferEnergy(nearExtension[0]) == 0)
							{
								//Fill objects along the way
							}
							else
							{
								//var cpu = Game.getUsedCpu();
								//unit.moveTo(transferTarget);
								unitByPath(unit, transferTarget);
								
								//cpu = Game.getUsedCpu()-cpu;
								//console.log(unit.name + ' moving to ' + transferTarget.name + ' costs: ' + cpu);
							}
						}
					}
					else
					{
						if(transferTarget.energy != null && 
							transferTarget.energy < transferTarget.energyCapacity && 
							unit.transferEnergy(transferTarget) == 0)
						{
							delete unit.memory._move;
							delete unit.memory.extraStorage;
							//Don't look for any more structures to transfer to, successfully filled one.
							return(true);
						}
						else
						{
							console.log(unit.name + ' couldnt fill ' + transferTarget.name);
						}
					}
				}
			}
			else if(returnResources.room.energyAvailable >= returnResources.room.energyCapacityAvailable)
			{
				var transferStorage = unit.room.storage;
				var needyStruct;
				if(unit.memory.extraStorage == null)
				{
					//gathers carry 1350-1650 energy when with road, Tower takes 1000, Power takes 5000. If dropping near full (1350)
					//into the highest of these we only want to drop energy if they are under .73 capacity.
					//var findStruct = unit.pos.findClosestByRange(FIND_MY_STRUCTURES, {
					var findStruct = unit.room.find(FIND_MY_STRUCTURES, {
						filter: function(object) {
							return(object.energy < (object.energyCapacity*.73) && 
								(object.structureType == STRUCTURE_POWER_SPAWN || object.structureType == STRUCTURE_TOWER));
						}
					});
					
					//unit.memory.extraStorage = findStruct.id;
					needyStruct = uniqueStorage(unit, findStruct);
				}
				else
				{
					needyStruct = Game.getObjectById(unit.memory.extraStorage);
					if(needyStruct.energy >= needyStruct.energyCapacity)
					{
						delete unit.memory.extraStorage;
						return(false);	//Nothing will be done this tick while we wait to get another object in the next tick. This object was filled by another unit.
					}
				}
				
				if(transferStorage != null || needyStruct != null)
				{		//If we're in a room with a storage go over and transfer to the storage
					if(transferStorage != null && (transferStorage.store.energy < 5000 || needyStruct == null))
					{
						unitByPath(unit, transferStorage);
						var transferCode = unit.transferEnergy(transferStorage);
						
						if(transferCode == 0)
						{
							delete unit.memory._move;
							delete unit.memory.extraStorage;
						}
						
						if(unitDirection != null)
							delete unit.memory.direction;
					}
					else if(needyStruct != null)
					{
						unitByPath(unit, needyStruct);
						var transferCode = unit.transferEnergy(needyStruct);
						
						if(transferCode == 0)
						{
							delete unit.memory._move;
							delete unit.memory.extraStorage;
						}
						
						if(unitDirection != null)
							delete unit.memory.direction;
					}
				}
				else	//If room is full and no storage found, send back to retrieve what energy they can, until full.
				{
					followFlagForward(unit, unit.carry.energy < unit.carryCapacity);
				}
			}
			else
			{
				console.log(unit.name + ' gather has null returnResource or equivalent that should never happen.');
			}
		}
		else if(unit.carry.power != null && unit.carry.power > 0)
		{
			//If out of the spawn room, follow path back to spawn
			if(returnResources.room.name != unit.room.name)
			{
				followFlagForward(unit, false);
			}
			else	//Otherwise we're in spawn and need to move and transfer energy into power bank
			{
				var powerSpawn = unit.room.find(FIND_MY_STRUCTURES, {
					filter: { structureType: STRUCTURE_POWER_SPAWN }
				});
				
				if(powerSpawn.length > 0)
				{
					if(powerSpawn[0].power < powerSpawn[0].powerCapacity * .5)
					{
						//TO DO: Check if power spawn is > .5 of power, if unit has room, pickup energy from storage or equivalent
						//and dump in power spawn.
						unitByPath(unit, powerSpawn[0]);
						
						if(unit.transfer(powerSpawn[0], RESOURCE_POWER) == 0)
						{
							delete unit.memory._move;
						}
					}
					else
					{
						unitByPath(unit, unit.room.storage);

						if(unit.transfer(unit.room.storage, RESOURCE_POWER) == 0)
						{
							delete unit.memory._move;
						}
					}
				}
				else
				{
					console.log(unit.name + ' has power but no found STRUCTURE_POWER_SPAWN in ' + unit.room.name);
					Game.notify('Have power but cant find STRUCTURE_POWER_SPAWN', 10);
				}
			}
		}
		else if(unit.pos.getRangeTo(returnResources) > 1)
		{
			findRoadOrCreate(unit);
			//As long as half full, move to store energy back at base.
			if(returnResources.room != null)
			{
				//If room is full, send back to retrieve what energy they can.
				followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5 || 
								(returnResources.room.energyAvailable >= returnResources.room.energyCapacityAvailable &&
								unit.carry.energy < unit.carryCapacity*.9));
			}
			else
			{
				followFlagForward(unit, unit.carry.energy <= unit.carryCapacity*.5);
			}
		}
		else
		{
			var transferEnergyReturn = unit.transferEnergy(returnResources);
			if(transferEnergyReturn != 0)
				console.log(unit.name + ' transfer not handled. ' + transferEnergyReturn);
			else
				return(true);
		}
	}
	return(false);
 }
 
 function gatherFrom(unit)
 {
    var returnResources = findSpawn(unit);
	var unitEnergy = unit.carry.energy;
	var unitPower;
	if(unit.carry.power != null)
		unitPower = unit.carry.power;
	else
		unitPower = 0;
	var unitEnergyCapacity = unit.carryCapacity;
	//TO DO: This will spawn attackers endlessly for as long as the unit survives. Spawn 1 needed unit and that's it.
	if(unit.hits < unit.hitsMax)
	{
		var spawner = require('Spawner');
		spawner.createTempCreep('attack', {'role': 'attack', 'usingSourceId': unit.room.name, 'spawnId': returnResources.id}, returnResources.room.name);
	}
	
	//Going to try to grab any energy the unit can and immediately try a drop off instead of waiting for it to fill up
	//since it seems like all energy sits in the gatherers if I wait until they are full.
    //if(unit.carry.energy < unit.carryCapacity)
	if(unitEnergy == 0 && unitPower == 0 && returnResources != null)
    {
        var activeSource;
		if(unit.memory.usingSourceId != null)
		{
		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
		}
		else
		{
			activeSource = retrieveSource(unit);
		}
		
		if(unit.room.controller != null &&
			unit.room.controller.owner != null &&
			unit.room.controller.owner.username == 'RaskVann' &&
			unit.room.controller.level >= 5)
		{
			var links = unit.pos.findInRange(FIND_MY_STRUCTURES, 1, { 
				filter: { structureType: STRUCTURE_LINK } 
			});
			
			if(links.length > 0 && links[0].cooldown <= 0)
			{
				links[0].transferEnergy(unit);
			}
		}
		
		followFlagForward(unit, (unitEnergy+unitPower) < unitEnergyCapacity);
		
		//Look for power
		if(returnResources.room.name != unit.room.name)
		{
			if(unitEnergy > 0)
				unit.drop(RESOURCE_ENERGY);
			
			var powerDrop = unit.room.find(FIND_DROPPED_RESOURCES, {
				filter: { resourceType: RESOURCE_POWER }
			});
			
			if(powerDrop.length > 0)
			{
				unit.moveTo(powerDrop[0]);
				//If already contains power, force go home
				if(unit.pickup(powerDrop[0]) == 0)
				{
					unitPower = unitEnergyCapacity;
				}
			}
		}
    }
    else if(returnResources != null)
    {
        fillUpRoomWithEnergy(unit, returnResources);
    }
    
    if(unitEnergy < unitEnergyCapacity)
    {
        var target = unit.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if(target.length > 0)
    	{
            unit.pickup(target[0]);
        }
    }
 }
 
 function distribute(unit)
 {
	var returnResources = findSpawn(unit);

	if(unit.carry.energy == 0)
    {
		var activeSource;
		var continueGather = true;
		//Look for dropped energy around the sources in this room, if it exists retrieve and bring back to spawn
		if(unit.memory.usingSourceId != null)
		{
		    activeSource = Game.getObjectById(unit.memory.usingSourceId);
			//Remove assignment of the source (stop going back and forth to here)
			//if we can't find any energy here.
			if(activeSource.pos.findInRange(FIND_DROPPED_ENERGY, 1).length <= 0)
			{
				if(unit.carry.energy <= 0)
				{
					unit.memory.usingSourceId = null;
				}
				else
				{
					continueGather = false;
				}
			}
		}
		else	//Look at each source for dropped energy, assign the unit there if find energy
		{
			var sources = unit.room.find(FIND_SOURCES);
			for(var x in sources)
			{
				var droppedEnergy = sources[x].pos.findInRange(FIND_DROPPED_ENERGY, 1);
				if(droppedEnergy.length > 0)
				{
					unit.memory.usingSourceId = sources[x].id;
					break;
				}
			}
		}
		
		findRoadOrCreate(unit);
		followFlagForward(unit, unit.carry.energy < unit.carryCapacity && continueGather);
	}
	else if(returnResources != null)
	{
		fillUpRoomWithEnergy(unit, returnResources);
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
 
 function distance(x1, y1, x2, y2)
 {
	return(Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2)));
 }
 
 //'claim' needs to move to controller
 //'claim2' already at controller, just claim
 function claimRoom(unit)
 {
	//var reserveController = Game.getObjectById(unit.memory.claimController);
	if(unit.memory.role == 'claim')
	{
		//if(reserveController == null || reserveController.room.name != unit.room.name)	//usingSourceId is the room the controller is in
		if(unit.memory.usingSourceId != unit.room.name)
			followFlagForward(unit, true);
		else if(unit.pos.getRangeTo(unit.room.controller) > 1)
			unit.moveTo(unit.room.controller);
		else
		{
			unit.memory.role = 'claim2';
			unit.claimController(unit.room.controller);
			return(true);
		}
	}
	else if(unit.memory.role == 'claim2')
	{
		//if(reserveController == null || reserveController.room.name != unit.room.name)
		if(unit.memory.usingSourceId != unit.room.name)
			unit.memory.role = 'claim';
		else
		{
			unit.claimController(unit.room.controller);
			return(true);
		}
	}
	return(false);
 }
 
 //Attempts to construct structure as close to closeSpawn as possible center being closestLocation, within range 1
 function constructOutOfWay(closestLocation, structure, closeSpawn)
 {
	var success;
	var closeBuild;
	if(closestLocation != null)
	{
		for(var x = Math.max(0, closestLocation.x-1); x <= Math.min(49, closestLocation.x+1); x++)
		{
			for(var y = Math.max(0, closestLocation.y-1); y <= Math.min(49, closestLocation.y+1); y++)
			{
				if(x == closestLocation.x && y == closestLocation.y)
				{
					continue; //Skip over the location the harvester/builder should be sitting at that this link is for.
				}
				
				var nextPosition = new RoomPosition(x, y, closestLocation.roomName);
				var findTerrain = closeSpawn.room.lookForAt('terrain', x, y);
				var findFlag = closeSpawn.room.lookForAt('flag', x, y);
				var findCreep = closeSpawn.room.lookForAt('creep', x, y);
				var findStructure = closeSpawn.room.lookForAt('structure', x, y);
				var findConstruction = closeSpawn.room.lookForAt('constructionSite', x, y);
				
				//console.log('testing: ' + nextPosition + ' range: ' + nextPosition.getRangeTo(closeSpawn) + ' Terrain: ' + findTerrain + ' findFlag: ' + findFlag.length + ' findCreep: ' + findCreep.length + ' findStructure: ' + findStructure.length + ' findConstruction: ' + findConstruction.length);
				//Terrain should be movable (not constructable otherwise), if there is a flag, structure
				//or creep this area is being used for something important (usually travel) and so this
				//should only construct within 2 range of anchor in a buildable, unused spot.
				if(findTerrain.length > 0 && (findTerrain[0] == 'plain' || findTerrain[0] == 'swamp') &&
					findFlag.length == 0 && findCreep.length == 0 && findStructure.length == 0 && 
					findConstruction.length == 0 && 
					(closeBuild == null || distance(closeBuild.x, closeBuild.y, closeSpawn.pos.x, closeSpawn.pos.y) > distance(nextPosition.x, nextPosition.y, closeSpawn.pos.x, closeSpawn.pos.y)))
				{
					closeBuild = nextPosition;
				}
			}
		}
		
		//Build a structure at the closest found location to the spawn
		if(closeBuild != null)
		{
			success = closeBuild.createConstructionSite(structure);
			if(success == 0)
			{
				//if(structure == STRUCTURE_STORAGE)
				//{	//Spawn a link next to the storage in a empty position
				//	return(constructOutOfWay(closeBuild, STRUCTURE_LINK, closeSpawn));
				//}
				return(success);
			}
			else
			{
				//If fail construction for whatever reason, try again in another location.
				console.log('Trying to construct link failed, trying another location.');
			}
		}
	}
	console.log('structure: ' + structure + ' could not be built around: ' + closestLocation);
	return(success);
 }
 
 //Tries to find a ideal location, 1-2 spaces away from anchor, not in the way of anything in use and add construction site for link
 function constructStructure(anchor, structure)
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
				(closestLocation == null || distance(closeSpawn.pos.x, closeSpawn.pos.y, closestLocation.x, closestLocation.y) > distance(closeSpawn.pos.x, closeSpawn.pos.y, x, y)))
			{
				closestLocation = new RoomPosition(x, y, anchor.room.name);
				//console.log(closestLocation + ', pos: ' + closestLocation.pos + ' range: ' + closeSpawn.pos.getRangeTo(closestLocation));
			}
		}
	}
	
	//Closest location should be where the builder/harvester is sitting at either upgrading the controller or
	//harvesting a source. We want a link 1 away from this location. That isn't disruptive (isn't in a path,
	//isn't in a wall
	if(closestLocation != null)
	{
		console.log('attempting to build ' + structure + ' near location: ' + closestLocation);
		return(constructOutOfWay(closestLocation, structure, closeSpawn));
	}
	else
	{
		console.log('Unable to find closest location for link at ' + anchor);
	}
	return(success);	//Send back last attempted createConstructionSite error, if any was attempted
 }
 
module.exports.link = function(nextRoom)
{
	//Look through all the rooms we have access to (passed in from main)
	if(Game.getUsedCpu() < 5)
	{
		//If the room is mine and has access to links, look for applicable link locations
		if(nextRoom.controller != null &&
			nextRoom.controller.owner != null &&
			nextRoom.controller.owner.username == 'RaskVann')
		{
			if(nextRoom.controller.level >= 5)
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
							constructStructure(sources[i], STRUCTURE_LINK);
						}
					}
				}
			}
			
			if(nextRoom.controller.level >= 4)
			{
				//Look at the controller and make sure there is a link within 2 spaces of it
				var controllerStorage = nextRoom.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
					filter: { structureType: STRUCTURE_STORAGE }
				});
				
				if(controllerStorage.length <= 0)
				{
					var controllerConstructStorage = nextRoom.controller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2, {
						filter: { structureType: STRUCTURE_STORAGE }
					});
					//No link within 2 spaces, create one.
					if(controllerConstructStorage.length <= 0)
					{
						//Construct link, nothing exists.
						constructStructure(nextRoom.controller, STRUCTURE_STORAGE);
					}
				}
			}
		}
	}
	else
	{
		console.log('creation of links and storage skipped, not enough cpu');
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

module.exports.claim = function(unit, claimSeen)
{
	//role.contains('claim');
	if(unit.memory.role.startsWith('claim'))
	{
		claimRoom(unit);
	}
}

module.exports.distribute = function(unit, distributeSeen)
{
	if(unit.memory.role == 'distribute')
	{
		distribute(unit);
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