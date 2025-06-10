import { Button } from "../GeneralButtons/styled";
import { CurrentTool } from "../../types/types";

interface ToolsInterface {
    width?: string;
    currentTool: CurrentTool,
    onChangeTool: (currentTool: CurrentTool) => void
}

export function Tools({width="100%", currentTool, onChangeTool} : ToolsInterface){


const setEditLinks = () => {
    onChangeTool({
      editLinks: true,
      addNodes: false,
      selection: false,
      standard: false,
      noEdit: false
    });
  }

  const setSelection= () => {
    onChangeTool({
      editLinks: false,
      addNodes: false,
      selection: true,
      standard: false,
      noEdit: false
    });
  }

  const setAddNodes = () => {
    onChangeTool({
      editLinks: false,
      addNodes: true,
      selection: false,
      standard: false,
      noEdit: false
    });
  }

  const setStandard = () => {
    onChangeTool({
      editLinks: false,
      addNodes: false,
      selection: false,
      standard: true,
      noEdit: false
    });
  }


  return (
  <div style={{display: "flex", width: width, alignItems: "center", height: "auto", fontSize: "0.5vw", backgroundColor: "#E4DADF"}}>
    <Button width="16vw" height="max(4.44vh, 29px)" onClick={setEditLinks} disabled={currentTool.editLinks} style={{borderRadius: "4px 0px 0px 4px"}}>Links</Button>
    <Button width="16vw" height="max(4.44vh, 29px)" onClick={setSelection} disabled={currentTool.selection} style={{borderRadius:"0"}}>Seleção</Button>
    <Button width="16vw" height="max(4.44vh, 29px)" onClick={setStandard} disabled={currentTool.standard} style={{borderRadius: "0px 4px 4px 0px"}}>Padrão</Button>
  </div>

  )

}


export default Tools;