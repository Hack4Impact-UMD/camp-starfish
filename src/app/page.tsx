"use client";
import ConfirmationModal from "../components/ConfirmationModal";

import RequireAuth from "@/auth/RequireAuth";
import LoginPage from "./LoginPage"
import RoleBasedPage from "@/auth/RoleBasedPage";
import EmployeeHomePage from "./EmployeeHomePage";
import ParentHomePage from "./ParentHomePage";

export default function HomePage() {
  return (
    <RequireAuth
      allowedRoles={["ADMIN", "PARENT", "PHOTOGRAPHER", "STAFF"]}
      allowUnauthenticated
    >
      <RoleBasedPage
        rolePages={{
          ADMIN: <EmployeeHomePage />,
          PARENT: <ParentHomePage />,
          PHOTOGRAPHER: <EmployeeHomePage />,
          STAFF: <EmployeeHomePage />,
        }}
        unauthenticatedPage={<LoginPage />}
      />
    </RequireAuth>
  );
}
