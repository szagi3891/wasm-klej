Uruchomienie w trybie watch

* `cargo make watch`




Wykorzystać stos do przesyłania parametrów ze stringami
Po stronie rusta, zaalokować Vektor

po stronie js:
push(string)
pop() -> string

po stronie rusta
push(string)
pop() -> string


przekazanie stringa z js -> rust

push_js(string)
call_rustowej_metody() - bez parametrów


po stronie rusta metoda będzie musiała wiedzieć ze czeka na nia coś na stosie
pop_string()
przetwarzanie


w ten sposób mozna uniknąć tworzenie mateod alloc i dealloc a zarządzaniem pamięcią nadal będzie zajmował się rust






https://radu-matei.com/blog/practical-guide-to-wasm-memory/
https://rustwasm.github.io/book/reference/js-ffi.html
https://github.com/rustwasm/wasm-bindgen/blob/7465a4f84f8047f4acc8e7a2f6ea6977ebea4e58/src/lib.rs#L973-L1026


https://github.com/bnjbvr/perf-wasm-calls/blob/gh-pages/main.js#L265
https://github.com/bnjbvr/perf-wasm-calls/blob/gh-pages/make_wasm.js
https://github.com/bnjbvr/perf-wasm-calls/blob/gh-pages/main.js
