import React, { useState } from 'react'
import { SafeAreaView, Image, View, StyleSheet } from 'react-native'
import colors from '../constants/colors'
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Text } from 'react-native-paper';
import { Dimensions } from 'react-native';



// Get the full screen width and height
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;



const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    cardStyle: {
        width: screenWidth * 0.9, 
        height: screenHeight * 0.7, 
        margin: 20,
        alignItems: "center"

    },
    cardImage: {
        width: screenWidth * 0.8, 
        height: screenHeight * 0.5, 

    },

    textContainer: {
        backgroundColor: colors.DarkGray,
        padding: 30,
        marginTop: 50,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        borderRadius: 20




    }

})
export default () => {
    const [image, setImage] = useState(null)

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                console.log(result.assets[0].uri)

                setImage(result.assets[0].uri);
                // and display the image or upload it to your server
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred while picking the image.');
        }
    };
    const captureImage = async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                console.log(result.assets[0].uri);
                setImage(result.assets[0].uri);
            }

        } catch (e) {
            console.error(e);
            alert('An error occurred while capturing the image.');
        }


    }
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <View style={{ flexDirection: 'row', justifyContent: "space-around", marginVertical: 20 }}>
                    <Button icon="image"
                        mode="contained" theme={{ colors: { primary: "green" } }} onPress={pickImage}> choose image </Button>
                    <Button icon="camera"
                        mode="outlined" theme={{ colors: { primary: "green", outline: "green" } }} onPress={captureImage}> capture </Button>
                </View>



                {image ?
                    (
                        <Card
                            // style={{ margin: 5 }}
                            style={styles.cardStyle}
                            mode="contained"
                            theme={{ colors: { surfaceVariant: colors.background } }}
                            heigh
                        >

                            <Card.Content>
                                <Text variant="titleLarge">image  title</Text>
                                <Text variant="bodyMedium">image content</Text>

                            </Card.Content>

                            <Card.Cover source={{ uri: image }} style={styles.cardImage} />

                            <Card.Actions>
                                <Button theme={{ colors: { primary: colors.textAndIcons, outline: colors.textAndIcons, } }} onPress={() => setImage(null)}>Cancel</Button>
                                <Button theme={{ colors: { primary: colors.textAndIcons } }} onPress={() => alert("Your image has been sent for animal detection.Results will be displayed shortly.")}>Detect Animal</Button>
                            </Card.Actions>

                        </Card>
                    ) : (
                        <View style={styles.textContainer} >
                            <Text variant="headlineMedium" style={{ textAlign: 'center', color: '#FFFFFF', }} >  Uncover the Wild: A Click Away from Nature's Wonders</Text>

                        </View>
                    )
                }


            </View>

        </SafeAreaView >


    )
}
