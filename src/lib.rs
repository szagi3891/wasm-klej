use std::{cell::RefCell};

// tasks: RefCell<VecDeque<Rc<crate::task::Task>>>,

struct StackStringAlloc {
    list: RefCell<Vec<
        (
            *mut u8,    //ptr
            usize,      //size
        )
    >>,
}

impl StackStringAlloc {
    pub fn new() -> StackStringAlloc {
        StackStringAlloc {
            list: RefCell::new(Vec::new())
        }
    }

    pub fn alloc(&self, size: usize) -> *mut u8 {
        use std::alloc::{alloc, Layout};
        use std::mem;

        let align = mem::align_of::<usize>();
        if let Ok(layout) = Layout::from_size_align(size, align) {
            unsafe {
                if layout.size() > 0 {
                    let ptr = alloc(layout);
                    if !ptr.is_null() {

                        let mut state = self.list.borrow_mut();
                        state.push((ptr, size));
                        
                        return ptr;
                    }
                } else {
                    //return align
                }
            }
        }

        panic!("dddd");
    }

    pub fn pop(&self) -> String {
        let mut state = self.list.borrow_mut();
        let (ptr, size) = state.pop().unwrap();

        let data = unsafe {
            Vec::<u8>::from_raw_parts(ptr, size, size)
        };
        
        String::from_utf8(data).unwrap()
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
    //ddd dasdsa
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

    // let str_js = String::from_utf8(str_js).unwrap();

    // let ff = "ddd";

    let message = format!("string ciut przerobiony przez rust-a ---> {str_js} len={}", str_js.len());
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
    STACK_STRING.with(|state| state.alloc(len as usize)) as u64
}


/*
js startowy

alokuje stringa przez api, przekazuje wskaźnik i pozostawia rustowi dealokację

wasm

wasm moze wywolac stringa, ale nie oddaje mu własności nad tym stringiem.
po zakończeniu wywołania następuje dealokacja

js drivera moze zwrocić stringa. Rust przejmuje stringa i go dealokuje ...


*/