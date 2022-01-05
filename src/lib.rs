use std::{cell::RefCell};

// tasks: RefCell<VecDeque<Rc<crate::task::Task>>>,

struct StackStringAlloc {
    list: RefCell<Vec<String>>,
}

impl StackStringAlloc {
    pub fn new() -> StackStringAlloc {
        StackStringAlloc {
            list: RefCell::new(Vec::new())
        }
    }

    pub fn alloc(&self, length: u64) -> u64 {
        let buf = Vec::<u8>::with_capacity(length as usize);
        let ptr = buf.as_ptr() as u64;

        let word = unsafe {
            String::from_utf8_unchecked(buf)
        };

        let mut state = self.list.borrow_mut();
        state.push(word);

        ptr
    }

    pub fn pop(&self) -> String {
        let mut state = self.list.borrow_mut();
        state.pop().unwrap()

        //TODO - tutaj mozna wykonać dodatkowe sprawdzenie zeby sie upewnić ze otrzymano poprawny utf8
        //String --> do Vec<u8> a potem String::from_utf8
    }
}

thread_local! {
    pub(crate) static STACK_STRING: StackStringAlloc = StackStringAlloc::new();
}

#[link(wasm_import_module = "mod")]
extern {
    fn log(s: u64);
    fn log_string(ptr: u64, len: u64);
    // fn alert(s: &str);
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
    let str_js = STACK_STRING.with(|state| state.pop());

    let message = format!("string ciut przerobiony przez rust-a ---> {str_js}");
    show_log_string(message.as_str());
}

//https://radu-matei.com/blog/practical-guide-to-wasm-memory/

/*
Struktura danych wyraająca pamięć zaalokowaną
 - moliwość wpisywania po indexie nowych wartości
 - włąściwość pozwalająca wyciągnięcie ptr w formie u64 i przekazania go do js-a
*/

#[no_mangle]
pub fn alloc(len: u64) -> u64 {
    STACK_STRING.with(|state| state.alloc(len))
}


//Info - Dealokacji nigdy js nie będzie wywoływał

// pub unsafe fn dealloc(ptr: *mut u8, size: usize) {
//     let data = Vec::from_raw_parts(ptr, size, size);

//     std::mem::drop(data);
// }

/*
js startowy

alokuje stringa przez api, przekazuje wskaźnik i pozostawia rustowi dealokację

wasm

wasm moze wywolac stringa, ale nie oddaje mu własności nad tym stringiem.
po zakończeniu wywołania następuje dealokacja

js drivera moze zwrocić stringa. Rust przejmuje stringa i go dealokuje ...


*/