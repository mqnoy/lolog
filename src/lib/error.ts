type EcsError = {
  message?: string;
  type?: string;
  stack_trace?: string;
  stack?: string;
};

export const isEcsError = (error: unknown): error is EcsError => {
  return (
    typeof error === "object" &&
    error !== null &&
    ("stack_trace" in error || "stack" in error)
  );
};

export const serializeError = (err: Error) => {
  return {
    message: err.message,
    type: err.name,
    stack_trace: err.stack,
    // cause: err.cause,
  };
};
