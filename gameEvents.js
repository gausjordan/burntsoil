/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasSizeFormatterGame(12, 12);
    drawBackdrop(canvRef1.width, canvRef1.height, "blue");
    drawTerrain(pxMix);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});