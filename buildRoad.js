//Runs right before a unit attempts other tasks which moves them along and upgrade,repair,build,... their task.
//the unit repairs or builds any structure it runs over, or any structure within 3 repairable range. If there
//is no road underneath it, it creates a construction site (which is also built when run over)
//TO DO: Build a toned down version of this that is cheaper CPU wise if this is getting intensive.
//TO DO: Version where only looks at current tile for repair/build/createConstruction
module.exports = function (unit)
{
 var workComponents = unit.getActiveBodyparts(WORK);
 if(workComponents > 0 && unit.carry.energy >= workComponents)
 {
   var findStructure = unit.pos.lookFor('structure');
   var foundRoad = -1;
   var lowCpuUsage = (Game.cpu.getUsed() < 20);
   for(var x = 0; findStructure != null && x < findStructure.length; x++)
   {
     //Go through all structures at current builder's spot, if they have less hits then what the builder
     //would repair, repair the structure
     if(findStructure[x].hits < (findStructure[x].hitsMax - (workComponents*REPAIR_POWER)) &&
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
         repairInRange[z].hits < (repairInRange[z].hitsMax - (workComponents*REPAIR_POWER)) &&
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
     var constructionInRange = _.filter(Game.constructionSites, function(object) {
       return(object.room.name == unit.room.name &&
             object.pos.inRangeTo(unit.pos, 3));
     });
     //var constructionInRange = unit.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3);
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
   if(foundRoad <= 0)
   {
     if(unit.pos.createConstructionSite(STRUCTURE_ROAD) == 0)
     {
       return(true);
     }
   }
 }
 return(false);
}
