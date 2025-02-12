import { InputErrors, InputValues, TokenizedInputValues, Transitions, State } from "../../../../../types/types";


export function initUndoRedo(
  history: Array<State>,
  historyIndex: number,
  setHistoryIndex: (index: number) => void,
  onChangeInputs: (inputs: InputValues, inputs_tokenized: TokenizedInputValues, new_transitions: Transitions, newErrors: InputErrors) => void,
  eventHandlers: any[]

) {
  const undo = () => {
    if (historyIndex > 0) {
      const state = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChangeInputs({ ...state.inputs }, { ...state.tokenizedInputs }, { ...state.transitions }, { ...state.errors });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const state = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChangeInputs({ ...state.inputs }, { ...state.tokenizedInputs }, { ...state.transitions }, { ...state.errors });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  eventHandlers.push({ element: document, event: "keydown", handler: handleKeyDown });
}
