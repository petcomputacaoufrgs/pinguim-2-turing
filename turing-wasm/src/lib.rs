use wasm_bindgen::prelude::*;

use turing::tests::capslock;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", capslock(name)));
}
