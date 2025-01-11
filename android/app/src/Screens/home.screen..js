import React, { useState } from 'react';
import {
    View,
    Text,
    Alert,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Picker } from '@react-native-picker/picker'; // Notan dropdown picker
import Slider from '@react-native-community/slider';
import { Skia, Canvas, Paint, useValue, runTiming, useComputedValue, rect } from '@shopify/react-native-skia';

const HomeScreen = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [notanTones, setNotanTones] = useState(2); // Default value is 2 tones (Black and White)
    const [modalVisible, setModalVisible] = useState(false);
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    // Define colors for the Notan effect
    const black = Skia.Color(0, 0, 0);
    const white = Skia.Color(255, 255, 255);
    const gray = Skia.Color(169, 169, 169); // Light gray
    const midGray = Skia.Color(128, 128, 128); // Mid gray
    const darkGray = Skia.Color(64, 64, 64); // Dark gray

    const selectImage = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: false,
        })
            .then((image) => {
                setSelectedImage(image.path);
                setProcessedImage(null); // Reset processed image after new image selection
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Could not pick an image');
            });
    };

    const saveImageToGallery = async () => {
        try {
            if (!processedImage) {
                Alert.alert('No Image', 'Please process an image before saving.');
                return;
            }

            const destPath = `${RNFS.PicturesDirectoryPath}/edited_image_${Date.now()}.jpg`;
            await RNFS.copyFile(processedImage, destPath);
            Alert.alert('Success', `Image saved to: ${destPath}`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong while saving the image.');
        }
    };

    const processNotan = async (tones) => {
        if (!selectedImage) {
            Alert.alert('No Image Selected', 'Please select an image first');
            return;
        }

        try {
            const resizedImage = await ImageResizer.createResizedImage(
                selectedImage,
                300,
                300,
                'JPEG',
                100
            );

            const pixelData = await ImageEditor.getPixelData(resizedImage.uri);

            const convertToNotan = (data, toneCount) => {
                const step = 255 / (toneCount - 1);
                return data.map((value) => Math.round(value / step) * step);
            };

            const newPixelData = convertToNotan(pixelData, tones);
            const processedPath = await ImageEditor.savePixelData(newPixelData, {
                format: 'JPEG',
                quality: 100,
            });

            setProcessedImage(processedPath);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to apply Notan effect');
        }
    };

    const cropImage = () => {
        if (!selectedImage) {
            Alert.alert('No Image Selected', 'Please select an image first');
            return;
        }

        ImagePicker.openCropper({
            path: selectedImage,
            width: 150,
            height: 150,
            cropping: true,
        })
            .then((image) => {
                setProcessedImage(image.path); // Set only the cropped image
                setSelectedImage(null); // Reset the original image
            })
            .catch((error) => {
                console.error(error);
                Alert.alert('Error', 'Failed to crop the image');
            });
    };

    const drawGrid = () => {
        if (!selectedImage && !processedImage) return null; // Only show grid when there's an image

        const imageWidth = 310; // Fixed image width
        const imageHeight = 310; // Fixed image height

        const rowHeight = imageHeight / rows;
        const colWidth = imageWidth / cols;

        const grid = [];

        // Draw row grid lines
        for (let i = 1; i < rows; i++) {
            grid.push(
                <View
                    key={`row-${i}`}
                    style={{
                        position: 'absolute',
                        top: i * rowHeight,
                        left: 0,
                        right: 0,
                        borderBottomWidth: 1,
                        borderColor: 'rgba(0,0,0,0.5)',
                    }}
                />
            );
        }

        // Draw column grid lines
        for (let i = 1; i < cols; i++) {
            grid.push(
                <View
                    key={`col-${i}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: i * colWidth,
                        bottom: 0,
                        borderLeftWidth: 1,
                        borderColor: 'rgba(0,0,0,0.5)',
                    }}
                />
            );
        }

        // Ensure that the last row reaches the bottom of the image
        grid.push(
            <View
                key="last-row"
                style={{
                    position: 'absolute',
                    top: rows * rowHeight, // This should be the bottom of the image
                    left: 0,
                    right: 0,
                    borderBottomWidth: 1,
                    borderColor: 'rgba(0,0,0,0.5)',
                }}
            />
        );

        // Ensure that the last column reaches the right edge of the image
        grid.push(
            <View
                key="last-col"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: cols * colWidth, // This should be the right edge of the image
                    bottom: 0,
                    borderLeftWidth: 1,
                    borderColor: 'rgba(0,0,0,0.5)',
                }}
            />
        );

        return grid;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {processedImage ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: processedImage }} style={styles.imageStyle} />
                    {drawGrid()}
                </View>
            ) : (
                selectedImage && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imageStyle} />
                        {drawGrid()}
                    </View>
                )
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={selectImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Apply Notan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={cropImage}>
                    <Text style={styles.buttonText}>Crop Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={saveImageToGallery}>
                    <Text style={styles.buttonText}>Save Image</Text>
                </TouchableOpacity>
            </View>

            {/* Notan Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Select Notan Tones</Text>
                    <Picker
                        selectedValue={notanTones}
                        onValueChange={(itemValue) => setNotanTones(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="2 Tones (Black, White)" value={2} />
                        <Picker.Item label="3 Tones (Black, White, Grey)" value={3} />
                        <Picker.Item label="4 Tones (Black, White, Dark Grey, Mid Grey)" value={4} />
                    </Picker>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            processNotan(notanTones); // Apply the Notan effect based on selected tones
                            setModalVisible(false); // Close modal after applying
                        }}
                    >
                        <Text style={styles.buttonText}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={styles.sliderContainer}>
                <Text>Rows: {rows}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={60}
                    step={1}
                    value={rows}
                    onValueChange={setRows}
                />
                <Text>Columns: {cols}</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={60}
                    step={1}
                    value={cols}
                    onValueChange={setCols}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        position: 'relative',
    },
    imageStyle: {
        width: 300,
        height: 300,
        alignSelf: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        flexWrap: 'wrap',
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        margin: 5,
        width: '40%',
        justifyContent: 'center',
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sliderContainer: {
        marginTop: 20,
    },
    slider: {
        width: '100%',
        height: 40,
        marginVertical: 10,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        fontSize: 20,
        color: 'white',
        marginBottom: 15,
    },
    picker: {
        width: 200,
        height: 50,
        color: 'white',
        backgroundColor: '#007BFF',
        marginBottom: 15,
    },
});

export default HomeScreen;
