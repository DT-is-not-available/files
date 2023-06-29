const vars = c2.vars
const settings = c2.vars.settings
const Audio = c2.objects.Audio
const Player = c2.objects.Player

function SFX(sfx) {
	if (!c2.vars.settings.sfx) return
	Audio.Stop(sfx)
	Audio.PlayByName(0, sfx, 0, 0, sfx)
}

if (this.Object == c2.obj_EventZone) {
	if (this.getPairedInstance().contains_pt(Math.floor(Player.X), Math.floor(Player.Y)) && !this.used) {
		this.used = true
		console.log(this.id)
		c2.vars.events[this.id]()
	}
}

if (this.Object == c2.obj_CameraZone) {
	if (Player.freezeCamera || Player.FreeCamera) return
	if (this.getPairedInstance().contains_pt(Math.floor(Player.X), Math.floor(Player.Y))) {
		if (this.lockX && !Player.FreeCameraX) {
			if (this.Width > 465) {
				if (vars.CameraX < this.X - (this.Width - 465)/2) {
					vars.CameraX = this.X - (this.Width - 465)/2
				}
				if (vars.CameraX > this.X + (this.Width - 465)/2) {
					vars.CameraX = this.X + (this.Width - 465)/2
				}
			} else vars.CameraX = this.X
		}
		if (this.lockY && !Player.FreeCameraY) {
			if (this.Height > 345) {
				if (vars.CameraY < this.Y - (this.Height - 345)/2) {
					vars.CameraY = this.Y - (this.Height - 345)/2
				}
				if (vars.CameraY > this.Y + (this.Height - 345)/2) {
					vars.CameraY = this.Y + (this.Height - 345)/2
				}
			} else vars.CameraY = this.Y
		}
		if (vars.currentMusic != this.music && this.changeMusic && !Audio.freezeMusic) {
			let playbackPoint = Audio.PlaybackTime("music")
			Audio.Stop("music")
			Audio.PlayByName(1, this.music, 1, settings.music ? 0 : -100, "music")
			Audio.Seek("music", playbackPoint)
			vars.currentMusic = this.music
		}
	}
}

if (this.Object == c2.obj_Checkpoint) {
	if (this.getPairedInstance().contains_pt(Math.floor(Player.X), Math.floor(Player.Y)) && Player.Checkpoint != this) {
		Player.Checkpoint = this
		c2.spawn(c2.obj_CheckpointParticles, c2.layers.World, this.X, this.Y)
		c2.vars.save()
	}
}

if (this.Object == c2.obj_LevelFragment) {
	if (settings.fragments[this.id-1]) {
		const index = c2.objects.iterables.indexOf(this)
		if (index > -1) {
			c2.objects.iterables.splice(index, 1)
		}
		this.Destroy()
		Player.Fragments ++
		Player["Fragment"+this.id] = true
	} else if (Math.sqrt((this.X - Player.X)**2 + (this.Y - Player.Y)**2) < 15) {
		c2.spawn(c2.obj_FragmentParticles, c2.layers.World, this.X, this.Y)
		vars.CameraShake = 15
		const index = c2.objects.iterables.indexOf(this)
		if (index > -1) {
			c2.objects.iterables.splice(index, 1)
		}
		this.Destroy()
		SFX("collect")
		Player.Fragments ++
		Player["Fragment"+this.id] = true
		settings.fragments[this.id-1] = true
		vars.save()
	}
}

if (this.Object == c2.obj_SemiSolid) {
	if ((Player.ReverseGravity == 1 || this.forceNormal) && !this.forceAnti) {
		if (Player.Y - Player.YV < this.Y - 7) vars.Solids.push(this)
	} else {
		if (Player.Y + Player.YV > this.Y + this.Height + 7) vars.Solids.push(this)
	}
}

function timeDisplay() {
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
	return `${hours}:${minutes.toString().padStart(2, 0)}:${seconds.toString().padStart(2, 0)}.${ms.toString().padStart(3, 0)}`
}

if (this.Object == c2.obj_pausedText) {
	if (this.displayID == 1) this.Text = timeDisplay()
	if (this.displayID == 2) this.Text = vars.deaths + " deaths"
	if (this.optionNumber == 0) {
		if (vars.pausedOption == this.optionNumber)
			this.Text = "RESUME"
		else
			this.Text = "resume"
	}
	if (this.optionNumber == 1) {
		if (vars.pausedOption == this.optionNumber)
			this.Text = `MUSIC; ${vars.settings.music ? "ON" : "OFF"}`
		else
			this.Text = `music: ${vars.settings.music ? "on" : "off"}`
	}
	if (this.optionNumber == 2) {
		if (vars.pausedOption == this.optionNumber)
			this.Text = `SFX; ${vars.settings.sfx ? "ON" : "OFF"}`
		else
			this.Text = `sfx: ${vars.settings.sfx ? "on" : "off"}`
	}
	if (this.optionNumber == 3) {
		if (vars.pausedOption == this.optionNumber)
			this.Text = "RESET PROGRESS"
		else
			this.Text = "reset progress"
	}
	if (this.optionNumber == 4 || this.optionNumber == 5) {
		if (vars.pausedOption == this.optionNumber)
			this.Text = "+"
		else
			this.Text = "="
	}
}