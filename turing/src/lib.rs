//use wasm_bindgen::prelude::*;

/*
convenient{
    we are compiling rust to WebAssembly
    we use wasm_bindgen to interface with JavaScript, we import functions from JavaScript
    #[wasm_bindgen]
    extern {
        fn alert(s: &str);
    }

    and exports rust functions

    #[wasm_bindgen]
    pub fn greet() {
        alert("Hello, wasm-game-of-life!");
    }
    a discutir, talvez valesse a pena deixar todos os caracteres do alfabeto e 
    dos estados na parte de JavaScript e trabalhar em rust apenas com os vetores de
    posições (talvez fique pouco legível se fizermos isso em rust)

    após o rust receber o input do usuário a única coisa que tem que enviar 
    pro JavaScript é a fita, pois a tabela de transição e o alfabeto de entrada
    não se alteram durante a execução


    uma funçao em rust que executa um passo de execução na fita, retorna a alteração na fita
    ou o estado atual da fita?
    ao invés de mandar a fita o javascript pode acessar diretamente na memoria linear do
    WebAssembly, no vetor de posições da fita e o estado atual
}
*/


//input
//states (initial and final)
//input and auxiliary alphabet
//initial symbol and blank symbol




//function that initialize the vector (with the positions)
//example: let n = 9;
//         let initialized_vec = initialize_vector(n);
//         [0, 1, 2, 3, 4, 5, 6, 7, 8]

fn init_vector(n: usize) -> Vec<usize> {
    let mut vec = Vec::new();
    for i in 0..n {
        vec.push(i);
    }
    vec
}


// TRANSITION TABLE------------------------------------------------------------------------
// Matrix where the row is the position of the state vector
// and the column is the position of the alphabet vector


struct TransitionTable {
    matrix: Vec<Vec<Option<Transition>>>,
}

use std::ops::Index;

impl Index<usize> for TransitionTable {
    type Output = Vec<Option<Transition>>;

    fn index(&self, index: usize) -> &Self::Output {
        &self.matrix[index]
    }
}


//TRANSITION------------------------------------------------------------------------
// destination state, character written in place, direction the tape will move
enum Direction {
    Right,
    Left,
}


struct Transition {
    destination_state: usize,
    character_written: char,
    direction: Direction,
}

impl Transition {
    fn new(destination_state: usize, character_written: char, direction: Direction) -> Self {
    Transition {
        destination_state,
        character_written,
        direction,
        }
    }
}

//STATES------------------------------------------------------------------------
//vector of positions
//vector of strings with the names of the states
//vector of enum: initial, final, none

enum StateType {
    Initial,
    Final,
    Intermediate,
}
    
//vector of positions indicates the position in the vector with its corresponding name
//position 0 is always the initial state, final states are always in the end of the vector
struct States {
    positions: Vec<usize>,
    names: Vec<String>,
    types: Vec<StateType>,
}

impl States {
    fn new_states(states_count: usize, final_states_count:usize) -> Self {
        let positions = init_vector(states_count);
        let names = init_states_names(states_count);
        let types = init_states_types(states_count, final_states_count);

        States {
            positions,
            names,
            types,
        }
    }

    // Method to print all state names to the terminal
    // formatted q0, q1, q2...
    fn print_states(&self) {
        let concatenated_names = self.names.join(", ");
        println!("{}", concatenated_names);
    }
    // one on each line
    fn print_states2(&self) {
        for name in &self.names {
        println!("{}", name);
        }
    }
}

//provisory function
fn init_states_names(states_count: usize) -> Vec<String> {
    let mut vec = Vec::new();
    for i in 0..states_count {
        vec.push(format!("q{}", i));
    }
    vec
}

//provisory function
fn init_states_types(states_count: usize, final_states_count: usize) -> Vec<StateType> {
    let mut vec = Vec::new();

    for i in 0..states_count {
        if i == 0 {
            vec.push(StateType::Initial);
        } else if i < states_count - final_states_count {
            vec.push(StateType::Intermediate);
        } else {
            vec.push(StateType::Final);
        }
    }
    
    vec
}

//CURRENT STATUS------------------------------------------------------------------------
//int with the position of the current state in the positions vector of states
//int with the posision of where you are in the tape
struct CurrentStatus {
    current_state: usize,
    tape_position: usize,
}

impl CurrentStatus {
    //always start in the initial state, and in the position 0 of the tape
    fn init_status() ->  Self {
        CurrentStatus{
            current_state: 0,
            tape_position: 0,
        }
    }

