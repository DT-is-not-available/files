// Highlighted Due Dates
// mccsc.instructure.com

let oldelems = []
;[...document.querySelectorAll(".due")].forEach(e=>{
    if (e.innerText.length > 0) {
        let text = e.innerText.replace(" by",",")
        let old = e.innerText.match(/202\d/)
        let date = new Date("2023"+text.replace(/(am|pm)/,":00"))
        if (text.match("pm")) date = new Date(date.getTime()+43200000)
        let timeTillSubmit = date.getTime() - new Date().getTime()
        if (timeTillSubmit < 0) if (e.parentElement.querySelector(".submission-missing-pill")) {
            e.parentElement.style.background = "#f007"
            e.parentElement.style.color = "maroon"
        } else {
            e.parentElement.style.background = "transparent"
        }
        else if (timeTillSubmit < 86400000) {
            e.parentElement.style.background = "#f707"
            e.parentElement.style.color = "brown"
        }
        else if (timeTillSubmit < 259200000) {
            e.parentElement.style.background = "#ff07"
            e.parentElement.style.color = "#770"
        }
        else {
            e.parentElement.style.background = "#0f07"
            e.parentElement.style.color = "#070"
        }
        if (old) {
            oldelems.push(e.parentElement)
            e.parentElement.style.display = "none"
            e.parentElement.style.background = "#07f7"
            e.parentElement.style.color = "#037"
        }
    }
});

let showOld = document.createElement("button")
showOld.innerText = "Show old"
showOld.addEventListener("click", ()=>{oldelems.forEach(e=>e.style.display="")})
let hideOld = document.createElement("button")
hideOld .innerText = "Hide old"
hideOld .addEventListener("click", ()=>{oldelems.forEach(e=>e.style.display="none")})

addEventListener("load",()=>{

let bar = document.querySelector("#GradeSummarySelectMenuGroup div span")
if (bar && oldelems.length > 0) {
    bar.appendChild(showOld)
    bar.appendChild(hideOld)
}

})

// Improved Dashboard
// mccsc.instructure.com

if (document.location.href == 'https://mccsc.instructure.com/') {

document.querySelector("#not_right_side").style.flexDirection = "column"
document.querySelector("#right-side-wrapper").className = ""
document.querySelector("#right-side-wrapper").style.margin = "20px"
addEventListener("load", _=>{

document.querySelector(".todo-list-header").onclick = e=>{

let a = document.getElementById("planner-todosidebar-item-list")
a.style.display = a.style.display == "none" ? "block" : "none"

let b = document.querySelector(".events_list")
b.style.display = b.style.display == "none" ? "block" : "none"

}
document.querySelector(".todo-list-header").style.cursor = "pointer"
document.querySelector(".todo-list-header").click()

})

let style = `

.ic-DashboardCard {
	width: 215px !important;
}

.ic-DashboardCard__header_hero {
	height: 100px !important;
}

`

document.body.appendChild(document.createElement("style")).innerText = style

}

// Automate cengage
// samcp.cengage.com

let loaded = false
let automate = ()=>{
    if (document.querySelector(".load-wrap.hidden") && !loaded) {
        document.querySelector("button.button.play").click()
        document.querySelector("#apply-button").click()
        loaded = true
    }
    if (!document.querySelector(".load-wrap.hidden")) loaded = false
}
let i
function START() {
    loaded = false
    i = setInterval(automate, 100)
}
function STOP() {
    clearInterval(i)
}