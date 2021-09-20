import * as THREE from 'three';

import Delaunator from 'delaunator';

export default function TriangulationFactory(pointArray) {
    if (pointArray.length < 2) {
        console.log(
            'TriangulationFactory called with argument pointArray having less than 2 elements; returned null'
        );

        return null;
    }

    const d = Delaunator.from(pointArray);

    const getPoints = () => pointArray;

    const getD = () => d;

    function edgesOfTriangle(t) {
        return [3 * t, 3 * t + 1, 3 * t + 2];
    }

    function triangleOfEdge(e) {
        return Math.floor(e / 3);
    }

    function nextHalfedge(e) {
        if (e === d.triangles.length - 1) {
            return null;
        }

        return e % 3 === 2 ? e - 2 : e + 1;
    }

    function prevHalfedge(e) {
        return e % 3 === 0 ? e + 2 : e - 1;
    }

    function pointsOfTriangle(t) {
        return edgesOfTriangle(t)
            .map((e) => d.triangles[e])
            .map((e) => pointArray[e]);
    }

    // CB is called with one array argument, with three entries, which in turn are each an array of two numbers
    function forEachTriangle(CB) {
        let newArray = [];

        for (let t = 0; t < d.triangles.length / 3; t++) {
            newArray[t] = CB(pointsOfTriangle(t));
        }

        return newArray;
    }

    let centerArray;

    function getCenterArray() {
        // if centerArray is null, then need to create it
        if (!centerArray) centerArray = forEachTriangle((t) => circumcenter(t));

        return centerArray;
    }

    let radiusAndCenterArray;

    function getRadiusAndCenterArray() {
        // if radiusArray is null, then need to create it
        if (!radiusAndCenterArray)
            radiusAndCenterArray = forEachTriangle((t) => radiusAndCenter(t));

        return radiusAndCenterArray;
    }

    function getRadiusArray() {
        // if radiusArray is null, then need to create it
        if (!radiusAndCenterArray)
            radiusAndCenterArray = forEachTriangle((t) => radiusAndCenter(t));

        return radiusAndCenterArray.map(({ radius, center }) => radius);
    }

    // returns an array of line segments, each starting at a = [a0, a1];
    // each line segment is a 2 item array of points, each point is a 2 item array of numbers

    // (in implementation, need to be careful about mapping over typed array,
    // because it returns a typed array)

    // a = [a0, a1]
    function halfedgesOfPoint(a) {
        let tempArray = [],
            e;

        for (let i = 0; i < d.triangles.length; i++) {
            e = d.triangles[i];

            if (pointEqual(pointArray[e], a))
                tempArray.push(pointArray[d.triangles[nextHalfedge(i)]]);
        }

        tempArray = tempArray.map((endPt) => [a, endPt]);

        return tempArray;
    }

    // returns an index of d.triangles that represents the half-edge
    function halfedgeOfLineSeg(a, b) {
        for (let i = 0; i < d.triangles.length; i++) {
            let nextEdge;

            if (pointEqual(pointArray[d.triangles[i]], a)) {
                nextEdge = d.triangles[nextHalfedge(i)];

                if (pointEqual(pointArray[nextEdge], b)) {
                    return i;
                }
            }
        }

        return null;
    }

    // does a lot more errorr checking
    function halfedgeOfLineSegOld(a, b) {
        for (let i = 0; i < d.triangles.length; i++) {
            if (!pointArray[d.triangles[i]]) {
                console.log('pointArray[d.triangles[i]] is null');
                return null;
            } else if (!a) {
                console.log('a is null');
                return null;
            } else if (pointEqual(pointArray[d.triangles[i]], a)) {
                const nextEdge = d.triangles[nextHalfedge(i)];

                if (!pointArray[nextEdge]) {
                    console.log('pointArray[d.triangles[nextHalfedge(i)]] is null');
                    return null;
                } else if (!b) {
                    console.log('b is null');
                    return null;
                } else if (pointEqual(pointArray[nextEdge], b)) {
                    return i;
                }
            }
        }

        return null;
    }

    function triangleOfLineSeg(a, b) {
        return triangleOfEdge(halfedgeOfLineSeg(a, b));
    }

    // start and end are indices for pointArray, representing the curve
    function trianglesOfCurve(start, end) {
        let edgeArray = [];

        let s, e;

        for (let i = 0; i < d.triangles.length; i++) {
            s = d.triangles[i];
            e = d.triangles[nextHalfedge(i)];

            if (s < start || s > end || e < start || e > end) continue;

            edgeArray.push(i);
        }

        //console.log('edgeArray has length ', edgeArray.length );
        //console.log('while end-start is ', Number(end) - Number(start) );

        return edgeArray.map((e) => radiusAndCenter(pointsOfTriangle(triangleOfEdge(e))));
    }

    // each a,b,c is an array of two numbers

    function radiusAndCenter([a, b, c]) {
        const center = circumcenter([a, b, c]);

        const v1 = new THREE.Vector2(a[0], a[1]);
        const v2 = new THREE.Vector2(center[0], center[1]);

        const radius = v1.distanceTo(v2);

        return { radius, center };
    }

    function circumcenter([a, b, c]) {
        const ad = a[0] * a[0] + a[1] * a[1];
        const bd = b[0] * b[0] + b[1] * b[1];
        const cd = c[0] * c[0] + c[1] * c[1];
        const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

        return [
            (1 / D) * (ad * (b[1] - c[1]) + bd * (c[1] - a[1]) + cd * (a[1] - b[1])),
            (1 / D) * (ad * (c[0] - b[0]) + bd * (a[0] - c[0]) + cd * (b[0] - a[0]))
        ];
    }

    function pointEqual([a0, a1], [b0, b1]) {
        return a0 === b0 && a1 === b1;
    }

    return {
        getPoints,
        getD,
        pointsOfTriangle,
        forEachTriangle,
        getCenterArray,
        getRadiusArray,
        triangleOfLineSeg,
        trianglesOfCurve,
        halfedgesOfPoint,
        radiusAndCenter,
        getRadiusAndCenterArray,
        pointsOfTriangle
    };
}
