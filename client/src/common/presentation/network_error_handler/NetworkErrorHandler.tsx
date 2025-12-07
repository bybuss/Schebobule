import React, { useState, useEffect } from "react";
import "./NetworkErrorHandler.css";

interface NetworkErrorHandlerProps {
    error: string | null;
    onRetry?: () => void;
    onClose?: () => void;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
    error,
    onRetry,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            console.error("[NetworkErrorHandler] Error detected:", error);
            setIsVisible(true);
            
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, 10000);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [error, onClose]);

    const handleRetry = () => {
        console.log("[NetworkErrorHandler] Retrying...");
        onRetry?.();
        setIsVisible(false);
    };

    const handleClose = () => {
        console.log("[NetworkErrorHandler] Closing error");
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible || !error) {
        return null;
    }

    const isNetworkError = error.includes("network") || 
                          error.includes("Network") || 
                          error.includes("timeout") ||
                          error.includes("internet") ||
                          error.includes("соединение");

    const isAuthError = error.includes("401") || 
                       error.includes("auth") || 
                       error.includes("Auth") ||
                       error.includes("token") ||
                       error.includes("авторизации");

    return (
        <div className={`network-error ${isNetworkError ? 'network' : ''} ${isAuthError ? 'auth' : ''}`}>
            <div className="error-content">
                <div className="error-icon">
                    {isNetworkError ? "🌐" : isAuthError ? "🔒" : "⚠️"}
                </div>
                <div className="error-details">
                    <h3 className="error-title">
                        {isNetworkError ? "Проблемы с сетью" : 
                         isAuthError ? "Ошибка авторизации" : "Произошла ошибка"}
                    </h3>
                    <p className="error-message">{error}</p>
                    <div className="error-actions">
                        {onRetry && (
                            <button className="retry-button" onClick={handleRetry}>
                                Повторить попытку
                            </button>
                        )}
                        {isNetworkError && (
                            <button 
                                className="help-button"
                                onClick={() => window.open('https://www.google.com/search?q=проверка+интернЕЕЕЕееетааа', '_blank')}
                            >
                                Проверить соединение
                            </button>
                        )}
                        <button className="close-error-button" onClick={handleClose}>
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
