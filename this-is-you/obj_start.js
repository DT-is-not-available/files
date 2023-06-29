const vars = c2.vars
const Audio = c2.objects.Audio
const Player = c2.objects.Player

if (this.Object == c2.obj_dialogue) {
	c2.objects.Dialogue = this
	c2.layers.Dialogue.visible = false
}

if (this.Object == c2.obj_trophy) {
	c2.objects.Trophy = this
}

if (this.Object == c2.obj_timer) {
	c2.objects.Timer = this
}

if (this.Object == c2.obj_deathcount) {
	c2.objects.DeathCount = this
}

if (this.Object == c2.obj_fragmentbar) {
	c2.objects.FragmentBar = this
}

if (this.Object == c2.obj_SolidTiles) {
	c2.objects.Solid = this
}

if (this.Object == c2.obj_player) {
	this.Image = c2.spawn(c2.obj_PlayerImage, c2.layers.World, this.X, this.Y)
	c2.objects.Player = this
	this.XV = 0
	this.YV = 0
	this.Gravity = 1
	this.Inactive = false
	this.freezeCamera = false
	this.isBouncing = false
	this.Fragments = 0

	this.Checkpoint = 0
	if (vars.settings.checkpoint > 0) {
		this.Checkpoint = c2.objects[vars.settings.checkpoint]
		this.SetPosToObject(this.Checkpoint)
		this.X += 7.5
		this.Y += 7.5
	}

	this.ReverseGravity = 1
	this.FlipGravity = function(flipped) {
		if (this.ReverseGravity == 1 && flipped || this.ReverseGravity == -1 && !flipped) {
			this.ReverseGravity *= -1
			this.YV *= -1
			this.Jumped = false
		}
	}
	
	this.Jumped = false

	this.Visible = false
	this.canWallBoost = false

	this.WallBuffer = 0
	this.WallTimer = 0
	this.WallPos = 0
	
	this.FloorTimer = 0
}
if (this.Object == c2.obj_CameraZone) {
	c2.objects.iterables.push(this)
}
if (this.Object == c2.obj_EventZone) {
	c2.objects.iterables.push(this)
}
if (this.Object == c2.obj_Checkpoint) {
	c2.objects.iterables.push(this)
}
if (this.Object == c2.obj_SemiSolid) {
	c2.objects.iterables.push(this)
}
if (this.Object == c2.obj_LevelFragment) {
	c2.objects.iterables.push(this)
}
if (this.Object == c2.obj_pausedText) {
	c2.objects.iterables.push(this)
	let originX = this.X
	this.onPause = function() {

	}
	this.onUnpause = function() {

	}
}
if (this.Object == c2.obj_pausimation) {
	c2.objects.iterables.push(this)
	let originY = this.Y
}
if (this.Object == c2.obj_Spawnpoint) {
	Player.Checkpoint = this
}