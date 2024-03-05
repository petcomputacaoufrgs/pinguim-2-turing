# Pinguim 2.0 - Turing machine simulator

"Pinguim" is an initiative by PET Computação, originating in 2021, dedicated to crafting efficient simulators for the Register Machine, Lambda calculus, and the Turing machine, essential components of the INF05501 course instructed by Professor Rodrigo Machado at UFRGS. Collaborating with Professor Rodrigo, the group successfully developed an efficient simulator for the Register Machine before transitioning to other projects. You can check the new simulator [here](https://www.inf.ufrgs.br/pet/pinguim/norma/).

In 2024, other members of PET Computação decided to work on Pinguim again, but this time focusing in creating the Turing machine simulator. This project is a web application that compiles [Rust](https://www.rust-lang.org) code to WebAssembly for high-performance computing in the browser, while utilizing [Next.js](https://nextjs.org/) for  front-end development; and it's still in development.

## Install and run the project

To build the package, additional to Rust, we need a library called `wasm-pack`

```bash
cargo install wasm-pack
```
After cloning the project, build it using:

```bash
cd turing-wasm
wasm-pack build --target bundler
```
Now, you are ready to run the development server

```bash
cd site
npm run serve
```

## How is this project organized

This projects utilizes three main folders

```bash
site
turing
turing-wasm
 |_ pkg
 |_ src
```
### `site`
Contains all files used for front-end development

### `turing`
Contains source code for the Turing machine simulator

### `turing-wasm`
This folder contains information about the transformation from Rust to WebAssembly

#### `pkg`
Contains build information of the source code after compiling using `wasm-pack

#### `src`
Contains source code that uses `wasm-bindgen` to export Rust functions to JavaScript
