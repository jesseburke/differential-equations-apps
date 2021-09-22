import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { OptionsTabComp } from '@jesseburke/components';

import { MainDataComp } from '@jesseburke/jotai-data-setup';

import { SvgScene } from '@jesseburke/svg-scene-with-react';
import { SvgBorderAxes } from '@jesseburke/svg-scene-with-react';
import { SvgAxes } from '@jesseburke/svg-scene-with-react';
import { SvgFunctionGraph } from '@jesseburke/svg-scene-with-react';

import {
    funcAtom,
    labelData,
    solutionCurveData,
    axesData,
    atomStoreAtom,
    SecondOrderInput,
    svgData
} from './App_resonance_atoms.jsx';

import '../styles.css';

//------------------------------------------------------------------------
//
// initial data
//

const btnClassStr =
    'absolute right-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

const photoBtnClassStr = btnClassStr + ' bottom-8';

export default function App() {
    const DataComp = MainDataComp(atomStoreAtom);

    return (
        <JProvider>
            <div className='full-screen-base'>
                <header
                    className='control-bar-large bg-persian_blue-900 font-sans
		    p-4 md:p-8 text-white'
                >
                    <SecondOrderInput />
                    <OptionsTabComp
                        className={
                            'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded hidden lg:block'
                        }
                        nameComponentArray={[
                            ['Solution curve', solutionCurveData.component, { offerToShow: false }]
                        ]}
                    />
                </header>

                <main className='flex-grow relative p-0'>
                    <SvgScene svgData={svgData}>
                        <SvgAxes />
                        <SvgFunctionGraph
                            funcAtom={funcAtom}
                            curveDataAtom={solutionCurveData.atom}
                        />
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
