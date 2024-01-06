let posX = 0;
let posY = 0;
let lock = false;

// Do not delete, it will be required
/*
window.addEventListener("click", (ev) => {
    posX = getMousePos(canvRef2, ev).x * ratio;
    posY = getMousePos(canvRef2, ev).y * ratio;
    corrX = posX / squeezeFactor;
    corrY = (canvRef2.height - posY) / squeezeFactor;
    if (!lock) {
        lock = true;
        explosionOnGround(corrX, corrY, 250);        
    }
});
*/


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    oldSqueezeFactor = squeezeFactor;
    squeezeFactor = canvRef2.width / pxMix.length;
    canvasSizeFormatterGame(12, 12);
    squeezeFactor = canvRef2.width / pxMix.length;
    drawBackdrop(canvRef1.width, canvRef1.height, "blue");
    drawTerrain(pxMix, squeezeFactor);
    tanks.forEach(tank => tank.drawTank());
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});


document.addEventListener('keydown', function(event) {
    const key = event.key;
    switch (event.key) {
        case "ArrowLeft":
            tanks[0].angleInc();
            tanks[0].drawTank();

            canvCtx2.fillStyle = "rgb(255,255,255)";
            
            canvCtx2.clearRect(
                tanks[0].xPos * squeezeFactor,
                tanks[0].yCorrPos - 500 * tankSize * squeezeFactor,
                30 * tankSize * squeezeFactor,
                505 * tankSize * squeezeFactor);
            
            tanks[0].drawTank();
            break;
            
        case "ArrowRight":
            tanks[0].angleDec();
            canvCtx2.clearRect(
                tanks[0].xPos * squeezeFactor,
                tanks[0].yCorrPos - 500 * tankSize * squeezeFactor,
                30 * tankSize * squeezeFactor,
                505 * tankSize * squeezeFactor);

            tanks[0].drawTank();
            break;
        case "ArrowUp":
            // Up pressed
            break;
        case "ArrowDown":
            // Down pressed
            break;
    }
});