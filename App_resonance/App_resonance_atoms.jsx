import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { LabelDataComp } from '@jesseburke/jotai-data-setup';
import { NumberDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { SvgDataComp } from '@jesseburke/svg-scene-with-react';

import { TexDisplayComp } from '@jesseburke/components';
import { Slider } from '@jesseburke/components';
import { processNum } from '@jesseburke/basic-utils';
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

const initW0Val = 4.8;
const initWVal = 4.9;
const initFVal = 4.89;

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 10
};

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.01,
    visible: true,
    width: 4
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

export const labelData = LabelDataComp({ xLabel: 't', twoD: true });
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const solutionCurveData = CurveDataComp(initSolutionCurveData);

export const fData = NumberDataComp(initFVal);
export const wData = NumberDataComp(initWVal);
export const w0Data = NumberDataComp(initW0Val);

export const svgData = SvgDataComp();

export const atomStoreAtom = atom({
    ls: labelData.readWriteAtom,
    ax: axesData.readWriteAtom,
    sc: solutionCurveData.readWriteAtom,
    f: fData.readWriteAtom,
    w: wData.readWriteAtom,
    w0: w0Data.readWriteAtom,
    svg: svgData.svgSaveDataAtom
});

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => {
    const f = get(fData.atom);
    const w = get(wData.atom);
    const w0 = get(w0Data.atom);

    if (w != w0) {
        const A = f / (w0 * w0 - w * w);

        return { func: (t) => A * (Math.cos(w * t) - Math.cos(w0 * t)) };
    }

    return { func: (t) => (f / (2 * w)) * t * Math.sin(w * t) };
});

export const solnStrAtom = atom((get) => {
    {
        const f = get(fData.atom);
        const w = get(wData.atom);
        const w0 = get(w0Data.atom);

        const { x, y } = get(labelData.atom);

        if (w != w0) {
            const A = f / (w0 * w0 - w * w);

            return `${y}=${processNum(A, precision).texStr}( \\cos(${w}${x}) - \\cos(${w0}${x}))`;
        }

        return `${y}=${
            processNum(f / (2 * w0), precision).texStr
        } \\cdot ${x}\\cdot\\sin(${w}${x})`;
    }
});

//------------------------------------------------------------------------
//

const fMin = 0.1;
const fMax = 10;
const w0Min = 0.1;
const w0Max = 10;
const wMin = 0.1;
const wMax = 10;

const step = 0.01;

const resonanceEqTexAtom = atom((get) => {
    const { x, y } = get(labelData.atom);

    return `\\ddot{${y}} + \\omega_0^2 ${y} = f \\cos( \\omega ${x} )`;
});

const initialCondsTexAtom = atom((get) => {
    const { y } = get(labelData.atom);

    return `${y}(0) = 0, \\, \\, \\dot{${y}}(0) = 0`;
});

export function SecondOrderInput() {
    const { x: xLabel, y: yLabel } = useAtom(labelData.atom)[0];

    const [f, setF] = useAtom(fData.atom);
    const [w, setW] = useAtom(wData.atom);
    const [w0, setW0] = useAtom(w0Data.atom);

    const solnStr = useAtom(solnStrAtom)[0];

    const resonanceEqTex = useAtom(resonanceEqTexAtom)[0];
    const initialCondsTex = useAtom(initialCondsTexAtom)[0];

    const ATexStr = `A = \\frac{f}{\\omega_0^2 - \\omega^2} = ${
        processNum(f / (w0 * w0 - w * w), precision).texStr
    }`;

    return (
        <div
            className='flex justify-around items-center h-full py-2
            px-4 text-xl m-0 flex-grow'
        >
            <div
                className='m-0 flex flex-col justify-center
		content-center py-2 pl-8 pr-16 lg:pr-32 hidden xl:block'
            >
                <div className='pb-2 px-0 whitespace-nowrap'>
                    <TexDisplayComp str={resonanceEqTex} />
                </div>
                <div>
                    <TexDisplayComp str={initialCondsTex} />
                </div>
            </div>

            <div
                className='m-0 flex flex-col justify-center
		content-center py-2 pl-8 lg:px-16 flex-grow'
            >
                <div className='py-1'>
                    <Slider
                        value={w0}
                        CB={(val) => setW0(Number.parseFloat(val))}
                        label={'w0'}
                        max={w0Max}
                        min={w0Min}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
                <div className='py-1'>
                    <Slider
                        value={w}
                        CB={(val) => setW(Number.parseFloat(val))}
                        label={'w'}
                        max={wMax}
                        min={wMin}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
                <div className='py-1'>
                    <Slider
                        value={f}
                        CB={(val) => setF(Number.parseFloat(val))}
                        label={'f'}
                        max={fMax}
                        min={fMin}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
            </div>
            <div
                className='mr-auto ml-auto flex flex-col justify-center
		content-center py-2 pl-8 pr-16 flex-grow'
            >
                <div
                    className='m-0 flex flex-col justify-center
		    content-center py-2 px-4 hidden xl:block'
                >
                    <TexDisplayComp str={ATexStr} />
                </div>
                <div className='py-1 text-m whitespace-no-wrap'>
                    <TexDisplayComp str={solnStr} />
                </div>
            </div>
        </div>
    );
}
