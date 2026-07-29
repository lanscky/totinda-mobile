import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    font?: 'maven' | 'noto';
    weight?: 'reg' | 'med' | 'semi' | 'bold' | 'black';
    color?: string;
    className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    font = 'maven',
    weight = 'reg',
    color,
    className = '',
    style,
    children,
    ...props
}) => {
    const getFontFamily = () => {
        const prefix = font === 'maven' ? 'MavenPro' : 'NotoSans';
        let suffix = 'Regular';

        switch (weight) {
            case 'med': suffix = 'Medium'; break;
            case 'semi': suffix = 'SemiBold'; break;
            case 'bold': suffix = 'Bold'; break;
            case 'black': suffix = font === 'maven' ? 'Black' : 'Bold'; break;
            default: suffix = 'Regular';
        }

        return `${prefix}-${suffix}`;
    };

    const getFontSize = () => {
        switch (variant) {
            case 'h1': return 'text-3xl';
            case 'h2': return 'text-2xl';
            case 'h3': return 'text-xl';
            case 'body': return 'text-base';
            case 'caption': return 'text-sm';
            case 'label': return 'text-xs';
            default: return 'text-base';
        }
    };

    const fontFamily = getFontFamily();
    const fontSize = getFontSize();

    return (
        <RNText
            className={`${fontSize} ${className}`}
            style={[{ fontFamily, color }, style]}
            {...props}
        >
            {children}
        </RNText>
    );
};
