import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './android/app/src/Screens/home.screen.';
import SplashScreen from './android/app/src/Screens/splash.screen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ title: 'Splash', headerShown: false }} />


        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MainNavigator />
    </GestureHandlerRootView>
  );
}

export default App;
