var file = window.location.pathname;
var ver = file.substring(file.lastIndexOf(".htm")-2, file.lastIndexOf(".htm"));
document.getElementById("tit").innerHTML = document.getElementById("tit").innerText + ver;
document.getElementById("ha-1").innerHTML = document.getElementById("tit").innerText;