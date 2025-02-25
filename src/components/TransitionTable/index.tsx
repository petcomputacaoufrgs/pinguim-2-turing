import React, { ChangeEvent } from 'react';
import {StyledInput, StyledTable} from "./styled";
import { errorCodes, Transitions } from '../../types/types';

import { validateTransition } from '../../utils/validation';
import { useStateContext } from '../../ContextProvider';

interface i_transition_table {
    OnChangeTransitionTable: (newTransitions: Transitions) => void;
    editable: boolean
}

const TransitionTable = ({OnChangeTransitionTable, editable} : i_transition_table) => {
  
  const  {inputStates} = useStateContext();
  const {tokenizedInputs} = inputStates;
  const {transitions} = inputStates;
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, state: string, symbol: string, alphabet: string[]) => {
    const {value} = e.target;
    const [newState, newSymbol, direction, error] = validateTransition(value, tokenizedInputs.states, alphabet);

    OnChangeTransitionTable({
      ...transitions,
      [state]: {
        ...transitions[state], 
        [symbol]: {transitionText: value, error: error, nextState: newState, newSymbol: newSymbol, direction: direction} 
      }
    })  
  };

  const hasError = (error: number) => {
    if(error === undefined)
        return false;

    if(error !== errorCodes.NoError)
        return true;
      
    return false;
  }

  const stateList = Array.from(new Set(tokenizedInputs.states));
  const finalStateList = Array.from(new Set(tokenizedInputs.finalStates));
  const alphabetList = Array.from(new Set([tokenizedInputs.initSymbol[0], ...(tokenizedInputs.inAlphabet.filter((symbol) => symbol !== "").concat(tokenizedInputs.auxAlphabet.filter((symbol) => symbol !== ""))), tokenizedInputs.blankSymbol[0]]));
  
  return (
      <StyledTable>
        <thead>
          <tr>
            <th></th>
            {alphabetList.map((symbol) => (
              <th key={symbol}>{symbol}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stateList.map((state) => (
            <tr key={state} style={{ backgroundColor: finalStateList.includes(state) ? '#FFD700' : 'white' }}>
              <td>{(tokenizedInputs.initState[0] !== state)? state : ">" + state}</td>
              {alphabetList.map((symbol) => (
                <td key={symbol}>

              <StyledInput
                type="text"
                placeholder="State, Direction (R/L), Symbol"
                value={transitions[state]?.[symbol]?.transitionText || ''}
                $hasError={hasError(transitions[state]?.[symbol]?.error)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, state, symbol, alphabetList)} 
                readOnly={!editable} />
                </td>
              ))} 
            </tr>
          ))}
        </tbody>
      </StyledTable>
  );
};

export default TransitionTable;





