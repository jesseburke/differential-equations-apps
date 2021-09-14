import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { LineDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';
import { NumberDataComp } from '@jesseburke/jotai-data-setup';
import { ArrowGridDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

import { TexDisplayComp } from '@jesseburke/components';
import { Slider } from '@jesseburke/components';

//------------------------------------------------------------------------
//
// initial constants

const precision = 3;

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds = { xMin: -20, xMax: 20, yMin: 0, yMax: 22 };

const initInitialPoint = { x: 0, y: 6 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initBVal = 10.0;
const initKVal = 1.0;

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    target: [0, 11, 0],
    zoom: 0.185,
    position: [0, 11, 50]
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

const initLineColor = '#3285ab';

const lineLabelStyle = {
    color: initLineColor,
    padding: '0em',
    margin: '0em',
    fontSize: '1.75em'
};

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

export const bData = NumberDataComp(initBVal);
export const kData = NumberDataComp(initKVal);

export const atomStoreAtom = atom({
    ls: labelData.readWriteAtom,
    ip: initialPointData.readWriteAtom,
    ag: arrowGridData.readWriteAtom,
    ax: axesData.readWriteAtom,
    sc: solutionCurveData.readWriteAtom,
    bd: boundsData.readWriteAtom,
    cd: orthoCameraData.readWriteAtom,
    b: bData.readWriteAtom,
    k: kData.readWriteAtom
});

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => {
    const k = get(kData.atom);
    const b = get(bData.atom);
    return { func: (x, y) => k * (1 - y / b) };
});

const pt1Atom = atom((get) => {
    const b = get(bData.atom);
    const { xMax, xMin } = get(boundsData.atom);

    return new THREE.Vector3(xMin, b, 0);
});

const pt2Atom = atom((get) => {
    const b = get(bData.atom);
    const { xMax, xMin } = get(boundsData.atom);

    return new THREE.Vector3(xMax, b, 0);
});

export const { lineDataAtom } = LineDataComp({ pt1Atom, pt2Atom });

export const lineColorAtom = atom(initLineColor);

export const lineLabelAtom = atom((get) => {
    return {
        pos: [initBounds.xMax - 5, get(bData.atom) + 3, 0],
        text: get(labelData.atom).y + '= ' + get(bData.atom),
        style: lineLabelStyle
    };
});

function theta(a) {
    return Math.asin(a / Math.sqrt(a * a + 1));
}

export const zHeightAtom = atom((get) => {
    const f = get(funcAtom).func;

    return { func: (x, y) => 3 * theta(f(x, y)) };
});

//------------------------------------------------------------------------
//

export function LogisticEquationInput() {
    const { x: xLabel, y: yLabel } = useAtom(labelData.atom)[0];

    const [b, setB] = useAtom(bData.atom);
    const [k, setK] = useAtom(kData.atom);
    const { yMax } = useAtom(boundsData.atom)[0];

    const [texEquation, setTexEquation] = useState();

    useEffect(() => {
        setTexEquation(
            `\\frac{d ${yLabel} }{d ${xLabel} } = k ${yLabel} (1 - \\frac{ ${yLabel} }{b})`
        );
    }, [xLabel, yLabel]);

    const bCB = useCallback(
        (num) => {
            setB(Number.parseFloat(num));
        },
        [setB]
    );

    const kCB = useCallback(
        (num) => {
            setK(Number.parseFloat(num));
        },
        [setK]
    );

    return (
        <div
            className='flex justify-center items-center h-full py-2
        px-8 text-xl m-0'
        >
            <div
                className='m-0 flex flex-col justify-center
        content-center py-0 pr-16'
            >
                <div className='text- pb-2 px-0'>Logistic equation</div>
                <TexDisplayComp str={texEquation} />
            </div>
            <div className='pr-4 pt-2'>
                <Slider
                    value={b}
                    CB={bCB}
                    label={'b'}
                    max={yMax}
                    min={0.01}
                    precision={precision}
                />
            </div>
            <div className='pt-2'>
                <Slider value={k} CB={kCB} label={'k'} max={100} min={0.01} precision={precision} />
            </div>
        </div>
    );
}
