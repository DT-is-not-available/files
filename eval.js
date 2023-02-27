(function(Scratch) {
	// document.querySelector("canvas").parentElement
	'use strict'
	function getReturnable(v) {
		if (typeof v === "object") {
			try {
				return JSON.stringify(v)
			} catch(e) {
				return "[circular Object]"
			}
		}
		return v
	}

	var variables = {}
	var states = {}
	var jsToRun = ""
	
	class JavascriptEval {

		getInfo() {
			return {

				id: 'javascripteval',

				name: 'Eval',

				blocks: [
					{
						opcode: 'when',
						blockType: Scratch.BlockType.HAT,
						text: 'when [cond]',
						arguments: {
							cond: {
								type: Scratch.ArgumentType.BOOLEAN
							}
						}
					},
					{
						opcode: 'eval',
						blockType: Scratch.BlockType.REPORTER,
						text: 'eval [code] reporter',
						arguments: {
							code: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: '1+2'
							}
						}
					},
					{
						opcode: 'eval2',
						blockType: Scratch.BlockType.COMMAND,
						text: 'eval [code] command',
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
						text: 'eval [code] boolean',
						arguments: {
							code: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'true'
							}
						}
					},
					{
						opcode: 'stashLine',
						blockType: Scratch.BlockType.COMMAND,
						text: 'prep JS [code]',
						arguments: {
							code: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'var foo = 3'
							}
						}
					},
					{
						opcode: 'execute',
						blockType: Scratch.BlockType.COMMAND,
						text: 'execute',
					},
					{
						opcode: 'execute2',
						blockType: Scratch.BlockType.REPORTER,
						text: 'execute',
					},
					{
						opcode: 'clear',
						blockType: Scratch.BlockType.COMMAND,
						text: 'clear JS',
					},
					{
						opcode: 'setVar',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set [varname] to [val]',
						arguments: {
							varname: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'foo'
							},
							val: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: '10'
							}
						}
					},
					{
						opcode: 'getVar',
						blockType: Scratch.BlockType.REPORTER,
						text: 'var [varname]',
						arguments: {
							varname: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'foo'
							}
						}
					},
					{
						opcode: 'object',
						blockType: Scratch.BlockType.REPORTER,
						text: 'new object'
					},
					{
						opcode: 'array',
						blockType: Scratch.BlockType.REPORTER,
						text: 'new array'
					},
					{
						opcode: 'sprite',
						blockType: Scratch.BlockType.REPORTER,
						text: 'this'
					},
					{
						opcode: 'lastclone',
						blockType: Scratch.BlockType.REPORTER,
						text: 'newest sprite'
					},
				]
			};
		}

		when(ARGS) {
			return ARGS.cond
		}
		stashLine(ARGS) {
			jsToRun += ARGS.code+"\n"
		}
		execute() {
			Function("variables", jsToRun)(variables)
		}
		execute2() {
			var v = Function("variables", jsToRun)(variables)
			return getReturnable(v)
		}
		clear() {
			jsToRun = ""
		}
		eval(ARGS) {
			var v = eval(ARGS.code)
			return getReturnable(v)
		}
		eval2(ARGS) {
			eval(ARGS.code);
		}
		eval3(ARGS) {
			return eval(ARGS.code) && true
		}
		setVar(ARGS, util) {
			let v = variables
			let path = ARGS.varname.split(".")
			let value = {
				"\x00Javascript Object\x00": new Object(),
				"\x00Javascript Array\x00": new Array(),
				"\x00Scratch Sprite\x00": util.target,
				"\x00Scratch Sprite\x01": Scratch.vm.runtime.targets[Scratch.vm.runtime.targets.length-1]
			}[ARGS.val] || ARGS.val
			while (path.length > 1) {
				v = v?.[path.shift()]
			}
			v[path[0]] = value
			console.log(`set ${ARGS.varname} to`,value)
		}
		getVar(ARGS) {
			let v = variables
			let path = ARGS.varname.split(".")
			while (path.length > 0) {
				v = v?.[path.shift()]
			}
			return getReturnable(v)
		}
		object() {
			return "\x00Javascript Object\x00"
		}
		array() {
			return "\x00Javascript Array\x00"
		}
		sprite() {
			return "\x00Scratch Sprite\x00"
		}
		lastclone() {
			return "\x00Scratch Sprite\x01"
		}
	}

	Scratch.extensions.register(new JavascriptEval());

})(Scratch);