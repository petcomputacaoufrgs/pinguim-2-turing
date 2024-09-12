use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::from_value;
use crate::turing::TuringMachine;
use crate::tape::Tape;
use crate::transition::Transition;
use crate::state::{State, StateType};
use crate::direction::Direction;


mod turing;
mod tape;
mod transition;
mod state;
mod direction;


#[wasm_bindgen]
pub fn add(mut a: i32, b: i32) -> i32 {
    a = turing::multiply_2(a);
    a + b
}

<<<<<<< Updated upstream
#[test]
fn add_test() {
    assert_eq!(1 + 1, add(1, 1));
}
=======
    // if run : tm.run()
    // if step : tm.step() 
        // how to know if it is the first step?
        // how to know which step to take?
    // if reset : tm.reset()

#[wasm_bindgen]
pub struct TuringMachineWrapper {
    machine: TuringMachine,
}

#[wasm_bindgen]
impl TuringMachineWrapper {
    #[wasm_bindgen(constructor)]
    pub fn new(states: Vec<String>, initial_state: String, final_states: Vec<String>, tape: String, transitions: Vec<JsValue>, alphabet: String) -> TuringMachineWrapper {
        let states = states.into_iter().map(|s| {
            if final_states.contains(&s) {
                State::new(s.chars().next().unwrap(), StateType::Final)
            } else if s == initial_state {
                State::new(s.chars().next().unwrap(), StateType::Start)
            } else {
                State::new(s.chars().next().unwrap(), StateType::Empty)
            }
        }).collect();

        let tape = Tape::new(&alphabet, &tape);
        

        let transitions = transitions.into_iter().map(|t| {
            let t: TransitionWrapper = from_value(t).unwrap();
            Transition::new(
                t.current_state.chars().next().unwrap(),
                t.current_symbol.chars().next().unwrap(),
                t.new_state.chars().next().unwrap(),
                t.new_symbol.chars().next().unwrap(),
                match t.direction.as_str() {
                    "R" => Direction::Right,
                    "L" => Direction::Left,
                    _ => panic!("Invalid direction"),
                }
            )
        }).collect();

        TuringMachineWrapper {
            machine: TuringMachine::new(states, transitions, tape),
        }
    }

    pub fn run(&mut self) {
        self.machine.run();
    }

    pub fn step(&mut self) {
        self.machine.step();
    }

    pub fn reset(&mut self) {
        self.machine.reset();
    }

    pub fn get_tape(&self) -> String {
        self.machine.tape.to_string()
    }

    pub fn get_current_state(&self) -> String {
        self.machine.get_current_state().id.to_string()
    }
}

#[wasm_bindgen]
#[derive(serde::Serialize, serde::Deserialize)]
pub struct TransitionWrapper {
    pub current_state: String,
    pub current_symbol: String,
    pub new_state: String,
    pub new_symbol: String,
    pub direction: String,
}
>>>>>>> Stashed changes
