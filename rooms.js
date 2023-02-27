(function(Scratch) {
	// document.querySelector("canvas").parentElement
	'use strict'

	String.template = function(...args) {
		let t = [...args]
		let Z = [...t[0].raw]
		while (Z.length > 1) {
			let c = Z.pop()
			let b = t.pop()
			let a = Z.pop()
			Z.push(a+b+c)
		}
		return Z[0]
	}

	function dialog(title, ...content) {
		let html = `
		<div class="modal_modal-overlay">
			<div style="width: 500px" class="modal_modal-content" tabindex="-1" role="dialog" aria-label="Custom">
				<div class="box_box_-Ky8F" dir="ltr" style="flex-direction: column; flex-grow: 1;">
					<div class="modal_header_tU9KR">
						<div id="BOXTITLE" class="modal_header-item_WVv7i modal_header-item-title_DkMtw">Dialog</div>
						<div class="modal_header-item_WVv7i modal_header-item-close_MA3cE">
							<div id="BOXCLOSE" aria-label="Close" class="close-button_close-button_hsJUK close-button_large_UcF64" role="button" tabindex="0"><img class="close-button_close-icon_rixGf" src="static/assets/07abd61d8902b05e7a284918f4a4932c.svg"></div>
						</div>
					</div>
					<div id="BOXCONTENT" class="prompt_body_Lv10o box_box_-Ky8F">
						
					</div>
				</div>
			</div>
		</div>
		`
		document.body.append(EL`div.ReactModalPortal`().$({innerHTML: html}))

		document.getElementById("BOXCLOSE").onclick = closeDialog
		document.getElementById("BOXTITLE").innerText = title
		document.getElementById("BOXCONTENT").append(...content)
	}

	function closeDialog() {
		document.querySelector("div.ReactModalPortal").remove()
	}

	function EL(...args) {
		let a = String.template(...args)
		let tag = a.replace(/[#\.][^#\.]+/gm, "").trimEnd().trimStart()
		let id = a.match(/[#][^#\.]+/gm)
		let classes = a.match(/[\.][^#\.]+/gm)
		let elem = document.createElement(tag)
		if (id) elem.id = id.join(" ").replaceAll("#","")
		if (classes) elem.className = classes.join(" ").replaceAll(".","")
		elem.$ = function(props) {
			for (const [k,v] of Object.entries(props) ) {
				elem[k]=v
			}
			return elem
		}
		elem.on = function(...a) {
			elem.addEventListener(...a)
			return elem
		}
		return function(...e) {
			elem.append(...e)
			return elem
		}
	}

	let stage, stagevars
	let vars = {}

	function newVar(varname, namespace, defaultValue) {
		if (!stagevars[namespace+"."+varname]) {
			stage.createVariable(namespace+"."+varname, namespace+"."+varname, '', false)
			stagevars[namespace+"."+varname].value = defaultValue
		}
		stagevars[namespace+"."+varname].type = "hidden"
		vars[varname] = stagevars[namespace+"."+varname]
	}

	Scratch.vm.runtime._events.PROJECT_LOADED.push(function(){
		stage = Scratch.vm.runtime._stageTarget
		stagevars = stage.variables

		newVar("rooms", "scratchrooms", JSON.stringify({

		}))

		document.querySelector(".stage-selector_stage-selector_6Qx9w").addEventListener("dblclick", ROOMS_UI.prototype.rooms)
		document.querySelector(".stage-selector_header_ANp8P").style.height = "1.65em"
		document.querySelector(".stage-selector_stage-selector_6Qx9w").append(
			EL`div.stage-selector_label_+NSVk`(
				EL`a`("Edit Rooms").$({style:"color: var(--text-primary, hsla(225, 15%, 40%, 1))"})
				.on('click', ROOMS_UI.prototype.rooms)
			)
		)
	})

	document.body.append(EL`style`(`

	.modal_modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 510;
		background-color: var(--ui-modal-overlay, hsla(0, 100%, 65%, 0.9));
	}

	.modal_modal-content {
		margin: 100px auto;
		outline: none;
		border: 4px solid hsla(0, 100%, 100%, 0.25);
		padding: 0;
		border-radius: 0.5rem;
		user-select: none;
		font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
		color: hsla(225, 15%, 40%, 1);
		overflow: hidden;
	}

	.sr-selectable {
		padding: 10px;
		width: 100%;
		cursor: pointer;
	}
	.sr-selectable:hover {
		background: #7773;
	}

	#BOXCONTENT * {
		box-sizing: border-box;
	}

	`))

	class ROOMS_UI {

		getInfo() {
			return {

				id: 'scratchroomsUI',

				name: 'Rooms',
				color1: "#555555",
				color2: "#ffffff",
				color3: "#ffffff",

				blocks: [
					{
						opcode: 'rooms',
						blockType: Scratch.BlockType.REPORTER,
						text: 'Open Rooms UI',
						disableMonitor: true,
					},
				]
			};
		}

		rooms(ARGS) {
			let rooms = JSON.parse(vars.rooms.value)
			let roomslist = EL`div`().$({style:"overflow: auto; height: 350px; border: 1px solid #777; border-radius: 5px"})
			for (const [k, v] of Object.entries(rooms)) {
				roomslist.append(
					EL`div.sr-selectable`(
						k
					)
				)
			}
			dialog("Rooms", 
				roomslist,
				EL`br`(),
				EL`div.prompt_button-row_YDrcg.box_box_-Ky8F`(
					EL`button.prompt_ok-button_i8oBR`("Make a Room")
					.on("click", function(){
						closeDialog()
						dialog("New Room",
							EL`div.prompt_label_TDFyn`("New room name:"),
							EL`input.prompt_variable-name-text-input_NyJ9m`(),
							EL`div.prompt_cloud-option_loDIG.prompt_button-row_YDrcg.box_box_-Ky8F`(
								EL`button.prompt_cancel-button_HVW97`("Cancel").on("click", function(){
									closeDialog()
									ROOMS_UI.prototype.rooms()
								}),
								EL`button.prompt_ok-button_i8oBR`("OK").on("click", function(){
									closeDialog()
									ROOMS_UI.prototype.rooms()
								})
							)
						)
					})
				)
			)
		}
	}
	
	class ScratchRooms {

		getInfo() {
			return {

				id: 'scratchrooms',

				name: 'Rooms',
				color1: "#999999",
				color2: "#777777",

				blocks: [
					{
						opcode: 'saveroom',
						blockType: Scratch.BlockType.COMMAND,
						text: 'save room [id]',
						arguments: {
							id: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Room 1'
							}
						}
					},
					{
						opcode: 'loadroom',
						blockType: Scratch.BlockType.COMMAND,
						text: 'load room [id]',
						arguments: {
							id: {
								type: Scratch.ArgumentType.STRING,
								defaultValue: 'Room 1'
							}
						}
					},
				]
			};
		}

		saveroom(ARGS) {
			
		}
		loadroom(ARGS) {
			
		}
	}

	//Scratch.extensions.register(new ROOMS_UI());
	Scratch.extensions.register(new ScratchRooms());

})(Scratch);