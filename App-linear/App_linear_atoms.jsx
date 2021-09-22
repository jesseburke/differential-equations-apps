import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';
import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { ArrowGridDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

import { TexDisplayComp } from '@jesseburke/components';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initInitialPoint = { x: 0, y: 6 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initPXFuncStr = '4*x/(x^2+1)';
const initQXFuncStr = '-12*x/(x^2+1)';

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

export const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1em',
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

export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom
});

export const orthoCameraData = OrthoCameraDataComp(initCameraData);

const pxFunctionData = FunctionDataComp({
    initVal: initPXFuncStr,
    functionLabelAtom: atom((get) => 'p(' + get(labelData.atom).x + ') = '),
    labelAtom: labelData.atom,
    inputSize: 10
});

const qxFunctionData = FunctionDataComp({
    initVal: initQXFuncStr,
    functionLabelAtom: atom((get) => 'q(' + get(labelData.atom).x + ') = '),
    labelAtom: labelData.atom,
    inputSize: 10
});

export const atomStoreAtom = atom({
    ls: labelData.readWriteAtom,
    ip: initialPointData.readWriteAtom,
    ag: arrowGridData.readWriteAtom,
    ax: axesData.readWriteAtom,
    sc: solutionCurveData.readWriteAtom,
    bd: boundsData.readWriteAtom,
    cd: orthoCameraData.readWriteAtom,
    px: pxFunctionData.readWriteAtom,
    qx: qxFunctionData.readWriteAtom
});

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: (x, y) =>
        get(pxFunctionData.funcAtom).func(x, 0) * -y + get(qxFunctionData.funcAtom).func(x, 0)
}));

function theta(a) {
    return Math.asin(a / Math.sqrt(a * a + 1));
}

export const zHeightAtom = atom((get) => {
    const f = get(funcAtom).func;

    return { func: (x, y) => 3 * theta(f(x, y)) };
});

//------------------------------------------------------------------------
//
// input components

export const LinearEquationInput = function LinearEquationI({}) {
    const { x: xLabel, y: yLabel } = useAtom(labelData.atom)[0];

    const [texEquation, setTexEquation] = useState();

    useEffect(() => {
        setTexEquation(`\\frac{d${yLabel}}{d${xLabel}} + p(${xLabel})${yLabel} = q(${xLabel})`);
    }, [xLabel, yLabel]);

    return (
        <div className='flex flex-col justify-center items-center h-full'>
            <div className='px-2 py-3 text-xl'>
                <TexDisplayComp str={texEquation} />
            </div>
            <div className='flex flex-col md:flex-row'>
                <span className='px-2 py-1'>
                    <pxFunctionData.component />
                </span>
                <span className='px-2 py-1'>
                    <qxFunctionData.component />
                </span>
            </div>
        </div>
    );
};
