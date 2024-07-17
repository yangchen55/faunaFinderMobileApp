import React, { useState } from 'react'
import { Text, Image, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'

import { InputField } from '../components/InputField';
import { CustomButton } from '../components/CustomButton';
import useEmailValidation from '../hooks/emailValidation';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import { verifyEmail } from '../helper/axios';
import colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
    modalText: { marginBottom: 15, textAlign: 'center' }
})


export default () => {
    const navigation = useNavigation();
    const { email, emailVerified, handleEmail } = useEmailValidation();
    const [code, setCode] = useState()

    const handleToken = (token) => {
        setCode(token)

    };

    const handleVerificationCode = async () => {
        if (!emailVerified) {
            alert('wrong email format')
            return
        }

        try {
            const response = await verifyEmail(email, code);
            if (response.status === 200) {
                navigation.navigate('Login');
                Toast.show(response.message, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                    shadow: true,
                    animation: true,
                });

            } else {
                alert(response.message)
                const message = response.message || "Unexpected error occurred.";
                Toast.show(message, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                    shadow: true,
                    animation: true,
                });
            }
        } catch (error) {

            const errorMessage = error.response?.data?.detail || 'An error occurred while trying to verify the email.';
            Toast.show(errorMessage, {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
                shadow: true,
                animation: true,
            });
        }


    }


    return (

        <>
            <Text style={styles.modalText}>Enter your email and code</Text>
            <InputField
                label={'enter your email address'}
                value={email}
                icon={
                    <MaterialIcons name="alternate-email" size={20} color={colors.textAndIcons} style={{ marginHorizontal: 15 }} />}
                keyboardType="email-address"
                onChangeText={email => handleEmail(email)}
                textContentType={"emailAddress"}
            >
            </InputField>
            <InputField
                label={' enter your token here '}
                icon={
                    <MaterialIcons name="token" size={20} color={colors.textAndIcons} style={{ marginHorizontal: 15 }} />}
                keyboardType="numeric"
                onChangeText={(e) => handleToken(e)}
                maxLength={6}

                condition={email.length < 1 ? null : emailVerified ?
                    (<Feather name="check-circle" color="green" size={20} />)
                    :
                    (<MaterialIcons name="error" color="red" size={20} />)
                }
            >
            </InputField>
            <CustomButton label={"Submit"} onPress={() => handleVerificationCode()} />

        </>




    )
}
