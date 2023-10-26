// Example for pages/Page1.js
'use client'
import {
    TextInput,
    Label,
    Button,
    Alert,
    Spinner as _Spinner,
} from 'flowbite-react'
import React, { useState } from 'react'
// import { formDataSchemaEncrypt, formDataSchemaDecrypt } from './parsers'
import { useSharedResources } from '../EngineContext';
import { stringify } from "json-bigint";

type Utils = typeof import("../Utils")
type Engine = typeof import("@ezkljs/engine/web/ezkl")

type Cipher = number[][][]
type DecryptedCipher = number[][]

export default function FeltUtils() {
    const { engine, utils } = useSharedResources();

    return (
        <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
        </div>
    );
}