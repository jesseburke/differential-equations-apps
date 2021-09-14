import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import Delaunator from 'delaunator';

import} {{ FullScreenBaseComponent } from '@jesseburke/components';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';
import {ClickablePlaneComp} from '@jesseburke/components';

import useGridAndOrigin from '../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../geometries/use2DAxes.jsx';
import DelaunayGeometry from '../../geometries/DelaunayGeometry.jsx';

import TriangulationFactory from '../../factories/TriangulationFactory.jsx';

import {
    initColors,
    initAxesData,
    initGridData,
    initControlsData,
    bounds,
    initCameraData,
    fonts
} from './constants.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const { xMin, xMax, yMin, yMax } = bounds;

const labelStyle = {
    color: 'black',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

//------------------------------------------------------------------------

export default function App() {
    const [controlsData, setControlsData] = useState(initControlsData);

    const [colors, setColors] = useState(initColors);

    const [pointArray, setPointArray] = useState([]);

    const [triangulation, setTriangulation] = useState(null);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // effects

    useGridAndOrigin({ gridData: initGridData, threeCBs, originRadius: 0.1 });
    use2DAxes({ threeCBs, axesData: initAxesData });

    useEffect(() => {
        setTriangulation(TriangulationFactory(pointArray));
    }, [pointArray]);

    // draws edges of triangles
    useEffect(() => {
        if (!threeCBs || !triangulation) return;

        const geom = DelaunayGeometry(triangulation);

        if (!geom) return;

        const mesh = new THREE.Mesh(geom, solutionMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [triangulation, threeCBs]);

    const clickCB = useCallback(
        (pt) => {
            setPointArray((a) => a.concat([[pt.x, pt.y]]));

            if (!threeCBs) return;

            threeCBs.addLabel({
                pos: [pt.x, pt.y, 0],
                text: pointArray.length.toString(),
                style: labelStyle
            });

            threeCBs.drawLabels();
        },
        [threeCBs, pointArray]
    );

    const d = Delaunator.from(pointArray);

    const triangleArray = d.triangles;

    let triangleDisplayStr = '';

    for (let i = 0; i < triangleArray.length; i += 3) {
        triangleDisplayStr +=
            triangleArray[i].toString() +
            triangleArray[i + 1].toString() +
            triangleArray[i + 2].toString() +
            ',';
    }

    let halfedgeDisplayStr = '';

    d.halfedges.forEach((e) => (halfedgeDisplayStr += e.toString() + ', '));

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ThreeSceneComp
                ref={threeSceneRef}
                initCameraData={initCameraData}
                controlsData={controlsData}
            />
            <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} />

            <div
                css={{
                    position: 'absolute',
                    top: '7%',
                    left: '5%',
                    border: '2px',
                    borderStyle: 'solid',
                    padding: '1em',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.25em',
                    userSelect: 'none'
                }}>
                <div
                    css={{
                        paddingLeft: '1em',
                        paddingRight: '1em',
                        paddingTop: '.75em',
                        paddingBottom: '.75em',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'baseline'
                    }}>
                    <span
                        css={{
                            margin: '.5em'
                        }}>
                        {' '}
                        Triangles are :{triangleDisplayStr}
                    </span>
                </div>

                <div
                    css={{
                        paddingLeft: '1em',
                        paddingRight: '1em',
                        paddingTop: '.75em',
                        paddingBottom: '.75em',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'baseline'
                    }}>
                    <span
                        css={{
                            margin: '.5em'
                        }}>
                        {' '}
                        Halfedge array is:
                        {halfedgeDisplayStr}
                    </span>
                </div>
            </div>
        </FullScreenBaseComponent>
    );
}
