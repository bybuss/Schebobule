import React, { useState } from "react";
import { useAuthViewModel } from "./AuthViewModel";
import "./AuthPage.css";

export const AuthPage: React.FC = () => {
    const { model, intent } = useAuthViewModel();
    const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);

    const openPolicyModal = () => {
        console.log("[AuthPage] Opening policy modal");
        setPolicyModalOpen(true);
    };

    const closePolicyModal = () => {
        console.log("[AuthPage] Closing policy modal");
        setPolicyModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("[AuthPage] Form submitted");
        if (model.currentTab === "login") {
            intent.handleLogin();
        } else {
            intent.handleRegister();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={`tab-button ${model.currentTab === "login" ? "active" : ""}`}
                        onClick={() => intent.handleTabChange("login")}
                    >
                        Вход
                    </button>
                    <button
                        className={`tab-button ${model.currentTab === "register" ? "active" : ""}`}
                        onClick={() => intent.handleTabChange("register")}
                    >
                        Регистрация
                    </button>
                </div>

                {model.error && (
                    <div className="error-message">
                        {model.error}
                        <button onClick={intent.clearError} className="error-close">×</button>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={model.email}
                            onChange={(e) => intent.handleEmailChange(e.target.value)}
                            placeholder="Введите ваш email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            value={model.password}
                            onChange={(e) => intent.handlePasswordChange(e.target.value)}
                            placeholder="Введите ваш пароль"
                            required
                        />
                    </div>

                    {model.currentTab === "register" && (
                        <>
                            <div className="input-group">
                                <label>Подтверждение пароля</label>
                                <input
                                    type="password"
                                    value={model.confirmPassword}
                                    onChange={(e) => intent.handleConfirmPasswordChange(e.target.value)}
                                    placeholder="Повторите пароль"
                                    required
                                />
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={model.isAgreedForAdmin}
                                        onChange={(e) => intent.handleIsAgreedForAdminChange(e.target.checked)}
                                        required
                                    />
                                    <span className="checkmark"></span>
                                    Я соглашаюсь с <button type="button" className="policy-link" onClick={openPolicyModal}>политикой конфиденциальности</button>
                                </label>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={model.isLoading}
                    >
                        {model.isLoading ? "Загрузка..." : (model.currentTab === "login" ? "Войти" : "Зарегистрироваться")}
                    </button>
                </form>
            </div>

            {isPolicyModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Политика конфиденциальности</h2>
                        <div className="policy-text">
                            <p>Здесь будет текст политики конфиденциальности...</p>
                            <p>Мы обязуемся защищать ваши персональные данные и обеспечивать их конфиденциальность.</p>
                        </div>
                        <button className="close-button" onClick={closePolicyModal}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};
