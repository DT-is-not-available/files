(function(Scratch) {

	// http://localhost:8000/compiled_language.js
	
	'use strict'

	let Workspace = window.Workspace = {}

	let stagebtn = document.querySelector("canvas")
		.parentElement
		.parentElement
		.parentElement
		.parentElement
		.parentElement
		.nextElementSibling
		.firstChild
		.lastChild
		.firstChild
	stagebtn.click()
	Workspace.stagebtn = stagebtn
	;(Workspace.display = document.querySelector("canvas")
		.parentElement
		.parentElement
		.parentElement
		.parentElement
		.parentElement
		.parentElement
	).style.display = "none"
	;(Workspace.costumes = document.getElementById("react-tabs-2")).style.display = "none"
	;(Workspace.sound = document.getElementById("react-tabs-4")).style.display = "none"
	document.getElementById("react-tabs-0").click()

	let loaded = Scratch.vm.runtime._events.PROJECT_LOADED
	Scratch.vm.runtime._events.PROJECT_LOADED = function(...a){
		loaded(...a)
		stagebtn = Workspace.stagebtn = document.querySelector("canvas")
			.parentElement
			.parentElement
			.parentElement
			.parentElement
			.parentElement
			.nextElementSibling
			.firstChild
			.lastChild
			.firstChild
		stagebtn.click()
	}

	dispatchEvent(new Event("resize"))
	
	class CompiledLanguage {

		getInfo() {
			return {

				id: 'compiledBase',

				name: 'Compiled Test',

				blocks: [
					{
						opcode: 'keypressed',
						blockType: Scratch.BlockType.HAT,
						text: 'key [0] pressed',
						arguments: [
							{
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'DownArrow',
								menu: 'keys'
							}
						]
					},
					{
						opcode: 'execute',
						blockType: Scratch.BlockType.COMMAND,
						text: 'yo',
						arguments: [
							
						]
					},
				],
				menus: {
					keys: [
						"ArrowUp",
						"ArrowDown",
						"ArrowLeft",
						"ArrowRight"
					]
				}
			};
		}

		keypressed(ARGS) {
			return hat(()=>{
				let a = []
				base.push({keypressed: a})
				code = a
			})
		}
		execute() {
			code.push()
			return 'hi'
		}
	}

	Scratch.extensions.register(new CompiledLanguage());

})(Scratch);