import React, { useState } from 'react';
import {
    View,
    Text,
    Alert,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import Slider from '@react-native-community/slider';

const HomeScreen = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [sliderValue, setSliderValue] = useState(0.5); // Contrast adjustment slider
    const [level, setLevel] = useState(null); // For level tracking (Notan, 3, or 4)
    const [imageWidth, setImageWidth] = useState(300); // Default width
    const [imageHeight, setImageHeight] = useState(300); // Default height

    // Image selection
    const selectImage = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: false,
        })
            .then((image) => {
                setSelectedImage(image.path);
                setProcessedImage(null);

                // Set image dimensions
                Image.getSize(image.path, (width, height) => {
                    const screenWidth = Dimensions.get('window').width;
                    const scaleFactor = screenWidth / width;
                    const scaledHeight = height * scaleFactor;

                    setImageWidth(screenWidth);
                    setImageHeight(scaledHeight);
                });
            })
            .catch(() => {
                Alert.alert('Error', 'Could not pick an image');
            });
    };

    // Cropping image
    const cropImage = () => {
        if (!selectedImage) {
            Alert.alert('No Image Selected', 'Please select an image first');
            return;
        }
        ImagePicker.openCropper({
            path: selectedImage,
            width: 150,
            height: 150,
        })
            .then((image) => {
                setSelectedImage(image.path); // Ensure the cropped image is displayed
                setProcessedImage(null);

                // Update image dimensions after cropping
                Image.getSize(image.path, (width, height) => {
                    const screenWidth = Dimensions.get('window').width;
                    const scaleFactor = screenWidth / width;
                    const scaledHeight = height * scaleFactor;

                    setImageWidth(screenWidth);
                    setImageHeight(scaledHeight);
                });
            })
            .catch(() => {
                Alert.alert('Error', 'Failed to crop the image');
            });
    };

    // Save the processed image
    const saveImageToGallery = async () => {
        try {
            if (!processedImage && !selectedImage) {
                Alert.alert('No Image', 'Please process or crop an image before saving.');
                return;
            }
            const destPath = `${RNFS.PicturesDirectoryPath}/edited_image_${Date.now()}.jpg`;
            await RNFS.copyFile(selectedImage || processedImage, destPath);
            Alert.alert('Success', `Image saved to: ${destPath}`);
        } catch {
            Alert.alert('Error', 'Something went wrong while saving the image.');
        }
    };

    const drawGrid = () => {
        const rowHeight = imageHeight / rows;
        const colWidth = imageWidth / cols;

        const grid = [];
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
        return grid;
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.imageContainer}>
                {selectedImage && (
                    <View>
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: imageWidth, height: imageHeight }}
                        />
                        {drawGrid()}
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={selectImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={cropImage}>
                    <Text style={styles.buttonText}>Crop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setLevel(2)}>
                    <Text style={styles.buttonText}>Apply Notan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setLevel(3)}>
                    <Text style={styles.buttonText}>Level 3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setLevel(4)}>
                    <Text style={styles.buttonText}>Level 4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={saveImageToGallery}>
                    <Text style={styles.buttonText}>Save Image</Text>
                </TouchableOpacity>
            </View>

            {level === 3 || level === 4 ? (
                <View style={styles.sliderContainer}>
                    <Text>Adjust Contrast: {sliderValue.toFixed(2)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.01}
                        value={sliderValue}
                        onValueChange={(value) => setSliderValue(value)}
                    />
                </View>
            ) : null}

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
        flexGrow: 1,
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
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        margin: 5,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sliderContainer: {
        marginVertical: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});

export default HomeScreen;
