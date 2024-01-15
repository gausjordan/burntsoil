/** Gets a pixel color value at a given mouse position, on click */
let posX = 0;
let posY = 0;


/** On resize - reset */
window.addEventListener("resize", (ev) => {
    canvasSizeFormatterIndex(10, 10);
    let squeezeFactor = canvRef2.width / pixels2.length;
    drawBackdrop(canvRef1.width, canvRef1.height, "sunset");
    drawTerrain(pxMix, squeezeFactor);
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});


/** Keyboard shortcuts */
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "s":
        case "S":
            window.location.href = 'game.html';
            break;
        case "p":
        case "P":
            iterateNumberOfPlayers(event);
            break;
        case "T":
        case "t":
            iterateTankSize(event);
            break;
    }
  }, false);
