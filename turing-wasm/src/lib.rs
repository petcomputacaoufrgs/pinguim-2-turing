use wasm_bindgen::prelude::*;

mod turing;

// call to create new turing machine with translate
    // call to run tm.run()
    // call to step  tm.step()
    // call to reset tm.reset()

#[wasm_bindgen]
pub fn create_turing_machine(/*all inputs*/) {
    tm = translate();

    // i think everything needs to be handled inside this function ??

    // if run : tm.run()
    // if step : tm.step() 
        // how to know if it is the first step?
        // how to know which step to take?
    // if reset : tm.reset()
    
}