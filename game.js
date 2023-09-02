// Check all players and get the widest screen resolution possible
// Temporarily hardcoded
let blowUpSpeed = 500;
let maxRes = 6000;
let globalTerrainColor = "rgba(0, 255, 0, 1)";
let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
canvasSizeFormatterGame(12, 12);
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');


let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain


/*
// DEBUG: Fixed points

rawPoints1 = [
  {
    "x": 227,
    "y": 40
  },
  {
    "x": 452,
    "y": 939
  },
  {
    "x": 708,
    "y": 71
  },
  {
    "x": 932,
    "y": 778
  },
  {
    "x": 1147,
    "y": 165
  }
];

rawPoints2 = [
  {
    "x": 74,
    "y": 933
  },
  {
    "x": 202,
    "y": 800
  },
  {
    "x": 303,
    "y": 518
  },
  {
    "x": 408,
    "y": 902
  },
  {
    "x": 482,
    "y": 224
  },
  {
    "x": 588,
    "y": 315
  },
  {
    "x": 669,
    "y": 98
  },
  {
    "x": 774,
    "y": 889
  },
  {
    "x": 893,
    "y": 500
  },
  {
    "x": 982,
    "y": 761
  }
];
*/


let normPoints1 = normalizeCps(rawPoints1, maxRes, false);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
let squeezeFactor = canvRef2.width / pxMix.length;

// Backdrop always uses canvas1. Game elements use canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "blue");

drawTerrain(pxMix, squeezeFactor);
