#[link(wasm_import_module = "mod")]
extern {
    fn log(s: u64);
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

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}

