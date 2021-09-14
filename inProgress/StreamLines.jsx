import { RK4Pts } from './RK4.jsx';
import TriangulationFactory from '../../../factories/TriangulationFactory.jsx';
import PriorityQueueFactory from '../../../factories/PriorityQueueFactory.js';

// h is used to calculate solution curves

export default function Streamlines({
    func,
    initialPt = [0, 0],
    bounds,
    sepDist = 0.5,
    saturation = 1.5,
    h
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    let pointArray = [],
        curveArray = [],
        curCurve;

    // shorthand

    const RKPts = (pt) => RK4Pts({ func, initialPt: pt, h, bounds });

    // start by adding points along the boundary
    pointArray = pointsOnBoundary({
        xMin: xMin - sepDist,
        xMax: xMax + sepDist,
        yMin: yMin - sepDist,
        yMax: yMax + sepDist,
        delta: sepDist
    });

    // then add points of solution curve through initial point
    curCurve = RKPts(initialPt);
    curveArray.push([pointArray.length, curCurve.length]);
    pointArray = pointArray.concat(curCurve);

    let t = TriangulationFactory(pointArray);

    const initRadiusAndCenterArray = filterRadiusAndCenter(t.getRadiusAndCenterArray());

    //console.log('initRadiusAndCenterArray has length ', initRadiusAndCenterArray.length);
    //console.log('initRadiusAndCenterArray is ', initRadiusAndCenterArray);

    const pq = PriorityQueueFactory(initRadiusAndCenterArray, 'radius');

    let curTriangle, tempObj;

    while (!pq.isEmpty()) {
        curTriangle = pq.pop();

        //------------------------------------------------------------------------
        //
        // checking whether curTriangle is in triangulation t, by
        // checking whether the radius and center of the current triangle is equal
        // to the radius and center of a triangle in t
        // (note: need to check equality for each entry of array; won't ever be equal otherwise)

        const isStillTriangle = filterRadiusAndCenter(t.getRadiusAndCenterArray()).some(
            ({ center, radius }) =>
                // (center[0] === curTriangle.center[0])
                // &&
                // (center[1] === curTriangle.center[1])
                // &&
                radius === curTriangle.radius
        );

        if (!isStillTriangle) continue;

        //------------------------------------------------------------------------

        // if still is a triangle, then find the solution curve through that point
        curCurve = RKPts(curTriangle.center);

        tempObj = [pointArray.length, curCurve.length];

        // add it to the curve array
        curveArray.push(tempObj);

        // add it to the point array
        pointArray = pointArray.concat(curCurve);

        // and make new triangulation
        t = TriangulationFactory(pointArray);

        // each entry of triangleArray is an object of the form: {center, radius}
        // these are the triangles that border the curve
        let triangleArray = t.trianglesOfCurve(tempObj[0], tempObj[0] + tempObj[1]);

        // if there is more than one triangle, then filter the array,
        // keeping only local maxima wrt radius
        if (triangleArray.length > 1) {
            triangleArray = triangleArray.filter(({ center, radius }, index) => {
                if (index === 0) return radius >= triangleArray[1].radius;
                else if (index === triangleArray.length - 1)
                    return radius >= triangleArray[triangleArray.length - 1];

                return (
                    radius >= triangleArray[index - 1].radius &&
                    radius >= triangleArray[index + 1].radius
                );
            });
        }

        //console.log(triangleArray);

        // filter by radius > sepDist * saturation, and whether center is in bounds
        triangleArray = filterRadiusAndCenter(triangleArray);

        //console.log(triangleArray);

        // add each triangle that is left to the priority queue
        triangleArray.forEach((o) => pq.push(o));

        // add all triangle incident to the end points of the curve to the priority queue
        filterRadiusAndCenter(t.halfedgesOfPoint(curCurve[0])).forEach((o) => pq.push(o));
        filterRadiusAndCenter(t.halfedgesOfPoint(curCurve[curCurve.length - 1])).forEach((o) =>
            pq.push(o)
        );
    }

    //console.log('curveArray has length ', curveArray.length);

    // helper function that takes array of objects with 'radius' and 'center' fields
    // returns an array with same

    function filterRadiusAndCenter(array) {
        return array
            .filter(({ radius, center }) => radius > sepDist * saturation)
            .filter(
                ({ radius, center }) =>
                    center[0] < xMax && center[0] > xMin && center[1] < yMax && center[1] > yMin
            );
    }

    return {
        triangulation: t,
        curveArray: curveArray.map(([start, length]) => pointArray.slice(start, start + length))
    };
}

function pointsOnBoundary({ xMin, xMax, yMin, yMax, delta }) {
    let pointArray = [];

    if (xMax < xMin) {
        console.log('pointsOnBoundary called with xMax < xMin; null was returned');
        return null;
    }

    if (yMax < yMin) {
        console.log('pointsOnBoundary called with yMax < yMin; null was returned');
        return null;
    }

    // bottom horizontal

    for (let i = 0; i <= Math.floor((xMax - xMin) / delta); i++) {
        pointArray.push([i * delta + xMin, yMin]);
    }

    // if yMin = yMax, we are done

    if (yMax === yMin) {
        return pointArray;
    }

    // top horizontal

    for (let i = 0; i <= Math.floor((xMax - xMin) / delta); i++) {
        pointArray.push([i * delta + xMin, yMax]);
    }

    // left vertical, minus the top and bottom, which are already done

    for (let i = 1; i <= Math.floor((yMax - yMin) / delta); i++) {
        pointArray.push([xMin, i * delta + yMin]);
    }

    // if xMin = xMax, we are done

    if (xMax === xMin) {
        return pointArray;
    }

    // right vertical, minus the top and bottom, which are already done

    for (let i = 0; i <= Math.floor((yMax - yMin) / delta); i++) {
        pointArray.push([xMax, i * delta + yMin]);
    }

    return pointArray;
}
