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

mod state;
mod tape;
mod direction;
mod transition;

struct TuringMachine {
    states: Vec<state::State>,
    transitions: Vec<transition::Transition>,
    tape: tape::Tape,
}

impl TuringMachine {
    fn new(states: Vec<state::State>, transitions: Vec<transition::Transition>, tape: tape::Tape) -> TuringMachine{
        TuringMachine{states, transitions, tape}
    }

    fn run(&mut self){
        let mut current_state: state::State = self.get_first_state();
        let mut step: i32 = 0;

        self.log_step(step);
        
        while current_state.state_type != state::StateType::Final {
            let current_symbol = self.tape.read();
            let state_id = current_state.id;

            let transition = *self.transitions.iter().clone().find(
                |transition| transition.current_state == state_id &&
                             transition.current_symbol == current_symbol).unwrap();
            
            current_state = *self.states.iter().clone().find(
                |state| state.id == transition.new_state).unwrap();

            step +=1;
            self.tape.write(transition.new_symbol);
            self.tape.move_head(transition.direction);
            self.log_step(step);
        }
    }

    // reset
    // step

    fn get_first_state(&self) -> state::State {
        let mut iter = self.states.iter().clone();
        let first_state: Option<state::State> = iter.find(|state| state.state_type == state::StateType::Start).copied();

        match first_state {
            None => panic!("não achou estado"), // erro
            Some(state) => state 
        }
    }

    fn log_step(&mut self, step: i32) {
        println!("Tape after step {0}: {1} -> Head position: {2}", step, 
                  self.tape.to_string(), self.tape.head_position);
    }
}

fn main(){
    //let mut tm : TuringMachine = translate()
    //tm.run();
}

fn translate(states: Vec<&str>, transitions: Vec<&str>, alphabet: &str, word: &str) -> TuringMachine {
    let tape = Tape::new(alphabet, word);

    // declare states
    // declare transitions

    TuringMachine::new(states, transitions, tape);
}