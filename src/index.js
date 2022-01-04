(async () => {
    console.info('Uruchamianie 1/5');
    const resp = await fetch('binary.wasm');

    console.info('Uruchamianie 2/5');
    const binary = await resp.arrayBuffer();

    console.info('Uruchamianie 3/5');

    const imports = {
        mod: {
            log: (walue) => {
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


    mod_1.instance.exports.sum(33,44);
})();