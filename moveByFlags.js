/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('moveByFlags'); // -> 'a thing'
 */
 
 function moveByFlags(unit) 
 {
	var flagsOnUnit = unit.pos.lookFor('flag');
	for(var eachFlag in flagsOnUnit)
	{
		if(eachFlag != null && eachFlag.name.startsWith('dir'))
		{
			unit.memory.direction = eachFlag.direction;
			/**
				TOP
				TOP_RIGHT
				RIGHT
				BOTTOM_RIGHT
				BOTTOM
				BOTTOM_LEFT
				LEFT
				TOP_LEFT
			**/
		}
	}
	//If we've stored a direction, keep going until you find a flag
	//that tells you to do something different
	if(unit.memory.direction != null)
	{
		unit.move(unit.memory.direction);
	}
 }
 
 module.exports = function(unit)
 {
    moveByFlags(unit);
 }