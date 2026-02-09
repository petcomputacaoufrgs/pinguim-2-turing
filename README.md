# Pinguim 2.0 - Turing machine simulator

"Pinguim" is an initiative by PET Computação, originating in 2021, dedicated to crafting efficient simulators for the Register Machine, Lambda calculus, and the Turing machine, essential components of the INF05501 course instructed by Professor Rodrigo Machado at UFRGS. Collaborating with Professor Rodrigo, the group successfully developed an efficient simulator for the Register Machine before transitioning to other projects. You can check the new simulator [here](https://www.inf.ufrgs.br/pet/pinguim/norma/).

In 2024, other members of PET Computação decided to work on Pinguim again, but this time focusing in creating the Turing machine simulator. This project is a web application that compiles [Rust](https://www.rust-lang.org) code to WebAssembly for high-performance computing in the browser, while utilizing [React](https://react.dev) for  front-end development; and it's still in development.

You can check this new Turing Machine Simulator [HERE](https://petcomputacaoufrgs.github.io/pinguim-2-turing/)

## Install and run the project

To build the package, additional to Rust, we need a library called `wasm-pack`

```bash
cargo install wasm-pack
```

After cloning the project, ensure dependencies are up to date. If not up to date, then:
```bash
npm install
```

Afterwards, build it using:
```bash
npm run build:wasm
```

Now, you are ready to run the development server

```bash
npm start
```

## How is this project organized

This projects utilizes two main folders

```bash
src
turing-wasm
 |_ lib.rs
 |_ turing.rs
```
### `src`
Contains all files used for front-end development

### `turing-wasm`
This folder contains all files regarding the library turing-wasm, which represents the back-end of the project.

#### `lib.rs`
Contains source code that uses `wasm-bindgen` to export Rust functions to JavaScript

#### `turing.rs`
Contains source code for the Turing machine simulator
