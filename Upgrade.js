var followFlagForward = require('createPathFlags');
var buildRoad = require('buildRoad');

function upgradeController(unit, controllerStructure)
{
 if(controllerStructure != null)
 {
   //TO DO: If energy < active WORK, transfer so it can keep going next tick.
   if(_.sum(unit.carry) > 0)
   {
     if(Math.abs(unit.pos.getRangeTo(controllerStructure)) <= 3)
     {
       var errorController = unit.upgradeController(controllerStructure);
     }

     if(Math.abs(unit.pos.getRangeTo(controllerStructure)) > 1)
     {
       buildRoad(unit);
       followFlagForward(unit, _.sum(unit.carry) > 0);
     }
   }
   else
   {
     unit.memory.task = 'energy';
   }
   return(true);
 }
 return(false);
}

function filterStructure(unit, structureType)
{
  var tempStructure = _.filter(Game.structures, function(object) {
    return(unit.room.name == object.room.name &&
          object.structureType == structureType);
  });
  return(tempStructure);
}

function filterStructureInRange(unit, structureType, rangeTo)
{
  var tempStructure = _.filter(filterStructure(unit, structureType), function(object) {
    return(object.pos.getRangeTo(unit.pos, rangeTo));
  });
  return(tempStructure);
}

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
    useSpawn = _.filter(Game.spawns, function(object) {
      return(unit.room.name == object.room.name)
    });
    if(useSpawn != null && useSpawn.length > 0)
    {
      useSpawn = useSpawn[0];
      unit.memory.spawnId = useSpawn.id;
    }
    else {
      console.log(unit.name + ' in upgrade: findSpawn() ' + useSpawn + ' can not find spawn');
    }
  }
  return(useSpawn);
}

