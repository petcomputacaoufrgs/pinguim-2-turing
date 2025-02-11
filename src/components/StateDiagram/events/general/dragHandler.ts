import { dia } from "jointjs";

export function initDragHandler(
  paper: dia.Paper,
  container: any,
  setTranslation: (translation: { x: number; y: number }) => void
) {
  let dragStartPosition: { x: number; y: number } | null = null;

  // Captura a posição inicial do arraste ao clicar em um espaço vazio
  paper.on("blank:pointerdown", (evt, x, y) => {
    if (evt.target.tagName !== "svg") return;

    const scale = paper.scale();

    if (dragStartPosition === null) {
      dragStartPosition = { x: x * scale.sx, y: y * scale.sy }; // Ajuste para o escalonamento
    }
  });

  // Limpa a posição de arraste quando o mouse é solto
  paper.on("blank:pointerup", () => {
    dragStartPosition = null;
  });

  // Função para mover o conteúdo do paper conforme o mouse se move
  const handleMouseMove = (event: MouseEvent) => {
    if (dragStartPosition !== null) {
      const deltaX = event.offsetX - dragStartPosition.x;
      const deltaY = event.offsetY - dragStartPosition.y;

      // Translaciona o conteúdo do paper
      paper.translate(deltaX, deltaY);
      setTranslation({ x: deltaX, y: deltaY });
    }
  };

  if(container)
    container.addEventListener("mousemove", handleMouseMove);

  return {element: container, event: "mousemove", handler: handleMouseMove };
}
