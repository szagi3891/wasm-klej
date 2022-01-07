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
}


(async () => {

    //@ts-expect-error
    let log: (walue: BigInt) => void = null;
    //@ts-expect-error
    let log_string: (ptr: BigInt, len: BigInt) => void = null;

    const controller = await wasmInit<ImportType, ExportType>('binary.wasm', {
        mod: {
            log: (walue: BigInt) => {
                log(walue);
            },
            log_string: (ptr: BigInt, len: BigInt) => {
                log_string(ptr, len)
            },
        }
    });

    //TODO - miejsce na inicjację stanu

    log = (walue: BigInt) => {
        console.info("Log z webassemblera", walue);
    };

    log_string = (ptr: BigInt, len: BigInt) => {
        const text = controller.decodeText(ptr, len);
        console.info(`string otrzymany z wasm """${text}"""`);
    }

    const suma = controller.exports().sum(33, 44);
    console.info(`Suma 33 i 44 = ${suma}`);

    controller.pushString("JJJAAAABBBCCCSSSSSaa66");
    controller.pushString("aaa");
    controller.exports().str_from_js();
    controller.exports().str_from_js();
})();
