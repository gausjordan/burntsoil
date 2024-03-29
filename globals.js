// Check all players, and get the widest screen resolution possible
// Temporarily hardcoded
let maxRes = 6000;
let tankSize = 20;
let blowUpSpeed = 500;
let blastSize = 250;
let globalTerrainColor = "rgba(0, 255, 0, 1)";
let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');
let oldSqueezeFactor; // Old aspect ratio (before resizing)
let squeezeFactor; // Current aspect Ratio
let initPlayersNum = 2;
let initTankSize = 1;
let initBlastSize = 1;
const playerColors = [[255, 0, 0], [0, 160, 0], [180, 0, 180],
                     [180, 180, 0], [0, 180, 180]];