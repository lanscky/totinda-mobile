import { Skeleton as MotiSkeleton } from 'moti/skeleton';
import React from 'react';
import { View } from 'react-native';

interface SkeletonProps {
    show: boolean;
    children: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ show, children }) => {
    return (
        <MotiSkeleton.Group show={show}>
            {children}
        </MotiSkeleton.Group>
    );
};

export const OfferSkeleton = () => (
    <View className="flex-row items-center bg-white rounded-3xl p-4 mb-4 border border-gray-50">
        <MotiSkeleton colorMode="light" radius={20} height={64} width={64} />
        <View className="flex-1 ml-4 justify-center">
            <MotiSkeleton colorMode="light" radius={4} height={20} width="80%" />
            <View className="h-2" />
            <MotiSkeleton colorMode="light" radius={4} height={14} width="40%" />
            <View className="h-4" />
            <View className="flex-row gap-4">
                <MotiSkeleton colorMode="light" radius={4} height={12} width={60} />
                <MotiSkeleton colorMode="light" radius={4} height={12} width={60} />
            </View>
        </View>
    </View>
);

export const CompanySkeleton = () => (
    <View className="w-40 mr-4 bg-white rounded-3xl p-5 items-center border border-gray-50">
        <MotiSkeleton colorMode="light" radius="round" height={80} width={80} />
        <View className="h-4" />
        <MotiSkeleton colorMode="light" radius={4} height={16} width="70%" />
        <View className="h-2" />
        <MotiSkeleton colorMode="light" radius={4} height={12} width="50%" />
    </View>
);
