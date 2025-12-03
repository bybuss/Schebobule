export interface AuthAction {
    handleEmailChange: (email: string) => void;
    handlePasswordChange: (password: string) => void;
    handleConfirmPasswordChange: (confirmPassword: string) => void;
    handleIsAgreedForAdminChange: (isAgreed: boolean) => void;
    handleLogin: () => void;
    handleRegister: () => void;
    handleTabChange: (tab: "login" | "register") => void;
    clearError: () => void;
}
