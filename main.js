var harvester = require('Harvester');
var spawnFrom = require('Spawner');
var builder = require('builder');
var cpuUsage = require('measureCPU');
var cleanMemory = require('cleanMemory');
var defense = require('Defense');

module.exports.loop = function()
{
	var reportInitializeCpuUsed = Game.getUsedCpu();
	//console.log('Initialize required modules CPU: ' + reportInitializeCpuUsed);
	
	//Triggers a function every 'defaultWait' ticks.
	var defaultWait = 20;
	var defaultLongWait = 1000;
	var gameTime = Game.time;
	var cpuLimit = Game.cpuLimit;
	var enemyInSpawn;
	
	if(cpuLimit < 60)
	{
		console.log('ignore this tick.');
		return(false);
	}
	else
	{
		//console.log('Limit: ' + cpuLimit);
	}
	
	//if(Memory.waitForTicks == null || Memory.waitForTicks-- <= 0)
	if(gameTime % defaultWait == 0)
	{
		cleanMemory();
		//cleanMemory.purgeFlagsWithId("123");
		//cleanMemory.purgeFlags();
		//cleanMemory.purgeRole('builder');
		//cleanMemory.purgeScoutInfo();
		
		enemyInSpawn = defense.detectEnemyCreep();
		//Memory.waitForTicks = defaultWait;
	}
	//else if(Memory.waitForLong == null || Memory.waitForLong-- <= 0)
	else if((gameTime+5) % defaultLongWait == 0)	//This overlaps defaultWait so we offset it by 5 ticks to make sure they're seperate
	{
		var nextRoom = _.find(Game.rooms, 'controller.owner.username', 'RaskVann');
		//for(var eachRoom in Game.rooms)
		//{
		//	var nextRoom = Game.rooms[eachRoom];
		//	if(nextRoom.controller != null && nextRoom.controller.owner != null && 
		//		nextRoom.controller.owner.username == 'RaskVann')
		//	{
				//Rooms I own
				harvester.link(nextRoom);	//Create links near sources
				spawnFrom.createSpawn(nextRoom);	//Create additional spawns, power spawn and observers
		//	}
		//	else
		//	{
		//		//Rooms I don't own
		//	}
		//}
		
		//TO DO: Create extensions if doesn't exist
		//TO DO: Walls / ramparts to secure exits
		//Memory.waitForLong = defaultLongWait;
	}
	
	var reportPeriodic = Game.getUsedCpu()-reportInitializeCpuUsed;
	if(cpuLimit > 200)	//Disable room look if we're low on cpu
	{
		var nextRoom = _.find(Game.rooms, 'controller.owner.username', 'RaskVann');
		//for(var eachRoom in Game.rooms)
		//{
		//	var nextRoom = Game.rooms[eachRoom];
		//	if(nextRoom.controller != null && nextRoom.controller.owner != null && 
		//		nextRoom.controller.owner.username == 'RaskVann')
		//	{
				//Rooms I own
				defense.observe(nextRoom);	//Use observer to analyse nearby rooms
				defense.tower(nextRoom, enemyInSpawn);	//Towers attack sent in enemy
		//	}
		//	else
		//	{
		//		//Rooms I don't own
		//	}
		//}
	}
	var reportLookThroughRooms = Game.getUsedCpu() - reportInitializeCpuUsed - reportPeriodic;

    var buildersSeen = 0;
	var harvestersSeen = 0;
	var gatherersSeen = 0;
	var attackersSeen = 0;
	var scoutsSeen = 0;
	var previousScoutState = 'ready';
    var individualCPU = Game.getUsedCpu();
    for(var name in Game.creeps) 
    {
        var creep = Game.creeps[name];
		var role = creep.memory.role;

		if(role == 'worker' || role == 'lazy')
		{
			harvester.work(creep, harvestersSeen);
			harvestersSeen++;
		}
		else if(role == 'gather')
		{
			harvester.gather(creep, gatherersSeen);
			gatherersSeen++;
		}
		else if(role == 'builder') 
        {
			builder.units(creep, buildersSeen);
    	    buildersSeen++;
        }
		else if(role == 'attack' || role == 'defend')
		{
			defense.attack(creep, attackersSeen);
			attackersSeen++;
		}
		else if(role == 'scout')
		{
			//if(cpuLimit > 100)
				previousScoutState = defense.scout(creep, scoutsSeen, previousScoutState);
			scoutsSeen++;
		}
		else if(role == 'attackPower' || role == 'healPower' || role == 'rangedPower')
		{
			defense.attackPower(unit);
		}
		
		var calc = Game.getUsedCpu()-individualCPU;
		if((calc > 10 && cpuLimit < 400) || calc > 20)
		{
			//console.log('Creep ' + creep.name + ' CPU: ' + calc);
			//Game.notify('Creep ' + creep.name + ' CPU: ' + calc, 720);
		}
		if(role == 'gather')
		{
			//cpuUsage.measure1(calc);
		}
		else if(role == 'builder')
		{
			//cpuUsage.measure2(calc);
		}
		individualCPU = Game.getUsedCpu();
    }
	var reportCreepCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed - reportPeriodic - reportLookThroughRooms;
	//console.log('Creep logic CPU: ' + reportCreepCpuUsed);

	//TO DO: Adjust to only count unit types tied to the spawn we're sending in
    for(var spawners in Game.spawns)
    {
        spawnFrom.spawn(Game.spawns[spawners], harvestersSeen, gatherersSeen, buildersSeen, attackersSeen, scoutsSeen);
    }
	var reportSpawnCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed - reportPeriodic - reportLookThroughRooms - reportCreepCpuUsed;
	//console.log('Spawn logic CPU: ' + reportSpawnCpuUsed);
	
	//cpuUsage.measure(reportInitializeCpuUsed, reportPeriodic, reportLookThroughRooms, reportCreepCpuUsed);
	//cpuUsage.seen(gatherersSeen, buildersSeen, harvestersSeen, attackersSeen, scoutsSeen);
	cpuUsage.cpu();
	var reportCPUCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed - reportPeriodic - reportLookThroughRooms - reportCreepCpuUsed - reportSpawnCpuUsed;
	//console.log('CPU tracking: ' + reportCPUCpuUsed);
	//cpuLimit raises if unused energy was spent, used 30 since that's our account limit so if we use over this amount we're cutting into our reserves
	if((Game.getUsedCpu() > 30 && cpuLimit < 400) || Game.getUsedCpu() > 60)
	{
	    console.log('Initialize: ' + reportInitializeCpuUsed + ', Periodic Check: ' + reportPeriodic + ', RoomLook: ' + reportLookThroughRooms + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed);
	}
	else if(cpuLimit < 200)
	{
	    //Game.notify('LOW LIMIT: ' + cpuLimit + ' Initialize: ' + reportInitializeCpuUsed + ', Periodic Check: ' + reportPeriodic + ', RoomLook: ' + reportLookThroughRooms + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed, 720);
		//console.log('LOW LIMIT: ' + cpuLimit + ' Initialize: ' + reportInitializeCpuUsed + ', Periodic Check: ' + reportPeriodic + ', RoomLook: ' + reportLookThroughRooms + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed);
	}
}