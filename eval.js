class JavascriptEval {

	getInfo() {
		return {

			id: 'javascripteval',

			name: 'Eval',

			blocks: [
				{
					opcode: 'eval',
					blockType: Scratch.BlockType.REPORTER,
					text: 'eval',
					arguments: {
						code: {
							type: Scratch.ArgumentType.STRING,
							defaultValue: 'prompt("Hello World!")'
						}
					}
				},
				{
					opcode: 'eval',
					blockType: Scratch.BlockType.COMMAND,
					text: 'eval',
					arguments: {
						code: {
							type: Scratch.ArgumentType.STRING,
							defaultValue: 'alert("Hello World!")'
						}
					}
				},
				{
					opcode: 'eval',
					blockType: Scratch.BlockType.BOOLEAN,
					text: 'eval',
					arguments: {
						code: {
							type: Scratch.ArgumentType.STRING,
							defaultValue: 'true'
						}
					}
				}
			]
		};
	}

	eval(ARGS) {
		return eval(ARGS.code);
	}
}

Scratch.extensions.register(new JavascriptEval());