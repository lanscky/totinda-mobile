import { X } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Typography } from "./Typography";

interface FilterModalProps {
    isVisible: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialFilters: FilterValues;
    options: FilterValues;
}

export interface FilterValues {
    sector: string[];
    contract: string[];
    location: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
    isVisible,
    onClose,
    onApply,
    initialFilters,
    options,
}) => {
    const { t } = useTranslation();
    const [filters, setFilters] = React.useState<FilterValues>(initialFilters);

    // Sync local state when modal opens
    React.useEffect(() => {
        if (isVisible) {
            setFilters(initialFilters);
        }
    }, [isVisible, initialFilters]);

    const toggleFilter = (type: keyof FilterValues, value: string) => {
        setFilters((prev) => {
            const current = prev[type];
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [type]: next };
        });
    };

    const handleReset = () => {
        const emptyFilters = { sector: [], contract: [], location: [] };
        setFilters(emptyFilters);
        onApply(emptyFilters);
        onClose();
    };

    const Chip = ({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 mb-2 border ${isSelected ? "bg-primary border-primary" : "bg-white border-gray-200"}`}
        >
            <Typography
                variant="caption"
                weight={isSelected ? "bold" : "reg"}
                className={isSelected ? "text-white" : "text-gray-600"}
            >
                {label}
            </Typography>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                            <Typography variant="h3" font="maven" weight="bold" className="text-secondary">
                                {t("filters.title")}
                            </Typography>
                            <TouchableOpacity onPress={onClose} className="p-2">
                                <X size={24} color="#1D2633" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                            {/* Sectors */}
                            <View className="mb-8">
                                <Typography variant="body" weight="bold" className="text-secondary mb-4">
                                    {t("filters.sector")}
                                </Typography>
                                <View className="flex-row flex-wrap">
                                    {options.sector.map((s) => (
                                        <Chip
                                            key={s}
                                            label={s}
                                            isSelected={filters.sector.includes(s)}
                                            onPress={() => toggleFilter("sector", s)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Contract Types */}
                            <View className="mb-8">
                                <Typography variant="body" weight="bold" className="text-secondary mb-4">
                                    {t("filters.contract")}
                                </Typography>
                                <View className="flex-row flex-wrap">
                                    {options.contract.map((c) => (
                                        <Chip
                                            key={c}
                                            label={c}
                                            isSelected={filters.contract.includes(c)}
                                            onPress={() => toggleFilter("contract", c)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Locations */}
                            <View className="mb-8">
                                <Typography variant="body" weight="bold" className="text-secondary mb-4">
                                    {t("filters.location")}
                                </Typography>
                                <View className="flex-row flex-wrap">
                                    {options.location.map((l) => (
                                        <Chip
                                            key={l}
                                            label={l}
                                            isSelected={filters.location.includes(l)}
                                            onPress={() => toggleFilter("location", l)}
                                        />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View className="px-6 py-4 flex-row gap-4 border-t border-gray-100 bg-white">
                            <TouchableOpacity
                                onPress={handleReset}
                                className="flex-1 h-14 items-center justify-center border border-gray-200 rounded-2xl"
                            >
                                <Typography weight="bold" className="text-gray-500">{t("common.reset")}</Typography>
                            </TouchableOpacity>
                            <View className="flex-[1.5]">
                                <Button
                                    title={t("common.apply")}
                                    onPress={() => onApply(filters)}
                                    variant="gradient"
                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    content: {
        backgroundColor: "white",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        height: "80%",
    },
});
