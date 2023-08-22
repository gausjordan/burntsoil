// Check all players and get the widest screen resolution possible
// Temporarily hardcoded
let maxRes = 6000;

let colorValueAtPos = null;
let ratio = Math.ceil(window.devicePixelRatio);
let canvRef1 = document.getElementById("canvas1");
let canvRef2 = document.getElementById("canvas2");
canvasSizeFormatterGame(12, 12);
let canvCtx1 = canvRef1.getContext('2d');
let canvCtx2 = canvRef2.getContext('2d');


let rawPoints1 = generateCps(5);    // low frequency terrain
let rawPoints2 = generateCps(10);   // high frequency terrain


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


let normPoints1 = normalizeCps(rawPoints1, maxRes, false);
let normPoints2 = normalizeCps(rawPoints2, maxRes, false);
let pixels1 = cpsToPxs(normPoints1);
let pixels2 = cpsToPxs(normPoints2);

// Two sets of (pixel-defined) curves merged into one
let pxMix = pixels1.map( (e, index) => { return e + 0.2 * pixels2[index]; });
let squeezeFactor = canvRef2.width / pxMix.length;

// Draws graphics. Backdrop is always on canvas1, game elements are on canvas2.
drawBackdrop(canvRef1.width, canvRef1.height, "blue");


canvCtx2.fillStyle = "rgba(0,255,0,1)";

explode(4700, 900, 250, squeezeFactor);


drawCircle();

canvCtx2.fillStyle = "rgba(0,255,0,1)";

drawTerrain(pxMix, squeezeFactor);



// TODO:
// Provjeri delta time i pomakni objekt za onolko kolko vremena ima!
// Klasican delta-time.


// var id;
// var counter = 0;

// function doStuff() {
//   canvCtx2.fillRect(640, 420, 40+counter, 20+counter);
//   counter++;

//   if (counter < 60) {
//      //id = 
//      requestAnimationFrame(doStuff);
//      //console.log(id);
//   }
// }
// requestAnimationFrame(doStuff);







/*
 
// PRIMJER ANIMACIJE S MDN WEB DOCSA

const element = document.getElementById("some-element-you-want-to-animate");
let start, previousTimeStamp;   // undefined
let done = false;               // flag

function step(timeStamp) {
  if (start === undefined) {
    start = timeStamp;
  }
  const elapsed = timeStamp - start;

  if (previousTimeStamp !== timeStamp) {
    // Math.min() is used here to make sure the element stops at exactly 200px
    const count = Math.min(0.1 * elapsed, 200);
    element.style.transform = `translateX(${count}px)`;
    if (count === 200) done = true;
  }

  if (elapsed < 2000) {
    // Stop the animation after 2 seconds
    previousTimeStamp = timeStamp;
    if (!done) {
      window.requestAnimationFrame(step);
    }
  }
}

window.requestAnimationFrame(step);

*/