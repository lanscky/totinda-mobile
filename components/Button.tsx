import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
    loading?: boolean;
    disabled?: boolean;
    icon?: LucideIcon;
    fullWidth?: boolean;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon: Icon,
    fullWidth = true,
    className = '',
}) => {
    const isDisabled = disabled || loading;

    const baseStyles = "flex-row items-center justify-center rounded-xl ";
    const defaultPadding = "py-4 px-6 ";

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary': return 'bg-primary ';
            case 'secondary': return 'bg-secondary ';
            case 'outline': return 'bg-transparent border border-primary ';
            case 'ghost': return 'bg-transparent ';
            default: return '';
        }
    };

    const getTextStyles = () => {
        let styles = 'text-center font-maven-bold text-base ';
        if (variant === 'primary' || variant === 'secondary' || variant === 'gradient') {
            styles += 'text-white ';
        } else {
            styles += 'text-primary ';
        }
        return styles;
    };

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={(variant === 'outline' || variant === 'ghost') ? '#044EB8' : '#fff'} />
            ) : (
                <View className="flex-row items-center justify-center">
                    {Icon && <Icon size={20} color={(variant === 'outline' || variant === 'ghost') ? '#044EB8' : '#fff'} className="mr-2" />}
                    <Text className={getTextStyles()}>{title}</Text>
                </View>
            )}
        </>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={title}
                accessibilityState={{ disabled: isDisabled, busy: loading }}
                activeOpacity={0.8}
                className={`${fullWidth ? 'w-full' : ''} ${className} overflow-hidden rounded-xl ${isDisabled ? 'opacity-70' : ''}`}
            >
                <LinearGradient
                    colors={['#044EB8', '#1B81CA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className={`${baseStyles} ${defaultPadding}`}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            activeOpacity={0.7}
            className={`${baseStyles} ${defaultPadding} ${getVariantStyles()} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className}`}
        >
            {content}
        </TouchableOpacity>
    );
};
