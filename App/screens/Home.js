import React, { useState } from 'react'
import { View, StyleSheet, StatusBar, SafeAreaView, Image, TouchableOpacity, ScrollView } from "react-native"
import colors from '../constants/colors'
import { Button, Icon } from 'react-native-paper'



const styles = StyleSheet.create({
    header: {
        alignItems: "flex-end",
        marginHorizontal: 20,
    },

    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,

    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",

    },
    loginButton: {
        backgroundColor: colors.primary,
        color: colors.white,

    },
    signUpButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.primary,
    },

})

export default ({ navigation }) => {
    const [scrollEnabled, setScrollEnabled] = useState(false)
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />


            <SafeAreaView style={styles.header}>
                <TouchableOpacity onPress={() => navigation.push("Options")}>
                    <Icon
                        source="menu"
                        size={20}
                    />
                </TouchableOpacity>
            </SafeAreaView>



            <View style={styles.logoContainer}>
                <Image source={require("../assets/images/logo2.png")} style={styles.logo} resizeMode="contain" />
            </View>


            <View style={styles.buttonContainer}>
                <Button icon="login" mode="contained" style={styles.loginButton} onPress={() => navigation.push("Login")}>
                    Login
                </Button>
                <Button icon="account-plus" mode="contained-tonal" style={styles.signUpButton} onPress={() => navigation.push("SignUp")}>
                    Sign Up
                </Button>
            </View>
        </SafeAreaView>
    )
}
