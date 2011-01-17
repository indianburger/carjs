

function Tetris()
{
	var self = this;
	this.start = function()
	{
		if (self.puzzle && !confirm('Are you sure you want to start a new game ?')) return;
		self.reset();
		self.stats.start();
		
	};
}