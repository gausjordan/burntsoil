/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;
window.addEventListener("click", (ev) => {
    canvasCtx.fillStyle = "rgb(255,255,255)";
    canvasCtx.fillRect(0, 0, 200, 50);
    posX = getMousePos(canvRef, ev).x;
    posY = getMousePos(canvRef, ev).y;
    colorValueAtPos = canvasCtx.getImageData(posX, posY, 1, 1).data;
});


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvRef.width = getCanvasSize(canvRef, 8, 8)[0] * ratio;
    canvRef.height = getCanvasSize(canvRef, 8, 8)[1] * ratio;
    canvRef.style.width = canvRef.width / ratio + "px";
    canvRef.style.height = canvRef.height / ratio + "px";
    drawBackdrop(canvRef.width, canvRef.height);
    drawTerrain(canvRef.width, canvRef.height, terrain, oldWidth, oldHeight);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});