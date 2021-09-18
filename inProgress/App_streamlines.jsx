import React, { Fragment, useState, useRef, useEffect, useCallback } from 'react';

import queryString from 'query-string';

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

import { Helmet } from 'react-helmet';

import { ThreeSceneComp, useThreeCBs } from '@jesseburke/three-scene-with-react';
import { ControlBar } from '@jesseburke/components';
import { Main } from '@jesseburke/components';
import { FunctionInput } from '@jesseburke/components';
import { funcParser } from '@jesseburke/math-utils';

import { ClickablePlaneComp } from '@jesseburke/components';
import { Input } from '@jesseburke/components';
import { ArrowGridOptions } from '@jesseburke/components';
import { SaveButton } from '@jesseburke/components';
import { FullScreenBaseComponent } from '@jesseburke/components';

import useGridAndOrigin from '../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../geometries/use2DAxes.jsx';
import DirectionFieldApproxGeom from '../../geometries/DirectionFieldApprox.jsx';
import useDraggableMeshArray from '../../geometries/useDraggableMeshArray.jsx';

import Streamlines from './Streamlines.jsx';

import { fonts, labelStyle } from './constants.jsx';
import { round } from '../@jesseburke/basic-utils';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

const aspectRatio = window.innerWidth / window.innerHeight;

const frustumSize = 20;

const initCameraData = {
    position: [0, 0, 1],
    up: [0, 0, 1],
    //fov: 75,
    near: -100,
    far: 100,
    rotation: { order: 'XYZ' },
    orthographic: {
        left: (frustumSize * aspectRatio) / -2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: frustumSize / -2
    }
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const secControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    zoomSpeed: 1.25
};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.solution),
    side: THREE.FrontSide
});

//solutionMaterial.transparent = true;
//solutionMaterial.opacity = .6;

const solutionCurveRadius = 0.1;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = 0.6;

const initAxesData = {
    radius: 0.01,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true
};

const funcStr = 'cos(x+y)'; //'x*y*sin(x+y)/10';
const testFuncStr = 'sin(2*x)+1.5*sin(x)';

const initState = {
    bounds: { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    arrowDensity: 1,
    arrowLength: 0.7,
    funcStr,
    func: funcParser(funcStr),
    testFuncStr,
    testFunc: funcParser(testFuncStr),
    initialPt: [2, 2],
    approxH: 0.1
};

const roundConst = 3;

function shrinkState({
    bounds,
    arrowDensity,
    arrowLength,
    funcStr,
    testFuncStr,
    initialPt,
    approxH
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    const newObj = {
        b: [xMin, xMax, yMin, yMax],
        ad: arrowDensity,
        al: arrowLength,
        fs: funcStr,
        tfs: testFuncStr,
        ip: initialPt.map((x) => round(x, roundConst)),
        a: approxH
    };

    return newObj;
}

// f is a function applied to the string representing each array element

function strArrayToArray(strArray, f = Number) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]

    return strArray.split(',').map((x) => f(x));
}

function expandState({ b, ad, al, fs, tfs, ip, a }) {
    const bds = strArrayToArray(b, Number);

    return {
        bounds: { xMin: bds[0], xMax: bds[1], yMin: bds[2], yMax: bds[3] },
        arrowDensity: Number(ad),
        arrowLength: Number(al),
        funcStr: fs,
        func: funcParser(fs),
        testFuncStr: tfs,
        testFunc: funcParser(tfs),
        initialPt: strArrayToArray(ip),
        approxH: Number(a)
    };
}

const gridBounds = initState.bounds;

// constants for the Stream Line display
const initSepDist = 3.3;

