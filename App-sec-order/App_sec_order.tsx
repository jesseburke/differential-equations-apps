import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { OptionsTabComp } from '@jesseburke/components';

import { MainDataComp } from '@jesseburke/jotai-data-setup';

import { SvgScene, SvgContext } from '@jesseburke/svg-scene-with-react';
import { SvgBorderAxes } from '@jesseburke/svg-scene-with-react';
import { SvgAxes } from '@jesseburke/svg-scene-with-react';
import { SvgFunctionGraph } from '@jesseburke/svg-scene-with-react';

import {
    labelData,
    solutionCurveData,
    axesData,
    initialPoint1Data,
    initialPoint2Data,
    InitialPointsInput,
    solnAtom,
    atomStoreAtom,
    SecondOrderInput,
    svgData
} from './App_sec_order_atoms.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const btnClassStr =
    'absolute right-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-40';

const resetBtnClassStr = btnClassStr + ' bottom-24';

const photoBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
    const DataComp = MainDataComp(atomStoreAtom);
    return (
        <JProvider>
            <div className='full-screen-base'>
                <header
                    className='control-bar bg-persian_blue-900 font-sans
		    p-4 md:p-8 text-white'
                >
                    <SecondOrderInput />
                    <InitialPointsInput className='flex-grow-1' />
                    <OptionsTabComp
                        className={'relative w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                        nameComponentArray={[
                            ['Solution curve', solutionCurveData.component, { offerToShow: false }]
                        ]}
                    />
                </header>

                <main className='flex-grow relative p-0'>
                    <SvgScene svgData={svgData}>
                        <SvgAxes />
                        <SvgFunctionGraph
                            funcAtom={solnAtom}
                            curveDataAtom={solutionCurveData.atom}
                        />
                        <SvgCircleComp pointAtom={initialPoint1Data.atom} radius={0.25} />
                        <SvgBorderAxes />
                    </SvgScene>
                    <DataComp
                        resetBtnClassStr={resetBtnClassStr}
                        saveBtnClassStr={saveBtnClassStr}
                    />
                </main>
            </div>
        </JProvider>
    );
}

const SvgCircleComp = ({ pointAtom, radius }) => {
    const { mathToSvgFuncAtom, zoomAtom } = useContext(SvgContext);

    const zoom = useAtom(zoomAtom)[0];
    const { x, y } = useAtom(pointAtom)[0];

    const mathToSvgFunc = useAtom(mathToSvgFuncAtom)[0].func;

    return (
        <circle
            cx={x}
            cy={y}
            r={radius}
            stroke='red'
            fill='red'
            transform={`translate(${mathToSvgFunc({ x: 1, y: 1 }).x} ${
                mathToSvgFunc({ x: 1, y: 1 }).y
            }) scale(${1 / zoom})`}
        />
    );
};

/* <Sphere dragPositionAtom={initialPoint1Data.atom} radius={0.25} />
 * <Sphere dragPositionAtom={initialPoint2Data.atom} radius={0.25} /> */

const SvgMakeDraggable = ({ posAtom, zoomAtom }) => {
    const [pos, setPos] = useAtom(posAtom);
    const zoom = useAtom(zoomAtom)[0];

    const tempPos = useRef(pos);

    const isDown = useRef<null | 'mouse' | 'touch'>(null);
    const lastPosition = useRef<[number, number]>();

    useEffect(() => {
        if (pos.x !== tempPos.current.x || pos.y !== tempPos.current.y) tempPos.current = pos;
    }, [pos]);

    const onMouseDown = useCallback(
        (e) => {
            e.stopPropagation();
            if (e.button === 0 && !isDown.current) {
                isDown.current = 'mouse';
                lastPosition.current = [e.clientX, e.clientY];
            }
        },
        [isDown.current]
    );

    const onMouseMove = useCallback((e) => {
        if (isDown.current === 'mouse') {
            const newPos = [e.clientX, e.clientY];

            if (lastPosition.current) {
                const diffX = newPos[0] - lastPosition.current[0];
                const diffY = newPos[1] - lastPosition.current[1];
                lastPosition.current = pos;
                setPos((prev) => ({
                    x: prev.x - diffX / zoom,
                    y: prev.y - diffY / zoom
                }));
            }
        }
    }, []);

    /* onMouseDown={(e) => {
     *
     *                     console.log('clicked origin');
     *                 }}
     *                 onMouseMove={(e) => {
     *                     console.log('moving mouse over origin');
     *                 }}
     */
};
