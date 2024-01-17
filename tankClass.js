class Tank {

    constructor(r, g, b, name, xPercent, angle) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.angle = angle;
        this.xPercent = xPercent;
        this.name = name;
        this.power = 200;
        this.xPos = Math.round(maxRes / 100 * this.xPercent);
        this.midBottomPoint = null;
        this.yPos;

        // Magic numbers 15 and 9 are expressed in "tankSize" units,
        // and represent width (15) and length (9) of a tank
        this.yPos = Math.round(
                pxMix[Math.round(this.xPos + 15*tankSize)] + (9 * tankSize)
            );

        // If the terrain is too low, raise the tank to a 0 ground level
        if ( this.yPos < tankSize * 9 ) {
            this.yPos = tankSize * 9;
        }
            
        this.midBottomPoint = {
            x: (this.xPos +  15 * tankSize),
            y: Math.round( (this.yPos - (9 * tankSize)) )
        }

        // Creates a hole in the terrain, in such a way that at least 50% of
        // the tank's length lies on the flat ground. The loop overshoots by 10
        // tankSize units in order to blend out sharp rectangular carves.
        for (let i = -10 * tankSize; i < 30 * tankSize + 10 * tankSize; i++) {
            
            let bottom = this.midBottomPoint.y;
            let top = pxMix[this.xPos + i];
            let weight1 = -i / (10 * tankSize); // Linear drops from 1 to 0
            let weight2 = -(i - 40 * tankSize) / (10 * tankSize);

            if ( bottom < top ) {
                if (i < 0) {
                    pxMix[this.xPos + i] =
                        bottom + (pxMix[this.xPos+i] - bottom) * weight1;
                } else if (i > 30 * tankSize) {
                    pxMix[this.xPos + i] =
                        bottom + (pxMix[this.xPos+i] - bottom) * (1-weight2);
                } else
                    pxMix[this.xPos + i] = bottom;
            }

        }
    }

    angleInc() {
        if (this.angle == 180) {
            this.angle = 0;
            this.clearTank();
            this.drawTank();
        }
        else {
            this.angle += 1;
            updateStatusBar();
            this.clearTank();
            this.drawTank();
        }
    }

    angleDec() {
        if (this.angle == 0) {
            this.angle = 180;
            this.clearTank();
            this.drawTank();
        } else {
            this.angle -= 1;
            updateStatusBar();
            this.clearTank();
            this.drawTank();
        }
    }

    powerInc(value) {
        if (typeof value == "undefined")
            value = 2;
        if (this.power + value >= 1000)
            this.power = 1000;
        else 
            this.power += value;
        updateStatusBar();
    }

    powerDec(value) {
        if (typeof value == "undefined")
            value = 2;
        if (this.power - value <= 0)
            this.power = 0;
        else 
            this.power -= value;
        updateStatusBar();
    }
  
    async fire() {
        isBlocked = true;
        removeFireListeners();
        await this.computeTrajectory();
        whoseTurn = (whoseTurn == numberOfPlayers - 1) ? 0 : (whoseTurn + 1);
        updateStatusBar();
        restoreFireListeners();
        isBlocked = false;
    }
    
    computeTrajectory(whoseTurn) {
        // DELETE
        // let cannonBase = {x: (xPos + 15 * tankSize), y: (yPos + 0  * tankSize) };
        
        // Coordinates of the missile position in the previoes step
        let prevMissile;

        // Y position corrected for (new) aspect ratio after resizing
        let yPos = this.yPos;
        let angle = this.angle;
        let radianAngle = -angle*Math.PI/180;
        let xPos = this.xPos;
        let topX = 15 + Math.cos(Math.PI / 180 * angle) * 16.5
        let topY = 1  - Math.sin(Math.PI / 180 * angle) * 16.5

                
        // Where the tip of the cannon's barrel is (the center).
        // "+ 1 * tankSize" compensates for missile width
        let muzzle = { x: (xPos + topX * tankSize),
                       y: (yPos - topY * tankSize) + 1 * tankSize };
        
        let y0 = (yPos + topY * tankSize * squeezeFactor )
                 - (1*tankSize*squeezeFactor);

        let x0 = ((xPos * squeezeFactor + topX * tankSize * squeezeFactor)
                 - (1*tankSize*squeezeFactor)) / squeezeFactor;

        x0 = muzzle.x;
        y0 = muzzle.y;


        // DEBUG
        // canvCtx2.fillRect(
        //     (muzzle.x * squeezeFactor) - 1 * tankSize * squeezeFactor,
        //     (canvRef2.height - (muzzle.y * squeezeFactor) - 1 * tankSize * squeezeFactor),
        //     2 * tankSize * squeezeFactor,
        //     2 * tankSize * squeezeFactor
        // )


        return new Promise(resolve => {
            let startTime = performance.now();
            canvCtx2.fillStyle = "rgb(255,255,255)";
            let missile = { x: x0, y: y0 };
            let dx = Math.cos(radianAngle) * this.power/5;
            let dy = Math.sin(radianAngle) * this.power/5;
            let i = 0;

            async function drawProjectile(timeStamp) {
                // Animation loops until something unsets the isBlocked flag
                if ( isBlocked ) {
                    i++;
                    
                    if (prevMissile)
                        //clearMissile(prevMissile);

                    // Draw current missile position
                    canvCtx2.fillRect(
                        missile.x * squeezeFactor,
                        canvRef2.height - missile.y * squeezeFactor,
                        2 * squeezeFactor * tankSize,
                        2 * squeezeFactor * tankSize);

                    prevMissile = { x: missile.x, y: missile.y };
                    // missile.x = missile.x + dx / squeezeFactor;
                    // missile.y = missile.y - (dy/squeezeFactor) - i;

                    missile.x = missile.x + dx;
                    missile.y = missile.y - dy - i;

                    // If a missile hits terrain or goes off screen...
                    if (false && missile.y <= pxMix[Math.round(Math.round(missile.x))]
                       *squeezeFactor) {
                            clearMissile(missile);
                            await explosionOnGround(missile.x,
                                missile.y/squeezeFactor, 250);
                            resolve();
                        } else if (missile.y < 0) {
                            clearMissile(missile);
                            resolve();
                        } else {
                             requestAnimationFrame(drawProjectile);
                    }
                } else {
                    resolve();
                }

                /**
                 * Clears a missile dot from a given position. Cleared area is
                 * 1px wider than {missle size} to cover antialiasing artifacts
                 * @param {*} prevMissle an object containing x & y coordinates
                 */
                function clearMissile(prevMissle) {
                    canvCtx2.clearRect(
                        (prevMissile.x * squeezeFactor) - 1,
                        (canvRef2.height - prevMissile.y * squeezeFactor) -1,
                        3 * squeezeFactor * tankSize,
                        3 * squeezeFactor * tankSize);
                }
            }
            requestAnimationFrame(drawProjectile);
        })
    }
    

    /** If solid ground underneath is gone, the tank falls down */
    aftermathCheck() {
        let begin = this.xPos;
        let end = begin + (tankSize * 30);
        let isGrounded = false;
        let terrainLevel;
        let tankBottom;
        let highest = 0;

        // Loop through the X (length) of a tank
        // While at it, memorize the height of the highest peak
        for (let i=begin; i < end; i++) {
            
            if (pxMix[i] > highest)
                highest = pxMix[i];
            
            terrainLevel = canvRef2.height - pxMix[i];
            tankBottom = this.yPos + tankSize * 9;

            // If there is ground directly below the tank at any point
            if (Math.abs(terrainLevel - tankBottom) < 0.5) {
                isGrounded = true;
            }
        }
        
        if (!isGrounded) {
          
            this.yPos = highest - (tankSize * 9);
            
            canvCtx2.clearRect(
                this.xPos * squeezeFactor,
                canvRef2.height - (this.yPos * squeezeFactor)
                    + (tankSize * squeezeFactor * 7),
                tankSize * squeezeFactor * 30,
                -4000);                        

            this.drawTank();
            
        }
    }

    // DELETE
    // calculateCorrectedY() {

    //     this.yPos = this.yPos;

    //     this.yPos = Math.round(
    //         canvRef2.height
    //         - (pxMix[Math.round(this.xPos + 15 * tankSize)] 
    //         + 9 * tankSize)
    //         * squeezeFactor
    //     );
    // }

    drawTank() {
        
        // tankSize relative to screen size
        let tSizeRel = tankSize * squeezeFactor;

        // Relative X and Y positions of a tank; for rendering only.
        // Magic number -1 prevents a 1px shift due to subtraction.
        let yPosRel = canvRef2.height - 1 - this.yPos * squeezeFactor;
        let xPosRel = this.xPos * squeezeFactor;
        
        // Caterpillar tracks
        let styleString;
        styleString = `rgba(${this.r-150},${this.g-150},${this.b-150},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(xPosRel + 0  * tSizeRel, 6   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 1  * tSizeRel, 7.5 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 3  * tSizeRel, 8.5 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 5  * tSizeRel, 9   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 25 * tSizeRel, 9   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 27 * tSizeRel, 8.5 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 29 * tSizeRel, 7.5 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 30 * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 1  * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.fill();

        // Wheels and sprockets
        styleString = `rgba(${this.r+80},${this.g+100},${this.b+100},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.arc(
            xPosRel + 3.5 * tSizeRel,
            yPosRel + 6 * tSizeRel,
            0.7 * tSizeRel,
            0,
            2 * Math.PI);
        canvCtx2.arc(
            xPosRel + 26.5 * tSizeRel,
            yPosRel + 6 * tSizeRel,
            0.7 * tSizeRel,
            0,
            2 * Math.PI);
        canvCtx2.fill();
        canvCtx2.beginPath();
            for (let i = 1; i < 4; i += 0.65) {
                canvCtx2.arc(
                xPosRel + i * 6.5 * tSizeRel,
                yPosRel + 6.8 * tSizeRel,
                1.8 * tSizeRel,
                0,
                2 * Math.PI);
            }
        canvCtx2.fill();
        
        // Fender
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(xPosRel + 0    * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 0.4  * tSizeRel, 4.3 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 2    * tSizeRel, 3   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 28   * tSizeRel, 3   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 29.6 * tSizeRel, 4.3 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 30   * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 30   * tSizeRel, 7   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 28   * tSizeRel, 7   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 27.5 * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 2.5  * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 2    * tSizeRel, 7   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 0    * tSizeRel, 7   * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 0    * tSizeRel, 5   * tSizeRel + yPosRel);
        canvCtx2.fill();
    
        // Turret
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(xPosRel + 7    * tSizeRel, 4 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 7.5  * tSizeRel, 2 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 8    * tSizeRel, 1 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 9    * tSizeRel, 0 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 21   * tSizeRel, 0 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 22   * tSizeRel, 1 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 22.5 * tSizeRel, 2 * tSizeRel + yPosRel);
        canvCtx2.lineTo(xPosRel + 23   * tSizeRel, 4 * tSizeRel + yPosRel);
        canvCtx2.fill();

        // Cannon
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();        
        // Center of the turret, middle of the barrel at the bottom
        let bottomX = 15;
        let bottomY = 1;
        // Top of the cannon, centerline
        let topX = 15 + Math.cos(Math.PI / 180 * this.angle) * 15;
        let topY = 1 - Math.sin(Math.PI / 180 * this.angle) * 15;
        // Slope & unit vector calculation
        let slope = (topY - bottomY) / (topX - bottomX);
        let perpSlope = -(1/slope);
        let xSlope = 1;
        let ySlope = perpSlope;
        let magnitude = Math.sqrt(xSlope*xSlope + perpSlope*perpSlope);
        let normXslope = xSlope / magnitude;
        let normYslope = ySlope / magnitude;
        if (this.angle == 0) {
            normXslope = 0;
            normYslope = 1;
        }
        canvCtx2.moveTo(
            xPosRel + (bottomX - 1 * normXslope) * tSizeRel,
            yPosRel + (bottomY - 1 * normYslope) * tSizeRel);

        canvCtx2.lineTo(
            xPosRel + (topX - 1 * normXslope) * tSizeRel,
            yPosRel + (topY - 1 * normYslope) * tSizeRel);

        canvCtx2.lineTo(
            xPosRel + (topX + 1 * normXslope) * tSizeRel,
            yPosRel + (topY + 1 * normYslope) * tSizeRel);

        canvCtx2.lineTo(
            xPosRel + (bottomX + 1 * normXslope) * tSizeRel,
            yPosRel + (bottomY + 1 * normYslope) * tSizeRel);
        canvCtx2.fill();

        canvCtx2.fillStyle = "rgb(0,255,255)";


        // DEBUG Tank Bounding Box
        // canvCtx2.fillStyle = "rgb(255,255,0)";
        // canvCtx2.fillRect(
        //     this.xPos * squeezeFactor,
        //     this.yPos,
        //     tankSize * squeezeFactor * 30,
        //     1);
        // canvCtx2.fillRect(
        //     this.xPos * squeezeFactor,
        //     this.yPos + (tankSize * squeezeFactor * 9),
        //     tankSize * squeezeFactor * 30,
        //     1);
        // canvCtx2.fillRect(
        //     this.xPos * squeezeFactor,
        //     this.yPos,
        //     1,
        //     tankSize * squeezeFactor * 9);
        // canvCtx2.fillRect(
        //     (this.xPos + tankSize * 30) * squeezeFactor,
        //     this.yPos,
        //     1,
        //     tankSize * squeezeFactor * 9);

    }

    clearTank() {
        canvCtx2.clearRect(
            this.xPos * squeezeFactor,
            // -2px overhead clears antialiasing residue
            (canvRef2.height - this.yPos*squeezeFactor)
            - (14 * tankSize * squeezeFactor) - 2,
            30 * tankSize * squeezeFactor,
            22.5 * tankSize * squeezeFactor);
    }
}
