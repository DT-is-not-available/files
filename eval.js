class JavascriptEval {

	getInfo() {
		return {

			id: 'javascripteval',

			name: 'Eval',

			blocks: [
				{
					opcode: 'eval',
					blockType: Scratch.BlockType.REPORTER,
					text: 'eval [code]',
					arguments: {
						code: {
							type: Scratch.ArgumentType.STRING,
							defaultValue: 'prompt("Hello World!")'
						}
					}
				},
				{
					opcode: 'eval2',
					blockType: Scratch.BlockType.COMMAND,
					text: 'eval [code]',
					arguments: {
						code: {
							type: Scratch.ArgumentType.STRING,
							defaultValue: 'alert("Hello World!")'
						}
					}
				},
				{
					opcode: 'eval3',
					blockType: Scratch.BlockType.BOOLEAN,
					text: 'eval [code]',
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
	eval2(ARGS) {
		return eval(ARGS.code);
	}
	eval3(ARGS) {
		return eval(ARGS.code);
	}
}

Scratch.extensions.register(new JavascriptEval());