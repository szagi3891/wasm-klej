(async () => {
    console.info('Uruchamianie 1/5');
    const resp = await fetch('binary.wasm');

    console.info('Uruchamianie 2/5');
    const binary = await resp.arrayBuffer();

    console.info('Uruchamianie 3/5');

    //@ts-expect-error
    let module_instance: WebAssemblyInstantiatedSource;

    const imports = {
        mod: {
            log: (walue: BigInt) => {
                console.info("Log z webassemblera", walue);
            },
            log_string: (ptr: BigInt, len: BigInt) => {
                //zdekodować
                //wyświetlić

                var m = new Uint8Array(
                    module_instance.instance.exports.memory.buffer,
                    Number(ptr),
                    Number(len)
                );

                var decoder = new TextDecoder("utf-8");
                // return a slice of size `len` from the module's
                // memory, starting at offset `ptr`
                const dd = decoder.decode(m.slice(0, Number(len)));
                console.info(`string otrzymany z wasm """${dd}"""`);
            }
        }
    };

    module_instance = await WebAssembly.instantiate(binary, imports);

    console.info('exports', module_instance.instance.exports);

    // const mod = new WebAssembly.Module(binary);

    // console.info('Uruchamianie 4/5');
    // const exports = new WebAssembly.Instance(mod, imports).exports;

    console.info('Uruchamianie 5/5', module_instance);

    module_instance.instance.exports.sum(33,44);

    let cachedTextEncoder = new TextEncoder(
        //@ts-expect-error
        'utf-8'
    );


    let cachegetUint8Memory0: Uint8Array = new Uint8Array(1);
    const getUint8Memory0 = () => {
        if (cachegetUint8Memory0.buffer !== module_instance.instance.exports.memory.buffer) {
            cachegetUint8Memory0 = new Uint8Array(module_instance.instance.exports.memory.buffer);
        }
        return cachegetUint8Memory0;
    }


    const push_string = (arg: string) => {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = Number(module_instance.instance.exports.alloc(BigInt(buf.length)));
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
    };

    push_string("To jest jakiś string z js-aaaaaa");
    module_instance.instance.exports.str_from_js();

    //module_instance.instance.exports.alloc()
})();

// let cachegetUint8Memory0 = null;
// function getUint8Memory0() {
//     if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
//         cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
//     }
//     return cachegetUint8Memory0;
// }