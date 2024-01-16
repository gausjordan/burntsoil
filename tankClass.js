class Tank {

    constructor(r, g, b, name, xPercent, angle) {
        this.angle = angle;
        this.r = r;
        this.g = g;
        this.b = b;
        this.xPercent = xPercent;
        this.name = name;
        this.power = 200;
        this.xPos = Math.round(maxRes / 100 * this.xPercent);
        this.midBottomPoint = null;
        this.yCorrPos;

        // Magic numbers 15, 9 and 4.5 are expressed in "TankSize" units,
        // and represent width (15), length (9) or mid-point (4.5) of the tank
        this.yPos = Math.round(
                canvRef2.height
                - (pxMix[Math.round(this.xPos + 15 * tankSize)] 
                + 9 * tankSize)
                * squeezeFactor
            );

        // If the terrain is too low, raise the tank to a 0 ground level
        if ( (canvRef2.height - this.yPos) < (tankSize * squeezeFactor * 9) ) {
            this.yPos = canvRef2.height - (tankSize * squeezeFactor * 9);
        }
            
        this.midBottomPoint = {
            x: (this.xPos +  15 * tankSize),
            y: Math.round( (this.yPos + (9 * tankSize) * squeezeFactor) )
        }

        // Creates a hole in the terrain, in such a way that at least 50% of
        // the tank's length lies on the flat ground. The loop overshoots by 10
        // tankSize units in order to blend out sharp rectangular carves.
        for (let i = 0 - 10*tankSize; i < 30 * tankSize + 10*tankSize; i++) {
            
            let bottom = canvRef2.height - this.midBottomPoint.y;
            let top = pxMix[this.xPos + i] * squeezeFactor;
            let weight1 = -i/(10*tankSize); // Drops from 1 to 0
            let weight2 = -(i-40*tankSize)/(10*tankSize);

            if ( bottom < top ) {
                if (i < 0) {
                    pxMix[this.xPos + i] =
                        bottom/squeezeFactor
                        + (pxMix[this.xPos+i] - bottom/squeezeFactor)
                                * weight1;
                } else if (i > 30 * tankSize) {
                    pxMix[this.xPos + i] =
                        bottom/squeezeFactor
                        + (pxMix[this.xPos+i] - bottom/squeezeFactor)
                                * (1-weight2);
                } else
                    pxMix[this.xPos + i] = bottom / squeezeFactor;
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
        // Coordinates of the missile position in the previoes step
        let prevMissile;

        // Y position corrected for (new) aspect ratio after resizing
        let yCorrPos = this.yCorrPos;

        let angle = this.angle;
        let radianAngle = -angle*Math.PI/180;
        let xPos = this.xPos;
        let topX = 15 + Math.cos(Math.PI / 180 * angle) * 16;
        let topY = 1 - Math.sin(Math.PI / 180 * angle) * 16;

        // Where's the tip of the cannon barrel (x0, y0)?
        let y0 = (yCorrPos + topY * tankSize * squeezeFactor)
                 - (1*tankSize*squeezeFactor);
        let x0 = ((xPos * squeezeFactor + topX * tankSize * squeezeFactor)
                 - (1*tankSize*squeezeFactor)) / squeezeFactor;

        return new Promise(resolve => {
            let startTime = performance.now();
            canvCtx2.fillStyle = "rgb(255,255,255)";
            let missile = { x: x0, y: canvRef2.height - y0 };
            let dx = Math.cos(radianAngle) * this.power/20;
            let dy = Math.sin(radianAngle) * this.power/20;
            let i = 0;

            async function drawProjectile(timeStamp) {
                // Animation loops until something unsets the isBlocked flag
                if ( isBlocked ) {
                    i++;
                    
                    if (prevMissile)
                        clearMissile(prevMissile);

                    // Draw current missile position
                    canvCtx2.fillRect(
                        missile.x * squeezeFactor,
                        canvRef2.height - missile.y,
                        2 * squeezeFactor * tankSize,
                        2 * squeezeFactor * tankSize);

                    prevMissile = { x: missile.x, y: missile.y };
                    missile.x = missile.x + dx / squeezeFactor;
                    missile.y = missile.y - dy - i*0.5;

                    // If a missile hits terrain or goes off screen...
                    if (missile.y <= pxMix[Math.round(Math.round(missile.x))]
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
                        (canvRef2.height - prevMissile.y) -1,
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
            
            terrainLevel = canvRef2.height - pxMix[i]*squeezeFactor;
            tankBottom = this.yPos + (squeezeFactor  * tankSize * 9);

            // If there is ground directly below the tank at any point
            if (Math.abs(terrainLevel - tankBottom) < 0.5) {
                isGrounded = true;
            }
        }
        
        if (!isGrounded) {
          
            this.yPos = canvRef2.height - highest*squeezeFactor
                        - (squeezeFactor  * tankSize * 9);
            
            canvCtx2.clearRect(
                this.xPos * squeezeFactor,
                //this.yPos,
                this.yPos + (tankSize * squeezeFactor * 9),
                tankSize * squeezeFactor * 30,
                -1000);                        

            this.drawTank();
            
            //canvCtx2.fillRect(0, canvRef2.height - (highest*squeezeFactor), 1000, 2);
            
        }
    }




    drawTank() {

        // May be corrected for aspect ratio later, if required
        this.yCorrPos = this.yPos;

        // In the event of resizing in the middle of the game, this
        // calculates new Y position values (for rendering purposes only).
        // Initial 'Y' coordinates of each tank remain intact.
        if (oldSqueezeFactor != null && oldSqueezeFactor != squeezeFactor) {
            
            drawTerrain(pxMix, squeezeFactor);

            this.yCorrPos = Math.round(
                canvRef2.height
                - (pxMix[Math.round(this.xPos + 15 * tankSize)] 
                + 9 * tankSize)
                * squeezeFactor
            );
        }

        // Caterpillar tracks
        let styleString;
        let sF = squeezeFactor;
        let tS = tankSize;
        tS *= sF;
        styleString = `rgba(${this.r-150},${this.g-150},${this.b-150},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(this.xPos * sF + 0  * tS, 6   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 1  * tS, 7.5 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 3  * tS, 8.5 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 5  * tS, 9   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 25 * tS, 9   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 27 * tS, 8.5 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 29 * tS, 7.5 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 30 * tS, 5   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 1  * tS, 5   * tS + this.yCorrPos);
        canvCtx2.fill();

        // Wheels and sprockets
        styleString = `rgba(${this.r+80},${this.g+100},${this.b+100},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.arc(
            this.xPos * sF + 3.5 * tS,
            this.yCorrPos + 6 * tS,
            0.7 * tS,
            0,
            2 * Math.PI);
        canvCtx2.arc(
            this.xPos * sF + 26.5 * tS,
            this.yCorrPos + 6 * tS,
            0.7 * tS,
            0,
            2 * Math.PI);
        canvCtx2.fill();
        canvCtx2.beginPath();
            for (let i = 1; i < 4; i += 0.65) {
                canvCtx2.arc(
                this.xPos * sF + i * 6.5 * tS,
                this.yCorrPos + 6.8 * tS,
                1.8 * tS,
                0,
                2 * Math.PI);
            }
        canvCtx2.fill();
        
        // Fender
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(this.xPos * sF + 0    * tS, 5   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 0.4  * tS, 4.3 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 2    * tS, 3   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 28   * tS, 3   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 29.6 * tS, 4.3 * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 30   * tS, 5   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 30   * tS, 7   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 28   * tS, 7   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 27.5 * tS, 5   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 2.5  * tS, 5   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 2    * tS, 7   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 0    * tS, 7   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 0    * tS, 5   * tS + this.yCorrPos);
        canvCtx2.fill();
    
        // Turret
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();
        canvCtx2.moveTo(this.xPos * sF + 7  * tS, 4   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 7.5  * tS, 2   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 8  * tS, 1   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 9  * tS, 0   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 21 * tS, 0   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 22 * tS, 1   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 22.5 * tS, 2   * tS + this.yCorrPos);
        canvCtx2.lineTo(this.xPos * sF + 23 * tS, 4   * tS + this.yCorrPos);
        canvCtx2.fill();

        // Barrel
        styleString = `rgba(${this.r},${this.g},${this.b},1)`;
        canvCtx2.fillStyle = styleString;
        canvCtx2.beginPath();        
        // Center of the turret, middle of the barrel at the bottom
        let bottomX = 15;
        let bottomY = 1;
        // Top of the barrel, centerline
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
            this.xPos * sF + (bottomX - 1 * normXslope) * tS,
            this.yCorrPos + (bottomY - 1 * normYslope) * tS);

        canvCtx2.lineTo(
            this.xPos * sF + (topX - 1 * normXslope) * tS,
            this.yCorrPos + (topY - 1 * normYslope) * tS);

        canvCtx2.lineTo(
            this.xPos * sF + (topX + 1 * normXslope) * tS,
            this.yCorrPos + (topY + 1 * normYslope) * tS);

        canvCtx2.lineTo(
            this.xPos * sF + (bottomX + 1 * normXslope) * tS,
            this.yCorrPos + (bottomY + 1 * normYslope) * tS);
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
            tanks[whoseTurn].xPos * squeezeFactor,
            tanks[whoseTurn].yCorrPos - 500 * tankSize * squeezeFactor,
            30 * tankSize * squeezeFactor,
            505 * tankSize * squeezeFactor);
    }
}


