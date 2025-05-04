export const AppEnvironments = {
  dev: "development",
  prod: "production",
  local: "local",
  stagging: "stagging",
};

export type AppEnvironmentsType = keyof typeof AppEnvironments;
