import { atom } from 'jotai';

import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';
import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { ArrowGridDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

import { ObjectPoint2, Bounds, CurveData2, LabelStyle, AxesDataT } from '../../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#cf6c28' //#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initInitialPoint: ObjectPoint2 = { x: 2, y: 2 };

const initSolutionCurveData: CurveData2 = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initFuncStr: string = 'x*y*sin(x+y)/10';

const initAxesData: AxesDataT = {
    radius: 0.02,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

export const labelStyle: LabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1.5em',
    color: colors.tick
});

//------------------------------------------------------------------------
//
// primitive atoms

export const labelData = LabelDataComp({ twoD: true });
export const initialPointData = PointDataComp(initInitialPoint);
export const arrowGridData = ArrowGridDataComp(initArrowData);
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveData = CurveDataComp(initSolutionCurveData);

export const diffEqData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom: atom(
        (get) => 'd' + get(labelData.atom).y + '/d' + get(labelData.atom).x + ' = '
    ),
    labelAtom: labelData.atom
});

export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom,
    twoD: true
});

export const orthoCameraData = OrthoCameraDataComp(initCameraData);

export const atomStoreAtom = atom({
    ls: labelData.readWriteAtom,
    ip: initialPointData.readWriteAtom,
    ag: arrowGridData.readWriteAtom,
    ax: axesData.readWriteAtom,
    sc: solutionCurveData.readWriteAtom,
    fn: diffEqData.readWriteAtom,
    bd: boundsData.readWriteAtom,
    cd: orthoCameraData.readWriteAtom
});

function theta(a) {
    return Math.asin(a / Math.sqrt(a * a + 1));
}

export const zHeightAtom = atom((get) => {
    const f = get(diffEqData.funcAtom).func;

    return { func: (x, y) => 3 * theta(f(x, y)) };
});