     // Update the CurrentStatus based on a Transition
     fn update_status(&mut self, transition: &Transition) {
        match transition.direction {
            Direction::Right => self.tape_position += 1,
            Direction::Left => self.tape_position -= 1,
        }
        self.current_state = transition.destination_state;
        
    }

    fn print_status(&self) {
        for _ in 0..self.tape_position {
            print!("   ");
        }
        print!("^");
        println!("");
        println!("state: {}", self.current_state);
    }
}

//TAPE------------------------------------------------------------------------
//vector of characters? and position in the vector
struct Tape {
    positions: Vec<usize>, //vector where each int represents the position in the vector
    characters: Vec<char>, //of characters corresponding to the alphabet
 
}    
impl Tape {
// Method to print all tape characters to the terminal
// formatted @, 1, 1, 1, 1, B..
    fn print_tape(&self) {
        for (i, &c) in self.characters.iter().enumerate() {
            print!("{}", c);
            if i < self.characters.len() - 1 {
                print!(", ");
            }
        }
        println!();
    }
    // Update the Tape based on a Transition
    fn update_tape(&mut self, transition: &Transition, status: &CurrentStatus) {
        self.characters[status.tape_position] = transition.character_written;
    }
}



//ALPHABET------------------------------------------------------------------------
//vector of positions
//vector of characters with the names of the alphabet characters
//vector of enum: input, auxiliary, start, and blank

enum CharacterType {
    Input,
    Auxiliary,
    Start,
    Blank,
}

//this will be the positions vector
//[Start ------- Input(can be more than one) ---------- Auxiliary (can be more than one)---------Blank]
struct Alphabet {
    positions: Vec<usize>,
    characters: Vec<char>,
    types: Vec<CharacterType>,
}

impl Alphabet {
// Method to print all alphabet characters to the terminal
// formatted @, 1, 2 , B..
    fn print_alphabet(&self) {
        for (i, &c) in self.characters.iter().enumerate() {
        print!("{}", c);
        if i < self.characters.len() - 1 {
        print!(", ");
        }
    }
    println!();
    }
}

//JavaScript input
//number of states, position of the initial state, positions of the final states
//number of input characters
//number of auxiliary characters
//there will always be only one start character (it will be the first position in the alphabet vector)
//there will always be only one blank character (it will be the last position in the alphabet vector)


//funtion that takes one step, receives the transition table, the tape and the current status
// and returns the new current status, that depens on the tape and the tt
fn step(tt: &TransitionTable, tape: &mut Tape, status: &mut CurrentStatus) {
    let my_option_transition = &tt[status.current_state][tape.positions[status.tape_position]]; //access my <Option<transition>>
    let mut my_tape_position: usize = 0;
    match my_option_transition {
        None => println!("acabou"),
        Some(transition) => {
            tape.update_tape(transition, status);
            status.update_status(transition);
        },
    }

}
/*
TODO
-make it easier to initialize the (alphabet, tape, transitiontable)
-make it display the information better
-make the run function

*/


fn main() {
    // Initializing status
    let mut current_status = CurrentStatus::init_status();

    // Initialization of states
    let states = States::new_states(4,1);

    // Initialization of the alphabet
    let alphabet = Alphabet {
        positions: vec![0, 1,2],  // Positions of the characters
        characters: vec!['@', '1', 'B'],  // Characters of the alphabet
        types: vec![CharacterType::Start,CharacterType::Input, CharacterType::Blank],  // Types of the characters
    };

    let mut tape = Tape {
        positions: vec![0, 1, 1, 1, 1, 2],
        characters: vec!['@','1','1','1','1','B'],
    };

    let transition_q0_initial = Transition::new(1, '@', Direction::Right);
    let transition_q1_1       = Transition::new(2, '1', Direction::Right);
    let transition_q1_blank   = Transition::new(3, 'B', Direction::Left);
    let transition_q2_1       = Transition::new(1, '1', Direction::Right);

    let table = TransitionTable {
        matrix: vec![
            vec![
                Some(transition_q0_initial),
                None,
                None,  
            ],
            vec![
                None, 
                Some(transition_q1_1),
                Some(transition_q1_blank),
            ],
            vec![
                None,
                Some(transition_q2_1),
                None,
            ],
            vec![
                None,
                None,
                None,
            ],
        ],
    };

    let states = States::new_states(4,1);

    //states.print_states();
    //alphabet.print_alphabet();
    for _ in 0..7 {
        tape.print_tape();
        current_status.print_status();
        println!(".");

        step(&table, &mut tape, &mut current_status);
    }
    tape.print_tape();
    current_status.print_status();
}
