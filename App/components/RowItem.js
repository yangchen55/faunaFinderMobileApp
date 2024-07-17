import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from "react-native"
import colors from "../constants/colors"


const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },

    text: {
        fontSize: 16,
        color: colors.textAndIcons
    },
    separator: {
        backgroundColor: colors.primary,
        height: StyleSheet.hairlineWidth,
        marginLeft: 20
    }

})

export const RowItem = ({ title, onPress, rightIcon }) => (
    <TouchableOpacity TouchableOpacity style={styles.row} onPress={onPress} >
        <Text style={styles.text}>  {title}   </Text>

        {rightIcon}
    </TouchableOpacity>
)


export const RowSeparator = () => (
    <View style={styles.separator} />
)
