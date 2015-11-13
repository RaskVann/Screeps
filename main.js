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
	if(Memory.waitForTicks == null || Memory.waitForTicks-- <= 0)
	{
		cleanMemory();
		//cleanMemory.purgeFlagsWithId("123");
		//cleanMemory.purgeFlags();
		//cleanMemory.purgeRole('builder');
		//cleanMemory.purgeScoutInfo();
		
		//console.log('Is working every ' + defaultWait + ' ticks?');
		Memory.waitForTicks = defaultWait;
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
		else if(creep.memory.role == 'attack' || creep.memory.role == 'defend')
		{
			defense.attack(creep, attackersSeen);
			attackersSeen++;
		}
		else if(creep.memory.role == 'scout')
		{
			//previousScoutState = defense.scout(creep, scoutsSeen, previousScoutState);
			scoutsSeen++;
		}
    	else if(creep.memory.role == 'builder') 
        {
			builder(creep, buildersSeen);
    	    buildersSeen++;
        }
		
		var calc = Game.getUsedCpu()-individualCPU;
		if((calc > 10 && Game.cpuLimit < 400) || calc > 20)
			console.log('Creep ' + creep.name + ' CPU: ' + calc);
		individualCPU = Game.getUsedCpu();
    }
	var reportCreepCpuUsed = Game.getUsedCpu() - reportInitializeCpuUsed;
	//console.log('Creep logic CPU: ' + reportCreepCpuUsed);

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
		//Game.notify('LIMIT EXCEEDED-Initialize: ' + reportInitializeCpuUsed + ', Creep: ' + reportCreepCpuUsed + ', Spawn: ' + reportSpawnCpuUsed + ', Report: ' + reportCPUCpuUsed, 10);
	}
}