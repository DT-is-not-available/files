(function(Scratch) {
	// document.querySelector("canvas").parentElement
	'use strict'

	var camera = {}

	camera.X ??= 0
	camera.Y ??= 0
	camera.Zoom ??= 100
	camera.Background ??= "#ffffff"

	Scratch.vm.runtime.runtimeOptions.fencing = false
	Scratch.vm.renderer.offscreenTouching = true

	function updateCamera() {
		Scratch.vm.renderer.setStageSize(
			Scratch.vm.runtime.stageWidth/-2+camera.X, 
			Scratch.vm.runtime.stageWidth/2+camera.X, 
			Scratch.vm.runtime.stageHeight/-2+camera.Y, 
			Scratch.vm.runtime.stageHeight/2+camera.Y
		)
		Scratch.vm.renderer._projection[15] = 100/camera.Zoom
		Scratch.vm.renderer._backgroundColor4f = [
			parseInt(camera.Background.substring(1,3),16)/255,
			parseInt(camera.Background.substring(3,5),16)/255,
			parseInt(camera.Background.substring(5,7),16)/255,
			1
		]
	}

	let oldResize = Scratch.vm.runtime.setStageSize
	Scratch.vm.runtime.setStageSize = function(width, height) {
		oldResize.apply(this, [width, height])
		updateCamera()
	}
	

	Scratch.vm.runtime._events.PROJECT_START.push(function(){
		Scratch.vm.runtime.setStageSize(Scratch.vm.runtime.stageWidth, Scratch.vm.runtime.stageHeight)
	})

	// fix mouse positions
	let oldSX = Scratch.vm.runtime.ioDevices.mouse.getScratchX
	let oldSY = Scratch.vm.runtime.ioDevices.mouse.getScratchY
	
	Scratch.vm.runtime.ioDevices.mouse.getScratchX = function(...a){
		return (oldSX.apply(this, a)+camera.X)/camera.Zoom*100
	}
	Scratch.vm.runtime.ioDevices.mouse.getScratchY = function(...a){
		return (oldSY.apply(this, a)+camera.Y)/camera.Zoom*100
	}
	
	class JavascriptEval {

		getInfo() {
			return {
				color1: "#ff4da7",
				color2: "#b93778",

				id: 'cameracontrols',

				name: 'Camera Controls',

				blocks: [
					{
						opcode: 'setBoth',
						blockType: Scratch.BlockType.COMMAND,
						text: 'scroll to [x] [y]',
						arguments: {
							x: {
								type: 'number',
								defaultValue: 0
							},
							y: {
								type: 'number',
								defaultValue: 0
							},
						}
					},
					{
						opcode: 'getX',
						blockType: Scratch.BlockType.REPORTER,
						text: 'camera x',
					},
					{
						opcode: 'setX',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set camera x to [val]',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 0
							}
						}
					},
					{
						opcode: 'changeX',
						blockType: Scratch.BlockType.COMMAND,
						text: 'change camera x by [val]',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 10
							}
						}
					},
					{
						opcode: 'getY',
						blockType: Scratch.BlockType.REPORTER,
						text: 'camera y',
					},
					{
						opcode: 'setY',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set camera y to [val]',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 0
							}
						}
					},
					{
						opcode: 'changeY',
						blockType: Scratch.BlockType.COMMAND,
						text: 'change camera y by [val]',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 10
							}
						}
					},
					{
						opcode: 'getZoom',
						blockType: Scratch.BlockType.REPORTER,
						text: 'camera zoom',
					},
					{
						opcode: 'setZoom',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set camera zoom to [val] %',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 100
							}
						}
					},
					{
						opcode: 'changeZoom',
						blockType: Scratch.BlockType.COMMAND,
						text: 'change camera zoom by [val]',
						arguments: {
							val: {
								type: 'number',
								defaultValue: 10
							}
						}
					},
					{
						opcode: 'setCol',
						blockType: Scratch.BlockType.COMMAND,
						text: 'set background color to [val]',
						arguments: {
							val: {
								type: 'color'
							}
						}
					},
				]
			};
		}

		setBoth(ARGS) {
			camera.X = +ARGS.x
			camera.Y = +ARGS.y
			updateCamera()
		}
		getX() {
			return camera.X
		}
		setX(ARGS) {
			camera.X = +ARGS.val
			updateCamera()
		}
		changeX(ARGS) {
			camera.X += +ARGS.val
			updateCamera()
		}
		getY() {
			return camera.Y
		}
		setY(ARGS) {
			camera.Y = +ARGS.val
			updateCamera()
		}
		changeY(ARGS) {
			camera.Y += +ARGS.val
			updateCamera()
		}
		getZoom() {
			return camera.Zoom
		}
		setZoom(ARGS) {
			camera.Zoom = +ARGS.val
			updateCamera()
		}
		setCol(ARGS) {
			camera.Background = ARGS.val
			updateCamera()
		}
		changeZoom(ARGS) {
			camera.Zoom += +ARGS.val
			updateCamera()
		}
	}

	updateCamera()

	Scratch.extensions.register(new JavascriptEval());

})(Scratch);