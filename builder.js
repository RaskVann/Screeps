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

 function needEnergy(unit)
 {
    if(unit.carry.energy == 0)
	{
	
		var useSavedSpawn = findSpawn(unit);
		//TO DO: When carryCapacity is greater then what the spawn holds, this won't work.
		//As long as spawn exists, and it has energy for the builder, let him approach
		//otherwise he crowds the spawn and stops drop-off.
		if(useSavedSpawn != null && Math.abs(unit.pos.getRangeTo(useSavedSpawn.pos)) <= 1 && 
			useSavedSpawn.energy >= unit.carryCapacity && useSavedSpawn.transferEnergy(unit, unit.carryCapacity) == 0)
		{
			unit.memory.usingSourceId = null;	//Reset, ready for new source
		}
	    else if(useSavedSpawn != null)// && useSavedSpawn.energy >= unit.carryCapacity)
		{
			//unit.moveTo(useSavedSpawn);
			followFlagForward(unit, unit.carry.energy > 0);
		}
		else
		{
			console.log(unit.name + ' returning builder has no spawn: ' + useSavedSpawn);
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

 function upgradeController(unit, builderNumber)
 {
    var upgradeStart = 0;
    var upgradeLimit = 2;
    if(builderNumber >= upgradeStart && builderNumber < upgradeLimit)
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
		construction = unit.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
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
			//Ignore anything above 75% health, ignore anything that isn't more damaged then previous found repairTarget
            if(currentDamageRatio < .75 && currentDamageRatio < lowestDamageRatio)// &&
			    //skip-- == 0)
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
			findWall = unit.room.find(FIND_STRUCTURES); //no extensions, finds walls
			//console.log(unit.name + ' finding structures.');
		}
		var skip = builderNumber-upgradeStart;
		for(var wall in findWall)
		{
			currentDamageRatio = (findWall[wall].hits/findWall[wall].hitsMax);
			//This will typically trigger on walls, simply because they take so long to reach the limit
			//Ignore structures with higher then 75% health and anything that isn't more damaged then what we've already found to repair
			if(currentDamageRatio < .75 && currentDamageRatio < lowestDamageRatio)// && skip-- == 0)
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
	if(workComponents > 0)
	{
		var findStructure = unit.pos.lookFor('structure');
		var foundRoad = -1;
		var lowCpuUsage = (Game.getUsedCpu() < 10);
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
		//var errorController = unit.upgradeController(unit.room.controller);
		//var errorController = unit.upgradeController(structure);
		var errorController = upgradeController(unit, builderNumber);
		if(errorController === 0 || errorController === true)
		{
			return(true);
		}
		else
		{
			console.log(unit.name + ' can not upgrade controller, code: ' + errorController);
		}
	}
	else if(Math.abs(unit.pos.getRangeTo(structure)) > 1 || unit.carry.energy == 0)	//check for energy should never be reached
	{
		return(followFlagForward(unit, unit.carry.energy > 0));
	}
	else
	{
		
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

 module.exports = function (unit, builderNumber)
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
			foundJob = upgradeController(unit, builderNumber);
			if(foundJob)
			{
				//console.log(unit.name + ', upgrade source: ' + unit.memory.usingSourceId);
				return(true);
			}
		   
			if(repairTargets == null)
			{
				repairTargets = unit.room.find(FIND_MY_STRUCTURES); //no walls, extensions and ramparts
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
			console.log('unit: ' + unit.name + ' no available contruction, repair or upgrade.');
		}
	}
	return(false);	//Either not a builder, or didn't find a job for the builder
 }