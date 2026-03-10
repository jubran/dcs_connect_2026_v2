const restrictToContainer = (args) => {
  const { containerNodeRect, draggingNodeRect, transform } = args;

  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }

  return {
    ...transform,
    x: Math.max(
      containerNodeRect.left - draggingNodeRect.left,
      Math.min(containerNodeRect.right - draggingNodeRect.right, transform.x),
    ),
    y: Math.max(
      containerNodeRect.top - draggingNodeRect.top,
      Math.min(containerNodeRect.bottom - draggingNodeRect.bottom, transform.y),
    ),
  };
};

export default restrictToContainer;
