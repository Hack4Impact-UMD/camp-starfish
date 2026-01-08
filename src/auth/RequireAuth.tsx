"use client";

interface AuthCase {
  authFn: () => boolean;
  component: React.ReactNode;
}

interface RequireAuthProps {
  authCases: AuthCase[];
  fallbackComponent: React.ReactNode;
}

export default function RequireAuth(props: RequireAuthProps) {
  const { authCases, fallbackComponent } = props;
  for (const authCase of authCases) {
    if (authCase.authFn()) {
      return authCase.component;
    }
  }
  return fallbackComponent;  
}
