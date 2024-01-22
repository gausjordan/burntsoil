// Resize screen height and re-center vertically on resize (virual keyboard)

let mainElement = document.getElementsByTagName("main")[0];
let canv = document.getElementById("canv");
let mHeight = mainElement.getBoundingClientRect().height;
let mWidth = mainElement.getBoundingClientRect().width;
const c = canv.getContext('2d');
let ratio = Math.ceil(window.devicePixelRatio);
canv.width = mWidth / ratio + "px";
canv.height = mHeight / ratio + "px";
c.width = mWidth / ratio + "px";
c.height = mHeight / ratio + "px";

window.addEventListener('resize', function() {
    document.body.style.height = window.innerHeight + 'px';
    document.body.style.height = window.visualViewport.height + 'px';
    
    mainElement.style.height = window.visualViewport.height + 'px';
    
    canv.width = mWidth + "px";
    canv.height = mHeight + "px";
    c.width = canv.width;
    c.height = canv.height;
});


//console.log(mainElement.getBoundingClientRect().height);

horizontalBars();

let r = 255;
let g = 0;
let b = 0;

function horizontalBars(r, g, b) {
    c.style = "rgb(255,0,0)";
    c.fillRect(100,100,2000,2000);
}


