/*
    StateType defines the type of a state in a Turing Machine. It can be Start, Empty (an state which is neither Start nor is it Final) or Final.

    State is a struct that represents a state in a Turing Machine. 

    Attributes: 
    id : the identifier of the state
    state_type : the type of the state

    Methods:
    new : acts as a constructor for State, it receives the identifier and the type of the state

    Example of declaring a state:
    state: state::State::new('0', state::StateType::Start) 
*/

#[derive(PartialEq)]
#[derive(Copy)]
pub enum StateType {
    Start,
    Empty,
    Final
}

impl Clone for StateType {
    fn clone(&self) -> StateType { *self }
}

#[derive(Copy)]
pub struct State {
    pub id: char,
    pub state_type: StateType
}

impl State {
    pub fn new(id: char, state_type: StateType) -> State {
        State{id, state_type}
    }
}

impl Clone for State {
    fn clone(&self) -> State { *self }
}