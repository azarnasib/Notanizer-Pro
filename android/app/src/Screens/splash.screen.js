import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Import for navigation
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Navigate to HomeScreen after 1 second
        const timer = setTimeout(() => {
            navigation.replace('HomeScreen'); // Replace to avoid going back to splash screen
        }, 1000); // 1000 ms = 1 second

        return () => clearTimeout(timer); // Clear timer when component unmounts
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Notanizer Pro</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF', // Blue background
    },
    text: {
        fontSize: 50,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Pacifico', // Fancy font (you can change it to any other font)
    },
});

export default SplashScreen;
