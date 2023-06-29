const runtime = cr_getC2Runtime()

class c2_Object {}

function getAllProperties(obj){
    var allProps = []
      , curr = obj
    do{
        var props = Object.getOwnPropertyNames(curr)
        props.forEach(function(prop){
            if (allProps.indexOf(prop) === -1)
                allProps.push(prop)
        })
    }while(curr = Object.getPrototypeOf(curr))
    return allProps
}

function propNamesToEntries(obj, arr) {
    let entries = []
    for (let i = 0; i < arr.length; i++) {
        entries.push([arr[i], obj[arr[i]]])
    }
    return entries
}

const defaults = getAllProperties({})

function c2toFunc(c2name) {
    return function(...args) {
        c2_callFunction(c2name, args)
    }
}

function getNeEntries(obj) {
	return propNamesToEntries(obj, getAllProperties(obj).filter(function(a){return !defaults.includes(a)}))
}

function buildObjectFromInstance(instance) {
	// need to make a proxy that accesses all these together, binding functions to 'this'
	const object = new c2_Object
	const variables = {}

	const plugin = instance.type.plugin

	// instance vars
	if (instance.instance_var_names) for (let i = 0; i < instance.instance_var_names.length; i++) {
		let iv_name = instance.instance_var_names[i]
		let iv_index = i
		let getter = g=>instance.instance_vars[iv_index]
		let setter = v=>instance.instance_vars[iv_index]=(typeof v === "boolean" ? +v : v)
		Object.defineProperty(object, iv_name, {
			get: getter,
			set: setter,
		})
		Object.defineProperty(variables, iv_name, {
			get: getter,
			set: setter,
		})
	}
	
	// base actions, expressions, and conditions
	for (const [k, v] of getNeEntries(plugin.acts || {})) {
		object[k] = v.bind(instance)
	}
	for (const [k, v] of getNeEntries(plugin.cnds || {})) {
		let getter = k.replace(/^Is/,"")
		let setter = "Set"+getter.replace("Animation","Anim")
		if (object[setter]) {
			Object.defineProperty(object, getter, {
				get: v.bind(instance),
				set: object[setter],
			})
			delete object[setter]
		} else if (v.length == 0) {
			Object.defineProperty(object, k, {
				get: v.bind(instance),
				set: ()=>{},
			})
		} else {
			object[k] = v.bind(instance)
		}
	}
	for (const [k, v] of getNeEntries(plugin.exps || {})) {
		let f = function(...args) {
			let val
			const ret = {}
			ret.set_int = ret.set_float = ret.set_string = ret.set_any = (e)=>{val=e}
			ret.object_class = instance.type
			v.call(instance, ret, ...args)
			return val
		}
		let getter = k
		let setter = "Set"+getter.replace("Animation","Anim")
		if (object[setter] && object[setter].length == 1) {
			Object.defineProperty(object, getter, {
				get: _=>f(),
				set: object[setter],
			})
			delete object[setter]
		} else if (v.length == 1) {
			Object.defineProperty(object, k, {
				get: _=>f(),
				set: ()=>{},
			})
		} else {
			object[k] = f
		}
	}
	
	// behaviors
	if (instance.behavior_insts) for (let i = 0; i < instance.behavior_insts.length; i++) {
		const behavior = {}
		const behavior_inst = instance.behavior_insts[i]
		object[behavior_inst.type.name] = behavior
		// actions, expressions, and conditions
		for (const [k, v] of getNeEntries(behavior_inst.behavior.acts || {})) {
			behavior[k] = v.bind(behavior_inst)
		}
		for (const [k, v] of getNeEntries(behavior_inst.behavior.cnds || {})) {
			if (v.length == 0) {
				Object.defineProperty(behavior, k, {
					get: v.bind(behavior_inst),
					set: ()=>{},
				})
			} else {
				behavior[k] = v.bind(behavior_inst)
			}
		}
		for (const [k, v] of getNeEntries(behavior_inst.behavior.exps || {})) {
			let f = function(...args) {
				let val
				const ret = {}
				ret.set_int = ret.set_float = ret.set_string = ret.set_any = (e)=>{val=e}
				ret.object_class = behavior_inst.type
				v.call(behavior_inst, ret, ...args)
				return val
			}
			if (behavior["Set"+k] && behavior["Set"+k].length == 1) {
				Object.defineProperty(behavior, k, {
					get: _=>f(),
					set: behavior["Set"+k],
				})
				delete behavior["Set"+k]
			} else if (v.length == 1) {
				Object.defineProperty(behavior, k, {
					get: _=>f(),
					set: ()=>{},
				})
			} else {
				behavior[k] = f
			}
		}
	}

	Object.defineProperty(object, "getPairedInstance", {
		value: ()=>instance,
		writable: false,
	})
	Object.defineProperty(object, "ObjectName", {
		value: instance.type.name,
		writable: false,
	})
	Object.defineProperty(object, "Object", {
		value: c2.runtime.types[instance.type.name],
		writable: false,
	})
	Object.defineProperty(object, "InstanceVars", {
		value: variables,
		writable: false,
	})

	instance.update_bbox?.()

	return object
}

