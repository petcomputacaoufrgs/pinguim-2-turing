import React, { useState, useEffect, useRef } from "react";
import { Button } from "../GeneralButtons/styled";
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
  <div style={{display: "flex", width: "80%", alignItems: "center", height: "auto", fontSize: "0.5vw"}}>
    <Button width="11vw" height="4.5vh" onClick={setEditLinks} disabled={currentTool.editLinks} style={{borderRadius:"0"}}>Links</Button>
    <Button width="11vw" height="4.5vh" onClick={setSelection} disabled={currentTool.selection} style={{borderRadius:"0"}}>Seleção</Button>
    <Button width="11vw" height="4.5vh" onClick={setAddNodes} disabled={currentTool.addNodes} style={{borderRadius:"0"}}>Adic. Nodos</Button>
    <Button width="11vw" height="4.5vh" onClick={setStandard} disabled={currentTool.standard} style={{borderRadius:"0"}}>Padrão</Button>
  </div>

  )

}


export default Tools;