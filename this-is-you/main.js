let scrollX = 0
let scrollY = 0
c2.vars.settings = localStorage["insertgames:this_is_you"] ? JSON.parse(localStorage["insertgames:this_is_you"]) : {
	music: true,
	sfx: true,
	checkpoint: -1,
	trytoload: true,
	fragments: [false, false, false, false, false],
	time: 0,
	deaths: 0
}
if (c2.vars.settings.trytoload) {
	if (localStorage["cloudvariables:p4-@This is You.sb3"]) {
		let old_data = JSON.parse(localStorage["cloudvariables:p4-@This is You.sb3"])
		let checkpointMap = {
			"2,0": 12,
			"3,0": 35,
			"3,-1": 36,
			"4,-1": 37,
			"4,0": 28,
			"4,1": 54,
			"3,1": 69,
			"3,2": 71,
			"4,2": 82,
			"5,2": 101,
			"6,2": 102,
			"7,2": 128,
			"8,2": 146,
			"9,2": 150,
			"9,3": 165,
			"9,4": 181,
			"10,4": 181,
			"11,4": 206,
			"11,3": 208,
			"11,2": 225,
			"12,2": 253,
			"12,3": 257,
			"13,3": 295,
			"13,2": 301,
			"14,2": 329,
			"15,2": 337,
			"16,2": 338,
			"17,2": 352,
			"18,2": 396,
			"19,2": 551,
			"20,2": 479,
		}
		c2.vars.settings.checkpoint = checkpointMap[old_data["☁ saved cp room x"]+","+old_data["☁ saved cp room y"]]
		delete c2.vars.settings.trytoload
	}
}
let save = c2.vars.save = function() {
	c2.vars.settings.checkpoint = c2.objects.Player.Checkpoint.UID
	c2.vars.settings.time = c2.vars.time
	c2.vars.settings.deaths = c2.vars.deaths
	localStorage["insertgames:this_is_you"] = JSON.stringify(c2.vars.settings)
}
c2.vars.events = c2.scripts.events()

function resetEffects() {
	c2.layers.World.effect_params[1][0] = 1
	c2.layers.World.effect_params[2][0] = 0 // 0.25
	c2.layers.World.effect_params[3][0] = 0 // 0.25
	c2.layers.World.effect_params[4][0] = 0 // 0.05
	c2.layers.World.effect_params[5][1] = 1 // 0.5
	c2.layers.World.effect_params[5][2] = 1 // 0.9
}

c2.events.LayoutStart.push(function() {
	resetEffects()
	c2.vars.CameraX = 0
	c2.vars.CameraY = 0
	c2.vars.Solids = []
	c2.vars.CameraOffsetX = 0
	c2.vars.CameraOffsetY = 0
	c2.vars.CameraShake = 0
	c2.vars.currentMusic = "none"
	c2.vars.time = c2.vars.settings.time
	c2.vars.dt = 0
	c2.vars.deaths = c2.vars.settings.deaths
	c2.vars.Paused = false
	c2.vars.pausedOption = 0
	const settings = c2.vars.settings
	document.addEventListener("keydown", function(event) {
		if (!c2.layers.World.visible || c2.objects.Player.Inactive) return
		if (event.code == "Escape" || (event.code == "Space" && c2.vars.pausedOption == 0 && c2.vars.Paused)) {
			c2.vars.pausedOption = 0
			if (c2.vars.Paused) {
				if (settings.music) Audio.SetVolume("music", 0)
				c2.vars.Paused = false
				c2.layers.PauseScreen.visible = false
				for (let i = 0; i < c2.objects.iterables.length; i++) {
					c2.as(c2.objects.iterables[i], c2.objects.iterables[i].onUnpause || (_=>0))
				}
			} else {
				if (settings.music) Audio.SetVolume("music", -10)
				c2.vars.Paused = true
				c2.layers.PauseScreen.visible = true
				for (let i = 0; i < c2.objects.iterables.length; i++) {
					c2.as(c2.objects.iterables[i], c2.objects.iterables[i].onPause || (_=>0))
				}
			}
		}
		if (!c2.vars.Paused) return
		if (event.code == "KeyW" || event.code == "ArrowUp") {
			if (c2.vars.pausedOption > 4) c2.vars.pausedOption = 4
			if (c2.vars.Paused) c2.vars.pausedOption --
			if (c2.vars.pausedOption < 0) c2.vars.pausedOption = 0
		}
		if (event.code == "KeyS" || event.code == "ArrowDown") {
			if (c2.vars.Paused) c2.vars.pausedOption ++
			if (c2.vars.pausedOption > 4) c2.vars.pausedOption = 4
		}
		if (event.code == "KeyA" || event.code == "ArrowLeft") {
			if (c2.vars.Paused && c2.vars.pausedOption > 4) c2.vars.pausedOption --
			if (c2.vars.pausedOption < 0) c2.vars.pausedOption = 0
		}
		if (event.code == "KeyD" || event.code == "ArrowRight") {
			if (c2.vars.Paused && c2.vars.pausedOption >= 4) c2.vars.pausedOption ++
			if (c2.vars.pausedOption > 5) c2.vars.pausedOption = 5
		}
		if (event.code == "Space") {
			if (c2.vars.pausedOption == 1) {
				settings.music = !settings.music
				if (settings.music) Audio.SetVolume("music", -10)
				else Audio.SetVolume("music", -100)
			}
			if (c2.vars.pausedOption == 2) settings.sfx = !settings.sfx
			if (c2.vars.pausedOption == 3 && confirm("Are you 100% sure you want to reset ALL progress")) {
				settings.checkpoint = -1
				settings.fragments = [false, false, false, false, false]
				settings.time = 0
				settings.deaths = 0
				localStorage["insertgames:this_is_you"] = JSON.stringify(c2.vars.settings)
				window.location.reload()
			}
			if (c2.vars.pausedOption != 3) save()
			if (c2.vars.pausedOption == 4) window.open("https://discord.gg/X3bPan9U4G")
			if (c2.vars.pausedOption == 5) window.open("https://www.youtube.com/channel/UC_N0MiNEsCretIVZV_xuThg")
		}
	})
	c2.objects.iterables = []
	c2.forEachObject(c2.scripts.obj_start)
	for (let i = 0; i < c2.objects.iterables.length; i++) {
		c2.as(c2.objects.iterables[i], c2.scripts.object_tick)
	}
	scrollX = c2.vars.CameraX
	scrollY = c2.vars.CameraY
})

