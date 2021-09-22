import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { NumberDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

import { SvgDataComp } from '@jesseburke/jotai-data-setup';

import { TexDisplayComp } from '@jesseburke/components';
import { Slider } from '@jesseburke/components';

import { round, processNum } from '@jesseburke/basic-utils';

import { funcParser, solnStrs } from '@jesseburke/math-utils';

//------------------------------------------------------------------------
//
// initial constants

const precision = 4;
const sliderPrecision = 2;

const colors = {
    solutionCurve: '#B01A46', //'#C2374F'
    //solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initAVal = 0.2;
const initBVal = 3.0;

// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = 0.1;

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 10
};

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 3
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

const initInitialPoint1 = { x: 4, y: 7 };
const initInitialPoint2 = { x: 7, y: 5 };

const zoom1XWidth = 80;

//------------------------------------------------------------------------
//
// primitive atoms

export const labelData = LabelDataComp({ xLabel: 't', twoD: true });
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const solutionCurveData = CurveDataComp(initSolutionCurveData);

//solutionCurveData.component = (() =>

export const aData = NumberDataComp(initAVal);
export const bData = NumberDataComp(initBVal);

export const initialPoint1Data = PointDataComp(initInitialPoint1);
export const initialPoint2Data = PointDataComp(initInitialPoint2);

export const svgData = SvgDataComp({ zoom1XWidth });

export const atomStoreAtom = atom({
    ls: labelData.readWriteAtom,
    ax: axesData.readWriteAtom,
    sc: solutionCurveData.readWriteAtom,
    a: aData.readWriteAtom,
    b: bData.readWriteAtom,
    ip1: initialPoint1Data.readWriteAtom,
    ip2: initialPoint2Data.readWriteAtom,
    svg: svgData.svgSaveDataAtom
});

//------------------------------------------------------------------------
//
// derived atoms

export const texEquationAtom = atom((get) => {
    const { y } = get(labelData.atom);

    return `\\ddot{ ${y} } + a \\cdot \\dot{ ${y} } + b \\cdot
        ${y} = 0`;
});

export const solnAtom = atom((get) => {
    const ss = solnStrs(Number.parseFloat(get(aData.atom)), Number.parseFloat(get(bData.atom)), [
        [get(initialPoint1Data.atom).x, get(initialPoint1Data.atom).y],
        [get(initialPoint2Data.atom).x, get(initialPoint2Data.atom).y]
    ]);

    const func = funcParser(ss.str);

    // a and b are for debugging
    return Object.assign({ func, a: get(aData.atom), b: get(bData.atom) }, ss);
});
export const solnTexStrAtom = atom((get) => get(solnAtom).texStr);

const caseStrAtom = atom((get) => {
    const a = get(aData.atom);
    const b = get(bData.atom);
    const n = round(a * a - 4 * b);

    if (n > 0) {
        return { cse: 1, caseStr: `a^2 - 4b = ${n} > 0` };
    }

    if (n < 0) {
        return { cse: 2, caseStr: `a^2 - 4b = ${n} < 0` };
    }

    if (n === 0) {
        return { cse: 3, caseStr: `a^2 - 4b = ${n} = 0` };
    }
});

//------------------------------------------------------------------------
//
// input components

export const InitialPointsInput = ({ className }) => {
    const { y: yLabel } = useAtom(labelData.atom)[0];

    return (
        <div
            className='flex justify-center items-center h-100 py-0
        px-8 text-l'
        >
            <fieldset>
                <legend align='center'>Initial Conditions</legend>

                <div className='py-0 px-6 text-l'>
                    <initialPoint1Data.component prefixStr={yLabel + '('} infixStr={') = '} />
                </div>
                <div className='py-0 px-6'>
                    <initialPoint2Data.component
                        prefixStr={yLabel + '\u{0307}' + '('}
                        infixStr={') = '}
                    />
                </div>
            </fieldset>
        </div>
    );
};

export const SecondOrderInput = ({}) => {
    const [a, setA] = useAtom(aData.atom);
    const [b, setB] = useAtom(bData.atom);

    const texEquation = useAtom(texEquationAtom)[0];
    const { cse, caseStr } = useAtom(caseStrAtom)[0];

    return (
        <div
            className='flex justify-around items-baseline h-full py-0
            px-0 m-0 flex-grow'
        >
            <div
                className='flex flex-col justify-center items-center
        h-full text-l m-0 px-12 hidden xl:block'
            >
                <div className='pb-2 px-0 text-center'>
                    2nd order linear, w/ constant coefficients
                </div>
                <div className='pt-2 px-0 text-xl whitespace-no-wrap'>
                    <TexDisplayComp str={texEquation} />
                </div>
            </div>
            <div
                className='flex flex-col justify-center items-center
        h-full px-8'
            >
                <Slider
                    value={a}
                    label={'a'}
                    CB={(val) => setA(Number.parseFloat(val))}
                    max={aMax}
                    min={aMin}
                    step={aStep}
                    precision={sliderPrecision}
                />
                <Slider
                    value={b}
                    label={'b'}
                    CB={(val) => setB(Number.parseFloat(val))}
                    min={(a * a - abBound) / 4}
                    max={(a * a + abBound) / 4}
                    precision={sliderPrecision}
                />
            </div>
            <div
                className='flex flex-col justify-center items center
        h-full text-l m-0 px-8 hidden xl:block flex-grow'
            >
                <div className='pb-2 px-0 text-center'>
                    <TexDisplayComp str={caseStr} />
                </div>
                <div className='pt-2 px-0 text-center'>
                    <span>Case {cse}</span>
                </div>
            </div>
        </div>
    );
};

export const SolutionDisplayComp = ({}) => {
    const solnTexStr = useAtom(solnTexStrAtom)[0];

    return (
        <div
            className='py-2 px-0 flex flex-col justify-center
    align-center h-100 w-12'
        >
            <div>Solution:</div>
            <div className='whitespace-no-wrap py-1 px-0'>
                <TexDisplayComp str={solnTexStr} />
            </div>
        </div>
    );
};
