interface ModuleControllerType<ExportType> {
    exports: () => ExportType,
    getModule: () => WebAssembly.WebAssemblyInstantiatedSource,
    getUint8Memory: () => Uint8Array,
    decodeText: (ptr: BigInt, length: BigInt) => string,
}

const init_wasm = async <ExportType>(
    binary: ArrayBuffer,
    getImports: (controller: ModuleControllerType<ExportType>) => Record<string, WebAssembly.ModuleImports>
): Promise<ModuleControllerType<ExportType>> => {
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

    const decodeText = (ptr: BigInt, length: BigInt): string => {
        const m = getUint8Memory().subarray(Number(ptr), Number(ptr) + Number(length));
        var decoder = new TextDecoder("utf-8");
        return decoder.decode(m.slice(0, Number(length)));
    };

    const exports = (): ExportType => {
        //@ts-expect-error
        return module_instance.instance.exports;
    };

    const moduleController: ModuleControllerType<ExportType> = {
        exports,
        getModule,
        getUint8Memory,
        decodeText
    };

    module_instance = await WebAssembly.instantiate(binary, getImports(moduleController));

    return moduleController;
};


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

    console.info('exports', controller.exports());

    const suma = controller.exports().sum(33, 44);
    console.info(`Suma 33 i 44 = ${suma}`);

    let cachedTextEncoder = new TextEncoder();

    const push_string = (arg: string) => {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = Number(controller.exports().alloc(BigInt(buf.length)));

        controller.getUint8Memory().subarray(ptr, ptr + buf.length).set(buf);
    };

    push_string("JJJAAAABBBCCCSSSSSaa55");
    push_string("aaa");
    controller.exports().str_from_js();
    controller.exports().str_from_js();
})();
