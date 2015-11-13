/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('previewRoute'); // -> 'a thing'
 */
 var count = 1;
 
function removeFlags() {
    for(var i in Game.flags) 
    {
        if(Game.flags[i].name.startsWith('nav'))
        {
            Game.flags[i].remove();
        }
    }
    count = 1;
}

function addFlags(unit) {
    for(var position in unit.memory.pathTo) {
        //console.log("Position: " + unit.memory.pathTo[position].x);
        if(unit.memory.pathTo)
        {
    	    unit.room.createFlag(unit.memory.pathTo[position].x, unit.memory.pathTo[position].y, 'nav'+count++, COLOR_GREEN);
        }
    }
    for(var position in unit.memory.pathFrom)
    {
    	if(unit.memory.pathFrom)
    	{
    	    unit.room.createFlag(unit.memory.pathFrom[position].x, unit.memory.pathFrom[position].y, 'nav'+count++, COLOR_YELLOW);
    	}
    }
}
 
 module.exports = function(unit)
 {
    addFlags(unit);
    removeFlags();
 }