"use client";

import RequireAuth from "@/auth/RequireAuth";
import { useAuth } from "@/auth/useAuth";
import { Role } from "@/types/users/userTypes";
import { Container, Text, Title } from "@mantine/core";

export default function Page() {
  const { token } = useAuth();
  const allowedRoles: Role[] = ["ADMIN", "STAFF"];

  return (
    <RequireAuth
      authCases={[
        {
          authFn: () =>
            allowedRoles.some((role: Role) => token?.claims.role === role),
          component: (
            <Container className="py-8">
              <Title order={2}>Activity Scheduling</Title>
              <Text className="mt-4">Select a session to view its activity calendar.</Text>
            </Container>
          ),
        },
      ]}
    />
  );
}
