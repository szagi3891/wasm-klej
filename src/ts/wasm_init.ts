interface BaseExportType {
    alloc: (length: BigInt) => BigInt
};

export interface ModuleControllerType<ExportType extends BaseExportType> {
    exports: () => ExportType,
    getModule: () => WebAssembly.WebAssemblyInstantiatedSource,
    getUint8Memory: () => Uint8Array,
    decodeText: (ptr: BigInt, length: BigInt) => string,
    pushString: (value: string) => void,
}

export const wasmInit = async <ExportType extends BaseExportType>(
    wasmBinPath: string,
    getImports: (controller: ModuleControllerType<ExportType>) => Record<string, WebAssembly.ModuleImports>
): Promise<ModuleControllerType<ExportType>> => {
    // binary: ArrayBuffer,
    const resp = await fetch(wasmBinPath);
    const binary = await resp.arrayBuffer();

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


    let cachedTextEncoder = new TextEncoder();

    const pushString = (arg: string) => {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = Number(exports().alloc(BigInt(buf.length)));

        getUint8Memory().subarray(ptr, ptr + buf.length).set(buf);
    };

    const moduleController: ModuleControllerType<ExportType> = {
        exports,
        getModule,
        getUint8Memory,
        decodeText,
        pushString
    };

    module_instance = await WebAssembly.instantiate(binary, getImports(moduleController));

    return moduleController;
};