const slRadius = 0.5;

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState({ ...initState });

    const [meshArray, setMeshArray] = useState(null);

    const [colors] = useState(initColors);

    const [fontState] = useState(fonts);

    const [cbhState] = useState(controlBarHeight);

    const [cbfsState] = useState(controlBarFontSize);

    const [minuscbhState] = useState(100 - controlBarHeight);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const [streamlines, setStreamlines] = useState(null);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ threeCBs, bounds: gridBounds, show: initGridData.show, originRadius: 0.1 });

    use2DAxes({
        threeCBs,
        bounds: state.bounds,
        radius: initAxesData.radius,
        color: initColors.axes,
        show: initAxesData.show,
        showLabels: initAxesData.showLabels,
        labelStyle
    });

    //------------------------------------------------------------------------
    //
    // look at location.search

    // want to: read in the query string, parse it into an object, merge that object with
    // initState, then set all of the state with that merged object

    useEffect(() => {
        const qs = window.location.search;

        if (qs.length === 0) {
            setState((s) => s);
            return;
        }

        const newState = queryString.parse(qs.slice(1));
        setState((s) => expandState(newState));

        console.log('state is ', state);
        console.log('newState is ', newState);
        console.log('expandState(newState) is ', expandState(newState));

        //window.history.replaceState(null, null, '?'+queryString.stringify(state));
        //window.history.replaceState(null, null, "?test");
    }, []);

    const saveButtonCB = useCallback(
        () =>
            window.history.replaceState(
                null,
                null,
                '?' +
                    queryString.stringify(shrinkState(state), {
                        decode: false,
                        arrayFormat: 'comma'
                    })
            ),
        [state]
    );

    //-------------------------------------------------------------------------
    //
    // make the mesh for the initial point

    // not listing state as a dependency on purpose; don't want this effect running on drag

    useEffect(() => {
        if (!threeCBs) return;

        const geometry = new THREE.SphereBufferGeometry(solutionCurveRadius * 2, 15, 15);
        const material = new THREE.MeshBasicMaterial({ color: colors.solution });

        const mesh = new THREE.Mesh(geometry, material)
            .translateX(state.initialPt[0])
            .translateY(state.initialPt[1]);

        threeCBs.add(mesh);
        setMeshArray([mesh]);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [threeCBs]);

    //
    // make initial condition point draggable

    // in this case there is no argument, because we know what is being dragged
    const dragCB = useCallback(() => {
        const vec = new THREE.Vector3();

        // this will be where new position is stored
        meshArray[0].getWorldPosition(vec);

        setState(({ initialPt, ...rest }) => ({ initialPt: [vec.x, vec.y], ...rest }));
    }, [meshArray]);

    useDraggableMeshArray({ meshArray, threeCBs, dragCB, dragendCB: dragCB });

    // change initial point mesh if initialPoint changes

    useEffect(() => {
        if (!threeCBs) return;

        if (!meshArray || !state) return;

        let vec = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec);

        const [d1, e1] = [vec.x - state.initialPt[0], vec.y - state.initialPt[1]];

        if (d1 != 0) {
            meshArray[0].translateX(-d1);
        }
        if (e1 != 0) {
            meshArray[0].translateY(-e1);
        }
    }, [threeCBs, meshArray, state.initialPt]);

    //------------------------------------------------------------------------
    //
    // experimenting with streamlines...

    useEffect(() => {
        if (!state.func) return;

        setStreamlines(
            Streamlines({
                func: state.func,
                state: state.initialPt,
                bounds: state.bounds,
                sepDist: initSepDist,
                h: state.approxH
            })
        );
    }, [state.func, state.initialPt, state.bounds, state.approxH]);

    useEffect(() => {
        if (!threeCBs || streamlines.curveArray.length === 0) return;

        const geomArray = streamlines.curveArray.map((curve) => {
            const curvePointArray = curve.map(([x, y]) => new THREE.Vector3(x, y, 0));

            const path = new THREE.CurvePath();

            for (let i = 0; i < curvePointArray.length - 1; i++) {
                path.add(new THREE.LineCurve3(curvePointArray[i], curvePointArray[i + 1]));
            }

            let geom;

            if (path.curves.length === 0) {
                return null;
            }

            return new THREE.TubeBufferGeometry(path, 1064, slRadius, 8, false);
        });

        const geom = BufferGeometryUtils.mergeBufferGeometries(geomArray);
        geomArray.forEach((g) => g.dispose());

        const mesh = new THREE.Mesh(geom, solutionMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [streamlines, threeCBs]);

    //------------------------------------------------------------------------
    //
    // solution effect

    const funcInputCallback = useCallback(
        (newFunc, newFuncStr) =>
            setState(({ func, funcStr, ...rest }) => ({
                func: newFunc,
                funcStr: newFuncStr,
                ...rest
            })),
        []
    );

    const clickCB = useCallback(
        (pt) => {
            if (controlsEnabled) {
                setState((s) => s);
                return;
            }

            setState(({ initialPt, ...rest }) => ({ initialPt: [pt.x, pt.y], ...rest }));
        },
        [controlsEnabled]
    );

    useEffect(() => {
        if (!threeCBs || !state) return;

        const dfag = DirectionFieldApproxGeom({
            func: state.func,
            initialPt: state.initialPt,
            bounds: state.bounds,
            h: state.approxH,
            radius: solutionCurveRadius
        });

        const mesh = new THREE.Mesh(dfag, solutionMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
        };
    }, [threeCBs, state.initialPt, state.bounds, state.func, state.approxH]);

    //------------------------------------------------------------------------
    //
    //arrowGrid effect

    // useEffect( ()  => {

    //     if( !threeCBs ) return;

    //     const geom = ArrowGridGeom({ arrowDensity: state.arrowDensity,
    //                                  arrowLength: state.arrowLength,
    //                                  bounds: state.bounds,
    //                                  func: state.func });

    //     const material = new THREE.MeshBasicMaterial({ color: colors.arrows });
    //     //material.transparent = true;
    //     //material.opacity = .75;

    //     const mesh = new THREE.Mesh(geom, material);

    //     threeCBs.add( mesh );

    //     return () => {
    //         threeCBs.remove( mesh );
    //         if( geom) geom.dispose();
    //         if( material ) material.dispose();

    //     };

    // }, [threeCBs, state.arrowDensity, state.arrowLength, state.bounds, state.func] );

    //------------------------------------------------------------------------
    //
    // test graph effect

    const testFuncInputCB = useCallback(
        (newFunc, newFuncStr) =>
            setState(({ testFunc, testFuncStr, ...rest }) => ({
                testFunc: newFunc,
                testFuncStr: newFuncStr,
                ...rest
            })),
        []
    );

    // useEffect( () => {

    //     if( !threeCBs || !state ) return;

    //     const geom = FunctionGraph2DGeom({ func: state.testFunc, bounds: state.bounds,
    //                                        radius: testFuncRadius });

    //     const mesh = new THREE.Mesh( geom, testFuncMaterial );

    //     threeCBs.add( mesh );

    //     return () => {
    //         threeCBs.remove(mesh);
    //         if(geom) geom.dispose();
    //     };

    // }, [threeCBs, state.testFunc, state.bounds] );

    //------------------------------------------------------------------------
    //

    const approxInputCB = useCallback(
        (newA) => setState(({ approxH, ...rest }) => ({ approxH: Number(newA), ...rest })),
        []
    );

    const densityInputCB = useCallback(
        (newD) => setState(({ arrowDensity, ...rest }) => ({ arrowDensity: newD, ...rest })),
        []
    );

    const lengthInputCB = useCallback(
        (newL) => setState(({ arrowLength, ...rest }) => ({ arrowLength: newL, ...rest })),
        []
    );

    const resetCameraCB = useCallback(() => {
        if (controlsEnabled) {
            setControlsEnabled(false);
            threeCBs.setCameraPosition(initCameraData.position, initCameraData.up);
            threeCBs.resetControls();
            threeCBs.changeControls(initControlsData);
        } else {
            setControlsEnabled(true);
            //threeCBs.resetControls();
            threeCBs.changeControls(secControlsData);
        }
    }, [controlsEnabled, threeCBs]);

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 2.5em',
            borderRight: '1px solid',
            flex: 1
        },
        []
    );

    const css2 = useRef(
        {
            paddingRight: '1em',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            borderRight: '1px solid'
        },
        []
    );

    const css3 = useRef(
        {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 7,
            paddingTop: '.5em',
            paddingBottom: '.5em',
            paddingLeft: '1em',
            paddingRight: '2em'
        },
        []
    );

    const css4 = useRef(
        {
            margin: 0,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0em 2em',
            alignContent: 'center',
            alignItems: 'center',
            borderLeft: '1px solid'
        },
        []
    );

    const css5 = useRef({ textAlign: 'center', width: '12em' }, []);

    const css6 = useRef({ paddingTop: '.5em' }, []);

    const css7 = useRef({ textAlign: 'center' }, []);

    const css8 = useRef({ padding: '0em' }, []);

    return (
        <React>
            <Helmet>
                <title>Streamlines App</title>
            </Helmet>

            <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fontState}>
                <ControlBar height={cbhState} fontSize={fontSize * cbfsState} padding='0em'>
                    <div style={css1.current}>
                        <span style={css7.current}>Test Function</span>
                        <FunctionInput
                            userCss={css7.current}
                            onChangeFunc={testFuncInputCB}
                            initFuncStr={state.testFuncStr}
                            totalWidth='12em'
                            inputSize={16}
                            leftSideOfEquation={'\u{00177}(x) ='}
                        />
                    </div>

                    <FunctionInput
                        userCss={css2.current}
                        onChangeFunc={funcInputCallback}
                        initFuncStr={state.funcStr}
                        leftSideOfEquation='dy/dx ='
                    />

                    <ArrowGridOptions
                        userCss={css3.current}
                        initDensity={state.arrowDensity}
                        initLength={state.arrowLength}
                        densityCB={densityInputCB}
                        lengthCB={lengthInputCB}
                    />
                    <div style={css4.current}>
                        <div style={css5.current}>Solution approximation constant:</div>
                        <span style={css6.current}>
                            <Input size={4} initValue={state.approxH} onC={approxInputCB} />
                        </span>
                    </div>
                </ControlBar>

                <Main height={minuscbhState} fontSize={fontSize * cbfsState}>
                    <ThreeSceneComp
                        ref={threeSceneRef}
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                    />
                    <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} />
                    <SaveButton onClickFunc={saveButtonCB} />
                </Main>
            </FullScreenBaseComponent>
        </Fragment>
    );
}

/* <ResetCameraButton key="resetCameraButton" */
/*                               onClickFunc={resetCameraCB} */
/*                               color={controlsEnabled ? initColors.controlBar : null } */
/*                               userCss={{ top: '85%', */
/*                                          left: '5%', */
/*                                          userSelect: 'none'}}/> */
