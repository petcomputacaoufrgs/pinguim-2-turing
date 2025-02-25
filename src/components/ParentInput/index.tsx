import TitledInput from "../TitledInput";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import Upload_button from "../UploadButton";
import Buttons from "../GeneralButtons";
import { DivButtons, DivInputs } from "./styled";

import { InputErrors, InputValues, TokenizedInputValues, Transitions } from '../../types/types';

import { tokenize, tokenizeInputs } from "../../utils/tokenize";
import { validateInputs, revalidateTransitions, validateTransition } from "../../utils/validation";
import { useStateContext } from "../../ContextProvider";

interface ParentInputProps{
    onFileInputDoc : (docValue : string) => void;
    onChangeInputs: (inputs: InputValues, tokenizedInputs: TokenizedInputValues, newTransitions: Transitions, newErrors: InputErrors) => void;
}

// Inputs iniciais na esquerda superior da tela
const ParentInput = ({ onFileInputDoc, onChangeInputs }: ParentInputProps) => {

  const  { inputStates} = useStateContext();

  const {errors} = inputStates;
  const {tokenizedInputs} = inputStates;
  const {inputs} = inputStates;
  const {transitions} = inputStates;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValues = {...inputs, [name]: value};
    const newTokenizedValues = {...tokenizedInputs, [name]: tokenize(value)};
    const newTransitions = revalidateTransitions(transitions, tokenizedInputs, newTokenizedValues);

    onChangeInputs(newValues, newTokenizedValues, newTransitions, validateInputs(newTokenizedValues, errors));
  };

  const handleFileUpload = (lines: string[]) => {
    const newInputs = {...inputs};
    const ordem_leitura = ["inAlphabet", "auxAlphabet", "initSymbol", "blankSymbol", "states", "initState", "finalStates"];

    let i = 0;

    for(const key of ordem_leitura) {
        if(i >= lines.length)
            break;
        newInputs[key as keyof typeof inputs] = lines[i]; 
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
    onChangeInputs(newInputs, newInputsTokenized, transitions, validateInputs(newInputsTokenized, errors));
  }

  return (
    <>
      <DivButtons id="div1_buttons">
        <Upload_button onFileUpload={handleFileUpload}/>
        <Buttons height="4.5vh" width="14vw" title="Salvar"/>
      </DivButtons>
      
      <DivInputs id="div1_part2">
        <div id="div1_part2_inputs">
          <TitledInput name="states"      value={inputs.states}      onChange={handleInputChange} title={"Estados:"}></TitledInput>
          <TitledInput name="initState"   value={inputs.initState}   onChange={handleInputChange} title={"Estado inicial:"}></TitledInput>
          <TitledInput name="finalStates" value={inputs.finalStates} onChange={handleInputChange} title={"Estados finais:"}></TitledInput>
          <TitledInput name="inAlphabet"  value={inputs.inAlphabet}  onChange={handleInputChange} title={"Alfabeto de entrada:"}></TitledInput>
          <TitledInput name="auxAlphabet" value={inputs.auxAlphabet} onChange={handleInputChange} title={"Alfabeto auxiliar:"}></TitledInput>
          <TitledInput name="initSymbol"  value={inputs.initSymbol}  onChange={handleInputChange} title={"Símbolo inicial:"}></TitledInput>
          <TitledInput name="blankSymbol" value={inputs.blankSymbol} onChange={handleInputChange} title={"Símbolo de branco:"}></TitledInput>
        </div>  
      </DivInputs>          
    </>
  )
}

export default ParentInput;




