import React from "react";
import { AuthProvider } from "./app/AuthContext";
import { AuthPage } from "./auth/presentation/AuthPage";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <AuthPage />
        </AuthProvider>
    );
}

export default App;
