import { wasmInit, ModuleControllerType, BaseExportType } from './wasm_init';

type ImportType = {
    log: (walue: BigInt) => void,
    log_string: (ptr: BigInt, len: BigInt) => void,
    // alert: (message: string) => void,
}

type ExportType = {
    alloc: (length: BigInt) => BigInt,
    sum: (a: number, b: number) => number,
    str_from_js: () => void,
    call_native_string: (str_js: string) => void,
}

(async () => {
    const log = (walue: BigInt) => {
        console.info("Log z webassemblera", walue);
    };

    const log_string = (ptr: BigInt, len: BigInt) => {
        const text = wasm.decodeText(ptr, len);
        console.info(`string otrzymany z wasm """${text}"""`);
    }

    const wasm = await wasmInit<ImportType, ExportType>('binary.wasm', {
        mod: {
            log,
            log_string,
        }
    });

    const suma = wasm.exports.sum(33, 44);
    console.info(`Suma 33 i 44 = ${suma}`);

    wasm.pushString("JJJAAAABBBCCCSSSSSaa66");
    wasm.pushString("aaa");
    wasm.exports.str_from_js();
    wasm.exports.str_from_js();
    wasm.exports.call_native_string("...eeerrrtttrrreee...");
})();
