(async () => {
    console.info('Uruchamianie 1/5');
    const resp = await fetch('binary.wasm');

    console.info('Uruchamianie 2/5');
    const binary = await resp.arrayBuffer();

    console.info('Uruchamianie 3/5');

    const imports = {
        mod: {
            log: (walue: number) => {
                console.info("Log z webassemblera", walue);
            }
        }
    };

    const mod_1 = await WebAssembly.instantiate(binary, imports);

    console.info('exports', mod_1.instance.exports);

    // const mod = new WebAssembly.Module(binary);

    // console.info('Uruchamianie 4/5');
    // const exports = new WebAssembly.Instance(mod, imports).exports;

    console.info('Uruchamianie 5/5', mod_1);

    //@ts-expect-error
    mod_1.instance.exports.sum(33,44);
})();

// let cachegetUint8Memory0 = null;
// function getUint8Memory0() {
//     if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
//         cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
//     }
//     return cachegetUint8Memory0;
// }