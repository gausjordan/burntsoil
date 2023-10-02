// Check all players and get the widest screen resolution possible
// Temporarily hardcoded
let maxRes = 6000;
let tankSize = 20;
let blowUpSpeed = 500;
let globalTerrainColor = "rgba(0, 255, 0, 1)";
let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');