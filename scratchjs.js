(function(Scratch) {
	'use strict';
	class Broadcast1 {
		getInfo() {
			return {
				id: 'broadcast1example',
				name: 'Broadcast Example 1',
				blocks: [
					{
						opcode: 'whenReceived',
						blockType: Scratch.BlockType.HAT,
						text: 'when I receive the event',
						isEdgeActivated: false
					},
					{
						opcode: 'broadcast',
						blockType: Scratch.BlockType.COMMAND,
						text: 'broadcast the event'
					}
				]
			};
		}
		broadcast(args, util) {
			util.startHats('broadcast1example_whenReceived');
		}
	}
	Scratch.extensions.register(new Broadcast1());
}(Scratch));
