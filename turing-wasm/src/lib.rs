use wasm_bindgen::prelude::*;

mod turing;


#[wasm_bindgen]
pub fn add(mut a: i32, b: i32) -> i32 {
    a = turing::multiply_2(a);
    a + b
}

#[test]
fn add_test() {
    assert_eq!(1 + 1, add(1, 1));
}