import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { OptionsTabComp } from '@jesseburke/components';
import { ThreeSceneComp } from '@jesseburke/three-scene-with-react';
import { MainDataComp } from '@jesseburke/jotai-data-setup';
import { Grid } from '@jesseburke/three-scene-with-react';
import { Axes2D } from '@jesseburke/three-scene-with-react';
import { ArrowGrid } from '@jesseburke/three-scene-with-react';
import { IntegralCurve } from '@jesseburke/three-scene-with-react';
import { CameraControls } from '@jesseburke/three-scene-with-react';

import '../styles.css';

import {
    arrowGridData,
    boundsData,
    initialPointData,
    funcAtom,
    labelData,
    solutionCurveData,
    axesData,
    orthoCameraData,
    zHeightAtom,
    atomStoreAtom,
    SepEquationInput
} from './App_sep_atoms';

//------------------------------------------------------------------------
//
// initial data
//

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.PAN },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY_PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: true
};

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const btnClassStr =
    'absolute left-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

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
                    <SepEquationInput />
                    <initialPointData.component inputStr={'Initial Point: '} />
                    <OptionsTabComp
                        className={'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                        nameComponentArray={[
                            ['Arrow Grid', arrowGridData.component],
                            ['Axes', axesData.component],
                            ['Bounds', boundsData.component],
                            ['Camera', orthoCameraData.component],
                            ['Solution curve', solutionCurveData.component],
                            ['Variable labels', labelData.component]
                        ]}
                    />
                </header>

                <main className='flex-grow relative p-0'>
                    <ThreeSceneComp
                        fixedCameraData={fixedCameraData}
                        controlsData={initControlsData}
                        photoButton={true}
                        photoBtnClassStr={photoBtnClassStr}
                    >
                        <Grid boundsAtom={boundsData.atom} gridShow={true} />
                        <Axes2D
                            tickLabelDistance={1}
                            boundsAtom={boundsData.atom}
                            axesDataAtom={axesData.atom}
                            labelAtom={labelData.atom}
                        />
                        <ArrowGrid
                            diffEqAtom={funcAtom}
                            boundsAtom={boundsData.atom}
                            arrowGridDataAtom={arrowGridData.atom}
                            zHeightAtom={zHeightAtom}
                        />
                        <IntegralCurve
                            initialPointAtom={initialPointData.atom}
                            boundsAtom={boundsData.atom}
                            diffEqAtom={funcAtom}
                            curveDataAtom={solutionCurveData.atom}
                            zHeightAtom={zHeightAtom}
                        />
                        <CameraControls cameraDataAtom={orthoCameraData.atom} />
                    </ThreeSceneComp>
                    <DataComp
                        resetBtnClassStr={resetBtnClassStr}
                        saveBtnClassStr={saveBtnClassStr}
                    />
                </main>
            </div>
        </JProvider>
    );
}
