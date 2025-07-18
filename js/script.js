const botonNav = document.getElementById("botonNav");

function toggleNavbar() {
    const ulNav = document.getElementById("ulNav");
    const body = document.getElementById("body");
    ulNav.classList.toggle("active");
    body.classList.toggle("block-scroll");
}