#[link(wasm_import_module = "mod")]
extern {
    fn log(s: u64);
    // fn alert(s: &str);
}

fn show_log(info: u64) {
    unsafe {
        log(info);
    }
}

#[no_mangle]
fn sum(a: u32, b: u32) -> u32 {
    show_log(444);

    a + b
}


//https://radu-matei.com/blog/practical-guide-to-wasm-memory/


#[no_mangle]
pub fn alloc(len: usize) -> *mut u8 {
    // create a new mutable buffer with capacity `len`
    let mut buf = Vec::with_capacity(len);
    // take a mutable pointer to the buffer
    let ptr = buf.as_mut_ptr();
    // take ownership of the memory block and
    // ensure that its destructor is not
    // called when the object goes out of scope
    // at the end of the function
    std::mem::forget(buf);
    // return the pointer so the runtime
    // can write data at this offset
    return ptr;
}

#[no_mangle]
pub unsafe fn dealloc(ptr: *mut u8, size: usize) {
    let data = Vec::from_raw_parts(ptr, size, size);

    std::mem::drop(data);
}

/*
js startowy

alokuje stringa przez api, przekazuje wskaźnik i pozostawia rustowi dealokację

wasm

wasm moze wywolac stringa, ale nie oddaje mu własności nad tym stringiem.
po zakończeniu wywołania następuje dealokacja

js drivera moze zwrocić stringa. Rust przejmuje stringa i go dealokuje ...


*/