function needEnergy(unit)
{
  if(_.sum(unit.carry) == 0)
 {
   //If was sleeping
   if(unit.memory.task == 'sleep')
   {
     //Periodically check if we have enough energy to continue upgrading
     if(Game.time % 10 == 0 && unit.room.energyAvailable > 200)
     {
       unit.memory.task = 'energy';
       unit.say("\u2757", true);
     }
     else if(Game.time % 3 == 0)
     {
       unit.say("\uD83D\uDCA4", true);
     }
     return(false);
   }
   else if(unit.memory.task == 'energy')
   {
     if(unit.room.energyAvailable > 200)  //unit.room.energyAvailable > unit.room.energyCapacityAvailable*.5
     {
       //Go get energy below
     }
     else
     {
       unit.memory.task = 'sleep';
       unit.say('\uD83D\uDCA4', true);
       return(false);
     }
   }
   else//Don't recognize this task, code in new one.
   {
     console.log('Upgrade ' + unit.name + ' doesnt recognize : ' + unit.memory.task);
     unit.say('What was I doing?');
     return(false);
   }

   var useSavedSpawn = findSpawn(unit);

   //If it's possible for links to be in this room, look for them within reach
   //If found, try to pull energy from them so builder can continue work.
   //This is at the bottom so if anything is attempted before this, the builder takes from the link first
   if(unit.room.controller != null &&
     unit.room.controller.owner != null &&
     unit.room.controller.owner.username == 'RaskVann')
   {
     if(unit.room.controller.level >= 5)	//Links are available
     {
       var findLinks = filterStructureInRange(unit, STRUCTURE_LINK, 1);

       //Transfer any links within range 1 to the builder that have energy and aren't on cooldown
       if(findLinks.length > 0)
       {
         for(var i in findLinks)
         {
           if(findLinks[i].energy > 0 &&
             findLinks[i].cooldown == 0 &&
             findLinks[i].transferEnergy(unit, RESOURCE_ENERGY) == 0)
           {
             unit.memory.task = 'upgrade';
             //unit.memory.usingSourceId = null;	//Reset, ready for new source
             return(true);	//Don't look for anything else, we got some energy
             break;
           }
         }
       }
     }
     //If couldn't get it from links, try getting it from storage.
     if(unit.room.controller.level >= 4)	//Storage is available
     {
       var findStorage = unit.room.storage;

       //Recreate paths to go to and from storage instead of spawn for builders then try to get
       //energy from storage if its available, otherwise retrieve it from spawn.
       //if(findStorage.length > 0 && createNewPath(unit, findStorage) == false)
       if(findStorage != null && createNewPath(unit, findStorage) == false)
       {
         if(unit.pos.getRangeTo(findStorage.pos) <= 1 &&
           findStorage.store.energy > 0 &&
           findStorage.transferEnergy(unit, RESOURCE_ENERGY) == 0)
         {
           unit.memory.task = 'upgrade';
           return(true);	//Don't look for anything else, we got some energy
         }
         else if(findStorage.store.energy > 0)
         {
           unit.moveTo(findStorage);
           if(unit.memory.direction != null)
           {
             delete unit.memory.direction;
           }
         }
         else if(findStorage.store.energy <= 0 &&
             useSavedSpawn.energy > 0)
         {
           if(useSavedSpawn.transferEnergy(unit, RESOURCE_ENERGY) == 0)
           {
             unit.memory.task = 'upgrade';
             //unit.memory.usingSourceId = null;	//Reset, ready for new source
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
           followFlagForward(unit, _.sum(unit.carry) > 0);
         }
       }
       //var storageCpu = Game.getUsedCpu() - init;
       //console.log(unit.name + ' getting energy from storage or link takes cpu: ' + storageCpu);
     }

     //TO DO: When carryCapacity is greater then what the spawn holds, this won't work.
     //As long as spawn exists, and it has energy for the builder, let him approach
     //otherwise he crowds the spawn and stops drop-off.
     if(useSavedSpawn != null)
     {
       followFlagForward(unit, _.sum(unit.carry) > 0);
       if(unit.withdraw(useSavedSpawn, RESOURCE_ENERGY) == 0)
       {
         unit.memory.task = 'upgrade';
         return(true);
       }
     }

     //While we're returning check for nearby energy and pick it up if found
     var target = unit.pos.findInRange(FIND_DROPPED_ENERGY, 1);
     if(target.length > 0)
     {
       unit.memory.task = 'upgrade';
       unit.pickup(target[0]);
       return(true);
     }
   }
 }
 return(false);
}

//Once a unit has a usingSourceId and energy it creates (if needed) and follows the path to the object until it gets within
//1 unit of the object (0-1 needed to upgrade/repair/build). It then attempts to do these tasks and reports error if there
//is a problem
function upgrade(unit)
{
 var structure;
 if(unit.memory.usingSourceId != null)
 {
   structure = Game.getObjectById(unit.memory.usingSourceId);
 }
 else//Previous function already checks for this, but just in case.
 {
   structure = unit.room.controller;
   unit.memory.usingSourceId = unit.room.controller.id;
   console.log(unit.name + ' should have a source Id but it is returning null, assigning this rooms controller so can upgrade.');
 }

   //var errorController = unit.upgradeController(unit.room.controller);
   //var errorController = unit.upgradeController(structure);
   var errorController = upgradeController(unit, structure);
   if(errorController === 0 || errorController === true)
   {
     return(true);
   }
 return(false);
}

//TO DO: Need logic in main to point to here when found 'upgrade' unit role.
//TO DO: Need logic to determine how many to spawn
//TO DO: Need to decrease number of builders since no longer responsible for upgrading
module.exports.controller = function (unit)
{
  if(unit != null && unit.memory.role == 'upgrade')
  {
   //The direction the unit is moving depends on its position, which changes between death
   //and respawn so we clean up the direction when spawning so it can go the right direction.
   if(unit.spawning == true)
   {
     //Old data. Clean up.
     if(unit.memory.direction != null)
     {
       delete unit.memory.direction;
     }
     //If this is the first time this unit has ever appeared
     //it might not have a id assigned. Assign to current room
     if(unit.memory.usingSourceId == null)
     {
       unit.memory.usingSourceId = unit.room.controller.id;
     }
     unit.memory.task = 'energy';
   }
   var task = unit.memory.task;

   if(task == 'upgrade')
   //if(unit.memory.usingSourceId != null && _.sum(unit.carry) > 0)
   {
     //Move and attempt to carry out assigned task
     return(upgrade(unit));
   }
   //Return to controller and refill, once done so then remove usingSourceId so can assign a new object
   if(task == 'energy' || task == 'sleep')
   //else if(_.sum(unit.carry) <= 0)
   {
     return(needEnergy(unit));
   }
   else
   {
       unit.say(unit.memory.usingSourceId + ' task: ' + task);
   }
 }
 else
 {
     console.log(unit.name + " role " + unit.memory.role);
 }
 return(false);	//Either not a builder, or didn't find a job for the builder
}
