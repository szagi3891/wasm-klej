interface WasmModuleType<ExportType> {
    exports: ExportType, //WebAssembly.Exports,
    getUint8Memory: () => Uint8Array
}

type DDD = WebAssembly.ModuleImports;

const init_wasm = async <ExportType>(
    binary: ArrayBuffer,
    getImports: (
        getModule: () => WebAssembly.WebAssemblyInstantiatedSource,
        getUint8Memory: () => Uint8Array,
    ) => Record<string, WebAssembly.ModuleImports>
): Promise<WasmModuleType<ExportType>> => {
    let module_instance: WebAssembly.WebAssemblyInstantiatedSource;
    const getModule = () => module_instance;

    let cachegetUint8Memory: Uint8Array = new Uint8Array(1);

    const getUint8Memory = () => {
        if (module_instance.instance.exports.memory instanceof WebAssembly.Memory) {
            if (cachegetUint8Memory.buffer !== module_instance.instance.exports.memory.buffer) {
                console.info('Realokuję dla nowego rozmiaru', module_instance.instance.exports.memory.buffer);
                cachegetUint8Memory = new Uint8Array(module_instance.instance.exports.memory.buffer);
            }
            return cachegetUint8Memory;
        } else {
            throw Error('Missing memory');
        }
    };

    module_instance = await WebAssembly.instantiate(binary, getImports(getModule, getUint8Memory));

    return {
        //@ts-expect-error
        exports: module_instance.instance.exports,
        getUint8Memory
    }
};



// WebAssembly.Memory

(async () => {
    const resp = await fetch('binary.wasm');
    const binary = await resp.arrayBuffer();

    const getImports = (
        getSelfModule: () => WebAssembly.WebAssemblyInstantiatedSource,
        getUint8Memory: () => Uint8Array,
    ) => ({
        mod: {
            log: (walue: BigInt) => {
                console.info("Log z webassemblera", walue);
            },
            log_string: (ptr: BigInt, len: BigInt) => {
                const m = getUint8Memory().subarray(Number(ptr), Number(ptr) + Number(len));

                var decoder = new TextDecoder("utf-8");
                const dd = decoder.decode(m.slice(0, Number(len)));
                console.info(`string otrzymany z wasm """${dd}"""`);
            }
        }
    });

    interface ExportType {
        alloc: (length: BigInt) => BigInt,
        sum: (a: number, b: number) => number,
        str_from_js: () => void,
    }

    const moduleController = await init_wasm<ExportType>(binary, getImports);

    console.info('exports', moduleController.exports);
    console.info('Uruchomiono', moduleController);

    const suma = moduleController.exports.sum(33, 44);
    console.info(`Suma 33 i 44 = ${suma}`);

    let cachedTextEncoder = new TextEncoder();

    const push_string = (arg: string) => {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = Number(moduleController.exports.alloc(BigInt(buf.length)));

        moduleController.getUint8Memory().subarray(ptr, ptr + buf.length).set(buf);
    };

    push_string("JJJAAAABBBCCCSSSSSaa55");
    push_string("aaa");
    moduleController.exports.str_from_js();
    moduleController.exports.str_from_js();
})();
