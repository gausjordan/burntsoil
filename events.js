/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvCtx.fillStyle = "rgb(255,255,255)";
    canvCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvRef, ev).x;
    posY = getMousePos(canvRef, ev).y;
    colorValueAtPos = canvCtx.getImageData(posX, posY, 1, 1).data;
});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasSizeFormatter();
    drawBackdrop(canvRef.width, canvRef.height);
    drawTerrain(pxMix);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});