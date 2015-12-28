/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('builder'); // -> 'a thing'
 */

 var followFlagForward = require('createPathFlags');
 var cleanMemory = require('cleanMemory');

 //Static Globals might not work and persist between calls of these functions, if logs appear more then once, remove change
 var repairTargets;
 var findWall;
 var construction;
 //var foundEnergy;

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
 
 //If we're migrating to a different sourceId remove the direction since the old one we had isn't valid
 function newSourceId(unit, sourceId)
 {
	if(sourceId != null && unit.memory.usingSourceId == null)
	{
		//console.log('delete for ' + unit.name + ' where dif: ' + unit.memory.usingSourceId + ' vs ' + unit.room.controller.id);
		delete unit.memory.direction;
		unit.memory.usingSourceId = sourceId;
	}
 }
 
 //Use this on repair structure and repair wall if creeps keep lining up trying to repair the same thing.
 function newUniqueSourceId(unit, sourceId)
 {
	if(sourceId != null && unit.memory.usingSourceId == null)
	{
		for(var i in Game.creeps)
		{
			//console.log(unit.name + ' looks at id ' + Game.creeps[i].memory.usingSourceId + ', compare to ' + sourceId);
			if(Game.creeps[i] != null && Game.creeps[i].memory.usingSourceId == sourceId)
			{
				//Check all creeps stored in memory, if id is taken, return false and reject assignment
				return(false);
			}
		}
		//No creeps/units are using this sourceId, use this ID
		//console.log('delete for ' + unit.name + ' where dif: ' + unit.memory.usingSourceId + ' vs ' + unit.room.controller.id);
		delete unit.memory.direction;
		unit.memory.usingSourceId = sourceId;
		return(true);
	}
	//Unit isn't in a valid 'ready' state, ignore this check
	return(false);
 }
 
 //Returns true if a new path has been created. Checks if the builder sent in has a path created already at the storage
 //Before a storage is created they path to and from the spawn this switches over to storage instead.
 function createNewPath(unit, findStorage)
 {
	if(findStorage.length > 0 && unit.memory.usingSourceId != null)
	{
		var flagsAtStorage = findStorage[0].pos.findInRange(FIND_FLAGS, 1, {
			filter: function(object) { 
				return(object.memory.usingDestinationId == unit.memory.usingSourceId);
			}
		});
		
		var buildObject = Game.getObjectById(unit.memory.usingSourceId);
		
		if(flagsAtStorage.length <= 0 && buildObject != null && findStorage[0].pos.getRangeTo(buildObject) > 2)
		{
			//No flag around storage when storage exists, we're going to delete the existing path and path to storage instead
			//that way all builders get their energy from there instead of the spawns
			console.log('cleaning path: ' + unit.memory.usingSourceId + ' to re-path to storage.');
			
			//Only delete old path and create new one if the path is both valid and large enough
			//createPathFlags has problems with short paths
			var newPath = findStorage[0].pos.findPathTo(buildObject.pos, {maxOps: 4000, ignoreCreeps: true});
			if(newPath != null && newPath.length > 2)
			{
				cleanMemory.purgeFlagsWithId(unit.memory.usingSourceId);
				
				followFlagForward.createDefinedPath(unit.room, newPath, unit.memory.usingSourceId, true, findStorage[0].pos);
				return(true);
			}
		}
	}
	return(false);
 }

 function needEnergy(unit)
 {
    if(unit.carry.energy == 0)
	{
		var useSavedSpawn = findSpawn(unit);
		
		//If it's possible for links to be in this room, look for them within reach
		//If found, try to pull energy from them so builder can continue work.
		//This is at the bottom so if anything is attempted before this, the builder takes from the link first
		if(unit.room.controller != null &&
			unit.room.controller.owner != null &&
			unit.room.controller.owner.username == 'RaskVann')
		{
			if(unit.room.controller.level >= 4)	//Storage is available
			{
				//var findStorage = unit.room.find(FIND_MY_STRUCTURES, {
				//	filter: { structureType: STRUCTURE_STORAGE }
				//});
				var findStorage = unit.room.storage;
				
				//var init = Game.getUsedCpu();
				
				//Recreate paths to go to and from storage instead of spawn for builders then try to get
				//energy from storage if its available, otherwise retrieve it from spawn.
				//if(findStorage.length > 0 && createNewPath(unit, findStorage) == false)
				if(findStorage != null && createNewPath(unit, findStorage) == false)
				{
					if(unit.pos.getRangeTo(findStorage.pos) <= 1 && 
						findStorage.store.energy > 0 &&
						findStorage.transferEnergy(unit) == 0)
					{
						unit.memory.usingSourceId = null;	//Reset, ready for new source
						return(true);	//Don't look for anything else, we got some energy
					}
					else if(unit.memory.usingSourceId == null &&
							findStorage.store.energy > 0)
					{
						if(findStorage.transferEnergy(unit) == 0)
						{
							unit.memory.usingSourceId = null;	//Reset, ready for new source
							return(true);	//Don't look for anything else, we got some energy
						}
						
						unit.moveTo(findStorage);
						if(unit.memory.direction != null)
						{
							delete unit.memory.direction;
						}
					}
					else if(findStorage.store.energy <= 0 &&
							useSavedSpawn.energy > 0)
					{
						if(useSavedSpawn.transferEnergy(unit) == 0)
						{
							unit.memory.usingSourceId = null;	//Reset, ready for new source
							return(true);	//Don't look for anything else, we got some energy
						}
						
						unit.moveTo(useSavedSpawn);
						if(unit.memory.direction != null)
						{
							delete unit.memory.direction;
						}
					}
					else
					{
						followFlagForward(unit, unit.carry.energy > 0);
					}
				}
				//var storageCpu = Game.getUsedCpu() - init;
				//console.log(unit.name + ' getting energy from storage or link takes cpu: ' + storageCpu);
			}
			
			if(unit.room.controller.level >= 5)	//Links are available
			{
				var findLinks = unit.pos.findInRange(FIND_MY_STRUCTURES, 1, {
					filter: { structureType: STRUCTURE_LINK }
				});
				
				//Transfer any links within range 1 to the builder that have energy and aren't on cooldown
				if(findLinks.length > 0)
				{
					for(var i in findLinks)
					{
						if(findLinks[i].energy > 0 &&
							findLinks[i].cooldown == 0 &&
							findLinks[i].transferEnergy(unit) == 0)
						{
							unit.memory.usingSourceId = null;	//Reset, ready for new source
							return(true);	//Don't look for anything else, we got some energy
							break;
						}
					}
				}
			}
		}
		
		//TO DO: When carryCapacity is greater then what the spawn holds, this won't work.
		//As long as spawn exists, and it has energy for the builder, let him approach
		//otherwise he crowds the spawn and stops drop-off.
		if(useSavedSpawn != null && Math.abs(unit.pos.getRangeTo(useSavedSpawn.pos)) <= 1 && 
			useSavedSpawn.energy >= unit.carryCapacity && useSavedSpawn.transferEnergy(unit, unit.carryCapacity - unit.carry.energy) == 0)
		{
			unit.memory.usingSourceId = null;	//Reset, ready for new source
		}
	    else if(unit.memory.usingSourceId != null)
		{
			followFlagForward(unit, unit.carry.energy > 0);
		}
		else if(unit.memory.usingSourceId == null &&
				useSavedSpawn != null && 
				//useSavedSpawn.energyCapacityAvailable >= 300 && 
				useSavedSpawn.energy > 0 &&
				Math.abs(unit.pos.getRangeTo(useSavedSpawn.pos)) <= 1)
		{
			if(useSavedSpawn.transferEnergy(unit) == 0)
				unit.memory.usingSourceId = null;	//Reset, ready for new source;	//We don't always have 300 energy in the spawn, take if needed
		}
		else if(useSavedSpawn.energy > 0)	//Don't report if we have nothing to pull from
		{
			//unit.moveTo(useSavedSpawn);
			//useSavedSpawn.transferEnergy(unit);
			//console.log(unit.name + ' returning builder has sourceId: ' + unit.memory.usingSourceId + ' and spawn: ' + useSavedSpawn + ' range: ' + unit.pos.getRangeTo(useSavedSpawn.pos) + ' energy: ' + useSavedSpawn.energy);
		    //return(true);
		}
		
		
		//While we're returning check for nearby energy and pick it up if found
		var target = unit.pos.findInRange(FIND_DROPPED_ENERGY, 1);
		if(target.length > 0)
		{
			unit.pickup(target[0]);
		}
		
		//Since we have problems with builders crowding the spawn, giving them an
		//alternative pickup spot if all else fails and nothing is moving. We're not
		//going to use followFlagForward for this to reduce number of flags to random locations.
		//var foundEnergy = unit.pos.findClosestByRange(FIND_DROPPED_ENERGY);
		//if(unit.pickup(foundEnergy) < 0)
		//{
		//    unit.moveTo(foundEnergy);
		//}
		return(true);
	}
	return(false);
 }
 
 var upgradeIncrease = 0;
 
 function upgradeController(unit, builderNumber)
 {
    var upgradeStart = 0;
	var upgradeLimit = 2;
	//When a storage is built the builders no longer need to travel, 1 builder should be sufficient for 15work/tick
	if(unit.room.storage != null)
	{
		upgradeLimit = 1;
	}
	//If someone is about to die (we're really doing this for when the controller dies)
	//Let anyone we possibly can into upgrade while we transition to new unit.
	if(unit.ticksToLive < 50)
	{
		//TO DO: Check for if at least 2 units having sourceId of controller
		//If so, suicide this unit (near death). So spawners will hopefully start spawning a new one
		//TO DO: Check if spawners are available for this to be a valid action.
		upgradeIncrease = builderNumber+1;
	}
	upgradeLimit += upgradeIncrease;
	
    if((builderNumber >= upgradeStart && builderNumber < upgradeLimit) || 
		(unit.room.controller != null && newUniqueSourceId(unit, unit.room.controller.id) == true))
	{
	    //console.log('unit: ' + unit + ' is builder ' + builderNumber + ' and is upgrading controller');
		newSourceId(unit, unit.room.controller.id);
		if(Math.abs(unit.pos.getRangeTo(unit.room.controller)) <= 1 && unit.carry.energy > 0)
		{
			var errorController = unit.upgradeController(unit.room.controller);
			//console.log(unit.name + ' upgrading with code: ' + errorController);
		}
		else if(Math.abs(unit.pos.getRangeTo(unit.room.controller)) > 2 || unit.carry.energy == 0)
		{
			followFlagForward(unit, unit.carry.energy > 0);
		}
		else if(Math.abs(unit.pos.getRangeTo(unit.room.controller)) > 1)
		{
			if(unit.moveTo(unit.room.controller) == 0)
			{
				delete unit.memory.direction;	//Got to where we need, remove the direction, it's no longer valid.
			}
		}
		return(true);
	}
	return(false);
 }

 function buildClosest(unit, builderNumber)
 {
	if(construction == null)
	{
		//Find closest building site that isn't a road. Roads will take care of themselves
		construction = unit.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
			filter: function(object) {
				return(object.structureType != STRUCTURE_ROAD);
			}
		});
		//console.log(unit.name + ' finding construction site');
	}
	if(construction != null)
	{
		newSourceId(unit, construction.id);
		//newUniqueSourceId(unit, construction.id);
	    //console.log('unit: ' + unit + ' is builder ' + builderNumber + ' and needs energy');
		if(Math.abs(unit.pos.getRangeTo(construction)) <= 1 && unit.carry.energy > 0)
		{
			var buildError = unit.build(construction);
			if(buildError < 0)
			{
				console.log(unit.name + ' has build error ' + buildError + ' needs to drop energy after finish');
				//unit.dropEnergy();
			}
		}
		//Follows the path until it gets to the destination, continues the operation above until energy depleted and then returns
		else if(Math.abs(unit.pos.getRangeTo(construction)) > 1 || unit.carry.energy == 0)
		{
			followFlagForward(unit, unit.carry.energy > 0);
		}
		return(true);
	}
	return(false);
 }
 
 //Attempts to repair structure in range, if not tries to get closer by following path
 function repairStructure(unit, repairStructure)
 {
	if(Math.abs(unit.pos.getRangeTo(repairStructure)) <= 1 && unit.carry.energy > 0)
	{
		var repairCode = unit.repair(repairStructure);
	}
	//Follows the path until it gets to the destination, continues the operation above until energy depleted and then returns
	else if(unit.carry.energy == 0 || (unit.memory.usingSourceId != null && Math.abs(unit.pos.getRangeTo(Game.getObjectById(unit.memory.usingSourceId))) > 1))
	{
		followFlagForward(unit, unit.carry.energy > 0);
	}
 }

 function repairRamparts(unit, builderNumber, repairTargets)
 {
    var upgradeStart = 3;
    var upgradeLimit = 8;
	var lowestDamageRatio = 1;
	var currentDamageRatio = 1;
    //if(builderNumber >= upgradeStart && builderNumber < upgradeLimit)
	//{
	    //Spreads out the builders so that the first unit goes in and repairs
	    //the first found structure needing repair and the second unit takes the
	    //second structure and so on, as long as we are within the necessary builder limit
	    //They each will grab one.
	    var skip = builderNumber-upgradeStart;
	    for(var disrepair in repairTargets)
		{
			currentDamageRatio = (repairTargets[disrepair].hits/repairTargets[disrepair].hitsMax);
			//Ignore anything above ratio% health, ignore anything that isn't more damaged then previous found repairTarget
            if(currentDamageRatio < unit.room.memory.buildRatio && currentDamageRatio < lowestDamageRatio)
			{
				//newSourceId(unit, repairTargets[disrepair].id);
				
				//If the object is already taken by another builder this will return false in which case we'll try a 
				//different repair target. Otherwise we'll try to use this object unless we find something better in later calls.
				if(newUniqueSourceId(unit, repairTargets[disrepair].id) == false)
				{
					continue;
				}
				else
				{
					lowestDamageRatio = currentDamageRatio;
				}
			
			    //console.log('skip ' + skip + ' unit ' + unit.name + ', ' + repairTargets[disrepair].id);
			    //console.log('unit: ' + unit + ' is builder ' + builderNumber + ' and is repairing ramparts');
			    //console.log('repair ' + repairTargets[disrepair].structureType + ' health: ' + (repairTargets[disrepair].hits/repairTargets[disrepair].hitsMax));
				//repairStructure(unit, repairTargets[disrepair]);
			}
		}
	//}
	//If we've found and assigned a object to repair, return true. Otherwise nothing was found and we'll look in another function.
	if(lowestDamageRatio < 1)
	{
		return(true);
	}
	return(false);
 }

 function repairWalls(unit, builderNumber)
 {
    var upgradeStart = 6;
    var upgradeLimit = 12;
	var currentDamageRatio = 1;
	var lowestDamageRatio = 1;
    //if(builderNumber >= upgradeStart && builderNumber < upgradeLimit)
	//{
        //Find walls with X% health or lower, if you find something else farther down, do that instead.
		if(findWall == null)
		{
			findWall = unit.room.find(FIND_STRUCTURES, {
				filter: function(object) {
					return(object.hits < object.hitsMax && object.structureType == STRUCTURE_WALL);
				}
			}); //finds walls and roads with FIND_STRUCTURES, everything else with FIND_MY_STRUCTURES
			//console.log(unit.name + ' finding structures.');
		}
		var skip = builderNumber-upgradeStart;
		for(var wall in findWall)
		{
			currentDamageRatio = (findWall[wall].hits/findWall[wall].hitsMax);
			//This will typically trigger on walls, simply because they take so long to reach the limit
			//Ignore structures with higher then ratio% health and anything that isn't more damaged then what we've already found to repair
			if(currentDamageRatio < unit.room.memory.buildRatio && currentDamageRatio < lowestDamageRatio)
			{
				//newSourceId(unit, findWall[wall].id);
				
				//This will return false if another builder already is repairing it. Otherwise trigger this as our lowest found
				//repairable object as we look through the rest of the list.
				if(newUniqueSourceId(unit, findWall[wall].id) == false)
				{
					continue;
				}
				else
				{
					lowestDamageRatio = currentDamageRatio;
				}
				
			    //console.log('unit: ' + unit + ' is builder ' + builderNumber + ' and repairing walls');
				//console.log('repair ' + repairTargets[disrepair].structureType + ' health: ' + (repairTargets[disrepair].hits/repairTargets[disrepair].hitsMax));
			    //repairStructure(unit, findWall[wall]);
			}
		}
    //}
	
	//If we found a object to repair, return true. Otherwise go to another function and find more to do.
	if(lowestDamageRatio < 1)
	{
		return(true);
	}
    return(false);
 }
 
 //Runs right before builders attempt to upgradeRepairBuild() which moves them along and upgrade,repair,build's their task.
 //the builder repairs or builds any structure it runs over, any movement will continue in upgradeRepairBuild() and so this
 //will only be a 1 tick thing for each object but it won't hamper the movement/work it's otherwise doing, just drains the
 //energy faster while building roads along routes we're frequenting.
 function buildRoad(unit)
 {
	var workComponents = unit.getActiveBodyparts(WORK);
	if(workComponents > 0 && unit.carry.energy > 0)
	{
		var findStructure = unit.pos.lookFor('structure');
		var foundRoad = -1;
		var lowCpuUsage = (Game.getUsedCpu() < 20);
		for(var x = 0; findStructure != null && x < findStructure.length; x++)
		{
			//Go through all structures at current builder's spot, if they have less hits then what the builder
			//would repair, repair the structure
			if(findStructure[x].hits < (findStructure[x].hitsMax - (workComponents*100)) &&
				unit.carry.energy >= workComponents)
			{
				unit.repair(findStructure[x]);
				return(true);
			}
			
			if(findStructure[x].structureType == STRUCTURE_ROAD)
			{
				foundRoad = x;	//Keeps track of the last found road at this position, used to build roads at a spot if it's found
				break;
			}
		}
		//If we found a road on this spot and we don't need to repair it, we have extra time to try to repair anything nearby
		//Also don't do this unless we're really low on cpuUsage as this is a convienance feature, not needed.
		if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
		{
			var repairInRange = unit.pos.findInRange(FIND_STRUCTURES, 3);
			for(var z in repairInRange)
			{
				if(repairInRange[z] != null && 
					repairInRange[z].hits < (repairInRange[z].hitsMax - (workComponents*100)) &&
					unit.repair(repairInRange[z]) == 0)
				{
					return(true);
				}
			}
		}
	 
		var findConstruction = unit.pos.lookFor('constructionSite');
		if(findConstruction != null)
		{
			if(unit.carry.energy > 0 && findConstruction[0] != null &&
				unit.build(findConstruction[0]) == 0)
			{
				return(true);
			}
			else if(findConstruction[0] != null)
			{
				console.log(unit.name + ' failed building road? ' + findConstruction[0] + ' in room ' + unit.room.name + ' with energy ' + unit.carry.energy);
				return(false);
			}
		}
		//If we found a road on this spot and we don't need to repair or build it, we have extra time to try to build anything nearby
		//Also don't do this unless we're really low on cpuUsage as this is a convienance feature, not needed.
		else if(foundRoad >= 0 && unit.carry.energy > workComponents && lowCpuUsage)
		{
			var constructionInRange = unit.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
			for(var y in constructionInRange)
			{
				if(constructionInRange[y] != null && unit.build(constructionInRange[y]) == 0)
				{
					return(true);
				}
				else if(constructionInRange[y] != null)
				{
					console.log(unit.name + ' failed construction? ' + constructionInRange[y] + ' in room ' + unit.room.name + ' with energy ' + unit.carry.energy);
					return(false);
				}
			}
		}
		
		//We searched through all structures at this spot, no road was found, so build one.
		if(foundRoad < 0)
		{
			if(unit.pos.createConstructionSite(STRUCTURE_ROAD) == 0)
			{
				return(true);
			}
		}
	}
	return(false);
 }
 
 //Once a unit has a usingSourceId and energy it creates (if needed) and follows the path to the object until it gets within
 //1 unit of the object (0-1 needed to upgrade/repair/build). It then attempts to do these tasks and reports error if there
 //is a problem
 function upgradeRepairBuild(unit, builderNumber)
 {
	var structure;
	if(unit.memory.usingSourceId != null)
	{
		structure = Game.getObjectById(unit.memory.usingSourceId);
		if(structure == null)
		{
			cleanMemory.purgeFlagsWithId(unit.memory.usingSourceId);
		//If building a structure this id becomes invalid upon completion, returns null, remove if this is the case
			delete unit.memory.usingSourceId;
			delete unit.memory.direction;
			return(false);
		}
	}
	else
	{
		console.log(unit.name + ' should have a source Id but it is returning null, cannot upgrade/repair/build.');
		return(false);
	}
	
	if(structure.structureType == STRUCTURE_CONTROLLER)
	{
		//If the storage exists. Has energy, and the unit is almost empty. Transfer energy from the storage
		//The storeEnergy code does unnecessary movements that is hurting my through-put.
		if(unit.room.controller != null &&
			unit.room.controller.owner != null &&
			unit.room.controller.owner.username == 'RaskVann' &&
			unit.room.controller.level >= 4 && 
			unit.room.storage != null &&
			unit.room.storage.store.energy > 0 &&
			unit.carry.energy/unit.carryCapacity < .2 &&
			builderNumber <= 0)	//Only allow the first unit this luxury, this locks him into the controller
		{	//TO DO: Either look around controller for more then 1 builder unit assigned to this controller
			//		or find another way to make this room independant
			unit.room.storage.transferEnergy(unit);
		}
	
		//var errorController = unit.upgradeController(unit.room.controller);
		//var errorController = unit.upgradeController(structure);
		var errorController = upgradeController(unit, builderNumber);
		if(errorController === 0 || errorController === true)
		{
			return(true);
		}
		else
		{
			delete unit.memory.usingSourceId;
			//console.log(unit.name + ' can not upgrade controller, code: ' + errorController);
		}
	}
	else if(Math.abs(unit.pos.getRangeTo(structure)) > 3 || unit.carry.energy == 0)	//check for energy should never be reached
	{
		return(followFlagForward(unit, unit.carry.energy > 0));
	}
	else
	{
		var nextToCreep = unit.pos.findInRange(FIND_MY_CREEPS, 1);
		//This search finds itself, if it finds more then that, move to get out of the way
		if(nextToCreep.length > 1 || unit.pos.getRangeTo(structure) > 2)
			followFlagForward(unit, unit.carry.energy > 0);	//Keep it moving so units can move through it.
			
		if(structure.hits < structure.hitsMax)
		{
			var repairCode = unit.repair(structure);
			//var repairCode = repairStructure(unit, structure);
			if(repairCode == 0)
			{
				return(true);
			}
			else
			{
				console.log(unit.name + ' can not repair, code: ' + repairCode);
				//unit.dropEnergy();
			}
		}
		else if(structure.progress < structure.progressTotal)
		{
			var buildError = unit.build(structure);
			if(buildError == 0)
			{
				return(true);
			}
			else
			{
				console.log(unit.name + ' can not build, code: ' + buildError);
				//unit.dropEnergy();
			}
		}
		else if(structure.progress == structure.progressTotal)
		{
			console.log(unit.name + ' building complete, can we repair this or need to drop energy? ' + structure.progress + '/' + structure.progressTotal);
			//TO DO: Search for adjacent buildable structures and build those instead before droping energy if failing
			//unit.dropEnergy();
		}
		else if(structure.hits == structure.hitsMax)
		{
			console.log(unit.name + ' repair complete, can we repair nearby or need to drop energy? ' + structure.hits + '/' + structure.hitsMax);
			//TO DO: Search for adjacent repairable structures and repair those instead before droping energy if failing
			unit.dropEnergy();
		}
	}
	return(false);
 }

 module.exports.units = function (unit, builderNumber)
 {
    if(unit.memory.role == 'builder')
    {
		//Right before death this unit should clear out that it is/was working 
		//on usingSourceId that way later builders can be assigned to this object
		//since this unit can't work on it in death
		if(unit.ticksToLive <= 2)
		{
			delete unit.memory.usingSourceId;
			delete unit.memory.direction;
			unit.suicide();
			return('death');
		}
		else if(unit.spawning == true)
		{
			//Unit was upgraded or died before it's end of life, clean up for re-assignment.
			if(unit.memory.usingSourceId != null)
			{
				delete unit.memory.usingSourceId;
			}
			if(unit.memory.direction != null)
			{
				delete unit.memory.direction;
			}
		}
		
		if(unit.memory.usingSourceId != null && unit.carry.energy > 0)
		{
			buildRoad(unit);
			//Move and attempt to carry out assigned task
			return(upgradeRepairBuild(unit, builderNumber));
		}
		//Return to controller and refill, once done so then remove usingSourceId so can assign a new object
		else if(unit.carry.energy <= 0)
		{
			return(needEnergy(unit));
		}
		//Find a new object to upgrade/repair/build
		else	//unit.memory.SourceId == null && unit.carry.energy > 0
		{
			var foundJob;
			
			if(unit.room.memory.buildRatio == null)
			{
				unit.room.memory.buildRatio = .01;
			}
			
			foundJob = upgradeController(unit, builderNumber);
			if(foundJob)
			{
				//console.log(unit.name + ', upgrade source: ' + unit.memory.usingSourceId);
				return(true);
			}
		   
			if(repairTargets == null)
			{
				repairTargets = unit.room.find(FIND_MY_STRUCTURES, {
					filter: function(object) {
						return(object.hits < object.hitsMax);
					}
				}); //no walls or roads
				//console.log(unit.name + ' finding my structures');
			}
			
			foundJob = repairRamparts(unit, builderNumber, repairTargets);
			if(foundJob)
			{
				//console.log(unit.name + ', repair1 source: ' + unit.memory.usingSourceId);
				return(true);
			}
		   
			foundJob = repairWalls(unit, builderNumber);
			if(foundJob)
			{
				//console.log(unit.name + ', repair2 source: ' + unit.memory.usingSourceId);
				return(true);
			}
		   
			foundJob = buildClosest(unit, builderNumber);
			if(foundJob)
			{
				//console.log(unit.name + ', build source: ' + unit.memory.usingSourceId);
				return(true);
			}
			
			if(unit.room.memory.buildRatio < 1)
			{
				unit.room.memory.buildRatio += .01;
				console.log('unit: ' + unit.name + ' in ' + unit.room.name + ' no available contruction, repair or upgrade. Upping Ratio to ' + (unit.room.memory.buildRatio*100) + '%');
			}
			else
			{
				console.log('unit: ' + unit.name + ' in ' + unit.room.name + ' no available contruction, repair or upgrade. Ratio is full at ' + (unit.room.memory.buildRatio*100) + '%');
			}
		}
	}
	return(false);	//Either not a builder, or didn't find a job for the builder
 }