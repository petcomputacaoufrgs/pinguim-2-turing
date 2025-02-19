/*
    Turing Machine is a struct that represents a Turing Machine.

    Attributes:
    states : a vector of states that the machine can be in
    transitions : a vector of transitions that the machine can execute
    tape : the tape of the machine

    Methods:
    new : acts as a constructor for TuringMachine, it receives the states, transitions and tape
    run : runs the Turing Machine

        To-do
        step : executes only one step of the machine
        reset : resets the machine to the initial state

    get_first_state : returns the first state of the machine
    log_step : logs the current step of the machine (only used in debugging)

    Still deciding where to put the translate function and how to organize the code, 
*/

use super::tape;
use super::direction;
use super::transition;
use super::state;

struct TuringMachine {
    states: Vec<state::State>,
    current_state: state::State,
    transitions: Vec<transition::Transition>,
    tape: tape::Tape,
}

impl TuringMachine {
    fn new(states: Vec<state::State>, transitions: Vec<transition::Transition>, tape: tape::Tape) -> TuringMachine {
        
        let first_state = states.iter().find(|state| state.state_type == state::StateType::Start)
        .cloned()
        .expect("No initial state found with StateType::Start");

        TuringMachine {
            states,
            transitions,
            tape,
            current_state: first_state,
        }
    }

    fn run(&mut self){
        let mut step: i32 = 0;

        self.log_step(step);

        while self.current_state.state_type != state::StateType::Final {
            let current_symbol = self.tape.read();
            let state_id = self.current_state.id;

            let transition = self.transitions.iter().find(|transition| {
                transition.current_state == state_id &&
                transition.current_symbol == current_symbol
            }).expect("No valid transition found for the current state and symbol");

            self.current_state = self.states.iter().find(|state| state.id == transition.new_state)
                .expect("Transition specifies non-existent state")
                .clone();

            step += 1;
            self.tape.write(transition.new_symbol);
            self.tape.move_head(transition.direction);
            self.log_step(step);
        }
    }

    fn reset(&mut self) {
        self.tape.reset();

        self.current_state = self.get_first_state();
        println!("Turing Machine reset to initial state");
    }
    
    fn step(&mut self) {
        let current_symbol = self.tape.read();
        let state_id = self.current_state.id;

        let transition = self.transitions.iter().find(|transition| {
            transition.current_state == state_id &&
            transition.current_symbol == current_symbol
        }).expect("No valid transition found for the current state and symbol");

        self.current_state = self.states.iter().find(|state| state.id == transition.new_state)
            .expect("Transition specifies non-existent state")
            .clone();

        println!("Transition: {0} -> {1} -> {2}", transition.current_state, transition.current_symbol, transition.new_state);
        self.tape.write(transition.new_symbol);
        self.tape.move_head(transition.direction);
    }

    fn get_first_state(&self) -> state::State {
        let mut iter = self.states.iter().clone();
        let first_state: Option<state::State> = iter.find(|state| state.state_type == state::StateType::Start).copied();

        match first_state {
            None => panic!("não achou estado"), // erro
            Some(state) => state 
        }
    }

    fn get_current_state(&self) -> state::State{
        self.current_state
    }

    fn set_current_state(&mut self, state: state::State) {
        self.current_state = state;
    }

    fn log_step(&mut self, step: i32) {
        println!("Tape after step {0}: {1} -> Head position: {2}", step, 
                  self.tape.to_string(), self.tape.head_position);
    }
}

/* TESTS

fn main() {
    let mut tm = increment("$||#");

    tm.step(); 
    tm.step(); 

    tm.reset();

    tm.run();
}

fn increment(word: &str) -> TuringMachine {
    let mut tape = tape::Tape::new("$|#", word);
    let states = vec![
        state::State::new('0', state::StateType::Start),
        state::State::new('1', state::StateType::Empty),
        state::State::new('f', state::StateType::Final)
    ];

    let transitions = vec![
        transition::Transition::new('0', '$', '1', '$', direction::Direction::Right),
        transition::Transition::new('1', '|', '1', '|', direction::Direction::Right),
        transition::Transition::new('1', '#', 'f', '|', direction::Direction::Right)
    ];

    TuringMachine::new(states, transitions, tape)
}

*/