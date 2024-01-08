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


document.addEventListener('keydown', keyDown);


function keyDown(event) {
    const key = event.key;
    switch (event.key) {
        case "ArrowLeft":
            tanks[whoseTurn].angleInc();
            break;
        case "ArrowRight":
            tanks[whoseTurn].angleDec();
            break;
        case "ArrowUp":
            tanks[whoseTurn].powerInc();
            break;
        case "ArrowDown":
            tanks[whoseTurn].powerDec();
            break;
        case "PageUp":
            tanks[whoseTurn].powerInc(100);
            break;
        case "PageDown":
            tanks[whoseTurn].powerDec(100);
            break;
    }
}