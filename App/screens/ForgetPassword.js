import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import useEmailValidation from '../hooks/emailValidation';
import { resetPassword } from '../helper/axios';
import Toast from 'react-native-root-toast';

const ResetPasswordScreen = ({ route, navigation }) => {
    const [token, setToken] = useState('');
    const { showPassword, password, confirmPassword, handlePassword, handleConfirmPassword } = useEmailValidation();

    useEffect(() => {
        if (route.params?.token) {
            setToken(route.params.token);
        }
    }, [route.params]);




    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            alert('password do not match')
            return
        }
        try {
            const formData = {
                token: token,
                new_password: password
            };
            const response = await resetPassword(formData)
            if (response.status === 200) {
                navigation.navigate('Login')
                alert(response.data.message)
                Toast.show(response.data.message, {
                    duration: Toast.durations.LONG,
                });


            } else {
                Toast.show(response.message, {
                    duration: Toast.durations.LONG,
                });
            }
            console.log(response, "from reset")

        } catch (error) {
            Toast.show('An error occurred while trying to reset password.' + error.message, {
                duration: Toast.durations.LONG,
            });

        }

    }
    return (
        <View style={styles.container}>
            <Text>Reset your password</Text>
            <InputField
                label="Password"
                icon={<MaterialIcons name="lock" size={20} />}
                onChangeText={handlePassword}
                secureTextEntry={!showPassword}
                keyboardType="default"
            />
            <InputField
                label="Confirm Password"
                icon={<MaterialIcons name="lock" size={20} />}
                onChangeText={handleConfirmPassword}
                secureTextEntry={!showPassword}
                keyboardType="default"
            />

            <CustomButton label="Reset Password2" onPress={handlePasswordReset} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ResetPasswordScreen;
