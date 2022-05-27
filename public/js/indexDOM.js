const w = window;
const d = document;

w.onload = function () {
    d.querySelector("#loader").classList.add("ocultar");
    d.querySelector(".hidden").classList.remove("hidden");
}