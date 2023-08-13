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
    let tempHeight, tempWidth;
    // let aspect = getCanvSize(canvRef, 8, 8)[0] / getCanvSize(canvRef, 8, 8)[1];

    
        canvRef.width = getCanvSize(canvRef, 8, 8)[0] * ratio;
        canvRef.height = getCanvSize(canvRef, 8, 8)[1] * ratio;
        canvRef.style.width = canvRef.width / ratio + "px";
        canvRef.style.height = canvRef.height / ratio + "px";
        drawBackdrop(canvRef.width, canvRef.height);
        drawTerrain(pixels3);
        document.getElementsByTagName("main")[0].style.maxWidth = "";
        tempWidth = canvRef.width;
        tempHeight = canvRef.height;
    
});


/**
 * Things to do once the document is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
});