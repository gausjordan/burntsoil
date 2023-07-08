function catmullRom(p0, p1, p2, p3, alpha, tension, position) {
    
    let dist01 = Math.sqrt(
                    Math.pow( (p1.x - p0.x), 2) +
                    Math.pow( (p1.y - p0.y), 2) );
    let dist12 = Math.sqrt(
                    Math.pow( (p2.x - p1.x), 2) +
                    Math.pow( (p2.y - p1.y), 2) );
    let dist23 = Math.sqrt(
                    Math.pow( (p3.x - p2.x), 2) +
                    Math.pow( (p3.y - p2.y), 2) );

    let t01 = Math.pow(dist01, alpha);
    let t12 = Math.pow(dist12, alpha);
    let t23 = Math.pow(dist23, alpha);

    let m1 = {
        x:  (1 - tension) *
            ( 2 - p2.x - p1.x + t12 *
                ( (p1.x - p0.x) / t01 -
                (p2.x - p0.x) / (t01 + t12)
                )
            ),
        y:  (1 - tension) *
            ( 2 - p2.y - p1.y + t12 *
                ( (p1.y - p0.y) / t01 -
                (p2.y - p0.y) / (t01 + t12)
                )
            )
    };

    let m2 = {
        x:  (1 - tension) *
            ( 2 - p2.x - p1.x + t12 *
                ( (p3.x - p2.x) / t23 -
                (p3.x - p1.x) / (t12 + t23)
                )
            ),
        y:  (1 - tension) *
            ( 2 - p2.y - p1.y + t12 *
                ( (p3.y - p2.y) / t23 -
                (p3.y - p1.y) / (t12 + t23)
                )
            )
    };

    let a = {
        x: 2 * (p1.x - p2.x) + m1.x + m2.x,
        y: 2 * (p1.y - p2.y) + m1.y + m2.y
    };

    let b = {
        x: -3 * (p1.x - p2.x) - m1.x -m1.x -m2.x,
        y: -3 * (p1.y - p2.y) - m1.y -m1.y -m2.y,
    };
    
    let c = { x: m1.x, y: m1.y };

    let d = { x: p1.x, y: p1.y };

    return {
        x:  a.x * Math.pow(position, 3) +
            b.x * Math.pow(position, 2) +
            c.x * position +
            d.x,
        y:  a.y * Math.pow(position, 3) +
            b.y * Math.pow(position, 2) +
            c.y * position +
            d.y,
    };
}