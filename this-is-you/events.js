const vars = c2.vars
const settings = c2.vars.settings
const Keyboard = c2.Keyboard
const wait = c2.wait
const waitFor = c2.waitFor

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function SFX(sfx) {
	if (!c2.vars.settings.sfx) return
	const Audio = c2.objects.Audio
	Audio.Stop(sfx)
	Audio.PlayByName(0, sfx, 0, 0, sfx)
}

function animateEffects(time) {
	const effect_params = c2.layers.World.effect_params
	const Animate = c2.Animate
	Animate(effect_params[1], 0, null, 0.75, time)
	Animate(effect_params[2], 0, null, 0.25, time)
	Animate(effect_params[3], 0, null, 0.25, time)
	Animate(effect_params[4], 0, null, 0.05, time)
	Animate(effect_params[5], 1, null, 0.5, time)
	Animate(effect_params[5], 2, null, 0.9, time)
}

function popsfx() {
	SFX("click")
}

return {
	looming_horizon: function() {
		const Player = c2.objects.Player
		Player.NoInput = false
		const Audio = c2.objects.Audio
		Audio.freezeMusic = true
		if (!Audio.looming_horizon) {
			setTimeout(()=>animateEffects(120), 30000)
			Audio.Stop("music")
			Audio.PlayByName(1, "looming-horizon-intro", 0, settings.music ? 0 : -100, "music")
			c2.do([
				()=>c2.wait(1000),
				()=>c2.waitFor(()=>Audio.OnEnded("music")),
				()=>Audio.PlayByName(1, "looming-horizon", 1, settings.music ? 0 : -100, "music")
			])
		}
		Audio.looming_horizon = true
	},
	unfreeze_camera: function() {
		const Player = c2.objects.Player
		const Solid = c2.objects.Solid
		Solid.Solid.SetEnabled(1)
		Player.FreeCameraY = false
		Player.freezeCameraX = false
	},
	fake_out: function() {
		const Audio = c2.objects.Audio
		const Player = c2.objects.Player
		const Solid = c2.objects.Solid
		settings.beaten = true
		Audio.Stop("music")
		Player.Inactive = true
		Player.Image.Visible = false
		Player.NoInput = true
		c2.spawn(c2.obj_DeathParticles, c2.layers.World, Player.X, Player.Y)
		SFX("die")
		c2.vars.CameraShake = 15
		setTimeout(()=>{
			SFX("die")
			c2.vars.CameraShake = 15
			Player.SetPosToObject(Player.Checkpoint)
			Player.X += 7.5
			Player.Y += 7.5
			c2.vars.CameraShake = 15
			Player.XV = 0
			Player.YV = 0
			setTimeout(()=>{
				Player.Inactive = false
				Player.Image.Visible = true
			}, 500)
			setTimeout(()=>c2.spawn(c2.obj_RespawnParticles, c2.layers.World, Player.X, Player.Y), 250)
		}, 1000)
		setTimeout(()=>{
			SFX("die")
			c2.vars.CameraShake = 15
		}, 2000)
		setTimeout(()=>{
			SFX("kaboom")
			c2.vars.CameraShake = 30
			Player.YV = -15
			Player.FreeCameraY = true
			Player.freezeCameraX = true
			Solid.Solid.SetEnabled(0)
		}, 3500)
	},
	early_end: function() {
		var context = new AudioContext()
		function beep(frequency) {
			var o = context.createOscillator()
			var  g = context.createGain()
			o.connect(g)
			o.frequency.value = frequency
			o.type = 'square'
			g.connect(context.destination)
			o.start(context.currentTime)
			o.stop(context.currentTime+0.03)
			g.gain.exponentialRampToValueAtTime(
				0.25, context.currentTime
			)
			g.gain.linearRampToValueAtTime(
				0.0001, context.currentTime+0.025
			)
		}
		const Audio = c2.objects.Audio
		const Player = c2.objects.Player
		const Trophy = c2.objects.Trophy
		const Timer = c2.objects.Timer
		const DeathCount = c2.objects.DeathCount
		const FragmentBar = c2.objects.FragmentBar
		Audio.Stop("music")
		Player.Inactive = true
		Player.freezeCamera = true
		SFX("collect")
		c2.spawn(c2.obj_FragmentParticles, c2.layers.World, Trophy.X, Trophy.Y)
		c2.spawn(c2.obj_TrophyLight, c2.layers.World, Trophy.X, Trophy.Y)
		const XPOS = Trophy.X
		const YPOS = Trophy.Y
		function spawnLight() {
			SFX("click")
			let light = c2.spawn(c2.obj_LightCaster, c2.layers.World, XPOS, YPOS)
			Player.Image.MoveToTop()
			c2.Animate(light.ShadowCaster, "Height", 9000, 10000, 0.25, c2.Animations.EaseOutExpo)
			light.Angle = Math.random()*360
			let angle = light.Angle * Math.PI/180
			let x = Math.cos(angle)*5
			let y = Math.sin(angle)*5
			vars.CameraOffsetX -= x
			vars.CameraOffsetY -= y
			light.Rotate.Speed = (Math.random()*8+1)*5 * (Math.round(Math.random())*2-1)
		}
		let t
		function doLight() {
			return t = setTimeout(()=>{
				spawnLight()
				doLight()
			}, Math.random()*850+150)
		}
		doLight()
		setTimeout(()=>{
			clearTimeout(t)
		}, 5200)
		vars.CameraShake = 15
		SFX("chord")
		setTimeout(()=>SFX("last notes"), 2800)
		c2.Animate(Player.Image, "X", null, Trophy.X, 5.2, c2.Animations.EaseInSine)
		c2.Animate(Player.Image, "Y", null, Trophy.Y, 5.2, c2.Animations.EaseInSine)
		c2.Animate(Player.Image, "Width", null, 15, 5.2, c2.Animations.EaseInSine)
		c2.Animate(Player.Image, "Height", null, 15, 5.2, c2.Animations.EaseInSine)
		c2.Animate(c2.layers.World, "scale", null, 1.5, 5.2, c2.Animations.EaseInSine)
		c2.Animate(vars, "CameraX", null, Trophy.X, 5.2, c2.Animations.EaseInSine)
		c2.Animate(vars, "CameraY", null, Trophy.Y, 5.2, c2.Animations.EaseInSine)
		c2.Animate(Player.Image, "Angle", null, Math.round(Player.Image.Angle/90)*90+3600, 5.2, c2.Animations.EaseInExpo)
		setTimeout(()=>{
			c2.layers.World.visible = false
			setTimeout(()=>{
				SFX("click")
				c2.layers.EndScreen.visible = true
				let incrementer
				let deaths = 0
				c2.do([
					()=>wait(1000),
					()=>{
						SFX("click")
						Timer.Visible = true
						let time = vars.time
						let ms = time%1000
						time -= ms
						time /= 1000
						let seconds = time%60
						time -= seconds
						time /= 60
						let minutes = time%60
						time -= minutes
						time /= 60
						let hours = time%60
						Timer.Text = `${hours}:${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}.${ms.toString().padStart(3, 0)}`
					},
					()=>wait(1000),
					()=>{
						deaths = 0
						DeathCount.Visible = true
						incrementer = setInterval(()=>{
							deaths += 10
							beep(Math.min(deaths+100, 3000))
							DeathCount.Text = deaths+" death"+(deaths == 1 ? "" : "s")
						}, 35)
					},
					()=>waitFor(()=>(deaths >= vars.deaths)),
					()=>{
						clearInterval(incrementer)
						DeathCount.Text = vars.deaths+" death"+(vars.deaths == 1 ? "" : "s")
						if (vars.deaths == 0) {
							SFX("collect")
							DeathCount.Text = "NO DEATHS"
						}
					},
					()=>wait(1000),
					()=>{
						SFX("click")
						FragmentBar.Visible = true
						FragmentBar.Text = `${
							Player.Fragment1 ? "$" : "%"
						} ${
							Player.Fragment2 ? "$" : "%"
						} ${
							Player.Fragment3 ? "$" : "%"
						} ${
							Player.Fragment4 ? "$" : "%"
						} ${
							Player.Fragment5 ? "$" : "%"
						}`
					}
				])
			}, 3000)
		}, 5200)
		Trophy.Destroy()
	},
	final_level_music: function() {
		const Audio = c2.objects.Audio
		Audio.freezeMusic = true
		Audio.Stop("music")
		Audio.PlayByName(1, "finale_music_intro", 0, settings.music ? 0 : -100, "music")
		c2.do([
			()=>c2.wait(1000),
			()=>c2.waitFor(()=>Audio.OnEnded("music")),
			()=>Audio.PlayByName(1, "finale_music", 1, settings.music ? 0 : -100, "music")
		])
	},
	good_luck: function() {
		const Audio = c2.objects.Audio
		const Dialogue = c2.objects.Dialogue
		const Player = c2.objects.Player
		c2.layers.World.visible = false
		c2.layers.Dialogue.visible = true
		if (settings.music) Audio.SetVolume("music", -10)
		c2.do([
			()=>Dialogue.Text = `
good ____
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
good luck
`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
____ luck
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
good luck
`,
			popsfx,
			()=>waitFor(_=>!Keyboard.Space),
			()=>waitFor(_=>Keyboard.Space),
			popsfx,
			()=>Dialogue.Text = ``,
			()=>wait(Math.random()*200+400),
			popsfx,
			()=>{
				c2.layers.World.visible = true
				c2.layers.Dialogue.visible = false
				if (settings.music) Audio.SetVolume("music", 0)
			}
		])
	},
	take_a_breather: function() {
		const Audio = c2.objects.Audio
		const Dialogue = c2.objects.Dialogue
		const Player = c2.objects.Player
		c2.layers.World.visible = false
		c2.layers.Dialogue.visible = true
		if (settings.music) Audio.SetVolume("music", -10)
		c2.do([
			()=>Dialogue.Text = `
take _
_
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
take a
_
`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
take a
breather
`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
take a
_
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
take a
breather
`,
			popsfx,
			()=>waitFor(_=>!Keyboard.Space),
			()=>waitFor(_=>Keyboard.Space),
			popsfx,
			()=>Dialogue.Text = ``,
			()=>wait(Math.random()*200+400),
			popsfx,
			()=>{
				c2.layers.World.visible = true
				c2.layers.Dialogue.visible = false
				if (settings.music) Audio.SetVolume("music", 0)
			}
		])
	},
	this_is_you: function() {
		const Audio = c2.objects.Audio
		const Dialogue = c2.objects.Dialogue
		const Player = c2.objects.Player
		c2.layers.World.visible = false
		c2.layers.Dialogue.visible = true
		if (settings.music) Audio.SetVolume("music", -10)
		c2.do([
			()=>Dialogue.Text = `
this ______



`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
this is ___



`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
this is you



`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
this is you

@@
@@
`,
			popsfx,
			()=>wait(Math.random()*100+100),
			()=>Dialogue.Text = `
this is you



`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
this is you

@@
@@
`,
			popsfx,
			()=>waitFor(_=>!Keyboard.Space),
			()=>waitFor(_=>Keyboard.Space),
			popsfx,
			()=>Dialogue.Text = ``,
			()=>wait(Math.random()*200+100),
			popsfx,
			()=>Dialogue.Text = `
use ___ __ ____
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
use ___ to ____
`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
use ___ to move
`,
			popsfx,
			()=>wait(Math.random()*200+100),
			()=>Dialogue.Text = `
____ ^ ________
use < > to move
____ V ________
`,
			popsfx,
			()=>wait(Math.random()*100+100),
			()=>Dialogue.Text = `
use ___ to move
`,
			popsfx,
			()=>wait(Math.random()*100+50),
			()=>Dialogue.Text = `
____ ^ ________
use < > to move
____ V ________
`,
			popsfx,
			()=>waitFor(_=>!Keyboard.Space),
			()=>waitFor(_=>Keyboard.Space),
			popsfx,
			()=>Dialogue.Text = ``,
			()=>wait(Math.random()*200+400),
			popsfx,
			()=>{
				c2.layers.World.visible = true
				c2.layers.Dialogue.visible = false
				if (settings.music) Audio.SetVolume("music", 0)
			}
		])
	}
}