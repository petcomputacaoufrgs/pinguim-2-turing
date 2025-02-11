

export function initZoomHandler(
    currentScale: number,
    setCurrentScale: (scale: number) => void
  ) {
    const scaleIncrement = 0.1; // Incremento/decremento da escala
    const minScale = 0.2; // Escala mínima
    const maxScale = 2; // Escala máxima
  
    const paperContainer = document.getElementById("paper-container");

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault(); // Evita o scroll padrão da página
  
      if (event.deltaY < 0) {
        // Scroll para cima (zoom in)
        setCurrentScale(Math.min(currentScale + scaleIncrement, maxScale));
      } else {
        // Scroll para baixo (zoom out)
        setCurrentScale(Math.max(currentScale - scaleIncrement, minScale));
      }
    };

    if(paperContainer)
        paperContainer.addEventListener("wheel", handleWheel)
  
    return { element: paperContainer, event: "wheel", handler: handleWheel };
  }
  