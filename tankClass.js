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
            pxMix[Math.round(this.xPos + 15*tankSize)] + (9 * tankSize));

        // If the terrain is too low, raise the tank to a 0 ground level
        if ( this.yPos < tankSize * 9 )
             this.yPos = tankSize * 9;
            
        this.midBottomPoint = {
            x: (this.xPos +  15 * tankSize),
            y: Math.round( (this.yPos - (9 * tankSize)) )
        }

        // Creates a hole in the terrain, in such a way that at least 50% of
        // the tank's length lies on the flat ground. The loop overshoots by
        // 10 tankSize units in order to blend out sharp rectangular carves.
        for (let i = -10 * tankSize; i < 30 * tankSize + 10 * tankSize; i++)
        {
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
        } else {
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
  

    /** What happens when a tank fires a missile */
    async fire() {
        isBlocked = true;
        removeFireListeners();
        let trajectory = this.computeTrajectory();
        await this.animateMissile(trajectory[0]);
        switch (trajectory[1]) {
            
            // Terrain blast
            case 1:
            case 2:
                await explosionOnGround(
                    trajectory[0].at(-1).x,
                    trajectory[0].at(-1).y,
                    blastSize);
                break;
            
            // Missile went way off-screen, does nothing
            case 3:
                break;
            
            // Someone was hit
            default:
                numberOfPlayers--;
                await this.drawFire(trajectory[1]-10);
                tanks[trajectory[1]-10].clearTank();
                tanks.splice(trajectory[1]-10, 1);
                tanks.forEach(t => t.drawTank());       
        }

        // If there's only one player left; that's our winner
        if (numberOfPlayers == 1) {
            alert(tanks[0].name + " won!");
            window.location.href = 'index.html';            
        } else {
            whoseTurn = (whoseTurn >= numberOfPlayers - 1) ? 0 : (whoseTurn + 1);
            updateStatusBar();
            restoreFireListeners();
            isBlocked = false;
        }

    }


    /**
     * Computes complete path, which a fired missile will take
     * @param {*} whoseTurn Current player [int], also 'tanks' array index
     * @returns two objects: an array of x, y coordinates,
     *  describing the missile's path; and a collision information object
     */
    computeTrajectory(whoseTurn) {
        let gravity = 0;
        let radianAngle = -this.angle*Math.PI/180;        
        let trajectory = [];  // Whole trajectory, pre-computed here
        let topX = 15 + Math.cos(Math.PI / 180 * this.angle) * 18;
        let topY =  1 - Math.sin(Math.PI / 180 * this.angle) * 18;
        let dx = Math.cos(radianAngle) * this.power;
        let dy = Math.sin(radianAngle) * this.power;

        // Tip of the barrel (centerline). "+1" compensates for missile width
        let muzzle = { x: (this.xPos + topX * tankSize),
                       y: (this.yPos - topY * tankSize) + 1 * tankSize};

        // Missile trajectory's starting point is the muzzle itself
        let currentMissile = { x: muzzle.x, y: muzzle.y };

        trajectory.push(currentMissile);
        let collision = this.collisionDet(
                            currentMissile.x,
                            currentMissile.y);

        while (collision == 0) {
            gravity++;
            trajectory.push({ x: trajectory.at(-1).x + (dx)/20,
                              y: trajectory.at(-1).y - (dy + gravity)/20 });
            collision = this.collisionDet(
                            trajectory.at(-1).x, trajectory.at(-1).y);
        }
        return [trajectory, collision];
    }

    /** Animate an array of (x,y) positions */
    async animateMissile(trajectory) {
        return new Promise( resolve => {
            let index = 0;
            let oldIndex = 0;
            let deltaTime;
            let startTime = performance.now();

            function move(timeStamp) {
                if (typeof trajectory.at(index) !== 'undefined') {
                    if (index > 0) {
                        tanks[whoseTurn].clearMissile(
                            trajectory.at(oldIndex).x,
                            trajectory.at(oldIndex).y);
                    }
                    canvCtx2.fillStyle = "rgba(255,255,255,1)";
                    tanks[whoseTurn].drawMissile(
                        trajectory.at(index).x,
                        trajectory.at(index).y);
                    deltaTime = timeStamp - startTime;
                    deltaTime = (deltaTime < 0) ? 0 : deltaTime;
                    oldIndex = index;
                    index += Math.round(deltaTime/3 + 1);
                    startTime = performance.now();
                    requestAnimationFrame(move);
                } else {
                    tanks[whoseTurn].clearMissile(
                        trajectory.at(oldIndex).x,
                        trajectory.at(oldIndex).y);
                    resolve();
                }
            }
            requestAnimationFrame(move);
        });
    }


    /**
     * Draws a missile (a dot) on some given (unscaled) coordinates
     * @param {*} x 
     * @param {*} y  */
    async drawMissile(x, y) {
        canvCtx2.fillRect(
            x * squeezeFactor,
            canvRef2.height - y * squeezeFactor,
            2 * squeezeFactor * tankSize,
            2 * squeezeFactor * tankSize);
    }


    /**
     * Clears a missile dot from a given position. Cleared area is
     * 1px wider than {missle size} to cover antialiasing artifacts
     * @param {*} x unscaled missile x position
     * @param {*} y unscaled missile y position */
    async clearMissile(x, y) {
        canvCtx2.clearRect(
            (x * squeezeFactor) - 2,
            (canvRef2.height - y * squeezeFactor) -2,
            4 * squeezeFactor * tankSize,
            4 * squeezeFactor * tankSize);
    }


    /**
     * Checks whether a missle managed to hit something
     * @param {*} x0 current missle x coordinate
     * @param {*} y0 current missle y coordinate
     * @returns
     * 0 if nothing was hit (the missile keeps flying).
     * 1 if some terrain was hit.
     * 2 if bottom of the screen was reached.
     * 3 if missile went off screen to the side.
     * 10 if player 0 was hit.
     * 11 if player 1 was hit, etc. */
    collisionDet(x0, y0) {

        // Check if any of the tanks was hit
        let hit = 0;
        tanks.forEach((t, index) => {
            if (t.isShot(x0, y0) == true) {
                hit = 10 + index;
            }
        });

        // If a missile hits some terrain
        if (y0 <= pxMix[Math.round(Math.round(x0))]) {
            return 1;
        }

        // If a missle fell on the flat ground without any terrain
        else if (y0 < 0) {
            return 2;
        }

        // If a missile ran more than 1 blastSize off screen; left or right
        else if ( x0 < -blastSize || x0 > (maxRes + blastSize)) {
            return 3;
        }

        else if (hit !== 0)
            return hit;

        else {
            return 0;
        }
    }
    

    // If solid ground underneath is gone, the tank falls down.
    async aftermathCheck() {
            
        let begin = this.xPos;
        let end = begin + (tankSize * 30);
        let isGrounded = false;
        let terrainLevel;
        let tankBottom;
        let highest = 0;

        // Loop through the length of a tank. It doesn't matter if the
        // front edge or the rear edge still clings on. Each tank is 30
        // tankSize units long. Thus, ignore the first and the last five
        // thirds. While looping, note the highest peak (find max).
        for (let i=begin + 5 * tankSize; i < end - 5 * tankSize; i++) {
            
            if (pxMix[i] > highest)
                highest = pxMix[i];
            
            terrainLevel = pxMix[i];
            tankBottom = this.yPos - tankSize * 9;

            // If there is some ground below the tank, flag it 'grounded'
            if (Math.abs(terrainLevel - tankBottom) < 0.5) {
                isGrounded = true;
            }
        }
        
        if (isGrounded === false) {
            let oldYpos = this.yPos;
            let newYpos = highest + 9 * tankSize;
                        
            // Clear the tank and everything above
            this.partiallyClearTank();
            this.drawTank();
            await this.tankFallsDown(oldYpos, newYpos);  
        }
    }

    /** Animate a tank falling down (fps independent) */
    async tankFallsDown(oldYpos, newYpos) {
        return new Promise(resolve => {

            let startTime = performance.now();
            let deltaTime;

            const tankDescends = async(timeStamp) => {
                deltaTime = timeStamp - startTime;
                if (this.yPos > newYpos) {    
                    this.partiallyClearTank(this.x, this.y);
                    this.yPos = Math.max(newYpos, this.yPos - deltaTime/2);
                    this.drawTank();
                    startTime = performance.now();
                    requestAnimationFrame(tankDescends);
                }
                else resolve();
            }
            requestAnimationFrame(tankDescends);
        })
    }


    /** Clears full tank width up to the skies, leaving a small gap below */
    partiallyClearTank(xPosition, yPosition) {
        canvCtx2.clearRect(
            this.xPos * squeezeFactor,
            canvRef2.height - (this.yPos * squeezeFactor)
                + (tankSize * squeezeFactor * 7),
            // +1 clears up anti-aliasing artefacts
            (tankSize * squeezeFactor * 30) + 1,
            -200000); 
    }


    /** (Re)draws the tank */
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

    }

    /** Check if particular tank is to be found at given coordinates */
    isShot(x, y) {
        
        let topLeft, topRight, bottomRight, bottomLeft;
        
        topLeft = [this.xPos + 2  * tankSize, this.yPos + 1 * tankSize];
        topRight = [this.xPos + 28 * tankSize, this.yPos + 1 * tankSize];
        bottomRight = [this.xPos + 28 * tankSize, this.yPos - (9 * tankSize)];
        bottomLeft = [this.xPos + 2  * tankSize, this.yPos - (9 * tankSize)];

        if ( (x > topLeft[0]) &&
             (x < topRight[0]) &&
             (y > bottomLeft[1]) &&
             (y < topLeft[1]) ) {
                    return true;
        }
        else
        {
            return false;
        }
    }


    async drawFire(idx) {

        return new Promise( resolve => {
            
            let minAge = 20;
            let maxAge = 120;
            let initPartCount = Math.round(200 * tankSize * squeezeFactor);
            let tS = tankSize;
            let sF = squeezeFactor;

            class Particle {
                constructor(x, y) {
                    this.x = x,
                    this.y = y,
                    this.currentAge = 0;
                    this.maxAge = randomInteger(minAge, maxAge);
                    this.lifePercent = 100;
                    this.r = 255;
                    this.g = 255;
                    this.b = 0;
                    this.a = 1;
                }

                /** Computes a new location and color for a single particle */
                async stepForward(deltaTime) {

                    if (this.currentAge < this.maxAge) {
                        this.currentAge++;
                        this.lifePercent = 1000 - Math.round(
                                this.currentAge / this.maxAge * 1000);
                        // Elevate particle position
                        this.y += (Math.random() * tS * sF)
                                  * Math.abs(deltaTime/10);
                        // Jitter particle position horizontally
                        this.x += 0.3*(Math.random() - 0.5) * tS * sF;
                        
                        // Making sure that flames don't spread outwards
                        if (this.x < tanks[idx].xPos * sF)
                            this.x += 1.5*(Math.random()) * tS * sF;
                        if (this.x > (tanks[idx].xPos + 29 * tS) * sF)
                            this.x -= 1.5*(Math.random()) * tS * sF;

                        let temp = this.makeGradient(this.r, this.g,
                                          this.b, this.lifePercent);
                        this.r = temp[0];
                        this.g = temp[1];
                        this.b = temp[2];
                        this.a = temp[3];
                    }
                }

                /** Determine particles color depending on it's age */
                makeGradient(r, g, b, lifePercent) {
                    let a;
                    let perc = 100 - (lifePercent / 10);

                    if (perc > 80) {
                        r = 255 - 100*((perc - 80) / 20);
                        g = 255 - 255*((perc - 80) / 20);
                        b = 0;
                        a = 1 - ((perc - 80) / 20);
                    } else if (perc > 40) {
                        r = 255;
                        g = 255 - 200*((perc - 40) / 40);;
                        b = 0;
                        a = 1;
                    } else {
                        r = 255;
                        g = 255;
                        b = 0;
                        a = 1;
                    }           
                    return [r, g, b, a];
                }
            }
            
            // Particle collection
            let particles = [];

            // Horizontal tank span (displayed, scaled)
            let xStart = Math.round( tanks[idx].xPos * sF) ;
            let xEnd = Math.round( (tanks[idx].xPos + 30 * tankSize) * sF);
            
            // The height at which the fenders are located (displayed, scaled)
            let yFender = Math.round((tanks[idx].yPos - 3 * tS) * sF);

            // Initialize particles (following tank's fender contour)
            // While loop may generate more than {partCount} particles,
            // but no more than [{partCount} + {tankSize * squeezeFactor}]
            
            while (particles.length < initPartCount) {
            
                for (let i=xStart, j=0, k=xEnd-xStart; i < xEnd; i++,j++,k--) {
                    if (i < xStart + 0.3 * tS * sF) {
                        particles.push(
                            new Particle(i, (j*1.65 + yFender) - 1.78 * tS*sF)
                        );
                    }
                    else if ((i < xStart + 2 * tS * sF)) {
                        particles.push(
                            new Particle(i, (j*0.8 + yFender) - 1.47 * tS*sF)
                        );
                    }
                    else if ((i < xStart + 28 * tS * sF)) {
                        particles.push(
                            new Particle(i, yFender + 0.08 * tS * sF) );
                    }
                    else if ((i < xStart + 29.65 * tS * sF)) {
                        particles.push(
                            new Particle(i, (k*0.8 + yFender) - (1.5 * tS*sF))
                        );
                    }
                    else {
                        particles.push(
                            new Particle(i, (k*1.6 + yFender) - (1.8 * tS*sF))
                        );
                    }
                }
            }

            let endTime = performance.now();
            let deltaTime = 1;

            function animate(timeStamp) {
                
                // Draws all particles
                particles.forEach((p) => {
                    p.stepForward(deltaTime);
                    canvCtx2.fillStyle = `rgba(
                        ${p.r},
                        ${p.g},
                        ${p.b},
                        ${p.a})`;
                    canvCtx2.fillRect(p.x, canvRef2.height - p.y, 1, 1)
                });
                
                // Darkens a burning tank
                tanks[idx].r -= 2;
                tanks[idx].g -= 2;
                tanks[idx].b -= 2;
                tanks[idx].drawTank();

                // Removes dead particles
                if (particles.length > 10) {
                    for (let i = 0; i < particles.length; i++) {
                        if (particles[i].lifePercent == 0) {
                            particles.splice(i, 1);
                        }
                    }
                                        
                    deltaTime = timeStamp - endTime;
                    endTime = performance.now();
                    requestAnimationFrame(animate);
                } else {
                    canvCtx2.clearRect(
                    (tanks[idx].xPos * squeezeFactor) - 2, 0,
                    (30 * tankSize * squeezeFactor) + 2,
                    canvRef2.height - ((tanks[idx].yPos -
                        5 * tankSize) * squeezeFactor));
                    resolve();
                }
            }
            requestAnimationFrame(animate);
        })
    
    }

    showBoundingBox() {
        canvCtx2.fillStyle = "rgb(255,255,0)";
        
        // Gornji rub
        canvCtx2.fillRect(
            (this.xPos + 2*tankSize) * squeezeFactor,
            canvRef2.height - (this.yPos + 1*tankSize) * squeezeFactor,
            tankSize * squeezeFactor * 26,
            1);

        // Donji rub
        canvCtx2.fillRect(
            (this.xPos + 2*tankSize) * squeezeFactor,
            canvRef2.height - this.yPos*squeezeFactor
                + (tankSize * squeezeFactor * 9),
            tankSize * squeezeFactor * 26,
            1);

        // Lijevi rub
        canvCtx2.fillRect(
            (this.xPos + 2*tankSize) * squeezeFactor,
            canvRef2.height - this.yPos * squeezeFactor,
            1,
            tankSize * squeezeFactor * 9);
        
        // Desni rub
        canvCtx2.fillRect(
            (this.xPos + tankSize * 28) * squeezeFactor,
            canvRef2.height - this.yPos * squeezeFactor,
            1,
            tankSize * squeezeFactor * 9);        
    }

    clearTank(wide) {
        if (!wide) {
            canvCtx2.clearRect(
                (this.xPos * squeezeFactor) - 1,
                // -2px overhead clears antialiasing residue
                (canvRef2.height - this.yPos*squeezeFactor)
                - (14 * tankSize * squeezeFactor) - 2,
                (30 * tankSize * squeezeFactor) +2,
                (22.5 * tankSize * squeezeFactor) +2 ) ;
        } else {
            canvCtx2.clearRect(
                this.xPos * squeezeFactor,
                // -2px overhead clears antialiasing residue
                (canvRef2.height - this.yPos*squeezeFactor)
                - (14 * tankSize * squeezeFactor) - 2,
                30 * tankSize * squeezeFactor,
                22.5 * tankSize * squeezeFactor);
        }
    }
}
