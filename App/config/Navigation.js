import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from "expo-linking";
import Home from "../screens/Home";
import Options from "../screens/Options";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import CaptureImage from "../screens/CaptureImage";
import ForgetPassword from "../screens/ForgetPassword";

const MainStack = createStackNavigator();

const prefix = Linking.createURL("/");
const linking = {
    prefixes: [prefix, 'https://192.168.1.181:8081'],
    config: {
        screens: {
            ForgetPassword: "reset-password"
        },
    },
};

const MainStackScreen = () => (
    <MainStack.Navigator initialRouteName="Login">
        <MainStack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <MainStack.Screen name="Options" component={Options} />
        <MainStack.Screen name="Login" component={Login} />
        <MainStack.Screen name="SignUp" component={SignUp} />
        <MainStack.Screen name="CaptureImage" component={CaptureImage} />
        <MainStack.Screen name="ForgetPassword" component={ForgetPassword} />
    </MainStack.Navigator>
);

export default () => {
    return (
        <NavigationContainer linking={linking}>
            <MainStackScreen />
        </NavigationContainer>

    );
};
