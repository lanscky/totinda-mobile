import { MotiView } from "moti";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

interface SplashScreenProps {
    onAnimationComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationComplete();
        }, 900);

        return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
        <View style={styles.container}>
            <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: "timing",
                    duration: 1000,
                }}
                style={styles.logoContainer}
            >
                <Image
                    source={require("../assets/images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </MotiView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: width * 0.7,
        height: width * 0.4,
    },
});