let prevtime = Date.now()
function tick() {
	c2.vars.dt = Date.now() - prevtime
	prevtime = Date.now()
	if (c2.layers.World.visible == true) c2.vars.time += c2.vars.dt
	if (c2.Keyboard.F5) location.reload()
	c2.as(c2.objects.Player, c2.scripts.player_tick)
	c2.vars.Solids = []
	for (let i = 0; i < c2.objects.iterables.length; i++) {
		c2.as(c2.objects.iterables[i], c2.scripts.object_tick)
	}
	c2.vars.CameraX += c2.vars.CameraOffsetX
	c2.vars.CameraY += c2.vars.CameraOffsetY
	c2.vars.CameraOffsetX = Math.round(c2.vars.CameraOffsetX)
	c2.vars.CameraOffsetY = Math.round(c2.vars.CameraOffsetY)
	if (c2.vars.CameraOffsetX != 0) c2.vars.CameraOffsetX -= c2.vars.CameraOffsetX/Math.abs(c2.vars.CameraOffsetX)
	if (c2.vars.CameraOffsetY != 0) c2.vars.CameraOffsetY -= c2.vars.CameraOffsetY/Math.abs(c2.vars.CameraOffsetY)
	scrollX += (c2.vars.CameraX - scrollX)/10
	scrollY += (c2.vars.CameraY - scrollY)/10
	c2.layout.scrollToX(scrollX + c2.vars.CameraShake * (1-Math.random()*2)/3)
	c2.layout.scrollToY(scrollY + c2.vars.CameraShake * (1-Math.random()*2)/3)
	if (c2.vars.CameraShake > 0) c2.vars.CameraShake--
}
c2.events.Tick.push(tick)

const Audio = c2.objects.Audio
Audio.PreloadByName(1, "jump")
Audio.PreloadByName(1, "boost")
Audio.PreloadByName(1, "die")
Audio.PreloadByName(1, "airjump")
Audio.PreloadByName(1, "bigjump")
Audio.PreloadByName(1, "swim")
Audio.PreloadByName(1, "collect")
Audio.PreloadByName(1, "pop")
Audio.PreloadByName(1, "click")
Audio.PreloadByName(1, "chord")
Audio.PreloadByName(1, "final notes")
Audio.PreloadByName(1, "count")
Audio.PreloadByName(1, "kaboom")

Audio.PreloadByName(1, "lvl1")
Audio.PreloadByName(1, "lvl2")
Audio.PreloadByName(1, "lvl3")
Audio.PreloadByName(1, "lvl4")
Audio.PreloadByName(1, "lvl5")
Audio.PreloadByName(1, "lvl6")
Audio.PreloadByName(1, "lvl7&8")
Audio.PreloadByName(1, "learn")
Audio.PreloadByName(1, "purple")
Audio.PreloadByName(1, "slippery")
Audio.PreloadByName(1, "bo'o'o'wa'a'")
Audio.PreloadByName(1, "help im drowning")
Audio.PreloadByName(1, "flipped")
Audio.PreloadByName(1, "i can see my house from here")
Audio.PreloadByName(1, "breath")
Audio.PreloadByName(1, "think")
Audio.PreloadByName(1, "get-ready")