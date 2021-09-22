import * as THREE from 'three';

import { funcParser } from '@jesseburke/math-utils';

export const fonts = "'Helvetica', 'Hind', sans-serif";

// should adjust these based on aspect ratio of users screen
export const halfXSize = 10;
export const halfYSize = 7;
export const gridSize = 100;

export const xMin = -15,
    xMax = 15;
export const yMin = -10,
    yMax = 10;

// export const xMin = -15, xMax = 15;
// export const yMin = -10, yMax = 10;
//export const yMin = 0, yMax = 10;

export const bounds = { xMin, xMax, yMin, yMax };

export const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

export const initFuncStr = 'x+y'; // "x*y*sin(x + y)/10";

export const initXFuncStr = 'x';
export const initXFunc = funcParser(initXFuncStr);

export const initYFuncStr = 'cos(y)';
export const initYFunc = funcParser(initYFuncStr);

//separable case:
//export const initFunc = ((x,y) => initXFunc(x,0)*initYFunc(0,y));

// general case:
export const initFunc = funcParser(initFuncStr);

export const initArrowGridData = {
    gridSqSize: 0.5,
    color: initColors.arrows,
    arrowLength: 0.75,
    bounds,
    func: initFunc,
    xFunc: initXFunc,
    yFunc: initYFunc
};

export const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

export const initAxesData = {
    radius: 0.01,
    color: initColors.axes,
    bounds,
    tickDistance: 1,
    tickRadius: 3.5,
    show: true,
    showLabels: true,
    labelStyle
};

export const initGridData = {
    bounds,
    show: true,
    originColor: 0x3f405c
};

// how much of grid to show at start
//export const cameraConst = 1.00;
export const cameraConst = 1.05;

export const initCameraData = {
    position: [0, 0, 1],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 5000,
    rotation: { order: 'XYZ' },
    orthographic: {
        left: cameraConst * xMin,
        right: cameraConst * xMax,
        top: cameraConst * yMax,
        bottom: cameraConst * yMin
    }
};

// export const initControlsData = {
//     mouseButtons: { LEFT: THREE.MOUSE.DOLLY },
// 	touches: { ONE: THREE.MOUSE.ROTATE,
// 		   TWO: THREE.TOUCH.DOLLY,
// 		   THREE: THREE.MOUSE.PAN },
//     enableRotate: false,
//     enablePan: false,
//     enabled: true,
//     keyPanSpeed: 50 };

export const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.PAN },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

export const secControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    zoomSpeed: 1.25
};
