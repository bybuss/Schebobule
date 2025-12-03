import { useState } from "react";
import { LoginUseCase } from "../domain/usecases/LoginUseCase";
import { RegisterUseCase } from "../domain/usecases/RegisterUseCase";
import { useAuth } from "../../app/AuthContext";
import { AuthAction } from "./AuthAction";
import { AuthState } from "./AuthState";
import { container } from "../../di/container";

export const useAuthViewModel = () => {
    const [model, setState] = useState<AuthState>({
        email: "",
        password: "",
        confirmPassword: "",
        isAgreedForAdmin: false,
        isLoading: false,
        error: null,
        currentTab: "login"
    });

    const { login: authLogin } = useAuth();
    
    const loginUseCase = container.resolve(LoginUseCase) as LoginUseCase;
    const registerUseCase = container.resolve(RegisterUseCase) as RegisterUseCase;

    const updateState = (updates: Partial<AuthState>) => {
        console.log("[AuthViewModel] Updating model:", updates);
        setState(prev => ({ ...prev, ...updates }));
    };

    const handleEmailChange = (email: string) => {
        updateState({ email });
    };

    const handlePasswordChange = (password: string) => {
        updateState({ password });
    };

    const handleConfirmPasswordChange = (confirmPassword: string) => {
        updateState({ confirmPassword });
    };

    const handleIsAgreedForAdminChange = (isAgreedForAdmin: boolean) => {
        updateState({ isAgreedForAdmin });
    };

    const handleLogin = async () => {
        console.log("[AuthViewModel] Handling login");
        updateState({ isLoading: true, error: null });
        
        try {
            const result = await loginUseCase.execute(model.email, model.password);
            console.log("[AuthViewModel] Login successful");
            authLogin(result.user, result.accessToken, result.refreshToken);
        } catch (error: any) {
            console.error("[AuthViewModel] Login error:", error);
            updateState({ error: error.message || "Ошибка входа" });
        } finally {
            updateState({ isLoading: false });
        }
    };

    const handleRegister = async () => {
        console.log("[AuthViewModel] Handling register");
        
        if (model.password !== model.confirmPassword) {
            updateState({ error: "Пароли не совпадают" });
            return;
        }

        if (!model.isAgreedForAdmin) {
            updateState({ error: "Необходимо согласие с политикой конфиденциальности" });
            return;
        }

        updateState({ isLoading: true, error: null });
        
        try {
            const result = await registerUseCase.execute(model.email, model.password, false);
            console.log("[AuthViewModel] Registration successful");
            authLogin(result.user, result.accessToken, result.refreshToken);
        } catch (error: any) {
            console.error("[AuthViewModel] Registration error:", error);
            updateState({ error: error.message || "Ошибка регистрации" });
        } finally {
            updateState({ isLoading: false });
        }
    };

    const handleTabChange = (tab: "login" | "register") => {
        console.log("[AuthViewModel] Changing tab to:", tab);
        updateState({ 
            currentTab: tab,
            error: null,
            confirmPassword: "",
            isAgreedForAdmin: false
        });
    };

    const clearError = () => {
        updateState({ error: null });
    };

    const intent: AuthAction = {
        handleEmailChange,
        handlePasswordChange,
        handleConfirmPasswordChange,
        handleIsAgreedForAdminChange,
        handleLogin,
        handleRegister,
        handleTabChange,
        clearError
    };

    return { model, intent };
};
