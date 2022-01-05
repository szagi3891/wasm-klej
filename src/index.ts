(async () => {
    const resp = await fetch('binary.wasm');
    const binary = await resp.arrayBuffer();

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

    console.info('Uruchomiono', module_instance);

    const suma = module_instance.instance.exports.sum(33,44);
    console.info(`Suma 33 i 44 = ${suma}`);

    let cachedTextEncoder = new TextEncoder(
        //@ts-expect-error
        'utf-8'
    );


    let cachegetUint8Memory0: Uint8Array = new Uint8Array(1);

    const getUint8Memory0 = () => {
        if (cachegetUint8Memory0.buffer !== module_instance.instance.exports.memory.buffer) {
            console.info('Realokuję dla nowego rozmiaru', module_instance.instance.exports.memory.buffer);
            cachegetUint8Memory0 = new Uint8Array(module_instance.instance.exports.memory.buffer);
        }
        return cachegetUint8Memory0;
    }


    const push_string = (arg: string) => {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = Number(module_instance.instance.exports.alloc(BigInt(buf.length)));

        const nowe_okno_zapisu = getUint8Memory0().subarray(ptr, ptr + buf.length);

        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
    };

    push_string("JJJAAAABBBCCCSSSS");
    push_string("aaa");
    module_instance.instance.exports.str_from_js();
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