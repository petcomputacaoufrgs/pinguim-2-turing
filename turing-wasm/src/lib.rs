use wasm_bindgen::prelude::*;

mod state;
mod tape;
mod direction;
mod transition;
mod turing;


// call to create new turing machine with translate
    // call to run tm.run()
    // call to step  tm.step()
    // call to reset tm.reset()

    // if run : tm.run()
    // if step : tm.step() 
        // how to know if it is the first step?
        // how to know which step to take?
    // if reset : tm.reset()
