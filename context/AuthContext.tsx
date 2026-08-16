import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, StudentProfilePayload, User } from '../api/auth';
import { setSessionExpiredHandler } from '../api/client';
import { secureStorage, SESSION_KEYS } from '../api/secureStorage';
import { deactivatePushDevice, syncPushDevice } from '../api/pushNotifications';
import { signOutFromGoogle } from '../api/googleAuth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: (idToken: string, password?: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: (password: string) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    refreshUser: () => Promise<User>;
    completeStudentProfile: (payload: StudentProfilePayload) => Promise<User>;
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
                try {
                    const freshUser = await authService.refreshUser();
                    await secureStorage.set(SESSION_KEYS.userInfo, JSON.stringify(freshUser));
                    setUser(freshUser);
                } catch {
                    // Le cache local permet de rester connecté temporairement hors ligne.
                }
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

    useEffect(() => {
        if (user) void syncPushDevice().catch(() => undefined);
    }, [user]);

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

    const googleLogin = async (idToken: string, password?: string) => {
        setLoading(true);
        try {
            const response = await authService.googleLogin(idToken, password);
            setUser(response.user);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await deactivatePushDevice().catch(() => undefined);
        if (user?.auth_providers?.includes('google')) {
            await signOutFromGoogle().catch(() => undefined);
        }
        await authService.logout();
        setUser(null);
    };

    const deleteAccount = async (password: string) => {
        await deactivatePushDevice().catch(() => undefined);
        await authService.deleteAccount(password);
        setUser(null);
    };

    const updateUser = async (nextUser: User) => {
        await secureStorage.set(SESSION_KEYS.userInfo, JSON.stringify(nextUser));
        setUser(nextUser);
    };

    const refreshUser = async () => {
        const nextUser = await authService.refreshUser();
        await updateUser(nextUser);
        return nextUser;
    };

    const completeStudentProfile = async (payload: StudentProfilePayload) => {
        const nextUser = await authService.completeStudentProfile(payload);
        await updateUser(nextUser);
        return nextUser;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                googleLogin,
                logout,
                deleteAccount,
                updateUser,
                refreshUser,
                completeStudentProfile,
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
