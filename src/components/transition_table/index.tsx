import React, { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import {StyledInput, StyledTable} from "./styled";
import { errorCodes, Transitions, i_input_values_tokenized } from '../../types/types';


interface i_transition_table {
    tokenized_inputs: i_input_values_tokenized;

    transitions: Transitions;
    OnChangeTransitionTable: (newTransitions: Transitions) => void;
}

export default function TransitionTable({tokenized_inputs, transitions, OnChangeTransitionTable} : i_transition_table){


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

        const validacao = validateTransition(value, tokenized_inputs.states, alphabet);

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
        const stateList = tokenized_inputs.states;
        const finalStateList = tokenized_inputs.final_states;

        const alphabetList = [tokenized_inputs.init_symbol[0], ...(tokenized_inputs.in_alphabet.filter((symbol) => symbol != "").concat(tokenized_inputs.aux_alphabet.filter((symbol) => symbol != ""))), tokenized_inputs.blank_symbol[0]];
    
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
                  <td>{(tokenized_inputs.init_state[0] != state)? state : ">" + state}</td>
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






