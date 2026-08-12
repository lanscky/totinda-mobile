import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, User } from '../api/auth';
import { setSessionExpiredHandler } from '../api/client';
import { secureStorage, SESSION_KEYS } from '../api/secureStorage';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: (password: string) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const userInfo = await authService.getUserInfo();
            const token = await authService.getAccessToken();
            if (userInfo && token) {
                setUser(userInfo);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    useEffect(() => setSessionExpiredHandler(() => setUser(null)), []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const deleteAccount = async (password: string) => {
        await authService.deleteAccount(password);
        setUser(null);
    };

    const updateUser = async (nextUser: User) => {
        await secureStorage.set(SESSION_KEYS.userInfo, JSON.stringify(nextUser));
        setUser(nextUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                deleteAccount,
                updateUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
