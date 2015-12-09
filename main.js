var harvester = require('Harvester');
var spawnFrom = require('Spawner');
var viewFlags = require('previewRoute');
var builder = require('builder');
var cpuUsage = require('measureCPU');
var cleanMemory = require('cleanMemory');
var createRouteToExit = require('createPathFlags');
var defense = require('Defense');

module.exports.loop = function()
{
	var reportInitializeCpuUsed = Game.getUsedCpu();
	//console.log('Initialize required modules CPU: ' + reportInitializeCpuUsed);
	
	//Triggers a function every 'defaultWait' ticks.
	var defaultWait = 20;
	var defaultLongWait = 1000;
	if(Memory.waitForTicks == null || Memory.waitForTicks-- <= 0)
	{
		cleanMemory();
		//cleanMemory.purgeFlagsWithId("123");
		//cleanMemory.purgeFlags();
		//cleanMemory.purgeRole('builder');
		//cleanMemory.purgeScoutInfo();
		
		defense.detectEnemyCreep();
		Memory.waitForTicks = defaultWait;
	}
	else if(Memory.waitForLong == null || Memory.waitForLong-- <= 0)
	{
		harvester.link();	//Create links near spawners
		//Create storage if doesn't exist, link next to storage
		//Create extensions if doesn't exist
		//TO DO: Walls / ramparts to secure exits
		Memory.waitForLong = defaultLongWait;
	}

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

		if(creep.memory.role == 'worker' || creep.memory.role == 'lazy')
		{
			harvester.work(creep, harvestersSeen);
			harvestersSeen++;
		}
		else if(creep.memory.role == 'gather')
		{
			harvester.gather(creep, gatherersSeen);
			gatherersSeen++;
		}
		else if(creep.memory.role == 'builder') 
        {
			builder.units(creep, buildersSeen);
    	    buildersSeen++;
        }
		else if(creep.memory.role == 'attack' || creep.memory.role == 'defend')
		{
			defense.attack(creep, attackersSeen);
			attackersSeen++;
		}
		else if(creep.memory.role == 'scout')
		{
			previousScoutState = defense.scout(creep, scoutsSeen, previousScoutState);
			scoutsSeen++;
		}
		
		var calc = Game.getUsedCpu()-individualCPU;
		if((calc > 10 && Game.cpuLimit < 400) || calc > 20)
		{
			console.log('Creep ' + creep.name + ' CPU: ' + calc);
			Game.notify('Creep ' + creep.name + ' CPU: ' + calc, 480);
		}
		individualCPU = Game.getUsedCpu();
    }
	var reportCreepCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed;
	//console.log('Creep logic CPU: ' + reportCreepCpuUsed);
	
	builder.manageEnergy();	//Move energy around between storage and spawn (through a link)

	//TO DO: Adjust to only count unit types tied to the spawn we're sending in
    for(var spawners in Game.spawns)
    {
        spawnFrom(Game.spawns[spawners], harvestersSeen, gatherersSeen, buildersSeen, attackersSeen, scoutsSeen);
    }
	var reportSpawnCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed - reportCreepCpuUsed;
	//console.log('Spawn logic CPU: ' + reportSpawnCpuUsed);

	cpuUsage();
	var reportCPUCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed - reportCreepCpuUsed - reportSpawnCpuUsed;
	//console.log('CPU tracking: ' + reportCPUCpuUsed);
	//Game.cpuLimit raises if unused energy was spent, used 30 since that's our account limit so if we use over this amount we're cutting into our reserves
	if((Game.getUsedCpu() > 30 && Game.cpuLimit < 400) || Game.getUsedCpu() > 60)
	{
	    console.log('Initialize: ' + reportInitializeCpuUsed + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed);
	}
	else if(Game.cpuLimit < 200)
	{
	    Game.notify('LOW LIMIT: ' + Game.cpuLimit + ' Initialize: ' + reportInitializeCpuUsed + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed, 480);
		console.log('LOW LIMIT: ' + Game.cpuLimit + ' Initialize: ' + reportInitializeCpuUsed + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed);
	}
}