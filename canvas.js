/*
http://localhost:8000/canvas.js
*/
(function(Scratch) {
	'use strict'

	var images = []
	document.querySelector("#htmlcanvas")?.remove()
	var stageCanvas = document.querySelector("canvas")

	function prepCanvas() {
		var stageCanvas = document.querySelector("canvas")
		var canvas = stageCanvas.parentElement.appendChild(document.createElement("canvas"))
		canvas.id = "htmlcanvas"
		stageCanvas.parentElement.style.position = "relative"
		canvas.style = 
		`
			position: absolute;
			left: 0px;
			top: 0px;
			width: ${stageCanvas.style.width};
			height: ${stageCanvas.style.height};
			pointer-events: none;
		`
		canvas.width = stageCanvas.width
		canvas.height = stageCanvas.height 
		return canvas
	}

	function fixCoords(ARGS) {
		ARGS.x += canvas.width/2
		ARGS.y = -ARGS.y + canvas.height/2
	}

	let canvas = prepCanvas()
	let ctx = canvas.getContext("2d")
	ctx.font = "16px sans-serif"
	ctx.textBaseline = "middle"
	ctx.textAlign = "center"

	class HTMLCanvas {

		getInfo() {
			return this.info
		}

		clear() {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
		}
		fillText(ARGS) {
			fixCoords(ARGS)
			ctx.fillText(ARGS.text, ARGS.x, ARGS.y)
		}
		fillRect(ARGS) {
			fixCoords(ARGS)
			ctx.fillRect(ARGS.x, ARGS.y, ARGS.w, ARGS.h)
		}
		drawSprite(ARGS) {
			fixCoords(ARGS)
			let costume = Scratch.vm.runtime.getSpriteTargetByName(ARGS.sprite).getCurrentCostume()
			let src = costume.asset.encodeDataURI()
			if (images[src])
				ctx.drawImage(images[src], ARGS.x-costume.rotationCenterX, ARGS.y-costume.rotationCenterY)
			else {
				let i = images[src] = new Image
				i.src = src
				i.onload = ()=>
				ctx.drawImage(images[src], ARGS.x-costume.rotationCenterX, ARGS.y-costume.rotationCenterY)
			}
		}
		width() {
			return canvas.width
		}
		height() {
			return canvas.height
		}
	}

	HTMLCanvas.prototype.info = {

		id: 'htmlcanvas',

		name: 'Canvas',

		color1: "#9966ff",
		color2: "#6d4ab4",

		menus: {},

		blocks: [
			{
				opcode: 'clear',
				blockType: Scratch.BlockType.COMMAND,
				text: 'clear',
			},
			{
				opcode: 'width',
				blockType: Scratch.BlockType.REPORTER,
				text: 'canvas width'
			},
			{
				opcode: 'height',
				blockType: Scratch.BlockType.REPORTER,
				text: 'canvas height'
			},
			{
				opcode: 'fillText',
				blockType: Scratch.BlockType.COMMAND,
				text: 'draw text [text] at [x] [y]',
				arguments: {
					text: {
						type: Scratch.ArgumentType.STRING,
						defaultValue: 'Hello World!'
					},
					x: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
					y: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
				}
			},
			{
				opcode: 'fillRect',
				blockType: Scratch.BlockType.COMMAND,
				text: 'fill rectangle at [x] [y] of size [w] [h]',
				arguments: {
					x: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
					y: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
					w: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 100
					},
					h: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 100
					},
				}
			},
			{
				opcode: 'drawSprite',
				blockType: Scratch.BlockType.COMMAND,
				text: 'draw sprite [sprite] at [x] [y]',
				arguments: {
					sprite: {
						type: Scratch.ArgumentType.STRING,
						defaultValue: "Sprite1",
						menu: "sprites"
					},
					x: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
					y: {
						type: Scratch.ArgumentType.NUMBER,
						defaultValue: 0
					},
				}
			},
		],
		menus: {
			sprites: 'getSprites'
		}
	}

	HTMLCanvas.prototype.getSprites = function(){
		let sprites = []
		Scratch.vm.runtime.targets.forEach(e=>{
			if (e.isOriginal && !e.isStage) sprites.push(e.sprite.name)
		})
		return sprites
	}

	function newSetter(prop, label, type, menu) {
		let blk = {
			opcode: prop+"_set",
			blockType: Scratch.BlockType.COMMAND,
			text: label+" [inp]",
			arguments: {
				inp: {
					type: Scratch.ArgumentType[type],
					defaultValue: ctx[prop]
				},
			}
		}
		if (menu) {
			HTMLCanvas.prototype.info.menus[prop+"_menu"] = {
				acceptReporters: true,
				items: menu
			}
			blk.arguments.inp.menu = prop+"_menu"
		}
		HTMLCanvas.prototype.info.blocks.push(blk)
		HTMLCanvas.prototype[prop+"_set"] = function(ARGS) {
			ctx[prop] = ARGS.inp
		}
		HTMLCanvas.prototype.info.blocks.push(
			{
				opcode: prop+"_get",
				blockType: Scratch.BlockType.REPORTER,
				text: label
			}
		)
		HTMLCanvas.prototype[prop+"_get"] = function(ARGS) {
			return ctx[prop]
		}
	}

	function newReporter(op, label, args, cb) {
		HTMLCanvas.prototype.info.blocks.push(
			{
				opcode: op,
				blockType: Scratch.BlockType.REPORTER,
				text: label,
				arguments: args
			}
		)
		HTMLCanvas.prototype[op] = cb
	}

	newSetter("font", "font", "STRING")
	newSetter("textAlign", "text alignment", "STRING", ["left", "center", "right"])
	newSetter("textBaseline", "text baseline", "STRING", ["top", "middle", "bottom"])
	newSetter("fillStyle", "color", "COLOR")
	newReporter("rgb", "rgb [r][g][b]", {
		r:{
			type: Scratch.ArgumentType.NUMBER,
			defaultValue: 0
		},
		g:{
			type: Scratch.ArgumentType.NUMBER,
			defaultValue: 0
		},
		b:{
			type: Scratch.ArgumentType.NUMBER,
			defaultValue: 0
		}
	}, function(ARGS) {
		return `rgb(${ARGS.r}, ${ARGS.g}, ${ARGS.b})`
	})

	Scratch.extensions.register(new HTMLCanvas());

})(Scratch);