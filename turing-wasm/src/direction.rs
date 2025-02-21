/*
    Direction is an enum that represents the direction that the head of a Turing Machine will move after executing a transition.
*/

#[derive(Copy)]
pub enum Direction {
    Right,
    Left
}

impl Clone for Direction {
    fn clone(&self) -> Direction { *self }
}