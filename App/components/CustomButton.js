import React from 'react'
import { StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import colors from '../constants/colors'
const styles = StyleSheet.create({

    Button: {
        backgroundColor: colors.primary,
        color: colors.white,
        padding: 10,
        fontSize: 30,
        marginBottom: 20,
        margin: 15

    },


})


export const CustomButton = ({ icon, label, onPress }) => {
    return (
        <Button icon={icon} mode="contained" style={styles.Button} onPress={onPress}>
            {label}
        </Button>

    )
}
