export interface BaseExportType {
    alloc: (length: BigInt) => BigInt
};

export interface ModuleControllerType<ExportType extends BaseExportType> {
    exports: () => ExportType,
    getModule: () => WebAssembly.WebAssemblyInstantiatedSource,
    getUint8Memory: () => Uint8Array,
    decodeText: (ptr: BigInt, length: BigInt) => string,
    pushString: (value: string) => void,
}

export const wasmInit = async <ImportType extends Record<string, Function>, ExportType extends BaseExportType>(
    wasmBinPath: string,
    imports: { mod: ImportType },
): Promise<ModuleControllerType<ExportType>> => {
    const resp = await fetch(wasmBinPath);
    const binary = await resp.arrayBuffer();

    let module_instance: WebAssembly.WebAssemblyInstantiatedSource;
    const getModule = () => module_instance;

    let cachegetUint8Memory: Uint8Array = new Uint8Array(1);

    const getUint8Memory = () => {
        if (module_instance.instance.exports.memory instanceof WebAssembly.Memory) {
            if (cachegetUint8Memory.buffer !== module_instance.instance.exports.memory.buffer) {
                console.info('getUint8Memory: reallocate the Uint8Array for a new size', module_instance.instance.exports.memory.buffer.byteLength);
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

    const imports_inst: Record<string, WebAssembly.ModuleImports> = imports;
    module_instance = await WebAssembly.instantiate(binary, imports_inst);

    return moduleController;
};
