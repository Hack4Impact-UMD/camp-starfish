export type Environment = "development" | "production";

const ENVIRONMENTS = ["development", "production"];

function isValidEnvironment(env: string | undefined): env is Environment {
  return !!env && ENVIRONMENTS.includes(env);
}

export function getEnvironment(): Environment {
  if (process.env.NODE_ENV !== "test") {
    return process.env.NODE_ENV;
  } else if (isValidEnvironment(process.env.NEXT_PUBLIC_NODE_ENV)) {
    return process.env.NEXT_PUBLIC_NODE_ENV;
  }
  return "production";
}