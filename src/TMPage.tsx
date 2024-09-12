// src/TuringMachinePage.tsx
import React, { useState, ChangeEvent, FocusEvent } from 'react';

import init, * as wasm from "turing-wasm";

await init()

interface Transitions {
  [state: string]: {
    [symbol: string]: string;
  };
}

const TuringMachinePage: React.FC = () => {
  const [states, setStates] = useState<string>('');
  const [finalStates, setFinalStates] = useState<string>('');
  const [initialState, setInitialState] = useState<string>('');
  const [alphabet, setAlphabet] = useState<string>('');
  const [auxiliaryAlphabet, setAuxiliaryAlphabet] = useState<string>('');
  const [transitions, setTransitions] = useState<Transitions>({});
  const [tape, setTape] = useState<string>('');
  const initialSymbol = '@';
  const blankSymbol = '-';
  //const [turingMachineWrapper, setTuringMachineWrapper] = useState<wasm.TuringMachineWrapper | null>(null);

  const handleTransitionChange = (state: string, symbol: string, value: string) => {
    setTransitions((prevTransitions) => ({
      ...prevTransitions,
      [state]: {
        ...prevTransitions[state],
        [symbol]: value,
      },
    }));
  };

  const handleTransitionBlur = (state: string, symbol: string, value: string) => {
    if (value.match(/^[^,]+,[RL],[^,]+$/)) {
      console.log(`A transition got added in the ${state} state and when reading ${symbol} symbol, ${value} will happen`);
    }
  };

  const handleReady = () => {
    const stateList = states.split(',').map((s) => s.trim());
    const finalStateList = finalStates.split(',').map((s) => s.trim());
    const alphabetList = alphabet.split(',').map((a) => a.trim());
    const auxiliaryAlphabetList = auxiliaryAlphabet.split(',').map((a) => a.trim());

    const transitionList: { state: string; symbol: string; action: string }[] = [];
    for (const state in transitions) {
      for (const symbol in transitions[state]) {
        transitionList.push({
          state,
          symbol,
          action: transitions[state][symbol],
        });
      }
    }

    // const tm = new wasm.TuringMachineWrapper(stateList, initialState, finalStateList, tape, transitionList, alphabet);
    // setTuringMachineWrapper(tm);
    // console.log("Turing Machine Initialized!");

    console.log('Mounted!');
    console.log(`Here are the states: ${JSON.stringify(stateList)}`);
    console.log(`This is the initial state: ${initialState}`);
    console.log(`These are the final states: ${JSON.stringify(finalStateList)}`);
    console.log(`This is the alphabet: ${JSON.stringify(alphabetList)}`);
    console.log(`This is the auxiliary alphabet: ${JSON.stringify(auxiliaryAlphabetList)}`);
    console.log(`This is the tape: ${tape}`);
    console.log(`This is the transitions: ${JSON.stringify(transitionList)}`);
  };

  // const handleRun = () => {
  //   if (turingMachineWrapper) {
  //     turingMachineWrapper.run();
  //     console.log("Machine Run Complete!");
  //     console.log("Final Tape:", turingMachineWrapper.get_tape());
  //   }
  // };

  // const handleStep = () => {
  //   if (turingMachineWrapper) {
  //     turingMachineWrapper.step();
  //     console.log("Step Taken!");
  //     console.log("Current Tape:", turingMachineWrapper.get_tape());
  //     console.log("Current State:", turingMachineWrapper.get_current_state());
  //   }
  // };

  // const handleReset = () => {
  //   if (turingMachineWrapper) {
  //     turingMachineWrapper.reset();
  //     console.log("Machine Reset!");
  //     console.log("Tape after reset:", turingMachineWrapper.get_tape());
  //   }
  // };

  const renderTransitionTable = () => {
    const stateList = states.split(',').map((s) => s.trim());
    const finalStateList = finalStates.split(',').map((s) => s.trim());
    const alphabetList = [initialSymbol, ...alphabet.split(',').map((a) => a.trim()).filter((a) => a !== initialSymbol && a !== blankSymbol), blankSymbol];

    return (
      <table border={1}>
        <thead>
          <tr>
            <th>States / Alphabet</th>
            {alphabetList.map((symbol) => (
              <th key={symbol}>{symbol}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stateList.map((state) => (
            <tr key={state} style={{ backgroundColor: finalStateList.includes(state) ? '#FFD700' : 'white' }}>
              <td>{state}</td>
              {alphabetList.map((symbol) => (
                <td key={symbol}>
                  <input
                    type="text"
                    placeholder="State, Direction (R/L), Symbol"
                    value={transitions[state]?.[symbol] || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleTransitionChange(state, symbol, e.target.value)
                    }
                    onBlur={(e: FocusEvent<HTMLInputElement>) =>
                      handleTransitionBlur(state, symbol, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>Turing Machine Configuration</h1>
      <div>
        <label>
          States:
          <input
            type="text"
            value={states}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStates(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Final States:
          <input
            type="text"
            value={finalStates}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFinalStates(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Initial State:
          <input
            type="text"
            value={initialState}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInitialState(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Alphabet:
          <input
            type="text"
            value={alphabet}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAlphabet(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Auxiliary Alphabet:
          <input
            type="text"
            value={auxiliaryAlphabet}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAuxiliaryAlphabet(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Initial Symbol: {initialSymbol}
        </label>
      </div>
      <div>
        <label>
          Blank Symbol: {blankSymbol}
        </label>
      </div>
      <div>
        <label>
          Tape:
          <input
            type="text"
            value={tape}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTape(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleReady}>Ready</button>
      <h2>Transitions</h2>
      {renderTransitionTable()}
    </div>

// return (
//   <div>
//     {/* Configuração da Máquina */}
//     <button onClick={handleReady}>Ready</button>
    
//     {/* Botões para Interagir com a Máquina de Turing */}
//     <button onClick={handleRun}>Run</button>
//     <button onClick={handleStep}>Step</button>
//     <button onClick={handleReset}>Reset</button>
    
//     {/* Resto do código */}
//   </div>

  );
};

export default TuringMachinePage;
