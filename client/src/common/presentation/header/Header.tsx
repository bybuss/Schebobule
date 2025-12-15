import React from "react";
import { useAuth } from "../../../AuthContext";
import "./Header.css";

export const Header: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        console.log("[Header] Logout clicked");
        logout();
        window.location.href = "/login";
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <h1>Schebobule</h1>
                </div>
                <div className="user-info">
                    <span className="user-email">{user?.email}</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>
            </div>
        </header>
    );
};
