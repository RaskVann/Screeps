/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('measureCPU'); // -> 'a thing'
 */
 
 //Returns current CPU used this turn
 function cpuAverage(spawn0)
 {
	//-----------Average CPU Cost------------
	if(spawn0.memory.gameTicks == null)
	{
		spawn0.memory.gameTicks = 1;
	}
	else
	{
		spawn0.memory.gameTicks += 1;
	}
	
	var currentCpuUsage = Game.cpu.getUsed();
	if(spawn0.memory.totalCPU == null)
	{
		spawn0.memory.totalCPU = 0;
	}
	else
	{
		spawn0.memory.totalCPU += currentCpuUsage;
	}
	
	if(spawn0.memory.minCPU == null)
	{
		spawn0.memory.minCPU = currentCpuUsage;
	}
	if(spawn0.memory.maxCPU == null)
	{
		spawn0.memory.maxCPU = currentCpuUsage;
	}
	
	if(currentCpuUsage < spawn0.memory.minCPU)
	{
		spawn0.memory.minCPU = currentCpuUsage;
	}
	else if(currentCpuUsage > spawn0.memory.maxCPU)
	{
		spawn0.memory.maxCPU = currentCpuUsage;
	}
	
	spawn0.memory.averageCPU = spawn0.memory.totalCPU/spawn0.memory.gameTicks;
	return(currentCpuUsage);
 }
 
 //Stores the variance and the standard deviation of the CPU usage every tick
 function standardDeviation(spawn0, currentCpuUsage)
 {
	//-----------------Standard Deviation--------------------
	//Variance it calculated that SumOfEach((CurrentValue-Mean)^2)/HowManyValuesWeHad, we're storing the top bit here
	if(spawn0.memory.varianceTotal == null)
	{
		spawn0.memory.varianceTotal = Math.pow(currentCpuUsage-spawn0.memory.averageCPU, 2);
	}
	else
	{
		spawn0.memory.varianceTotal += Math.pow(currentCpuUsage-spawn0.memory.averageCPU, 2);
	}
	//If I recall my statistics correctly, the majority of the recorded values will hover 
	//around AverageCPU+/-standardDeviation range
	spawn0.memory.standardDeviation = Math.sqrt(spawn0.memory.varianceTotal/spawn0.memory.gameTicks); 
 }
 
 function measureCpuLimit(spawn)
 {
	if(spawn.memory.previousCpuLimit != null)
	{
		var currentLimit = Game.cpuLimit;
		var limitGrow = currentLimit-(spawn.memory.previousCpuLimit);	//Positive=Growing, Negative=Falling
		if(limitGrow == 0)
		{
			var accountLimit = 30;
			//var temp = accountLimit - Game.cpu.getUsed();
			//console.log('W: limit has not changed from last tick. May want to use improvised account limit: ' + accountLimit + ' to calc limit change (grow): ' + temp);
			limitGrow = accountLimit - Game.cpu.getUsed();
		}
		
		if(limitGrow > 0)
		{
			if(spawn.memory.CpuLimitGrow != null)
			{
				spawn.memory.CpuLimitGrow++;
			}
			else
			{
				spawn.memory.CpuLimitGrow = 1;
			}
			
			if(spawn.memory.CpuLimitGrowTotal != null)
			{
				spawn.memory.CpuLimitGrowTotal += limitGrow;
			}
			else
			{
				spawn.memory.CpuLimitGrowTotal = limitGrow;
			}
			
			spawn.memory.CpuLimitGrowAvg = spawn.memory.CpuLimitGrowTotal/spawn.memory.CpuLimitGrow;
		}
		else if(limitGrow < 0)
		{
			if(spawn.memory.CpuLimitShrink != null)
			{
				spawn.memory.CpuLimitShrink++;
			}
			else
			{
				spawn.memory.CpuLimitShrink = 1;
			}
			
			if(spawn.memory.CpuLimitShrinkTotal != null)
			{
				spawn.memory.CpuLimitShrinkTotal += limitGrow;
			}
			else
			{
				spawn.memory.CpuLimitShrinkTotal = limitGrow;
			}
			
			spawn.memory.CpuLimitShrinkAvg = spawn.memory.CpuLimitShrinkTotal/spawn.memory.CpuLimitShrink;
		}
		else
		{
			if(Game.cpuLimit < 500)
			{
				console.log('No reported change in CPU Limit, and not at cap. Not sure how this is possible except on rare freak occurances.');
			}
			else
			{
				//Behaving as expected, cpu limit is capped and will be recorded below, can potentially be moved into this slot
			}
		}
	}
	else
	{
		spawn.memory.previousCpuLimit = Game.cpuLimit;
	}
	
	//We might have a scew that looks like the Cpu limit isn't moving, however if the CPU limit is capped at 500
	//for most of the time either of the averages above will have moved less then CpuLimitCappedTicks
	if(Game.cpuLimit >= 499)
	{
		if(spawn.memory.CpuLimitCappedTicks != null)
		{
			spawn.memory.CpuLimitCappedTicks++;
		}
		else
		{
			spawn.memory.CpuLimitCappedTicks = 1;
		}
	}
	
	//In theory you should be able to raise/lower you account CPU by this amount (plus some buffer)
	//such that if positive you lower account cpu by that amount and vice versa. You'll on average won't hit the
	//CPU limit if the same thing occurs. If you don't give enough buffer during combat for example where far more
	//is occuring and cpu intensive you'll bottom out.
	//WARNING: If cap out early (CappedTicks is high) you should need little to no buffer since 
	//		you're true GrowTotal isn't being measured
	if(spawn.memory.CpuLimitShrink != null && spawn.memory.CpuLimitShrinkTotal != null &&
		spawn.memory.CpuLimitGrow != null && spawn.memory.CpuLimitGrowTotal != null)
	{
		spawn.memory.CpuLimitAvg = (spawn.memory.CpuLimitGrowTotal + spawn.memory.CpuLimitShrinkTotal) / (spawn.memory.CpuLimitGrow + spawn.memory.CpuLimitShrink);
	}
 }

 function measureCPU(spawn0)
 {
    if(spawn0 != null)
    {
		var currentCpuUsage = cpuAverage(spawn0);
		standardDeviation(spawn0, currentCpuUsage);
		
		measureCpuLimit(spawn0);
		
		//Not used for anything, just for fun to know what value was calculated last tick
    	spawn0.memory.previousCPU = Game.cpu.getUsed();
    }
 }
 
 function cleanMeasureCPU(spawn0)
 {
    if(spawn0 != null)
    {
		//Cleans average calculations
		var usedCPU = Game.cpu.getUsed();
		spawn0.memory.gameTicks = 1;
		spawn0.memory.totalCPU = usedCPU;
		spawn0.memory.minCPU = usedCPU;
		spawn0.memory.maxCPU = usedCPU;
		spawn0.memory.averageCPU = usedCPU;
		
		//Cleans standard deviation
		spawn0.memory.varianceTotal = 0;
		spawn0.memory.standardDeviation = 0; 
		
		//Cleans CPU Limit
		spawn0.memory.CpuLimitGrow = 0;
		spawn0.memory.CpuLimitGrowTotal = 0;
		spawn0.memory.CpuLimitGrowAvg = 0;
		spawn0.memory.CpuLimitShrink = 0;
		spawn0.memory.CpuLimitShrinkTotal = 0;
		spawn0.memory.CpuLimitShrinkAvg = 0;
		spawn0.memory.previousCpuLimit = Game.cpuLimit;
		spawn0.memory.CpuLimitCappedTicks = 0;
		spawn0.memory.CpuLimitAvg = 0;
		
		//Cleans average cpu of various functions
		spawn0.memory.measureTicks = 0;
		spawn0.memory.measureInitCpu = 0;
		spawn0.memory.measurePeriodicCpu = 0;
		spawn0.memory.measureRoomCpu = 0;
		spawn0.memory.measureCreepCpu = 0;
		//Cpu amount we've seen this round
		spawn0.memory.measureTicks1 = 0;
		spawn0.memory.measureCpu1 = 0;
		spawn0.memory.measureTicks2 = 0;
		spawn0.memory.measureCpu2 = 0;
		//How many units we've seen this round
		spawn0.memory.seenTicks = 0;
		spawn0.memory.unitSeen1 = 0;
		spawn0.memory.unitSeen2 = 0;
		spawn0.memory.unitSeen3 = 0;
		spawn0.memory.unitSeen4 = 0;
		spawn0.memory.unitSeen5 = 0;
	}
 }
 
 //reportInitializeCpuUsed, reportPeriodic, reportLookThroughRooms, reportCreepCpuUsed
 module.exports.measure = function(reportInitializeCpuUsed, reportPeriodic, reportLookThroughRooms, reportCreepCpuUsed)
 {
	var spawn0;
	//Stores data in last found spawn, which means after more then 1 spawn is generated I'll
	//be able to compare the previous stats with the older ones, since the oldest will be the
	//only one that is recording anything
	for(var x in Game.spawns)
	{
		spawn0 = Game.spawns[x];
	}
	
	//Measure how many times we've recorded this cpu value
	//if(spawn0.memory.measureTicks == null)
	//{
	//	spawn0.memory.measureTicks = 1;
	//}
	//else
	//{
	//	spawn0.memory.measureTicks += 1;
	//}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measureInitCpu == null)
	{
		spawn0.memory.measureInitCpu = reportInitializeCpuUsed/reportEvery;
	}
	else
	{
		spawn0.memory.measureInitCpu += reportInitializeCpuUsed/reportEvery;
	}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measurePeriodicCpu == null)
	{
		spawn0.memory.measurePeriodicCpu = reportPeriodic/reportEvery;
	}
	else
	{
		spawn0.memory.measurePeriodicCpu += reportPeriodic/reportEvery;
	}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measureRoomCpu == null)
	{
		spawn0.memory.measureRoomCpu = reportLookThroughRooms/reportEvery;
	}
	else
	{
		spawn0.memory.measureRoomCpu += reportLookThroughRooms/reportEvery;
	}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measureCreepCpu == null)
	{
		spawn0.memory.measureCreepCpu = reportCreepCpuUsed/reportEvery;
	}
	else
	{
		spawn0.memory.measureCreepCpu += reportCreepCpuUsed/reportEvery;
	}
 }
 
 module.exports.measure1 = function(value)
 {
	var spawn0;
	//Stores data in last found spawn, which means after more then 1 spawn is generated I'll
	//be able to compare the previous stats with the older ones, since the oldest will be the
	//only one that is recording anything
	for(var x in Game.spawns)
	{
		spawn0 = Game.spawns[x];
	}
	
	//Measure how many times we've recorded this cpu value
	if(spawn0.memory.measureTicks1 == null)
	{
		spawn0.memory.measureTicks1 = 1;
	}
	else
	{
		spawn0.memory.measureTicks1 += 1;
	}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measureCpu1 == null)
	{
		spawn0.memory.measureCpu1 = value;
	}
	else
	{
		spawn0.memory.measureCpu1 += value;
	}
 }
 
 module.exports.measure2 = function(value)
 {
	var spawn0;
	//Stores data in last found spawn, which means after more then 1 spawn is generated I'll
	//be able to compare the previous stats with the older ones, since the oldest will be the
	//only one that is recording anything
	for(var x in Game.spawns)
	{
		spawn0 = Game.spawns[x];
	}
	
	//Measure how many times we've recorded this cpu value
	if(spawn0.memory.measureTicks2 == null)
	{
		spawn0.memory.measureTicks2 = 1;
	}
	else
	{
		spawn0.memory.measureTicks2 += 1;
	}
	
	//Add the current value to the total to get the average later
	if(spawn0.memory.measureCpu2 == null)
	{
		spawn0.memory.measureCpu2 = value;
	}
	else
	{
		spawn0.memory.measureCpu2 += value;
	}
 }

 //gatherersSeen, buildersSeen, harvestersSeen, attackersSeen, scoutsSeen
 module.exports.seen = function(unitSeen1, unitSeen2, unitSeen3, unitSeen4, unitSeen5)
 {
	var spawn0;
	//Stores data in last found spawn, which means after more then 1 spawn is generated I'll
	//be able to compare the previous stats with the older ones, since the oldest will be the
	//only one that is recording anything
	for(var x in Game.spawns)
	{
		spawn0 = Game.spawns[x];
	}
	
	//Measure how many times we've recorded this cpu value
	//if(spawn0.memory.seenTicks == null)
	//{
	//	spawn0.memory.seenTicks = 1;
	//}
	//else
	//{
	//	spawn0.memory.seenTicks += 1;
	//}
	
	//How many of <X> unit was alive this tick
	if(spawn0.memory.unitSeen1 == null)
	{
		spawn0.memory.unitSeen1 = unitSeen1/reportEvery;
	}
	else
	{
		spawn0.memory.unitSeen1 += unitSeen1/reportEvery;
	}
	
	//How many of <Y> unit was alive this tick
	if(spawn0.memory.unitSeen2 == null)
	{
		spawn0.memory.unitSeen2 = unitSeen2/reportEvery;
	}
	else
	{
		spawn0.memory.unitSeen2 += unitSeen2/reportEvery;
	}
	
	//How many of <Z> unit was alive this tick
	if(spawn0.memory.unitSeen3 == null)
	{
		spawn0.memory.unitSeen3 = unitSeen3/reportEvery;
	}
	else
	{
		spawn0.memory.unitSeen3 += unitSeen3/reportEvery;
	}
	
	//How many of <W> unit was alive this tick
	if(spawn0.memory.unitSeen4 == null)
	{
		spawn0.memory.unitSeen4 = unitSeen4/reportEvery;
	}
	else
	{
		spawn0.memory.unitSeen4 += unitSeen4/reportEvery;
	}
	
	//How many of <U> unit was alive this tick
	if(spawn0.memory.unitSeen5 == null)
	{
		spawn0.memory.unitSeen5 = unitSeen5/reportEvery;
	}
	else
	{
		spawn0.memory.unitSeen5 += unitSeen5/reportEvery;
	}
 }

 //10,000 ticks is roughly 12 hours (720 minutes) last time I checked. Cpu Limit is 500
 var reportEvery = 10000;	//500
 var reportMin = 720;	//36
 
 module.exports.cpu = function()
 {
	var spawn0;
	//Stores data in last found spawn, which means after more then 1 spawn is generated I'll
	//be able to compare the previous stats with the older ones, since the oldest will be the
	//only one that is recording anything
	for(var x in Game.spawns)
	{
		spawn0 = Game.spawns[x];
	}
		
    measureCPU(spawn0);
	
	//Report to me cpu stats every 10,000 ticks (grouped every 12 hours)
	if(Game.time % reportEvery == 0)
	{
		Game.notify('CPU-Average: ' + spawn0.memory.averageCPU + '+/-' + spawn0.memory.standardDeviation + ', CpuLimitAvg: ' + spawn0.memory.CpuLimitAvg, reportMin);
		
		//If measure() is called
		if(spawn0.memory.measureInitCpu != null && spawn0.memory.measureInitCpu > 0)
		{
			var avgInit = spawn0.memory.measureInitCpu;// /spawn0.memory.measureTicks;
			var avgPeriodic = spawn0.memory.measurePeriodicCpu;// /spawn0.memory.measureTicks;
			var avgRoom = spawn0.memory.measureRoomCpu;// /spawn0.memory.measureTicks;
			var avgCreep = spawn0.memory.measureCreepCpu;// /spawn0.memory.measureTicks;
			Game.notify('Initialize Average: ' + avgInit + ', Periodic Average: ' + avgPeriodic + ', Room Average: ' + avgRoom + ', Creep Average: ' + avgCreep, reportMin);
		}
		//If seen(), measure1() and measure2() is called
		if(spawn0.memory.unitSeen1 != null && spawn0.memory.unitSeen1 > 0)
		{
			var averageMeasure1 = spawn0.memory.measureCpu1/spawn0.memory.measureTicks1;
			var averageMeasure2 = spawn0.memory.measureCpu2/spawn0.memory.measureTicks2;
			var unitSeenAvg1 = spawn0.memory.unitSeen1;// /spawn0.memory.seenTicks;
			var unitSeenAvg2 = spawn0.memory.unitSeen2;// /spawn0.memory.seenTicks;
			var unitSeenAvg3 = spawn0.memory.unitSeen3;// /spawn0.memory.seenTicks;
			var unitSeenAvg4 = spawn0.memory.unitSeen4;// /spawn0.memory.seenTicks;
			var unitSeenAvg5 = spawn0.memory.unitSeen5;// /spawn0.memory.seenTicks;
			var avgPerTick1 = averageMeasure1 * unitSeenAvg1;
			var avgPerTick2 = averageMeasure2 * unitSeenAvg2;
			Game.notify('Gather(' + unitSeenAvg1 + ') average: ' + averageMeasure1 + ' of ' + avgPerTick1 + 
			', builder(' + unitSeenAvg2 + ') average: ' + averageMeasure2 + ' of ' + avgPerTick2 + ' harvest(' + unitSeenAvg3 + '), attack (' + 
			unitSeenAvg4 + '), scout(' + unitSeenAvg5 + ')', reportMin);
		}
		
		cleanMeasureCPU(spawn0);
	}
 }
 