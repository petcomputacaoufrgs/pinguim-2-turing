import React, { useState, useEffect, useRef } from "react";
import { Button } from "../general_button/styled";
import { CurrentTool } from "../../types/types";

interface ToolsInterface {
    currentTool: CurrentTool,
    onChangeTool: (currentTool: CurrentTool) => void
}

export function Tools({currentTool, onChangeTool} : ToolsInterface){


const setEditLinks = () => {
    onChangeTool({
      editLinks: true,
      addNodes: false,
      selection: false,
      standard: false
    });
  }

  const setSelection= () => {
    onChangeTool({
      editLinks: false,
      addNodes: false,
      selection: true,
      standard: false
    });
  }

  const setAddNodes = () => {
    onChangeTool({
      editLinks: false,
      addNodes: true,
      selection: false,
      standard: false
    });
  }

  const setStandard = () => {
    onChangeTool({
      editLinks: false,
      addNodes: false,
      selection: false,
      standard: true
    });
  }


  return (
  <div style={{display: "flex", width: "80%", alignItems: "center", height: "auto"}}>
  <Button width="11vw" height="4.5vh" onClick={setEditLinks} disabled={currentTool.editLinks}>Links</Button>
  <Button width="11vw" height="4.5vh" onClick={setSelection} disabled={currentTool.selection}>Seleção</Button>
  <Button width="11vw" height="4.5vh" onClick={setAddNodes} disabled={currentTool.addNodes}>Adicionar Nodos</Button>
  <Button width="11vw" height="4.5vh" onClick={setStandard} disabled={currentTool.standard}>Padrão</Button>
  
  </div>

  )

}


export default Tools;