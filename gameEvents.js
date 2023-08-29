let posX = 0;
let posY = 0;
let lock = false;
window.addEventListener("click", (ev) => {
    posX = getMousePos(canvRef2, ev).x * ratio;
    posY = getMousePos(canvRef2, ev).y * ratio;
    corrX = posX / squeezeFactor;
    corrY = (canvRef2.height - posY) / squeezeFactor;
    if (!lock) {
        lock = true;
        explosionOnGround(corrX, corrY, 250);

        /*
            let pr = new Promise ( resolve => { 
                setTimeout( () => { resolve() }, 1200);
            });

            pr
                .then( () => console.log("Yo"))
                .then( () => animiranaSlova.innerHTML="Opa maco!")
                .then( () => setTimeout( () => alert("Ha!"), 1000));
        */

        
        // explode(1000, 500, 250, squeezeFactor);
        //drawTerrain(pxMix, squeezeFactor);
        
    }
});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasSizeFormatterGame(12, 12);
    squeezeFactor = canvRef2.width / pxMix.length;
    drawBackdrop(canvRef1.width, canvRef1.height, "blue");
    drawTerrain(pxMix, squeezeFactor);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});