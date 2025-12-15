import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { AuthPage } from "./auth/presentation/AuthPage";
import { Layout } from "./routing/Layout";
import { ProtectedRoute } from "./routing/ProtectedRoute";
import { SchedulePage } from "./schedule/presentation/SchedulePage";
import { PrivacyPolicyPage } from "./common/presentation/privacy_policy/PrivacyPolicyPage"
import "./App.css";

function App() {
    return (  
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/schedule" element={<SchedulePage />} />
                            <Route path="/" element={<Navigate to="/schedule" replace />} />
                        </Route>
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/schedule" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
