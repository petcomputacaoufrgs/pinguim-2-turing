import * as joint from 'jointjs';

export const attachLinkEvents = (paper: joint.dia.Paper) => {
      const verticesTool = new joint.linkTools.Vertices({stopPropagation: false}); // Permite a adição e edição de vértices num link
      const toolsView = new joint.dia.ToolsView({ tools: [verticesTool] });
  
      // Quando o mouse "entra" no link, se ele estiver entre 20% e 80% da extensão do link (modificar isso depois), permite a edição de vértices
      paper.on("link:mouseenter", (linkView, evt) => {
        const bbox = linkView.findMagnet(evt.target)?.getBoundingClientRect();
        const isTarget = evt.clientX !== undefined && bbox &&
          evt.clientX < bbox.left + bbox.width &&
          evt.clientX > bbox.left;
  
        if (isTarget) linkView.addTools(toolsView);
  
      });
  
      paper.on("link:mouseleave", (linkView) => {
        linkView.removeTools();
      });
    }