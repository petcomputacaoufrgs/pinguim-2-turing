/*
    Transition is a struct that represents a transition in a Turing Machine. 

    Attributes:
    current_state : the state that the machine must be in order to execute this transition
    current_symbol : the symbol that the machine must read in order to execute this transition
    new_state : the state that the machine will be after executing this transition
    new_symbol : the symbol that the machine will write after executing this transition
    direction : the direction that the machine will move after executing this transition

    Methods:
    new : acts as a constructor for Transition, it receives the current state, current symbol, new state, new symbol and direction

    Example of declaring a transition:
    transition: transition::Transition::new('0', 'a', '1', 'A', direction::Direction::Right)
    */

use direction;

#[derive(Copy)]
pub struct Transition{
    pub current_state: char,
    pub current_symbol: char,
    pub new_state: char,
    pub new_symbol: char,
    pub direction: direction::Direction
}

impl Transition {
    pub fn new(current_state: char, current_symbol: char, 
               new_state: char, new_symbol: char, direction: direction::Direction) -> Transition {
        Transition {current_state, current_symbol, new_state, new_symbol, direction}
    }

    pub fn from_str(transition: &str) -> Transition {
        let parts: Vec<&str> = transition.split("->").collect();
        let left: Vec<&str> = parts[0].split(',').collect();
        let right: Vec<&str> = parts[1].split(',').collect();

        Transition {
            current_state: left[0].chars().next().unwrap(),
            current_symbol: left[1].chars().next().unwrap(),
            new_state: right[0].chars().next().unwrap(),
            new_symbol: right[1].chars().next().unwrap(),
            direction: match right[2] {
                "L" => direction::Direction::Left,
                "R" => direction::Direction::Right,
                _ => panic!("Unknown direction"),
            }
        }
    }
}

impl Clone for Transition {
    fn clone(&self) -> Transition { *self }
}
