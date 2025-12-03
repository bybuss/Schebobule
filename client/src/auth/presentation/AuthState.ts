export interface AuthState {
    email: string;
    password: string;
    confirmPassword: string;
    isAgreedForAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    currentTab: "login" | "register";
}
