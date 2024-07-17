import React from "react"
import { StyleSheet, SafeAreaView, ScrollView, Alert, Linking } from "react-native"

import colors from '../constants/colors'
import { Button } from 'react-native-paper';
import { RowItem, RowSeparator } from "../components/RowItem";


const openLink = (url) => {
    Linking.openURL(url).catch(() => Alert.alert("link of website needed to connected👺"))
}


const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: colors.background
    }

})
export default () => {
    return (
        <SafeAreaView style={styles.main}>
            <ScrollView>
                <RowItem title="Home" onPress={() => alert("todo!")} rightIcon={
                    <Button icon="home"> </Button>

                } />
                <RowSeparator />

                <RowItem title="About Us" onPress={() => openLink("https://www.apple.com/au/")} rightIcon={
                    <Button Button icon="home" ></Button>
                } />



                <RowSeparator />
                <RowItem title="Contact" onPress={() => openLink("test")} rightIcon={
                    <Button icon="phone"></Button>
                } />

            </ScrollView>
        </SafeAreaView >

    )
} 