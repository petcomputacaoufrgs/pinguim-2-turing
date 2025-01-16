import React, { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import {StyledInput, StyledTable} from "./styled";
import { errorCodes, Transitions, TokenizedInputValues } from '../../types/types';


interface i_transition_table {
    tokenizedInputs: TokenizedInputValues;

    transitions: Transitions;
    OnChangeTransitionTable: (newTransitions: Transitions) => void;
}

export default function TransitionTable({tokenizedInputs, transitions, OnChangeTransitionTable} : i_transition_table){


    const validateTransition = (value:string, states:string[], alphabet:string[]) => {

        const value_tokenized =  value.split(',').map(token => token.trim()).filter(token => token.length > 0); 
        
        if(value_tokenized == null || value_tokenized.length == 0)
            return errorCodes.NoError;

        if(value_tokenized.length != 3)
            return errorCodes.InvalidNumberOfParameters;

        if(!states.includes(value_tokenized[0]))
            return errorCodes.InvalidState; 
    
        if(!alphabet.includes(value_tokenized[2]))
            return errorCodes.InvalidSymbol;

        if(value_tokenized[1].toUpperCase() != "L" && value_tokenized[1].toUpperCase() != "R")
            return errorCodes.InvalidDirection;

        return errorCodes.NoError;
    }



    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, state: string, symbol: string, alphabet: string[]) => {
        const {value} = e.target;

        const validacao = validateTransition(value, tokenizedInputs.states, alphabet);

        OnChangeTransitionTable({
            ...transitions,
            [state]: {
              ...transitions[state], 
              [symbol]: {next: value, error: validacao} 
            }
          })

        
    }


    const hasError = (error: number) => {
        if(error == undefined)
            return false;

        if(error != errorCodes.NoError)
            return true;
        
        return false;
    }

    const renderTransitionTable = () => {
        const stateList = Array.from(new Set(tokenizedInputs.states));
        const finalStateList = Array.from(new Set(tokenizedInputs.finalStates));

        const alphabetList = Array.from(new Set([tokenizedInputs.initSymbol[0], ...(tokenizedInputs.inAlphabet.filter((symbol) => symbol != "").concat(tokenizedInputs.auxAlphabet.filter((symbol) => symbol != ""))), tokenizedInputs.blankSymbol[0]]));
    
        return (
          <StyledTable border={1}>
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
                  <td>{(tokenizedInputs.initState[0] != state)? state : ">" + state}</td>
                  {alphabetList.map((symbol) => (
                    <td key={symbol}>

                 <StyledInput
                    type="text"
                    placeholder="State, Direction (R/L), Symbol"
                    value={transitions[state]?.[symbol]?.next || ''}
                    hasError={hasError(transitions[state]?.[symbol]?.error)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, state, symbol, alphabetList)} />

                    </td>
                  ))}


                  
                </tr>
              ))}
            </tbody>
          </StyledTable>
        );
      };
    
      return (
        <>
          {renderTransitionTable()}
        </>
      );
};






