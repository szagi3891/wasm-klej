mod stack;

#[link(wasm_import_module = "mod")]
extern "C" {
    fn log(s: u64);
    fn log_string(ptr: u64, len: u64);
}

fn show_log(info: u64) {
    unsafe {
        log(info);
    }
}

fn show_log_string(str: &str) {
    let ptr = str.as_ptr();
    unsafe {
        log_string(ptr as u64, str.len() as u64);
    }
    // log_string()
}

#[no_mangle]
fn sum(a: u32, b: u32) -> u32 {
    show_log(444);
    show_log_string("to jest jakiś string z rusta ....");

    a + b
}

#[no_mangle]
fn str_from_js() {
    let str_js = stack::STACK_STRING.with(|state| state.pop());

    // let str_js = String::from_utf8(str_js).unwrap();

    // let ff = "ddd";

    let message = format!("string ciut przerobiony przez rust-a ---> {str_js} len={}", str_js.len());
    show_log_string(message.as_str());
}

//https://radu-matei.com/blog/practical-guide-to-wasm-memory/

#[no_mangle]
pub fn alloc(len: u64) -> u64 {
    stack::STACK_STRING.with(|state| state.alloc(len as usize)) as u64
}


/*
js startowy

alokuje stringa przez api, przekazuje wskaźnik i pozostawia rustowi dealokację

wasm

wasm moze wywolac stringa, ale nie oddaje mu własności nad tym stringiem.
po zakończeniu wywołania następuje dealokacja

js drivera moze zwrocić stringa. Rust przejmuje stringa i go dealokuje ...


*/