import TitledInput from "../titled_input";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Upload_button from "../upload_button";
import Buttons from "../general_button";
import { DivButtons, DivInputs } from "./styled";

import { InputValues, TokenizedInputValues, InputErrors, Transitions } from '../../types/types';

import { tokenize, tokenizeInputs } from "../../utils/tokenize";
import { validateInputs, revalidateTransitions, validateTransition } from "../../utils/validation";

interface i_parent_input{

    onFileInputDoc : (doc_value : string) => void;
    inputValues: InputValues;
    inputTokenizedValues : TokenizedInputValues;
    onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void;

    old_errors: InputErrors;
    transitions: Transitions;
    onChangeErrors: (errors: InputErrors) => void;
}

const ParentInput = ({ onFileInputDoc, inputValues, inputTokenizedValues, onChangeInputs, old_errors, transitions, onChangeErrors }: i_parent_input) => {

      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newValues = {...inputValues, [name]: value};
        const newTokenizedValues = {...inputTokenizedValues, [name]: tokenize(value)};
        const newTransitions = revalidateTransitions(transitions, inputTokenizedValues, newTokenizedValues);

        onChangeInputs(newValues, newTokenizedValues, newTransitions, validateInputs(newTokenizedValues, old_errors));
    
      };


      const handleFileUpload = (lines: string[]) => {
        const newInputs = {...inputValues};
        const ordem_leitura = ["inAlphabet", "auxAlphabet", "initSymbol", "blankSymbol", "states", "initState", "finalStates"];

        let i = 0;

        for(const key of ordem_leitura) {
            if(i >= lines.length)
                break;
            newInputs[key as keyof InputValues] = lines[i]; 
            i = i + 1;
        }


        const newInputsTokenized = tokenizeInputs(newInputs);

        const transitions: Transitions = {};
        const table = lines[i].split(",");

        const alphabet = Array.from(new Set([newInputsTokenized.initSymbol[0], ...(newInputsTokenized.inAlphabet.filter((symbol) => symbol != "").concat(newInputsTokenized.auxAlphabet.filter((symbol) => symbol != ""))), newInputsTokenized.blankSymbol[0]]));
    
        let j = 0;

        while(j < table.length){
          const state = table[j];
          const symbol = table[j + 1];

          const remainingTable = table.slice(j + 3);
          const nextTransitionPosition = remainingTable.findIndex((value) => value === "");

          let transitionTextTokenized;

          if(nextTransitionPosition === -1){
            transitionTextTokenized = remainingTable; 
          }
          else{
            transitionTextTokenized = remainingTable.slice(0, nextTransitionPosition);
          }

          const transitionText = transitionTextTokenized.join(", ");

          if (!transitions[state]) {
            transitions[state] = {};
          }

          const [newState, newSymbol, direction, error] = validateTransition(transitionText, newInputsTokenized.states, alphabet);

          transitions[state][symbol] = {
            transitionText: transitionText,
            nextState: newState,
            newSymbol: newSymbol,
            direction: direction,
            error: error
          };

          j = j + transitionTextTokenized.length + 5;

        }

        i = i + 1;

        onFileInputDoc(lines[i]);
        onChangeInputs(newInputs, newInputsTokenized, transitions, validateInputs(newInputsTokenized, old_errors));

      }


    return (
        <>
          <DivButtons id="div1_buttons">
            <Upload_button onFileUpload={handleFileUpload}/>
            <Buttons height="4.5vh" width="14vw" title="Salvar"/>
          </DivButtons>
          
          <DivInputs id="div1_part2">
            <div id="div1_part2_inputs">
              <TitledInput name="states"      value={inputValues.states}      onChange={handleInputChange} title={"Estados:"}></TitledInput>
              <TitledInput name="initState"   value={inputValues.initState}   onChange={handleInputChange} title={"Estado inicial:"}></TitledInput>
              <TitledInput name="finalStates" value={inputValues.finalStates} onChange={handleInputChange} title={"Estados finais:"}></TitledInput>
              <TitledInput name="inAlphabet"  value={inputValues.inAlphabet}  onChange={handleInputChange} title={"Alfabeto de entrada:"}></TitledInput>
              <TitledInput name="auxAlphabet" value={inputValues.auxAlphabet} onChange={handleInputChange} title={"Alfabeto auxiliar:"}></TitledInput>
              <TitledInput name="initSymbol"  value={inputValues.initSymbol}  onChange={handleInputChange} title={"Símbolo inicial:"}></TitledInput>
              <TitledInput name="blankSymbol" value={inputValues.blankSymbol} onChange={handleInputChange} title={"Símbolo de branco:"}></TitledInput>
            </div>  
          </DivInputs>          
        </>
    )

}

export default ParentInput;




