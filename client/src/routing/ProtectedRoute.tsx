import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    console.log("[ProtectedRoute] Checking authentication:", isAuthenticated);

    if (!isAuthenticated) {
        console.log("[ProtectedRoute] User not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
