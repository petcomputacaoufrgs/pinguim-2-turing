/* 
    The tape is list of characters that can be read or written by the Turing Machine. It is used to store the input and the output of the machine.

    Attributes:
    alphabet : the list of valid characters that can be written on the tape
    head_position : the index of the current character
    tape : the list of characters that represents the tape

    Methods:
    new : acts as a constructor for Tape, it receives the alphabet and the initial tape as strings
    write : receives a character and writes it on the tape if it is a valid character
    read : returns the character at the current head position
    to_string : returns the tape as a string

    To-do:
    Implement error messages
*/

use super::direction;

#[derive(Clone)]
pub struct Tape {
    pub alphabet: Vec<char>,
    pub head_position: i32,
    pub tape: Vec<char>,
    initial_tape: Vec<char>
}

impl Tape {
    pub fn new(alphabet: &str, tape: &str) -> Tape {
        let initial_tape: Vec<char> = tape.chars().collect();

        Tape {
            alphabet: alphabet.chars().collect(),
            head_position: 0,
            tape: initial_tape.clone(), 
            initial_tape,  
        }
    }

    pub fn write(&mut self, character: char) {
        if !(self.head_position >=1 && self.alphabet.contains(&character)) {
            return
            // writing an invalid character ERROR
        }

        self.tape[self.head_position as usize] = character;
    }

    pub fn reset(&mut self) {
        self.head_position = 0;
        self.tape = self.initial_tape.clone(); 
    }

    pub fn read(&mut self) -> char {
        if self.head_position as usize > self.tape.len(){
            panic!("reading past the end of the tape")
            // error
        }

        self.tape[self.head_position as usize]
    }

    pub fn move_head(&mut self, direction: direction::Direction) {
        match direction {
            direction::Direction::Right => { self.head_position += 1},
            direction::Direction::Left => { self.head_position -= 1}
        }
        
        // testar isso aqui no simulador do rodrigo ir pra esquerda até passar do branco
        if self.head_position < 0 {
            self.head_position = 0;
        }

        // não lembro se é assim no rodrigo tmb testar mas acho q é 
        if self.head_position >= self.tape.len() as i32 {
            self.tape.push('#');
        }
    }

    pub fn to_string(&self) -> String {
        self.tape.iter().collect()
    }
}