/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Spawner'); // -> 'a thing'
 */

// var workerBody = [WORK, WORK, CARRY, MOVE];
 var workerBody = [ { cost: 300, body: [WORK, WORK, CARRY, MOVE] },	//Movement needs to be 1 for units travelling between rooms, needs to have carry if first worker
					  { cost: 350, body: [WORK, WORK, CARRY, MOVE, MOVE] },
                      { cost: 500, body: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE] },
                      { cost: 800, body: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] } ];
// var attackBody = [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK];
 var attackBody = [ { cost: 300, body: [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK] },
                      { cost: 320, body: [TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK] },	//50% Armour, +18.8% more effective against spawn keeper, around 10 needed to kill for all to survive
                      { cost: 640, body: [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK] },
                      { cost: 700, body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK] }];//,	//75% Armour, +23.6% more effective against spawn keeper (max effectiveness), around 5 needed to kill for all to survive
					  //{ cost: 1400, body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK] } ];	//2 needed for keeper
 var attackPower = [ { cost: 2990, body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, 
										  ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK] } ];
 var healPower = [ { cost: 8700, body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, 
										HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL] } ];
 var rangedBody = [ { cost: 200, body: [MOVE, RANGED_ATTACK] },
                      { cost: 400, body: [MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK] },
                      { cost: 600, body: [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK] },
                      { cost: 800, body: [MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK] } ];
// var gatherBody = [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
 var gatherBody = [ { cost: 100, body: [CARRY, MOVE] },
					  { cost: 300, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] },
                      { cost: 400, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] },
                      { cost: 600, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] },
					  { cost: 800, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] },
					  { cost: 1000, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] }, 
					  { cost: 1200, body: [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE] } ];
 var gatherRoadBody = [ { cost: 300, body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE] },
                      { cost: 500, body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] },
                      { cost: 800, body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] },
					  { cost: 1250, body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] } ];
