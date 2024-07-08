// src/TuringMachinePage.tsx
import React, { useState, ChangeEvent, FocusEvent } from 'react';

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
  const initialSymbol = '@';
  const blankSymbol = '-';

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

  const renderTransitionTable = () => {
    const stateList = states.split(',').map((s) => s.trim());
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
            <tr key={state}>
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
          States (comma separated):
          <input
            type="text"
            value={states}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStates(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Final States (comma separated):
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
          Alphabet (comma separated):
          <input
            type="text"
            value={alphabet}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAlphabet(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Auxiliary Alphabet (comma separated):
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
      <h2>Transitions</h2>
      {renderTransitionTable()}
    </div>
  );
};

export default TuringMachinePage;
