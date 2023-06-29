// constants and functions

if (!c2.layers.World.visible) return

const vars = c2.vars
const Audio = c2.objects.Audio
const Keyboard = c2.Keyboard

function SFX(sfx, vol=0) {
	if (!c2.vars.settings.sfx) return
	Audio.Stop(sfx)
	Audio.PlayByName(0, sfx, 0, vol, sfx)
}

// Controls

const JUMP = (
	Keyboard.KeyW ||
	Keyboard.ArrowUp ||
	Keyboard.Space
) && !this.NoInput

const DOWN = (
	Keyboard.KeyS ||
	Keyboard.ArrowDown
) && !this.NoInput

const LEFT = (
	Keyboard.KeyA ||
	Keyboard.ArrowLeft
) && !this.NoInput

const RIGHT = (
	Keyboard.KeyD ||
	Keyboard.ArrowRight
) && !this.NoInput

this.MV = 0

if (!(this.Inactive || vars.Paused)) {
	if (LEFT && this.WallBuffer == 0 || this.WallBuffer < 0) this.MV--
	if (RIGHT && this.WallBuffer == 0 || this.WallBuffer > 0) this.MV++

	if (this.WallBuffer > 0) this.WallBuffer--
	if (this.WallBuffer < 0) this.WallBuffer++

	if (this.WallTimer > 0) this.WallTimer--
	if (this.WallTimer < 0) this.WallTimer++

	if (this.FloorTimer > 0) this.FloorTimer--

	if (!this.isJumping && JUMP) {
		this.isJumping = true
		this.canJump = true
	}

	if (!JUMP) {
		this.isJumping = false
		this.canJump = false
	}

	// Update Velocity

	this.YV += this.Gravity/2
	if (this.YV > 0 && DOWN) this.YV += this.Gravity/4

	if (this.Jumped && this.YV < -6 * this.Gravity && !JUMP) {
		this.Jumped = false
		this.YV = -6 * this.Gravity
	}

	// Collision Detection

	let ice = false

	this.Y += this.YV/2 * this.ReverseGravity
	let oldY = this.Y

	if (!DOWN) for (let i = 0; i < vars.Solids.length; i++) {
		vars.Solids[i].SetCollisions(1)
	}

	ice = this.IsOverlapping(c2.obj_Ice)
	if (this.YV > 0) this.Motion.PushOutSolid(this.ReverseGravity == 1 ? 2 : 3 /*up*/)
	if (this.Y != oldY) {
		// hit floor
		this.canWallBoost = false
		c2.vars.CameraOffsetY += this.YV/3
		this.YV = 0
		this.Jumped = false
		this.FloorTimer = 6
	}

	if (JUMP && this.FloorTimer > 0) {
		this.FloorTimer = 0
		c2.vars.CameraOffsetY += this.YV/3 - 5
		this.YV = -12 * this.Gravity
		SFX("jump")
		this.canJump = false
		this.Jumped = true 
	}

	if (this.MV == 0) {
		if (!ice) {
			if (this.XV > 0.5) this.XV -= 0.5
			else if (this.XV < -0.5) this.XV += 0.5
			else this.XV = 0
		}
	} else if ((this.XV < 5 || ice) && this.MV > 0 || (this.XV > -5 || ice) && this.MV < 0) this.XV += this.MV/(ice ? 4 : 2)

	if (5 < Math.abs(this.XV)) {
		this.XV -= this.XV / Math.abs(this.XV) / 18
	}

	oldY = this.Y

	if (!DOWN) for (let i = 0; i < vars.Solids.length; i++) {
		vars.Solids[i].SetCollisions(0)
	}

	ice = this.IsOverlapping(c2.obj_Ice)
	if (this.YV < 0) this.Motion.PushOutSolid(this.ReverseGravity == -1 ? 2 : 3 /*down*/)
	if (this.Y != oldY) {
		// hit ceiling
		this.YV = 0
	}
	oldY = this.Y

	this.X += this.XV/2
	let oldX = this.X

	ice = this.IsOverlapping(c2.obj_Ice)
	if (this.XV < 0) this.Motion.PushOutSolid(5/*right*/)
	if (this.X != oldX) {
		// hit left wall
		this.XV = 0
		if (ice) {
			if (this.YV < 0) this.YV -= this.Gravity/4
		} else {
			if (this.YV > 0) this.YV *= 0.85
		}
		this.WallTimer = 6
		this.WallPos = this.X
	}
	if (this.WallTimer > 0) {
		if (this.canJump && JUMP && !this.IsOverlapping(c2.obj_Water)) {
			if (this.YV < -6 * this.Gravity && this.canWallBoost) {
				this.YV += -9 * this.Gravity
				SFX("boost")
				c2.vars.CameraOffsetY += this.YV
			} else {
				if (this.YV > -9 * this.Gravity) this.YV = -9 * this.Gravity
				SFX("jump")
			}
			this.canWallBoost = false
			this.XV = 9
			c2.vars.CameraOffsetX += 5
			c2.vars.CameraOffsetY -= 5
			this.WallBuffer = 4
			this.canJump = false
			this.WallTimer = 0
			this.X = this.WallPos
		}
	}
	oldX = this.X

	ice = this.IsOverlapping(c2.obj_Ice)
	if (this.XV > 0) this.Motion.PushOutSolid(4/*left*/)
	if (this.X != oldX) {
		// hit right wall
		this.XV = 0
		if (ice) {
			if (this.YV < 0) this.YV -= this.Gravity/4
		} else {
			if (this.YV > 0) this.YV *= 0.85
		}
		this.WallTimer = -6
		this.WallPos = this.X
	}
	if (this.WallTimer < 0) {
		if (this.canJump && JUMP && !this.IsOverlapping(c2.obj_Water)) {
			if (this.YV < -6 * this.Gravity && this.canWallBoost) {
				this.YV += -9 * this.Gravity
				SFX("boost")
				c2.vars.CameraOffsetY += this.YV
			} else {
				if (this.YV > -9 * this.Gravity) this.YV = -9 * this.Gravity
				SFX("jump")
			}
			this.canWallBoost = false
			this.XV = -9
			c2.vars.CameraOffsetX -= 5
			c2.vars.CameraOffsetY -= 5
			this.WallBuffer = -4
			this.canJump = false
			this.WallTimer = 0
			this.X = this.WallPos
		}
	}
	oldX = this.X

	// Death detection

	if (this.IsOverlapping(c2.obj_Death) || Keyboard.KeyR) {
		this.Inactive = true
		this.Image.Visible = false
		c2.spawn(c2.obj_DeathParticles, c2.layers.World, this.X, this.Y)
		this.SetPosToObject(this.Checkpoint)
		this.X += 7.5
		this.Y += 7.5
		SFX("die", -5)
		c2.vars.CameraShake = 15
		this.XV = 0
		this.YV = 0
		setTimeout(()=>{
			this.Inactive = false
			this.Image.Visible = true
		}, 500)
		setTimeout(()=>c2.spawn(c2.obj_RespawnParticles, c2.layers.World, this.X, this.Y), 250)
		vars.deaths ++
		c2.vars.save()
	}

	// Bounce detection

	if (this.IsOverlapping(c2.obj_Bounce)) {
		this.YV = -18 * this.Gravity
		this.canJump = false
		this.Jumped = false
		this.canWallBoost = true
		if (!this.isBouncing) {
			SFX("bigjump")
			c2.vars.CameraOffsetY -= 10
		}
		this.isBouncing = true
	} else {
		this.isBouncing = false
	}

	// Airjump detection

	if (this.IsOverlapping(c2.obj_AirJump)) {
		if (this.canJump && JUMP) {
			this.YV = -12 * this.Gravity
			SFX("airjump")
			this.canJump = false
			this.Jumped = true 
			this.canWallBoost = false
			c2.vars.CameraOffsetY -= 5
		}
	}

	// Adjust Gravity

	if (this.IsOverlapping(c2.obj_Water)) {
		this.XV *= 0.9
		this.YV *= 0.975
		this.Gravity = 0.5
		if (this.canJump) {
			SFX('swim')
			if (this.YV > 11 * this.Gravity) {
				this.YV = 0
			} else {
				this.YV -= 11 * this.Gravity
			}
			this.canJump = false
		}
	} else {
		this.Gravity = 1
	}
	
	if (this.IsOverlapping(c2.obj_Gravity)) {
		this.FlipGravity(true)
	} else {
		this.FlipGravity(false)
	}

	// Update hitbox direction

	this.Angle = (1 - this.ReverseGravity) * 90

	// And after everything, check if its over or not

	if (this.IsOverlapping(c2.obj_trophy)) {
		if (this.Fragments == 5 && false) {
			// initiate looming horizon
			c2.vars.events.fake_out()
		} else {
			// end the game prematurely
			c2.vars.events.early_end()
		}
	}

	// Update player image

	if (!this.Inactive) {
		if (this.IsOverlapping(c2.obj_Water)) {
			this.Image.SetTowardPosition(this.X, this.Y + 15)
		} else {
			this.Image.SetTowardPosition(this.X, this.Y)
		}
	
		this.Image.X = this.X
		this.Image.Y = this.Y
	
		this.Image.Width += (15 + Math.abs(this.YV/1.7) - this.Image.Width)
		this.Image.Height += (Math.max(15 - Math.abs(this.YV/1.7), 3) - this.Image.Height)
	}
}

if (!this.freezeCamera) {
	if (!this.freezeCameraX) vars.CameraX = this.X
	if (!this.freezeCameraY) vars.CameraY = this.Y
}