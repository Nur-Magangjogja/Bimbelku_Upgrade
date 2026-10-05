import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAdmin, permissionForAdminPath } from "@/lib/adminPermissions";

interface PrivateRouteProps {
  allowedRoles?: string[];
}

type StoredUser = {
  role?: string;
  admin_type?: string | null;
  admin_permissions?: string[];
};

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  let user: StoredUser | null = null;

  try {
    user = userString ? JSON.parse(userString) : null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  if (!token || !user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role || "")) {
    return <Navigate to="/access-denied" replace />;
  }

  if (user.role === "admin" && location.pathname.startsWith("/admin")) {
    const permission = permissionForAdminPath(location.pathname);
    if (!permission || !canAdmin(user, permission)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <Outlet />;
}
