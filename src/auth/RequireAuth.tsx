"use client";

import Error from "@/app/error";

interface AuthCase {
  authFn: () => boolean;
  component: React.ReactNode;
}

interface RequireAuthProps {
  authCases: AuthCase[];
}

export default function RequireAuth(props: RequireAuthProps) {
  const { authCases } = props;
  // Iterate through auth cases and return the first matching component
  for (const authCase of authCases) {
    if (authCase.authFn()) {
      return <>{authCase.component}</>;
    }
  }

  // Default error page when all functions evaluate to false
  const accessError: Error & { digest?: string } = {
    name: "Access Denied",
    message: "You do not have permission to view this page.",
  };
  
  return (
    <Error error={accessError} />
  );
}
