

import React, { useState } from 'react'
import { Text, StyleSheet } from 'react-native'
import { InputField } from '../components/InputField';
import colors from '../constants/colors';
import { CustomButton } from '../components/CustomButton';
import useEmailValidation from '../hooks/emailValidation';
import { RecoverPassword } from '../helper/axios';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

const styles = StyleSheet.create({
    modalText: { marginBottom: 15, textAlign: 'center' }
})


const CustomModal = () => {

    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const { email, emailVerified, handleEmail } = useEmailValidation();



    const handleSubmitForgetPassword = async () => {
        if (!emailVerified) {
            alert('please verify your email')
            return
        }

        try {
            const response = await RecoverPassword(email)
            if (response.status === 200) {
                setIsEmailVerified(true)
                Toast.show(response.data.message, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                    shadow: true,
                    animation: true,
                });

            } else {
                Toast.show(response.message, {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.CENTER,
                    shadow: true,
                    animation: true,
                });
            }


        } catch (error) {
            Toast.show(error.message, {
                duration: Toast.durations.LONG,
                position: Toast.positions.CENTER,
                shadow: true,
                animation: true,
            });
        }


    }
    return (
        <>

            {!isEmailVerified && (
                <>
                    <Text style={styles.modalText}>Reset Password</Text>
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
                    <CustomButton label={"Reset"} onPress={() => handleSubmitForgetPassword()} />
                </>

            )}


        </>


    )
}

export default CustomModal