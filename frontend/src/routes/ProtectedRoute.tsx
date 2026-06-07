import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