const vars = {}
for (let i = 0; i < runtime.all_global_vars.length; i++) {
    const c2var = runtime.all_global_vars[i]
	Object.defineProperty(vars, c2var.name, {
		get: c2var.getValue,
		set: c2var.setValue,
	})
}
var objects = {}

function cleanObjects() {
	c2.objects = objects = {}
	for (const [uid, instance] of Object.entries(c2.runtime.objectsByUid)) {
		if (instance.type.plugin.singleglobal) {
			objects[instance.type.name] = buildObjectFromInstance(instance)
		} else {
			objects[uid] = buildObjectFromInstance(instance)
		}
	}
}

const c2 = {}

c2.Animations = {
	// Linear
	Linear: x=>x,
	// Sine
	EaseInSine: x=> 1 - Math.cos((x * Math.PI) / 2),
	EaseOutSine: x=> Math.sin((x * Math.PI) / 2),
	EaseInOutSine: x=> -(Math.cos(Math.PI * x) - 1) / 2,
	// Quadratic
	EaseInQuad: x=> x**2,
	EaseOutQuad: x=> 1-(1-x)**2,
	EaseInOutQuad: x=> x < 0.5 ? (x**2)*2 : (1-(1-x)**2*2),
	// Cubic
	EaseInCubic: x=> x**3,
	EaseOutCubic: x=> 1-(1-x)**3,
	EaseInOutCubic: x=> x < 0.5 ? (x**3)*4 : (1-(1-x)**3*4),
	// Expo
	EaseInExpo: x=>x === 0 ? 0 : Math.pow(2, 10 * x - 10),
	EaseOutExpo: x=>x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
	EaseInOutExpo: x=>x === 0 ? 0 : (x === 1 ? 1 : (x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2))
}

c2.Animate = function(obj, prop, start, end, time=1, animation=c2.Animations.EaseInOutSine, ...animationParameters) {
	return new Promise(function(resolve) {
		if (start === null) start = obj[prop]
		let ms = time*1000
		let startTime = Date.now()
		let endTime = startTime + ms
		let range = end - start
		let i = setInterval(function(){
			let percent = (ms-(endTime - Date.now()))/ms
			obj[prop] = start + range * animation(percent, ...animationParameters)
		})
		setTimeout(function(){
			clearInterval(i)
			obj[prop] = end
			resolve()
		}, ms)
		obj[prop] = start
	})
}

c2.wait = function(ms) {
	return new Promise(function(resolve) {
		setTimeout(function(){
			resolve()
		}, ms)
	})
}

c2.waitFor = function(cnd) {
	return new Promise(function(resolve) {
		let i
		i = setInterval(function(){
			if (cnd()) {
				clearInterval(i)
				resolve()
			}
		})
	})
}

c2.do = function(...args) {
	return new Promise(function(resolve) {
		if (Array.isArray(args[0])) args = args[0]
		let i = 0
		function do_it(arg = undefined) {
			if (i < args.length) {
				let promise = args[i](arg)
				i++
				if (promise instanceof Promise) {
					promise.then(function(res) {
						do_it(res)
					})
				} else {
					do_it(promise)
				}
			} else resolve()
		}
		do_it()
	})
}