// var builderBody = [WORK, CARRY, MOVE, CARRY, MOVE];
 var builderBody = [ { cost: 300, body: [WORK, CARRY, CARRY, MOVE, MOVE] },
                      { cost: 450, body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE] },
                      { cost: 600, body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },
                      { cost: 750, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] },
                      { cost: 900, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] },
					  { cost: 1150, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] },
					  { cost: 1350, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] } ];
 var builderRoadBody = [ { cost: 400, body: [WORK, WORK, CARRY, CARRY, MOVE, MOVE] },
					  { cost: 600, body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE] },
                      { cost: 800, body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] },
 					  { cost: 1000, body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] },
 					  { cost: 1450, body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] },	//2 Needed. Hits 16 work instead of 15 for max controller
 					  { cost: 2250, body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] } ];	//Only 1 needed at controller at level 8 max
 var scoutBody =   [ { cost: 50, body: [MOVE] } ];
 
 function getHarvestId(spawn)
 {
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.harvestId0 == null)
	{
		spawn.memory.harvestId0 = -1;
		spawn.memory.harvestId1 = -1;
		spawn.memory.harvestId2 = -1;
		spawn.memory.harvestId3 = -1;
	}
	return(spawn.memory.harvestId0);
 }
 
 function nextHarvestId(spawn)
 {
	//If we still have valid units to spawn, give the currentID, otherwise push list closer to top.
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.needGather0 > 0 || spawn.memory.needHarvest0 > 0)
	{
		return(spawn.memory.harvestId0);
	}
	else	//nextNeedGather and nextNeedHarvest should trigger this, but just in case this is here
	{
		updateHarvestGatherList(spawn);
		return(spawn.memory.harvestId0);
	}
 }
 
 function getNeedGather(spawn)
 {
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.needGather0 == null)
	{
		spawn.memory.needGather0 = 0;
		spawn.memory.needGather1 = 0;
		spawn.memory.needGather2 = 0;
		spawn.memory.needGather3 = 0;
	}
	return(spawn.memory.needGather0);
 }
 
 function nextNeedGather(spawn)
 {
	//If we still have valid units to spawn, give the currentID, otherwise push list closer to top.
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.needGather0 > 0 || spawn.memory.needHarvest0 > 0)
	{
		var updateHarvest = spawn.memory.needGather0--;
		updateHarvestGatherList(spawn);
		return(updateHarvest);
	}
	else
	{
		updateHarvestGatherList(spawn);
		return(spawn.memory.needGather0);
	}
 }
 
 function getNeedHarvest(spawn)
 {
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.needHarvest0 == null)
	{
		spawn.memory.needHarvest0 = 0;
		spawn.memory.needHarvest1 = 0;
		spawn.memory.needHarvest2 = 0;
		spawn.memory.needHarvest3 = 0;
	}
	return(spawn.memory.needHarvest0);
 }
 
 function nextNeedHarvest(spawn)
 {
	//If we still have valid units to spawn, give the currentID, otherwise push list closer to top.
	if(spawn == null)
	{
		return(null);
	}
	else if(spawn.memory.needGather0 > 0 || spawn.memory.needHarvest0 > 0)
	{
		var updateHarvest = spawn.memory.needHarvest0--;
		updateHarvestGatherList(spawn);
		return(updateHarvest);
	}
	else
	{
		updateHarvestGatherList(spawn);
		return(spawn.memory.needHarvest0);
	}
 }
 
 //Push all three parts of the list closer to the top to be retrieved, no more gatherers
 //or harvesters were found.
 function updateHarvestGatherList(spawn)
 {
	var resetValue = -1;
	if(spawn != null && spawn.memory.needGather0 <= 0 && spawn.memory.needHarvest0 <= 0)
	{
		spawn.memory.needHarvest0 = spawn.memory.needHarvest1;
		spawn.memory.needHarvest1 = spawn.memory.needHarvest2;
		spawn.memory.needHarvest2 = spawn.memory.needHarvest3;
		spawn.memory.needHarvest3 = resetValue;
		
		spawn.memory.needGather0 = spawn.memory.needGather1;
		spawn.memory.needGather1 = spawn.memory.needGather2;
		spawn.memory.needGather2 = spawn.memory.needGather3;
		spawn.memory.needGather3 = resetValue;
		
		spawn.memory.harvestId0 = spawn.memory.harvestId1;
		spawn.memory.harvestId1 = spawn.memory.harvestId2;
		spawn.memory.harvestId2 = spawn.memory.harvestId3;
		spawn.memory.harvestId3 = resetValue;
	}
 }
 
 //Need to reference how many harvesters we've deployed already
 //Recorded by how many units we've assigned a harvest spot to in this room.
 function getHarvestSpot(spawner)
 {
    var thisRoom = spawner.room;
	if(thisRoom.memory.currentHarvestSpot == null)
	{
		thisRoom.memory.currentHarvestSpot = 0;
	}
	return(thisRoom.memory.currentHarvestSpot);
 }
 
 function getGatherSpot(spawner)
 {
	var thisRoom = spawner.room;
	if(thisRoom.memory.currentGatherSpot == null)
	{
		thisRoom.memory.currentGatherSpot = 0;
	}
	return(thisRoom.memory.currentGatherSpot);
 }
 
 function getBuilders(spawner)
 {
	var thisRoom = spawner.room;
	if(thisRoom.memory.currentBuilders == null)
	{
		thisRoom.memory.currentBuilders = 0;
	}
	return(thisRoom.memory.currentBuilders);
 }
 
 function increaseBuilders(spawner)
 {
	var thisRoom = spawner.room;
	if(thisRoom.memory.currentBuilders == null)
	{
		thisRoom.memory.currentBuilders = 0;
	}
	return(thisRoom.memory.currentBuilders++);
 }
 
 function getAttackers(spawner)
 {
	var thisRoom = spawner.room;
	if(thisRoom.memory.currentAttackers == null)
	{
		thisRoom.memory.currentAttackers = 0;
	}
	return(thisRoom.memory.currentAttackers);
 }
 
 function increaseAttackers(spawner)
 {
	var thisRoom = spawner.room;
	if(thisRoom.memory.currentAttackers == null)
	{
		thisRoom.memory.currentAttackers = 0;
	}
	return(thisRoom.memory.currentAttackers++);
 }
 
 //available energy is how much energy we have to upgrade with
 //baseBody is the body before any upgrades are started
 //upgradeCost is the cost it would take for addToBody to be added to baseBody
 //addToBody is what we're adding to the body each time we upgrade.
 function upgradeBody(availableEnergy, baseBody)
 {
    var newBody = baseBody;
    for(var bodyAdvancements = baseBody.length-1; bodyAdvancements > 0; bodyAdvancements--)
    {
        if(baseBody[bodyAdvancements].cost <= availableEnergy)
        {
            return(baseBody[bodyAdvancements].body);
        }
    }
    return(baseBody[0].body);
 }
 
 function retrieveBody(role, spawner)
 {
    var newBody = null;
    var upgradeCost;
    //All default units start at a 300 cost (just to be convenient), we're
    //subtracting from this value out of the gate to find out how much we have
    //to upgrade with
    var availableEnergy = spawner.room.energyAvailable;	//Spawn with whatever is available, fast
	//var availableEnergy = spawner.room.energyCapacityAvailable;	//Only spawn the highest possible at this level, efficient
    //used role.role to get the stored role from previous method
    if(role == 'worker' || role == 'flag')
    {
        newBody = upgradeBody(availableEnergy, workerBody);
    }
    else if(role == 'attack' || role == 'defend')
    {
        newBody = upgradeBody(availableEnergy, attackBody);
    }
    else if(role == 'gather')
    {
		var findRoads = spawner.room.find(FIND_STRUCTURES, {
			filter: { structureType: STRUCTURE_ROAD }
		});
		
		if(findRoads != null && findRoads.length > 20)
		{
			//var findConstruction = spawner.room.find(FIND_CONSTRUCTION_SITES, {
			//	filter: { structureType: STRUCTURE_ROAD }
			//});
			
			//If all construction sites for roads have been built (there are no construction found for roads)
			//Go ahead and build the road version of the gather, otherwise build the gatherBody
			//if(findConstruction == null)	
				newBody = upgradeBody(availableEnergy, gatherRoadBody);
		}
		else
		{
			newBody = upgradeBody(availableEnergy, gatherBody);
		}
    }
    //WORK, WORK, CARRY, MOVE works better at short distance, 6 or under
    //WORK, CARRY, CARRY, MOVE, MOVE works better at longer distance, 7 or higher
	else if(role == 'builder')
    {
		var findRoads = spawner.room.find(FIND_STRUCTURES, {
			filter: { structureType: STRUCTURE_ROAD }
		});
		if(findRoads != null && findRoads.length > 10)
		{
			//Once we get some roads up and running switch over to the builder's with only 1 MOVE
			newBody = upgradeBody(availableEnergy, builderRoadBody);
		}
		else	
		{
			newBody = upgradeBody(availableEnergy, builderBody);
		}
    }
	else if(role == 'scout')
	{
		newBody = upgradeBody(availableEnergy, scoutBody);
	}
    else if(role != 'empty')
    {
        //console.log("Can't find body for role: " + role);
    }
    return(newBody);
 }

 function retrieveNameNew(spawner, role)
 {
    //used role.role from previous method
    if(role == 'worker' || role == 'flag')
    {
        return("worker" + getHarvestSpot(spawner) + spawner.room.name);
    }
    else if(role == 'attack')
    {
        return("attack" + getAttackers(spawner) + spawner.room.name);
    }
    else if(role == 'gather')
    {
        return("gather" + getGatherSpot(spawner) + spawner.room.name);
    }
	else if(role == 'builder')
    {
        return("builder" + getBuilders(spawner) + spawner.room.name);
    }
	else if(role == 'scout')
	{
		return("scout" + spawner.memory.maxScouts + spawner.room.name);
		return(null);	//Give random names to scouts
	}
    else if(role != 'empty')
    {
        //console.log("Name role: " + role);
        return(null);
    }
	return(null);
 }

 function findNextRole(spawner)
 {
	var gatherers = getGatherSpot(spawner);
	var harvesters = getHarvestSpot(spawner);
	//TODO: At 2 work each energy node can support 5 repair/upgrades at a time or 2 builders each
	//come up with a way of measuring how much input or total energy we need to take care of and
	//create builders accordingly.
	var maxBuilders = 2;
	var maxAttackers = Math.min(5, spawner.room.controller.level);
	setRoomHarvesterMax(spawner.room, 3);    //Allow 3 harvesters per energy node for starter room
	if(spawner.room.controller.level > 1)   //Expand into nearby territories when level goes up enough for this to make sense
	{
		maxBuilders = Math.min(10, spawner.room.controller.level*2);
	    //var exits = Game.map.describeExits(spawner.room.name);
	    //for(var exitDirection = 1; exitDirection < exits.length; exitDirection++)
	    //{
	        //var currentExit = exits[exitDirection];
	        //If found a room this direction, this provides the name of the room
	        //if(currentExit != null)
	        //{
	            //creep.pos.findClosest(creep.room.findExitTo(currentExit))
	        //}
	    //}
	    //setRoomHarvesterMax(spawner.room, 1);
	}

	//If want (for example) double the amount of gathers per harvester, this will need to change
	//in addition to the logic in Harvester that is assigning the locations of the gathers
	//Gatherers needed at this spawn = ROUND_UP(((EnergyPerNode/RechargeTime)*(DistanceToNode*2))/CapacityPerGatherer)
	//Gathers needed per harvest = ROUND_UP(numberAbove/HarvestersPerNode)
	//Alternative Gatherer per Harvester= ROUND_UP((HarvestRate*(DistanceToNode*2))/CapacityPerGatherer)
	//With 3000/300 ticks, you'll get over a 15000 energy over the lifetime of the units spawned to
	//take care of it with 300/unit gets you 50 units. I'll hope 25 is conservative. With the above
	//formula the max distance you can pull off at 150 capacity units going over only
	//plains is 187.5 distance or 3.75 rooms worth. I'll gain a little less then half with that.
	if((spawner.room.memory.needGatherers != null && spawner.room.memory.needGatherers > 0))// || getNeedGather(spawner) > 0
	{
		return('gather');
	}
	else if((harvesters < spawner.room.memory.harvesterMax))// || getNeedHarvest(spawner) > 0
	{
		return('worker');
	}
	else if(getBuilders(spawner) < maxBuilders)
	{
		return('builder');
	}
	//TO DO: Come up with a alarm system that creates defenders. If so it would create a unit 
	//every (30/EnergyNodes) per tick. Assuming a 300 unit cost (Cost/10)/EnergyNodes
	else if(getAttackers(spawner) < maxAttackers)
	{
		return('attack');
	}
	else if(spawner.memory.scoutsAlive <= 0 || spawner.memory.requestScout > 0)
	{
		return('scout');
	}
	return(null);   //Nothing else to spawn, look to expand buildings or territory
 }
 
 function findRoleWithinName(nextName)
 {
	var lowestFoundNumber = 99999;
	if(nextName != null)
	{
		var findNumber = "0123456789";
		for(var number in findNumber)
		{
			var findNext = nextName.indexOf(number);
			if(findNext > 0 && findNext < lowestFoundNumber)
			{
				lowestFoundNumber = findNext;
			}
		}
		if(lowestFoundNumber != 99999)
		{
			var returningJob = nextName.substring(0, lowestFoundNumber);
			//console.log("Respawn job: " + returningJob);
			return(returningJob);
		}
	}
	return(null);
 }
 
 //The unit's name is formated 'Role''Num''Room'. This finds the first possible number in the name
 //and cuts out that and everything right of that, leaving the role to be extracted from the name
 function findDeadUnitRole(spawner, nextName)
 {
	var foundName = findNameIsLiving(nextName);
	
    if(foundName == false)
    //if(Game.time > getNextRespawnTime(spawner))
    {
		var nextName = findDeadUnitName(spawner);
        return(findRoleWithinName(nextName));
    }
    return(null);
 }
 
 function quickestUnitToDie(currentRole, activeSource)
 {
	var lowestTick = 1500;	//Lowest tick to live
	var lowestUnit;
	if(currentRole != null && activeSource != null)
	{
		var secondRole;
		//Workers also pair up with role == lazy, this isn't true for any other role so we're
		//allowing to send in 'worker' and count both types of units.
		if(currentRole == 'worker')
		{
			secondRole = 'lazy';
		}
		else if(currentRole == 'lazy')
		{
			secondRole = 'worker';
		}
		else
		{
			secondRole = currentRole;
		}
		
		for(var x in Game.creeps)
		{
			//Count up relevant body if the unit is going to the same id as the current unit and is the same role
			//We have a issue where previous calls of this function could have marked a previous unit to be skipped
			//however until it dies later calls of this have no way of knowing this, so we're going assume all older
			//units then the current one are marked for death (not to be used in the next cycle) that way we don't go
			//through an entire list of units trying to mark off 1 unneeded unit and instead mark off all of them.
			if(Game.creeps[x].memory.usingSourceId == activeSource && 
				(Game.creeps[x].memory.role == currentRole || Game.creeps[x].memory.role == secondRole) &&
				Game.creeps[x].ticksToLive < lowestTick)
			{
				lowestTick = Game.creeps[x].ticksToLive;
				lowestUnit = Game.creeps[x];
			}
		}
	}

	return(lowestUnit);
 }

 function findDeadUnitBody(spawner, nextName)
 {
    //This if statement only avoids going into retrieveBody since it will 
    //cause a console log to trigger that I'd rather hear if other things go wrong
    var role = findDeadUnitRole(spawner, nextName);
    if(role != null)
    {
		var returnBody = retrieveBody(role, spawner);
		
		//If next dead unit is a gather or worker and we already have enough units fielded for this source, do not spawn and
		//add to the end of the list.
		if(role == 'gather')
		{
			var countActiveGather = countGatherAtSource(nextName);
			var pathLength = 5;
			if(Memory.creeps[nextName] != null && Memory.creeps[nextName].pathLength != null)
			{
				pathLength = Memory.creeps[nextName].pathLength;
			}
			
			if(Memory.creeps[nextName] != null && pathLength != null)
			{
				pathLength = Memory.creeps[nextName].pathLength;
				var respawnThreshold = (pathLength*2*10);

				//If, even without this unit, we have enough carrying capacity to support this source
				//running at full capacity. Skip this unit.
				//Logic is if we have the total carrying capacity (numOfParts*50) and this is >= the amount
				//we'd need for the units to go there and back again (pathLength*2) at full capacity (*10 per tick)
				if((countActiveGather*50) >= respawnThreshold)
				{
					//console.log(nextName + ' found ' + (countActiveGather*50) + ' capacity of needed ' + respawnThreshold + ' moving to end.');
					moveRespawnToEnd(spawner);
					return(null);
				}
			}
			else
			{
				console.log(nextName + ' cant find path length in ' + Memory.creeps[nextName]);
			}
		}
		else if(role == 'worker' || role == 'lazy')
		{
			var countActiveWork = countWorkAtSource(nextName);
			var respawnThreshold = 10;

			//If even without this unit we'd have enough harvesting capacity to clean out this source, skip the unit
			//Logic is each unit of body harvests 2 units per tick. Each source carries 3000 units, recharging at 300 ticks.
			//Leading to 10 Energy/Tick being the optimal harvest rate. So Body*2 should be at or barely above 10
			if((countActiveWork*2) >= respawnThreshold)
			{
				//console.log(nextName + ' found ' + (countActiveWork*2) + ' work of needed ' + respawnThreshold + ' moving to end.');
				moveRespawnToEnd(spawner);
				return(null);
			}
		}
		
		//Otherwise return the body we're interested in as normal
        return(returnBody);
    }
    return(null);
 }
 
 //Goes through all living units, returns the unit with the matching name, otherwise null
 function findUnitByName(nextName)
 {
	var unitList = Game.creeps;
	//Look through all alive units, if don't find a unit with this name foundName will be null
	//and he is dead, otherwise returns the relevant unit
	for(var unit in unitList)
	{
		if(unitList[unit].name == nextName)
		{
			return(unitList[unit]);
		}
	}
	return(null);
 }
 
 function countWorkAtSource(unitName)
 {
	var countActiveWork = 0;	//Counts all relevant work bodies of the same role, going to the same id, ignoring current and older units
	if(unitName != null && Memory.creeps[unitName] != null && Memory.creeps[unitName].role != null && Memory.creeps[unitName].usingSourceId != null)
	{
		var currentRole = Memory.creeps[unitName].role;
		var activeSource = Memory.creeps[unitName].usingSourceId;
		if((currentRole == 'worker' || currentRole == 'lazy') && activeSource != null)
		{
			for(var x in Game.creeps)
			{
				//Count up relevant body if the unit is going to the same id as the current unit and is the same role
				//We have a issue where previous calls of this function could have marked a previous unit to be skipped
				//however until it dies later calls of this have no way of knowing this, so we're going assume all older
				//units then the current one are marked for death (not to be used in the next cycle) that way we don't go
				//through an entire list of units trying to mark off 1 unneeded unit and instead mark off all of them.
				if(Game.creeps[x].memory.usingSourceId == activeSource && 
					(Game.creeps[x].memory.role == 'worker' || Game.creeps[x].memory.role == 'lazy'))// &&
					//unit.ticksToLive < Game.creeps[x].ticksToLive)
				{
					countActiveWork += Game.creeps[x].getActiveBodyparts(WORK);
				}
			}
		}
	}
	//if(countActiveWork <= 0)
		//console.log(unitName + ' is trying to count work and it came back with ' + countActiveWork);
	
	return(countActiveWork);
 }
 
 function countGatherAtSource(unitName)
 {
	var countActiveGather = 0;	//Counts all relevant carry bodies of the same role, going to the same id, ignoring current and older units
	if(unitName != null && Memory.creeps[unitName] != null && Memory.creeps[unitName].role != null && Memory.creeps[unitName].usingSourceId != null)
	{
		var currentRole = Memory.creeps[unitName].role;
		var activeSource = Memory.creeps[unitName].usingSourceId;
		if(currentRole == 'gather' && activeSource != null) 
		{
			for(var x in Game.creeps)
			{
				//Count up relevant body if the unit is going to the same id as the current unit and is the same role
				//We have a issue where previous calls of this function could have marked a previous unit to be skipped
				//however until it dies later calls of this have no way of knowing this, so we're going assume all older
				//units then the current one are marked for death (not to be used in the next cycle) that way we don't go
				//through an entire list of units trying to mark off 1 unneeded unit and instead mark off all of them.
				if(Game.creeps[x].memory.usingSourceId == activeSource && 
					Game.creeps[x].memory.role == 'gather')// && 
					//unit.ticksToLive < Game.creeps[x].ticksToLive)
				{
					countActiveGather += Game.creeps[x].getActiveBodyparts(CARRY);
				}
			}
		}
	}
	//if(countActiveGather <= 0)
		//console.log(unitName + ' is trying to count gather and it came back with ' + countActiveGather);
	
	return(countActiveGather);
 }
 
 //Returns true if a unit with a matching name is living. Otherwise it's dead and returns false
 function findNameIsLiving(nextName)
 {
	var foundName = findUnitByName(nextName);
	
	if(foundName == null)
	{
		//console.log(nextName + ' is dead, respawning');
	}
	return(foundName != null);
 }

 function findDeadUnitName(spawner)
 {
	//Pull next unit from the respawn list
	var nextName = getNextName(spawner);
	var foundName = findNameIsLiving(nextName);

	//If we're overdue for respawning the unit based on time or the unit is dead, respawn the unit
	//If the unit is found to be unneeded don't bother to respawn this unit (skipRedudant is
	//fixing this issue, this tick if returning true, we'll be looking at a different unit next tick)
    if(foundName == false)
    {
		//Look at the unit we are trying to spawn here, if we can, look at the usingSourceId
		//if it is a gatherer and try to find a link next to the source, if it finds one don't
		//allow this unit to spawn since this source is covered and doesn't need gathers.
		/**if(Memory.creeps[nextName] != null && Memory.creeps[nextName].role == 'gather' && 
			Memory.creeps[nextName].usingSourceId != null)
		{
			var source = Game.getObjectById(Memory.creeps[nextName].usingSourceId);
			
			if(source != null)
			{
				var storage = source.room.find(FIND_MY_STRUCTURES, {
					filter: { structureType: STRUCTURE_STORAGE }
				});
				
				//If there is a link, there isn't a need for a gatherer at this source, this disables 
				//generation of gathers at sources where a link is found
				var findLinks = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
					filter: { structureType: STRUCTURE_LINK }
				});
				
				if(findLinks.length > 0 && storage.length > 0)
				{
					moveRespawnToEnd(spawner);
					return(null);
				}
			}
		}**/
		
		//Otherwise we are doing the normal routine and spawning a unit that is dead
        return(nextName);
    }
    return(null);
 }
 
 //Goes to the end of the respawnTime list and pulls the last from the list.
 function getLastCreatedRespawnTime(spawner)
 {
	if(spawner.memory.respawnTime != null)
    {
		var respawnTime = spawner.memory.respawnTime;
		var removeLastComma = respawnTime.substring(0, respawnTime.length-1);
		var lastTime = respawnTime.substring(removeLastComma.lastIndexOf(",")+1, respawnTime.length-1);
		//console.log('removed comma: ' + removeLastComma + ', returned value: ' + lastTime);
		return(lastTime);
    }
    return(null); //Make it fail the check, respawnTime doesn't exist yet
 }
 
 //Double check the last created unit's spawn time and makes sure at least a buffer amount
 //of time is between that and this new unit. If it has at least that amount it uses the
 //least amount of time possible (approx.) to tell the system to respawn this unit.
 function calculateRespawnTime(spawner, body)
 {
	var lastTime = getLastCreatedRespawnTime(spawner);
	var creepMaxLife = 1500;
	var totalCreeps = Object.keys(Game.creeps).length;
	var buffer = Math.ceil(creepMaxLife/totalCreeps);
	var nextSpawnTime;
	if(body != null && body.length != null)
	{
		nextSpawnTime = Game.time+creepMaxLife+(body.length*3);
	}
	else
	{
		nextSpawnTime = Game.time+creepMaxLife+(5*3);
	}
	
	//If we have to few units the buffer time is going to be insane (at 10 creeps, 150 ticks 
	//between units). Reduce the buffer if this is the case
	if(totalCreeps < 10)
	{
		buffer = 15;
	}
	
	//Measure the time between the spawn time we'd normally input and the unit that will be
	//spawning before it, if they are right next to each other (less then buffer limit)
	//increase it accordingly so we have time to collect energy between unit spawns.
	if(lastTime != null && nextSpawnTime-lastTime < buffer) 
	{
	    var convertToInteger = (buffer*1)+(1*lastTime);
        //console.log('1: ' + lastTime + ', 2: ' + buffer + ' becomes ' + convertToInteger);
		//return(convertToInteger);  //It's acting like a string, convert
		return(nextSpawnTime);
	}
	else 
	{
	    //console.log('regular time: ' + nextSpawnTime);
		return(nextSpawnTime);
	}
	//According to wiki, spawn time is numberOfBodyParts+3. Since these are being assigned
	//before the unit spawns, and the unit only starts counting down to death when spawned
	//this needs to be raised by TimeTillDeath+spawnTime+wiggleRoom.
 }

 function getNextRespawnTime(spawner)
 {
    if(spawner.memory.respawnTime != null)
    {
        var respawnTime = spawner.memory.respawnTime;
        //console.log("Getting Time: '" + respawnTime.substring(0, respawnTime.indexOf(",")) + "'");
        
        var nextTime = respawnTime.substring(0, respawnTime.indexOf(","));
        //Send back the next time stored in the list. If we find out that we're at energy capacity however
        //just give back an impossibly low time so we force the next unit to spawn.
        if(spawner.room.energyAvailable >= spawner.room.energyCapacityAvailable &&
			spawner.room.energyAvailable > 300)
        {
            //console.log('forcing next unit to spawn, energy is full ' + spawner.room.energyAvailable + ' of ' + spawner.room.energyCapacityAvailable);
            nextTime = 0;
        }
        return(nextTime);
    }
    return(Game.time+9999); //Make it fail the check, respawnTime doesn't exist yet
 }

 function extractNextRespawnTime(spawner)
 {
    if(spawner.memory.respawnTime != null)
    {
        var respawnTime = spawner.memory.respawnTime;
        var returnTime = respawnTime.substring(0, respawnTime.indexOf(","));
        spawner.memory.respawnTime = respawnTime.substring(respawnTime.indexOf(",")+1);
        //console.log("Extracting Time: " + returnTime + " saving: " + spawner.memory.respawnTime);
        return(returnTime);
    }
    return(Game.time+9999); //Make it fail the check, respawnTime doesn't exist yet
 }
 
 //If a sourceId exists, attempts to find the next dead unit that shares the same sourceId and role.
 //Otherwise just finds the next dead unit that share the same role.
 function nextDeadRoleName(spawner, checkRole, replaceSourceId)
 {
	if(spawner.memory.respawnName != null && checkRole != null)
    {
        var respawnName = spawner.memory.respawnName;
        var nextName;
		var consideredNames = "";
		do
		{
			nextName = respawnName.substring(0, respawnName.indexOf(","));
			respawnName = respawnName.substring(respawnName.indexOf(",")+1);
			if(Memory.creeps[nextName] != null &&
				((Memory.creeps[nextName].usingSourceId == null || replaceSourceId == null || 
				(Memory.creeps[nextName].usingSourceId != null && Memory.creeps[nextName].usingSourceId == replaceSourceId)) && 
				findRoleWithinName(nextName) == checkRole && findNameIsLiving(nextName) == false))
			{
				//Cut name we're spawning out of the list and add it to end
				var newRespawnList = consideredNames + respawnName + nextName + ",";
				//console.log('Trying to find dead ' + checkRole + ' found dead unit ' + nextName + ' from list ' + spawner.memory.respawnName + ' making new list ' + newRespawnList);
				//spawner.memory.respawnName = newRespawnList;
				return(nextName);
			}
			else
			{
				consideredNames += nextName + ","
			}
		} while (respawnName.length > 1);
    }
	return(null);
 }

 function getNextName(spawner)
 {
    if(spawner.memory.respawnName != null)
    {
        var respawnName = spawner.memory.respawnName;
        //console.log("Getting Name: " + respawnName.substring(0, respawnName.indexOf(",")));
        return(respawnName.substring(0, respawnName.indexOf(",")));
    }
    return(null);
 }
 
 function moveRespawnToEnd(spawner)
 {
	var atEnd = extractNextName(spawner);
	//extractNextRespawnTime(spawner);
	addRespawnEnd(spawner, atEnd);
 }

 function extractNextName(spawner)
 {
    if(spawner.memory.respawnName != null)
    {
        var respawnName = spawner.memory.respawnName;
        var returnName = respawnName.substring(0, respawnName.indexOf(","));
        spawner.memory.respawnName = respawnName.substring(respawnName.indexOf(",")+1);
        //console.log("Extracting Name: " + returnName + " saving: " + spawner.memory.respawnName);
        return(returnName);
    }
	console.log('ERROR: cant find respawnName from ' + spawner);
    return(null);
 }
 
 //Adds the current name and time to the end of the respawnTime and respawnName
 function addRespawnEnd(spawner, name)
 {
	var respawnName = spawner.memory.respawnName;
	var found = respawnName.indexOf(name);
	if(found >= 0)
	{
		console.log('addRespawnEnd-Redundant ' + name + ' was found at ' + found);
		Game.notify('addRespawnEnd-Redundant ' + name + ' was found at ' + found, 480);
	}
	
	if(spawner.memory.respawnTime == null)
	{
		//spawner.memory.respawnTime = calculateRespawnTime(spawner, body).toString()+",";
		spawner.memory.respawnName = name+",";
	}
	else
	{
		//spawner.memory.respawnTime += calculateRespawnTime(spawner, body).toString()+",";
		spawner.memory.respawnName += name+",";
	}
 }
 
 //Looks at the first object in the nextName respawn list and skips it if any prerequisits haven't been met
 //Attackers will only be allowed through if there is enough harvesters and gathers to support the ecconomy
 //Builders will only be allowed through if there is enough harvesters and gatherers, unless we're at the energy cap
 //Gatherers will only be allowed through if there is at least 1 harvester already at the source they're going for.
 //Additional logic to gate harvesters and gatherers are in the dead unit retrieval (quickestToDieRespawn() and findDeadUnitBody())
 //which only allows harvester/gathers through when we are under the limit for that source or a unit dieing will cause us
 //to be under that limit.
 function checkSkipUnit(spawner, body, harvestersSeen, gatherersSeen, buildersSeen, attackersSeen)
 {
	var name = getNextName(spawner);
	var role = findRoleWithinName(name);
	if(role == null)
	{
		role = findDeadUnitRole(spawner, name);
	}
	else if(body == null)
	{
		//console.log(spawner.name + ' found null body. Skipping over: ' + name);
		moveRespawnToEnd(spawner);
	}
	
	//Skip over gatherers if there are no workers present
	//or
	//Skip over gatherers if we can't find a live worker at this source already
	if(role == 'gather' && 
		(harvestersSeen <= 0 || 
		(Memory.creeps[name] != null && Memory.creeps[name].usingSourceId != null && quickestUnitToDie('worker', Memory.creeps[name].usingSourceId) == null)))
	{
		moveRespawnToEnd(spawner);
		//console.log('adding ' + name + ' to end of respawn list.');
		return(true);
	}
	//If there aren't harvesters and gatherers, skip over attackers
	else if(role == 'attack' && Math.min(harvestersSeen*2, gatherersSeen*2) <= attackersSeen+1)
	{
		moveRespawnToEnd(spawner);
		//console.log('adding ' + name + ' to end of respawn list.');
		return(true);
	}
	//If you're a builder and there isn't enough gatherers and harvesters already, skip over
	//ignore the gatherer/harvester limit if we are at the energy cap.
	else if(role == 'builder' && 
			(Math.min(harvestersSeen*2, gatherersSeen*2) <= buildersSeen+1))// && 
			//spawner.room.energyAvailable < spawner.room.energyCapacityAvailable))
			
	{
		moveRespawnToEnd(spawner);
		//console.log('adding ' + name + ' to end of respawn list.');
		return(true);
	}
	return(false);
 }
 
 function nextToDie()
 {
	var lowestTick = 1500;	//Lowest tick to live
	var lowestUnit;
	for(var x in Game.creeps)
	{
		if(Game.creeps[x].ticksToLive < lowestTick)
		{
			lowestTick = Game.creeps[x].ticksToLive;
			lowestUnit = Game.creeps[x];
		}
	}
	return(lowestUnit);
  }
 
 //Check the next unit to die, if it is critical to have this unit up and running at all times
 //This function will spawn that unit when it hits enough ticks to live so it will die when the unit
 //we're spawning with this function builds itself and has enough time to travel over.
 //Note: This assumes there is always a dead unit to pull from that is assigned to the source we're 
 //		interested in to spawn ahead of the dieing unit to replace it. It simply won't spawn anything
 //		if there isn't anything in the respawn list to take its place.
 function quickestToDieRespawn(spawner)
 {
	var unit = nextToDie();
	var pathLength = 5;
	var estimatedBodyLength = 1;
	var sourceId;
	var role;
	if(unit != null)
	{
		//Not going to bother calculating something more complicated, estimate 
		//we're spending 50 energy per body and we can make the highest possible 
		//body count we can right now, plus any path we might have stored.
		estimatedBodyLength = spawner.room.energyAvailable/50;
		if(unit.memory.pathLength != null)
		{
			pathLength = unit.memory.pathLength;
		}
		if(unit.memory.usingSourceId != null)
		{
			sourceId = unit.memory.usingSourceId;
		}
		if(unit.memory.role != null)
		{
			role = unit.memory.role;
		}
	}
	else
	{
		//If can't find a unit, kill it here
		return(false);
	}
	
	//If the spawner is able to handle our request and
	//If we pass this we have a unit near death that if a unit spawns now can take it's place or close to it when we need it.
	if(spawner != null && spawner.spawning == null && 
		unit != null && unit.ticksToLive <= estimatedBodyLength*3+pathLength)
	{
		var replaceWithName = nextDeadRoleName(spawner, role, sourceId);
		var returnRole = findRoleWithinName(replaceWithName);
		var returnBody = retrieveBody(returnRole, spawner);
		if(replaceWithName != null && returnRole != null && returnBody != null)
		{
			if(returnRole == 'gather')
			{
				var countActiveGather = countGatherAtSource(unit.name);
				var respawnThreshold = (pathLength*2*10);
				if((countActiveGather-unit.getActiveBodyparts(CARRY))*50 < respawnThreshold &&
					spawner.canCreateCreep(returnBody, replaceWithName) == 0)
				{
					var badSpawn = spawner.createCreep(returnBody, replaceWithName);
					//TO DO: Update respawn list, move unit we're spawning here to end.
					console.log('Spawn: ' + replaceWithName + ' to replace ' + unit.name + ' dieing in ' + unit.ticksToLive + ' ticks. Found ' + (countActiveGather-unit.getActiveBodyparts(CARRY))*50 + ' gather of needed ' + respawnThreshold);
					return(true);
				}
			}
			else if(returnRole == 'worker')
			{
				var countActiveWork = countWorkAtSource(unit.name);
				var respawnThreshold = 10;
				if((countActiveWork-unit.getActiveBodyparts(WORK))*2 < respawnThreshold &&
					spawner.canCreateCreep(returnBody, replaceWithName) == 0)
				{
					var badSpawn = spawner.createCreep(returnBody, replaceWithName);
					//TO DO: Update respawn list, move unit we're spawning here to end.
					console.log('Spawn: ' + replaceWithName + ' to replace ' + unit.name + ' dieing in ' + unit.ticksToLive + ' ticks. Found ' + (countActiveWork-unit.getActiveBodyparts(WORK))*2 + ' work of needed ' + respawnThreshold);
					return(true);
				}
			}
			else
			{
				//Note: Track something like how much carry modules are assigned to this task to ensure
				//		that you don't over spawn units with this function.
				//Nothing else is as time intensive as these, expand if necessary
			}
		}
	}
	return(false);
 }

 function spawnNextInQueue(spawner, harvestersSeen, gatherersSeen, buildersSeen, attackersSeen)
 {
	//Look at respawn list and check if needs to spawn new unit from the dead
    var name = findDeadUnitName(spawner);
    var body = findDeadUnitBody(spawner, name);
    var role = null;
    //If no found dead units need to respawn, attempt to spawn new unit
    if(name == null)
    {
        role = findNextRole(spawner);
        name = retrieveNameNew(spawner, role);
        body = retrieveBody(role, spawner);
    }
    
    //If found attackers (this requires attack units, since they hold the code that watches)
    //replace anything that might be going on by creating a 'defend' unit, no name, attack body
    if(spawner.room.memory.requestDefender > 0)
    {
        name = null;
        body = retrieveBody('defend', spawner);
        role = 'defend';
    }
	
	//Independant of all other checks in spawnNextInQueue logic, recieves body as a conveniance
	//to better calculate time more then anything else. If this fails however any work we were
	//doing in spawnNextInQueue will be stopped and tried again next tick.
	if(checkSkipUnit(spawner, body, harvestersSeen, gatherersSeen, buildersSeen, attackersSeen))
	{
		return(false);
	}

	var canCreateUnit;
	if(name == null)
	{
		canCreateUnit = spawner.canCreateCreep(body);
	}
	else
	{
		canCreateUnit = spawner.canCreateCreep(body, name);
	}
	if(canCreateUnit == 0)
	{
		var _ = require('lodash');
		var badSpawn;
		
		//Respawn harvest/gathers when they expire (current 1500 time, no way to reference this)
		//Have body and name, no role, should only be true for respawning units taking over for dead units
		if(role == null)
		{
			//role = findDeadUnitRole(spawner, name);
			role = findRoleWithinName(name);
			extractNextName(spawner);
			//extractNextRespawnTime(spawner);
			
			//If is a attack or build unit, check if we have at least as many harvesters/gatherers as the amount 
			//of attackers/builders we're trying to make, if there isn't, skip them.
			if(role == 'attack' || role == 'builder' || role == 'gather' || role == 'worker')
			{
				badSpawn = spawner.createCreep(body, name);
			}
			else    //Not expecting this here
			{
				console.log('Unit ' + name + ' with role ' + role + ' found to respawn when not expected. Removed from respawning.');
				//return(false);
			}
		}
		//Have body and role, don't have name, should only be true for 'defend'
		else if(name == null)
		{
			badSpawn = spawner.createCreep(body, {'role' : role});
		}
		//TO DO: Remove when ensure scout writing to memory works.
		//If creating a worker or gatherer for another room, place sourceId in the unit on spawn
		//else if((role == 'worker' || role == 'gather') && 
		//		(getNeedGather(spawner) > 0 || getNeedHarvest(spawner) > 0))
		//{
			//console.log(spawner.name + ' is not handling spawning of different rooms directly.');
			//badSpawn = spawner.createCreep(body, name, {'role': role, 'usingSourceId': getHarvestId(spawner)});
		//}
		//Have body, name and role, should be true for all new units, requested through memory
		else
		{
			badSpawn = spawner.createCreep(body, name, {'role' : role});
		}
		if(_.isString(badSpawn))
		{
			//If successfully spawn a new X
			if(role != null)
			{
				if(role == 'gather')
				{
					if(spawner.room.memory.needGatherers > 0)
					{
						//gatherer, remove the amount of needed gatherers
						spawner.room.memory.needGatherers--;
					}
					//else if(getNeedGather(spawner) > 0)
					//{//TO DO: Remove when ensure scout writing to memory works.
					//	nextNeedGather(spawner);
					//}
				}
				else if(role == 'worker')
				{
					if(spawner.room.memory.currentHarvestSpot < spawner.room.memory.harvesterMax)
					{
						spawner.room.memory.currentHarvestSpot++;
					}
					//else if(getNeedHarvest(spawner) > 0)
					//{//TO DO: Remove when ensure scout writing to memory works.
					//	nextNeedHarvest(spawner);
					//}
				}
				else if(role == 'builder')
				{
					//Update the amount of builders this room reportedly has
					increaseBuilders(spawner);
				}
				else if(role == 'attack')
				{
					//TO DO: Change this so room sees enemies and builds attackers
					//		or some other request is needed. Maintaining an army seems
					//		needlessly expensive when the enemy can't hide from passive
					//		regular scans.
					//Update the amount of attackers this room reportedly has
					increaseAttackers(spawner);
				}
				else if(role == 'scout')
				{
					spawner.memory.requestScout = 0;
					spawner.memory.maxScouts++;
				}
			}
		
			if(role == 'worker' || role == 'gather' || role == 'builder' || role == 'attack')
			{
				addRespawnEnd(spawner, name);
				//console.log("time: " + spawner.memory.respawnTime + ", role: " + spawner.memory.respawnName);
			}
		}
		else 
		{
			console.log('Spawn error: ' + badSpawn + ' \n name: ' + name + ' bodyLength: ' + body.length + ' spawner: ' + spawner.name);
		}
	}
	//Theoretically this could cause a problem if the capacity is low enough that we haven't spawned all the units we need yet and we're simply
	//replacing the old ones that still need support. So we'll delay this until we have at least 1 extension out.
	else if(canCreateUnit == ERR_NAME_EXISTS && spawner.room.energyAvailable >= spawner.room.energyCapacityAvailable && spawner.room.energyCapacityAvailable > 300)
	{
		for(var units in Game.creeps)
		{
			if(Game.creeps[units].name == name)
			{
				if(body != null && body.length != null && 
					Game.creeps[units].hitsMax < body.length*100)
				{
					console.log('next unit: ' + name + ' is still alive for ' + Game.creeps[units].ticksToLive + ' but found upgrade (' + Game.creeps[units].hitsMax + '/' + (body.length*100) + ')');
					Game.creeps[units].suicide();		//Disabling for now, trying to force only high level units to spawn
				}
				else
				{	//Skip over unit
					console.log('next unit: ' + name + ' is still alive for ' + Game.creeps[units].ticksToLive + ' but we are at full power, skipping over.');
					moveRespawnToEnd(spawner);
				}
				break;
			}
		}
	}
	else
	{
		//console.log('next unit: ' + name + ' isnt spawning, body ' + body);
	}
 }

 //spawner is which spawner we're dealing with, maxPerEnergy allows this many harvesters at each energy node
 function setRoomHarvesterMax(currentRoom, maxPerEnergy)
 {
	if(currentRoom.memory.harvesterMax == null)
	{
		var sources = currentRoom.find(FIND_SOURCES);
		var currentEnergy;
		var totalHarvestSpots = 0;
		for(var i = 0; i < sources.length; i++)
		{
			currentEnergy = sources[i];
			var countHarvestSpots = 0;
            //Search 1 spot away from the source and store applicable spots for harvest/gather
            for(var x = currentEnergy.pos.x - 1; x <= (currentEnergy.pos.x + 1) && countHarvestSpots < maxPerEnergy; x++)
            {
                for(var y = currentEnergy.pos.y - 1; y <= (currentEnergy.pos.y + 1) && countHarvestSpots < maxPerEnergy; y++)
                {
                    var lookAtRoomPosition = currentRoom.getPositionAt(x, y);
                    //Just avoiding walls should be enough, but plain's are ideal
                    if(lookAtRoomPosition.lookFor('terrain') == 'plain')
                    {
                        countHarvestSpots++;
						totalHarvestSpots++;
                    }
                }
            }
		}
		currentRoom.memory.harvesterMax = totalHarvestSpots;
	}
 }
 
 //Spawns a dead unit from the respawn queue with the role and sourceId provided (at spawner provided)
 function respawnPreexisting(spawner, role, sourceId)
 {
	var replaceWithName = nextDeadRoleName(spawner, role, sourceId);	//Gets next available respawnable unit matching this role and id
	var returnRole = findRoleWithinName(replaceWithName);	//Usually interchangable with role above, but just to be safe
	var returnBody = retrieveBody(returnRole, spawner);		//Gets body to match this role, given how much available energy we have.
	if(replaceWithName != null && returnRole != null && returnBody != null)
	{
		var creation = spawner.canCreateCreep(returnBody, replaceWithName);
		if(creation == 0)
		{
			var badSpawn = spawner.createCreep(returnBody, replaceWithName);
			//TO DO: Update respawn list, move unit we're spawning here to end.
			//console.log('Spawn: ' + replaceWithName);
			return(true);
		}
		else if(creation != ERR_NOT_ENOUGH_ENERGY)
		{
			//Can't create creep for some reason, usually not enough energy
			console.log('Trying to respawn replacement unit failed. Code: ' + creation);
		}
	}
	else
	{
		//console.log('Trying to respawn replacement unit failed. Could not find name: ' + replaceWithName + ' role: ' + returnRole + ' or body: ' + returnBody);
	}
	return(false);
 }
 
 //Every once in a while the spawner(s) will be busy when they need to replace a unit and so a role will be empty at a source
 //'Empty' meaning there will be either 0 gatherers or 0 harvesters at that particular source. We will go through all the rooms
 //we have access to and check all the sources at each, cycling through all alive units for potential matching workers and gathers
 //As long as we have one of each we meet the bare minimum requirements, otherwise we try to spawn what's missing from the respawn list.
 //If the respawn list doesn't have a gather or worker with a matching energy source id, this will fail.
 function respawnEmptyRolesAtSources(spawner)
 {
	//If the spawner exists, isn't spawning and we haven't used a lot of cpu this frame. This is a conveniance (optional) function
	if(spawner != null && spawner.spawning == null && Game.getUsedCpu() < 30)
	{
		for(var eachRoom in Game.rooms)
		{
			var worker;
			var gather;
			var roomSources = Game.rooms[eachRoom].find(FIND_SOURCES);
			for(var eachSource in roomSources)
			{
				//If there is a link, there isn't a need for a gatherer at this source, this disables 
				//generation of gathers at sources where a link is found
				var findLinks = roomSources[eachSource].pos.findInRange(FIND_MY_STRUCTURES, 1, {
					filter: { structureType: STRUCTURE_LINK }
				});
				
				worker = 0;
				gather = 0;
				var currentSourceId = roomSources[eachSource].id;
				for(var eachCreep in Game.creeps)
				{
					var roleWithinName = findRoleWithinName(Game.creeps[eachCreep].name);
					if(roleWithinName == 'worker' &&
						Game.creeps[eachCreep].memory.usingSourceId == currentSourceId)
					{
						worker++;
					}
					else if(roleWithinName == 'gather' &&
						Game.creeps[eachCreep].memory.usingSourceId == currentSourceId)
					{
						gather++;
					}
					
					if(worker > 0 && gather > 0)
					{
						break;	//Success, move to next source
					}
				}
				
				if(worker <= 0)
				{
					//No workers at this source, found a missed creep.
					var replacementSuccess = respawnPreexisting(spawner, "worker", currentSourceId);
					if(replacementSuccess == false)
					{
						//console.log('Source[' + currentSourceId + '] has 0 workers, success of spawn: ' + replacementSuccess + ' no respawnable unit or energy?');
					} 
					else 
					{
						//console.log('Source[' + currentSourceId + '] has 0 workers, creating missed worker');
						return(replacementSuccess);
					}
				}
				//If can't find a gatherer and there isn't a link to take care of this source, replace the unit.
				else if(gather <= 0 && (findLinks == null || findLinks.length <= 0))
				{
					//No gathers at this source, found a missed creep.
					var replacementSuccess = respawnPreexisting(spawner, "gather", currentSourceId);
					if(replacementSuccess == false)
					{
						//console.log('Source[' + currentSourceId + '] has 0 gatherers, success of spawn: ' + replacementSuccess + ' no respawnable unit or energy?');
					} 
					else 
					{
						//console.log('Source[' + currentSourceId + '] has 0 gatherers, creating missed gather');
						return(replacementSuccess);
					}
				}
			}
		}
	}
	return(false);
 }
 
 //Find unused spawn if possible, create temp creep with the input data. Returns if successful
 module.exports.createTempCreep = function(role, memToInput)
 {
	var spawner;
	for(var spawners in Game.spawns)
    {
		if(Game.spawns[spawners].spawning == null)
		{
			spawner = Game.spawns[spawners];
			break;
		}
	}
	
	if(spawner != null)
	{
		var body = retrieveBody(role, spawner);
		var canCreateUnit = spawner.canCreateCreep(body);
		if(canCreateUnit == 0)
		{
			var _ = require('lodash');
			var badSpawn = spawner.createCreep(body, memToInput);
			if(_.isString(badSpawn))
			{
				console.log(badSpawn + ' created from ' + spawner.name + ' for role ' + role + ' with mem: ' + memToInput);
				return(true);
			}
			else 
			{
				console.log('TEMP Spawn error: ' + badSpawn + ' bodyLength: ' + body.length + ' spawner: ' + spawner.name);
			}
		}
	}
	return(false);
 }
 
 module.exports.spawn = function(spawner, harvestersSeen, gatherersSeen, buildersSeen, attackersSeen, scoutsSeen)
 {
	spawner.memory.scoutsAlive = scoutsSeen;
	//If spawner is spawning something, this returns that creep's information, if null it is ready to spawn something
	//new. Only then do we go through the spawning logic to save processing time.
	if(spawner.spawning == null)
	{
		if(quickestToDieRespawn(spawner) == false)
		{
			//If it fails to find something to replace a unit.
			//Check if there are any previous units we now need since quickestToDie couldn't get to it while a spawn was occuring
			respawnEmptyRolesAtSources(spawner);
		}
		spawnNextInQueue(spawner, harvestersSeen, gatherersSeen, buildersSeen, attackersSeen, scoutsSeen);
	}
 }