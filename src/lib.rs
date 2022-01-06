mod stack;

mod extern_fn {
    #[link(wasm_import_module = "mod")]
    extern "C" {
        fn log(s: u64);
        fn log_string(ptr: u64, len: u64);
    }

    pub fn show_log(info: u64) {
        unsafe {
            log(info);
        }
    }
    
    pub fn show_log_string(str: &str) {
        let ptr = str.as_ptr();
        unsafe {
            log_string(ptr as u64, str.len() as u64);
        }
    }
}

#[no_mangle]
fn sum(a: u32, b: u32) -> u32 {
    extern_fn::show_log(444);
    extern_fn::show_log_string("to jest jakiś string z rusta ....");

    a + b
}

#[no_mangle]
fn str_from_js() {
    let str_js = stack::STACK_STRING.with(|state| state.pop());

    let message = format!("string ciut przerobiony przez rust-a ---> {str_js} len={}", str_js.len());
    extern_fn::show_log_string(message.as_str());
}

#[no_mangle]
pub fn alloc(len: u64) -> u64 {
    stack::STACK_STRING.with(|state| state.alloc(len as usize)) as u64
}