// key codes
{
	c2.KEY_CANCEL = 3;
	c2.KEY_HELP = 6;
	c2.KEY_BACK_SPACE = 8;
	c2.KEY_TAB = 9;
	c2.KEY_CLEAR = 12;
	c2.KEY_RETURN = 13;
	c2.KEY_ENTER = 14;
	c2.KEY_SHIFT = 16;
	c2.KEY_CONTROL = 17;
	c2.KEY_ALT = 18;
	c2.KEY_PAUSE = 19;
	c2.KEY_CAPS_LOCK = 20;
	c2.KEY_ESCAPE = 27;
	c2.KEY_SPACE = 32;
	c2.KEY_PAGE_UP = 33;
	c2.KEY_PAGE_DOWN = 34;
	c2.KEY_END = 35;
	c2.KEY_HOME = 36;
	c2.KEY_LEFT = 37;
	c2.KEY_UP = 38;
	c2.KEY_RIGHT = 39;
	c2.KEY_DOWN = 40;
	c2.KEY_PRINTSCREEN = 44;
	c2.KEY_INSERT = 45;
	c2.KEY_DELETE = 46;
	c2.KEY_0 = 48;
	c2.KEY_1 = 49;
	c2.KEY_2 = 50;
	c2.KEY_3 = 51;
	c2.KEY_4 = 52;
	c2.KEY_5 = 53;
	c2.KEY_6 = 54;
	c2.KEY_7 = 55;
	c2.KEY_8 = 56;
	c2.KEY_9 = 57;
	c2.KEY_SEMICOLON = 59;
	c2.KEY_EQUALS = 61;
	c2.KEY_A = 65;
	c2.KEY_B = 66;
	c2.KEY_C = 67;
	c2.KEY_D = 68;
	c2.KEY_E = 69;
	c2.KEY_F = 70;
	c2.KEY_G = 71;
	c2.KEY_H = 72;
	c2.KEY_I = 73;
	c2.KEY_J = 74;
	c2.KEY_K = 75;
	c2.KEY_L = 76;
	c2.KEY_M = 77;
	c2.KEY_N = 78;
	c2.KEY_O = 79;
	c2.KEY_P = 80;
	c2.KEY_Q = 81;
	c2.KEY_R = 82;
	c2.KEY_S = 83;
	c2.KEY_T = 84;
	c2.KEY_U = 85;
	c2.KEY_V = 86;
	c2.KEY_W = 87;
	c2.KEY_X = 88;
	c2.KEY_Y = 89;
	c2.KEY_Z = 90;
	c2.KEY_CONTEXT_MENU = 93;
	c2.KEY_NUMPAD0 = 96;
	c2.KEY_NUMPAD1 = 97;
	c2.KEY_NUMPAD2 = 98;
	c2.KEY_NUMPAD3 = 99;
	c2.KEY_NUMPAD4 = 100;
	c2.KEY_NUMPAD5 = 101;
	c2.KEY_NUMPAD6 = 102;
	c2.KEY_NUMPAD7 = 103;
	c2.KEY_NUMPAD8 = 104;
	c2.KEY_NUMPAD9 = 105;
	c2.KEY_MULTIPLY = 106;
	c2.KEY_ADD = 107;
	c2.KEY_SEPARATOR = 108;
	c2.KEY_SUBTRACT = 109;
	c2.KEY_DECIMAL = 110;
	c2.KEY_DIVIDE = 111;
	c2.KEY_F1 = 112;
	c2.KEY_F2 = 113;
	c2.KEY_F3 = 114;
	c2.KEY_F4 = 115;
	c2.KEY_F5 = 116;
	c2.KEY_F6 = 117;
	c2.KEY_F7 = 118;
	c2.KEY_F8 = 119;
	c2.KEY_F9 = 120;
	c2.KEY_F10 = 121;
	c2.KEY_F11 = 122;
	c2.KEY_F12 = 123;
	c2.KEY_F13 = 124;
	c2.KEY_F14 = 125;
	c2.KEY_F15 = 126;
	c2.KEY_F16 = 127;
	c2.KEY_F17 = 128;
	c2.KEY_F18 = 129;
	c2.KEY_F19 = 130;
	c2.KEY_F20 = 131;
	c2.KEY_F21 = 132;
	c2.KEY_F22 = 133;
	c2.KEY_F23 = 134;
	c2.KEY_F24 = 135;
	c2.KEY_NUM_LOCK = 144;
	c2.KEY_SCROLL_LOCK = 145;
	c2.KEY_COMMA = 188;
	c2.KEY_PERIOD = 190;
	c2.KEY_SLASH = 191;
	c2.KEY_BACK_QUOTE = 192;
	c2.KEY_OPEN_BRACKET = 219;
	c2.KEY_BACK_SLASH = 220;
	c2.KEY_CLOSE_BRACKET = 221;
	c2.KEY_QUOTE = 222;
	c2.KEY_META = 224;
}

c2.Keyboard = {}

document.addEventListener("keydown", function(e){
	c2.Keyboard[e.code] = true
})
document.addEventListener("keyup", function(e){
	c2.Keyboard[e.code] = false
})

