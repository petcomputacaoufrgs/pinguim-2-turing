//use wasm_bindgen::prelude::*;

pub mod tests{
    pub fn capslock(name: &str) -> String {
        name.to_uppercase()
    }
}

//#[wasm_bindgen]


//input
//estados (iniciais e finais)
//alfabeto de entrada e auxiliar
//símbolo inicial e símbolo de branco




//TABELA DE TRANSIÇÃO------------------------------------------------------------------------
//matriz onde a linha eh a posição do vetor de estado  
//e a coluna a posição do vetor do alfabeto  
struct TabelaTransicao {
    matriz: Vec<Vec<Option<Transicao>>>,
}

//TRANSIÇÃO------------------------------------------------------------------------
// estado de destino, caracter escrito no lugar, que direção da fita irá
enum Direcao {
    Direita,
    Esquerda,
}

struct Transicao {
    estado_destino: i32,
    caracter_escrito: char,
    direcao: Direcao,
}


//ESTADOS------------------------------------------------------------------------
//vetor de posiçoes
//vetor de strings com os nomes dos estados
//vetor de enum inicial final nada

enum TipoEstado {
    Inicial,
    Final,
    Intermediario,
}

//vetor de posições indica a posição do vetor que tem seu nome correspondente
//posição 0 sempre é o estado inicial
struct Estados {
    posicoes: Vec<usize>,
    nomes: Vec<String>,
    tipos: Vec<TipoEstado>,
}

//ESTADO ATUAL------------------------------------------------------------------------
//int com a posição do estado atual no vetor de posições
let estado_atual: i32 = 0; //começa no estado inicial 

//FITA------------------------------------------------------------------------
//vetor de caracteres? e posição do vetor 
struct Fita {
    caracteres: Vec<char>,
    posicoes: Vec<i32>,         //vetor que cada int representa a posição do vetor
}                               //de caracteres correspondente


//ALFABETO------------------------------------------------------------------------
//vetor de posiçoes
//vetor de caracteres com os nomes dos caracteres do alfabeto
//vetor de enum entrada auxiliar inicio e branco

enum TipoCaracter {
    Entrada,
    Auxiliar,
    Inicio,
    Branco,
}

struct Alfabeto {
    posicoes: Vec<usize>,
    caracteres: Vec<char>,
    tipos: Vec<TipoCaracter>,
}


