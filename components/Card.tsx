import { Clock, DollarSign, MapPin } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Typography } from './Typography';

const fallbackLogo = require('../assets/images/logo.png');

interface JobOfferCardProps {
    id: number;
    title: string;
    companyName: string;
    logo: string;
    location: string;
    duration: string;
    salary?: string | number;
    onPress: () => void;
    index?: number;
}

export const JobOfferCard: React.FC<JobOfferCardProps> = ({
    title,
    companyName,
    logo,
    location,
    duration,
    salary,
    onPress,
    index = 0,
}) => {
    return (
        <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 500, delay: index * 100 }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${title}, ${companyName}`}
                className="flex-row items-center bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-50"
            >
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center border border-gray-100 overflow-hidden">
                    <Image
                        source={logo ? { uri: logo } : fallbackLogo}
                        className="w-12 h-12"
                        resizeMode="contain"
                    />
                </View>

                <View className="flex-1 ml-4">
                    <Typography variant="h3" font="maven" weight="bold" className="text-secondary" numberOfLines={1}>
                        {title}
                    </Typography>
                    <Typography variant="caption" font="noto" className="text-gray-500 mt-0.5">
                        {companyName}
                    </Typography>

                    <View className="flex-row items-center mt-2 flex-wrap gap-x-3">
                        <View className="flex-row items-center">
                            <MapPin size={12} color="#9CA3AF" />
                            <Typography variant="label" font="noto" className="text-gray-400 ml-1">
                                {location}
                            </Typography>
                        </View>
                        <View className="flex-row items-center">
                            <Clock size={12} color="#9CA3AF" />
                            <Typography variant="label" font="noto" className="text-gray-400 ml-1">
                                {duration}
                            </Typography>
                        </View>
                        {salary && (
                            <View className="flex-row items-center">
                                <DollarSign size={12} color="#9CA3AF" />
                                <Typography variant="label" font="noto" className="text-gray-400 ml-1">
                                    {salary}
                                </Typography>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </MotiView>
    );
};

interface CompanyCardProps {
    id: number;
    name: string;
    logo: string;
    industry: string;
    onPress: () => void;
    index?: number;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
    name,
    logo,
    industry,
    onPress,
    index = 0,
}) => {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: index * 100 }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${industry}`}
                className="w-40 mr-4 bg-white rounded-3xl p-5 items-center shadow-sm border border-gray-50"
            >
                <View className="w-20 h-20 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm mb-3 overflow-hidden">
                    <Image
                        source={logo ? { uri: logo } : fallbackLogo}
                        className="w-14 h-14"
                        resizeMode="contain"
                    />
                </View>
                <Typography variant="body" font="maven" weight="bold" className="text-secondary text-center" numberOfLines={1}>
                    {name}
                </Typography>
                <Typography variant="label" font="noto" className="text-gray-400 text-center mt-1" numberOfLines={1}>
                    {industry}
                </Typography>
            </TouchableOpacity>
        </MotiView>
    );
};
