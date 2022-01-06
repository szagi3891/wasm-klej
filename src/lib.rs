mod stack;

mod extern_fn {
    mod inner_unsafe {
        #[link(wasm_import_module = "mod")]
        extern "C" {
            pub fn log(s: u64);
            pub fn log_string(ptr: u64, len: u64);
        }
    }

    pub fn log(info: u64) {
        unsafe {
            inner_unsafe::log(info);
        }
    }

    pub fn log_string(str: &str) {
        let ptr = str.as_ptr();
        unsafe {
            inner_unsafe::log_string(ptr as u64, str.len() as u64);
        }
    }
}

#[no_mangle]
fn sum(a: u32, b: u32) -> u32 {
    extern_fn::log(444);
    extern_fn::log_string("to jest jakiś string z rusta ....");

    a + b
}

#[no_mangle]
fn str_from_js() {
    let str_js = stack::STACK_STRING.with(|state| state.pop());

    let message = format!("string ciut przerobiony przez rust-a ---> {str_js} len={}", str_js.len());
    extern_fn::log_string(message.as_str());
}

#[no_mangle]
pub fn alloc(len: u64) -> u64 {
    stack::STACK_STRING.with(|state| state.alloc(len as usize)) as u64
}
