import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  if (isLoggedIn()) {
    return <Navigate to="/community" replace />;
  }

  return <>{children}</>;
}