c2.loadingText = c2toFunc("setLoadingText")
c2.finishLoading = c2toFunc("finishLoading")
c2.loadingBar = c2toFunc("setLoadingBar")
c2.runtime = runtime
c2.vars = vars
c2.plugins = {}
c2.layouts = c2.runtime.layouts
c2.gotoLayout = c2.runtime.doChangeLayout
c2.layers = {}
c2.layout = c2.runtime.running_layout
c2.as = function(self, cb) {
	cb.call(self)
}
let toload = 0
let maxload = 0
c2.scripts = {}
let onload = function(src, cb) {
	toload--
	if (toload == 0) {
		cb()
	} else {
		c2.loadingText(`${src} (${maxload-toload}/${maxload})`)
		c2.loadingBar(maxload-toload, maxload)
	}
}
c2.loadJS = function(arr, cb) {
	for (let i = 0; i < arr.length; i++) {
		let name = arr[i]
		let src = name+".js"
		fetch(src).then(e=>e.text()).then(e=>{
			c2.scripts[name] = function(){return Function("c2", e).call(this, c2)}
			onload(src, cb)
		})
		toload++
		maxload++
	}
	c2.loadingText(`Loading... (${maxload-toload}/${maxload})`)
	c2.loadingBar(maxload-toload, maxload)
}
for (const [k, v] of Object.entries(cr.plugins_)) {
	c2.plugins[k] = v.prototype
}
c2.behaviors = {}
for (const [k, v] of Object.entries(cr.behaviors)) {
	c2.behaviors[k] = v.prototype
}
c2.objects = objects
class c2_Event extends Array {
	emit() {
		for (let i = 0; i < this.length; i++) {
			this[i]()
		}
	}
}
c2.events = {
	LayoutStart: new c2_Event,
	LayoutEnd: new c2_Event,
	Tick: new c2_Event,
}
window.c2_exposed = {}
window.c2_exposed.Tick = ()=>c2.events.Tick.emit()
c2.types = c2.runtime.types

for (const [k, v] of Object.entries(c2.runtime.types)) {
	c2["obj_"+k] = v
}

c2.forEachObject = function(cb) {
	for (const [uid, obj] of Object.entries(c2.objects)) {
		cb.call(obj)
	}
}

const newInstanceListener = function(func){
	let newfunc = function(...args) {
		let instance = func.bind(runtime)(...args)
		// console.log("[NEW INSTANCE ALERT:",instance,"]")
		if (instance.type.plugin.singleglobal) {
			objects[instance.type.name] = buildObjectFromInstance(instance)
		} else {
			objects[instance.uid] = buildObjectFromInstance(instance)
		}
		return instance
	}
	return newfunc.bind(runtime)
}
const delInstanceListener = function(func){
	let newfunc = function(instance) {
		// console.log("[INSTANCE DELETED:",instance,"]")
		delete objects[instance.uid]
		let ret = func.bind(runtime)(instance)
		return ret
	}
	return newfunc.bind(runtime)
}
const layoutChangeListener = function(func){
	let newfunc = function(layout) {
		// console.log("[LAYOUT CHANGED:",layout,", RESETTING INSTANCES]")
		c2.events.LayoutEnd.emit()
		cleanObjects()
		let ret = func.bind(runtime)(layout)
		// rebind layers
		c2.layers = []
		c2.layout = c2.runtime.running_layout
		for (let i = 0; i < c2.runtime.running_layout.layers.length; i++) {
			let layer = c2.runtime.running_layout.layers[i]
			c2.layers[layer.name] = layer
		}
		for (let i = 0; i < c2.runtime.running_layout.layers.length; i++) {
			let layer = c2.runtime.running_layout.layers[i]
			c2.layers[i] = layer
		}
		c2.events.LayoutStart.emit()
		return ret
	}
	return newfunc.bind(runtime)
}
const conditionSubstitute = function(func) {
	return function() {
		try {
			return func.call(runtime) || {
				type: 0,
				inverted: false,
				current_event: {
					orblock: false
				}
			}
		} catch (e) {
			return {
				type: 0,
				inverted: false,
				current_event: {
					orblock: false
				}
			}
		}
	}
}
function watch(obj, prop, getter, setter) {
    let val = obj[prop]
    obj.__defineGetter__(prop, function(){return getter(val)})
    obj.__defineSetter__(prop, function(newval){return val = setter(newval)})
}
watch(runtime, "createInstance", newInstanceListener, e=>e)
watch(runtime, "createInstanceFromInit", newInstanceListener, e=>e)
watch(runtime, "DestroyInstance", delInstanceListener, e=>e)
watch(runtime, "doChangeLayout", layoutChangeListener, e=>e)
watch(runtime, "getCurrentCondition", conditionSubstitute, e=>e)
watch(runtime, "getCurrentEventStack", conditionSubstitute, e=>e)
c2.spawn = function(object, layer=0, x=undefined, y=undefined) {
	return c2.objects[c2.runtime.createInstance(object, layer, x, y).uid]
}
c2.destroy = c2.runtime.DestroyInstance

if (document.domain === "localhost") window.DEBUG = c2

cleanObjects()

c2.loadJS(["main", "player_tick", "obj_start", "object_tick", "events"], function(){
	c2.finishLoading()
	c2.scripts.main()
})