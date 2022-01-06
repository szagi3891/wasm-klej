import { init_wasm, ModuleControllerType } from './wasm_init';

(async () => {
    const resp = await fetch('binary.wasm');
    const binary = await resp.arrayBuffer();

    interface ExportType {
        alloc: (length: BigInt) => BigInt,
        sum: (a: number, b: number) => number,
        str_from_js: () => void,
    }

    const getImports = (controller: ModuleControllerType<ExportType>) => ({
        mod: {
            log: (walue: BigInt) => {
                console.info("Log z webassemblera", walue);
            },
            log_string: (ptr: BigInt, len: BigInt) => {
                const text = controller.decodeText(ptr, len);
                console.info(`string otrzymany z wasm """${text}"""`);
            }
        }
    });

    const controller = await init_wasm<ExportType>(binary, getImports);

    const suma = controller.exports().sum(33, 44);
    console.info(`Suma 33 i 44 = ${suma}`);

    controller.pushString("JJJAAAABBBCCCSSSSSaa66");
    controller.pushString("aaa");
    controller.exports().str_from_js();
    controller.exports().str_from_js();
})();