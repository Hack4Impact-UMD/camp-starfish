"use client";

import ErrorPage from "@/app/error";

interface AuthCase {
  authFn: () => boolean;
  component: React.ReactNode;
}

interface RequireAuthProps {
  authCases: AuthCase[];
  fallbackComponent?: React.ReactNode;
}

export default function RequireAuth(props: RequireAuthProps) {
  const {
    authCases,
    fallbackComponent = <ErrorPage error={Error("You do not have permission to access this page.")} />,
  } = props;
  for (const authCase of authCases) {
    if (authCase.authFn()) {
      return authCase.component;
    }
  }
  return fallbackComponent;
}
