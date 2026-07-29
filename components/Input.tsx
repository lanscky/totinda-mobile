import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    className?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon: Icon,
    error,
    secureTextEntry,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry;
    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <View className={`mb-4 w-full ${className}`}>
            {label && (
                <Text className="mb-2 ml-1 font-maven-med text-secondary text-sm">
                    {label}
                </Text>
            )}
            <View
                className={`flex-row items-center border rounded-xl px-4 py-3 bg-white ${isFocused ? 'border-primary' : error ? 'border-red-500' : 'border-gray-200'}`}
            >
                {Icon && <Icon size={20} color={isFocused ? '#044EB8' : '#9CA3AF'} className="mr-3" />}

                <TextInput
                    className="flex-1 font-noto-reg text-secondary text-base"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    placeholderTextColor="#9CA3AF"
                    accessibilityLabel={label || props.placeholder}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={togglePassword}
                        accessibilityRole="button"
                        accessibilityLabel={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                            <Eye size={20} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="mt-1 ml-1 text-red-500 text-xs font-noto-reg">
                    {error}
                </Text>
            )}
        </View>
    );
};
