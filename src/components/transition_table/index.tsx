import React, { ChangeEvent, FocusEvent, useEffect, useState } from 'react';

interface Transitions {
    [state: string]: {
      [symbol: string] : string;
    }
}
  


interface i_input_values_tokenized {
    input0: string[];
    input1: string[];
    input2: string[];
    input3: string[];
    input4: string[];
    input5: string[];
    input6: string[];
  }


interface i_transition_table {
    tokenized_inputs: i_input_values_tokenized;

    transitions: Transitions;
    OnChangeTransitionTable: (newTransitions: Transitions) => void;
}

export default function TransitionTable({tokenized_inputs, transitions, OnChangeTransitionTable} : i_transition_table){


    const renderTransitionTable = () => {
        const stateList = tokenized_inputs.input0;
        const finalStateList = tokenized_inputs.input2
        const alphabetList = tokenized_inputs.input3.filter((symbol) => symbol != "") .concat(tokenized_inputs.input4.filter((symbol) => symbol != ""));
    
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
                  <td>{(tokenized_inputs.input1[0] != state)? state : state + "*"}</td>
                  {alphabetList.map((symbol) => (
                    <td key={symbol}>
                      <input
                        type="text"
                        placeholder="State, Direction (R/L), Symbol"
                        value={transitions[state]?.[symbol] || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          OnChangeTransitionTable({
                            ...transitions,
                            [state]: {
                              ...transitions[state], 
                              [symbol]: e.target.value, 
                            }
                          })
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
          {renderTransitionTable()}
        </div>
      );
};






