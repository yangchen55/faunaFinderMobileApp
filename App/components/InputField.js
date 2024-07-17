
import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
const style = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 24,
        margin: 10

    },
    textInput: {
        flex: 1,
        paddingVertical: 0

    }

})


export const InputField = ({ label, icon, inputType, keyboardType, onChangeText, condition, secureTextEntry, value, maxLength, textContentType }) => {
    return (


        <View style={style.mainContainer}>
            {icon}
            {inputType == "password" ? (
                <TextInput
                    placeholder={label}
                    value={value}
                    style={style.textInput}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    onChangeText={onChangeText}
                    maxLength={maxLength}

                />) :
                (
                    <TextInput
                        placeholder={label}
                        value={value}
                        style={style.textInput}
                        keyboardType={keyboardType}
                        textContentType={textContentType}
                        maxLength={maxLength}
                        onChangeText={onChangeText} // Use onChangeText for TextInput



                    />

                )}
            {condition}

        </View>



    )
}




