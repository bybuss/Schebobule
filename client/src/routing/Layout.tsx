import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../common/presentation/header/Header";

export const Layout: React.FC = () => {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
            <main style={{ flex: 1, padding: "30px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                <Outlet />
            </main>
        </div>
    );
};
