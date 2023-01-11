use std::{cell::RefCell};
pub struct StackStringAlloc {
    list: RefCell<Vec<(
        *mut u8,    //ptr
        usize,      //size
    )>>,
}

impl StackStringAlloc {
    pub fn new(_: ()) -> StackStringAlloc {
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
