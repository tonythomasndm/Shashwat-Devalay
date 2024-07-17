import React, { useState, useContext, useEffect } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    StyleSheet,
    TextInput,
    Image,
    ScrollView,
    Alert,
} from "react-native";
import { COLOURS, SIZES } from "../../styles/index";
import { styles } from '../../styles/index';
import * as ImagePicker from 'expo-image-picker';
import AppContext from '../../../AppContext';
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, onSnapshot, query, where, doc, getDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject,listAll, } from "firebase/storage";

function convertTimeStringToTimestamp(timeString) {

    const [timePart, period] = timeString.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);

    let adjustedHours = hours;
    if (period.toLowerCase() === "pm" && adjustedHours !== 12) {
        adjustedHours += 12;
    } else if (period.toLowerCase() === "am" && adjustedHours === 12) {
        adjustedHours = 0;
    }

    const date = new Date(2024, 0, 1, adjustedHours, minutes);
    const timestamp = Timestamp.fromDate(date);

    return timestamp;
}
function convertTimestampToTimeString(timestamp) {
    // Get the Date object from the Firestore Timestamp
    const date = timestamp.toDate();

    // Extract hours and minutes from the Date object
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Convert hours to 12-hour format and determine period (AM/PM)
    let period = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

    // Convert hours and minutes to string format with leading zeros if needed
    const hoursString = String(hours).padStart(2, "0");
    const minutesString = String(minutes).padStart(2, "0");

    // Concatenate hours, minutes, and period to form the time string
    const timeString = `${hoursString}:${minutesString} ${period}`;

    return timeString;
}

const handleTimeSlots = (index, timeType, time) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index][timeType] = time;
    setTimeSlots(updatedTimeSlots);
};

const TimeSlotSelector = ({ timeType, initialValue, setTime }) => {
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedTime, setSelectedTime] = useState(initialValue);
    console.log("timetype:", timeType, "initialTime:", initialValue, "selectedTime:", selectedTime)

    // Function to handle time selection and update time slots
    const handleTimeConfirm = (time) => {
        const formattedTime = time.toLocaleTimeString("en-GB", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        setTime(formattedTime)
        console.log("selectedTIme:" + selectedTime);
        setSelectedTime(formattedTime); // Update selectedTime with formatted time
        //   handleTimeSlots( timeType, formattedTime); // Update time slot in main state
        setTimePickerVisibility(false); // Hide time picker
    };

    return (
        <View style={styles.timeSlotContainer}>
            <TouchableOpacity
                onPress={() => setTimePickerVisibility(true)}
                style={[styles.fillBlank(SIZES.medium), { width: "auto" }]}>
                <Text style={{ color: COLOURS.black, fontSize: 16 }}>
                    {selectedTime
                        ? selectedTime
                        : timeType === "Opening"
                            ? "Opening Time"
                            : "Closing Time"}
                </Text>
            </TouchableOpacity>

            {/* Render DateTimePickerModal when isTimePickerVisible is true */}
            <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode='time'
                onConfirm={handleTimeConfirm}
                onCancel={() => setTimePickerVisibility(false)}
            />
        </View>
    );
};

const SwarojgarCreateShop = ({ edit, setEdit }) => {
    const { infraId, mode, seekerId, volunteerId } = useContext(AppContext);
    const [shopName, setShopName] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [shopImages, setShopImages] = useState([]);
    const [shopOpening, setShopOpening] = useState(null);
    const [shopAddress, setShopAddress] = useState("");
    const [shopClosing, setShopClosing] = useState(null);
    const [error, setError] = useState("");
    const userId = (mode === "Volunteer") ? volunteerId : seekerId;

    const [products, setProducts] = useState([{
        imageUri: '',
        name: '',
        description: '',
        price: '',
        inStock: true,
    }]);
    const [requestStatus, setRequestStatus] = useState("");
    const [requestRemarks, setRequestRemarks] = useState("");

    const optionsRegistrationDeadline = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    };

    useEffect(() => {
        if (userId) {
            const unsubscribe = onSnapshot(
                collection(FIRESTORE_DB, "SwarozgarRequests"),
                (snapshot) => {
                    const docData = snapshot.docs.find(doc => doc.id === userId);
                    if (docData) {
                        const data = docData.data();
                        setRequestStatus(data.status || "");
                        setRequestRemarks(data.remarks || "");
                    } else {
                        setRequestStatus("");
                        setRequestRemarks("");
                    }
                },
                (error) => {
                    console.error("Error fetching SwarojgarRequests docs:", error);
                }
            );

            // return () => unsubscribe();

            const unsubscribe2 = onSnapshot(
                collection(FIRESTORE_DB, "Shops"),
                (snapshot) => {
                    const docData = snapshot.docs.find(doc => doc.id === userId);
                    if (docData) {
                        const data = docData.data();
                        setShopName(data.shopName)
                        setShopDescription(data.shopDescription);
                        setShopAddress(data.shopAddress);
                        setShopImages(data.shopImages);
                        setShopOpening(data.openingTime);
                        setShopClosing(data.closingTime);
                        setProducts(data.products)
                        // setRequestStatus(data.status || "");
                        // setRequestRemarks(data.remarks || "");
                    } else {
                        setRequestStatus("");
                        setRequestRemarks("");
                    }
                },
                (error) => {
                    console.error("Error fetching SwarojgarRequests docs:", error);
                }
            );

            return () => unsubscribe2();
        }
    }, []);

    const uplodToFirebase = async (uri, filename, subfolder) => {
        const fetchResponse = await fetch(uri);
        const theBlob = await fetchResponse.blob();
        console.log("Blob:" + theBlob);
        console.log("filename:" + filename);

        const storage = getStorage();
        const storageRef = ref(storage, `${userId}/${subfolder}/${filename}`);

        const uploadTask = uploadBytesResumable(storageRef, theBlob);

        return new Promise((resolve, reject) => {

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    // Handle unsuccessful uploads
                    reject(error);
                    console.log(error.message);
                },
                async () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
                    resolve({
                        downloadUrl,
                    })
                }
            );

        })
    }

    const pickImages = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (!result.cancelled) {
            try {
                // Map over assets and upload each one, returning a promise for the download URL
                const uploadPromises = result.assets.map(async (asset) => {
                    const uploadResp = await uplodToFirebase(asset.uri, asset.fileName, "ShopImages");
                    return uploadResp.downloadUrl;
                });

                // Wait for all upload promises to resolve
                const uploadedImageUrls = await Promise.all(uploadPromises);

                // Update the state with the resolved URLs
                setShopImages([...shopImages, ...uploadedImageUrls]);
            } catch (error) {
                console.error('Error uploading images to Firebase:', error);
            }
        }
    };

    const removeImage = (indexToRemove) => {
        const newImages = [...shopImages];
        newImages.splice(indexToRemove, 1);
        setShopImages(newImages);
    };

    const addProduct = () => {
        const newProduct = {
            imageUri: '',
            name: '',
            description: '',
            price: '',
            inStock: true,
        };
        setProducts([...products, newProduct]);
    };

    const updateProductDetails = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;
        setProducts(updatedProducts);
    };
    const validateProduct = (product, index) => {
        // Check each field of the product and return the first encountered error message
        if (!product.imageUri) return `Product at position ${index + 1} is missing image.`;
        if (!product.name) return `Product at position ${index + 1} is missing name.`;
        if (!product.description) return `Product at position ${index + 1} is missing description.`;
        if (!product.price) return `Product at position ${index + 1} is missing price.`;

        // If all fields are filled, return an empty string indicating no error
        return '';
    }

    const validateProducts = () => {
        for (let i = 0; i < products.length; i++) {
            const errorMessage = validateProduct(products[i], i);
            setError(errorMessage);
            if (errorMessage) return false; // Return the first encountered error message
        }
        return true; // Return a success message if no errors are found
    }
    const validate = () => {
        if (shopName === "") {
            setError("Shop Name is empty");
            return false;
        } else if (shopDescription === "") {
            setError("Shop Description is empty");
            return false;
        } else if (shopAddress === "") {
            setError("Shop Address is empty");
            return false;
        } else if (shopImages.length === 0) {
            setError("Please upload at least one shop image");
            return false;
        } else if (!shopOpening) {
            setError("Please select the opening time");
            return false;
        } else if (!shopClosing) {
            setError("Please select the closing time");
            return false;
        }

        return validateProducts();
    };
    const resetForm = () => {
        setShopName("");
        setShopDescription("");
        setShopImages([]);
        setShopOpening(null);
        setShopAddress("");
        setShopClosing(null);
        setError("");
        setProducts([{
            imageUri: '',
            name: '',
            description: '',
            price: '',
            inStock: true,
        }]);
    };
    const handleCheckRequest = async () => {

        if (validate()) {
            const docsRef = collection(FIRESTORE_DB, "SwarozgarRequests");
            const docRef = doc(docsRef, userId);
            try {
                await setDoc(docRef, {
                    infraId: infraId,
                    remarks: "",
                    status: "pending",
                    shopName: shopName,
                    shopDescription: shopDescription,
                    shopAddress: shopAddress,
                    openingTime: shopOpening,
                    closingTime: shopClosing,
                    products: products,
                    shopImages: shopImages,
                    phoneNumer: userId,

                });
                Alert.alert("Shop request sent successfully");
                resetForm();



            } catch (e) {
                console.log(e.message);
                //   setError(e.message);
            }

        }

    };

    const handleUpdateRequest = async () => {

        if (validate()) {
            const docsRef = collection(FIRESTORE_DB, "Shops");
            const docRef = doc(docsRef, userId);
            try {
                await setDoc(docRef, {
                    infraId: infraId,
                    shopName: shopName,
                    shopDescription: shopDescription,
                    shopAddress: shopAddress,
                    openingTime: shopOpening,
                    closingTime: shopClosing,
                    products: products,
                    shopImages: shopImages,
                    phoneNumer: userId,


                });
                Alert.alert("Updated successfully");
                setEdit(false);
                // resetForm();



            } catch (e) {
                console.log(e.message);
                //   setError(e.message);
            }

        }

    };

    const handleDeleteRequest = async () => {
        try {
            const storage = getStorage();
            const productRef = ref(storage, `${userId}/ProductImages`);
            const shopRef = ref(storage, `${userId}/ShopImages`);

            // List all files in the folder
            const result1 = await listAll(productRef);
            const result2 = await listAll(shopRef);

            // Iterate over each file and delete it
            const deletePromises = result1.items.map((fileRef) => deleteObject(fileRef));
            const deletePromises2 = result2.items.map((fileRef) => deleteObject(fileRef));

            // Wait for all deletions to complete
            await Promise.all(deletePromises);
            await Promise.all(deletePromises2);

            // Alert.alert("Folder Deleted Successfully");
              await deleteDoc(doc(collection(FIRESTORE_DB, "Shops"), userId));

              await deleteDoc(doc(FIRESTORE_DB, "SwarojgarChatRoom", userId + infraId));
            Alert.alert("Shop Deleted");
            navigation.navigate("home");
        } catch (e) {
            console.log(e.message);
        }
    };


    const pickProductImage = async (index) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            const imageUri = result.assets[0].uri;
            const uploadResp = await uplodToFirebase(imageUri, result.assets[0].fileName, "ProductImages");
            console.log(uploadResp.downloadUrl);
            const updatedProducts = [...products];
            updatedProducts[index]['imageUri'] = uploadResp.downloadUrl;
            setProducts(updatedProducts);
        }
    };

    const deleteProduct = (index) => {
        if (products.length === 1) {
            setProducts([]);
        } else {
            const updatedProducts = [...products];
            updatedProducts.splice(index, 1);
            setProducts(updatedProducts);
        }
    };




    return (
        <ScrollView>
            <SafeAreaView style={localStyles.container}>
                {requestStatus && <View style={{ backgroundColor: COLOURS.tertiary, padding: "5%", borderRadius: 15, }}>
                    {requestStatus === "pending" ? (
                        <Text style={{ color: COLOURS.white }}>The Shop Request is Pending</Text>
                    ) : (
                        <>
                            <Text style={{ color: COLOURS.white }}>The shop request is rejected.</Text>
                            {requestRemarks && <Text style={{ color: COLOURS.white }}> Remarks From the Admin : {requestRemarks}</Text>}
                        </>

                    )}
                </View>}
                {!edit && <View style={{ width: "80%", margin: 10, padding: 10 }}>
                    <Text style={{ fontSize: 30 }}>Create a Shop</Text>
                </View>}
                <View style={{ width: "80%" }}>
                    <TextInput
                        style={localStyles.name}
                        placeholder='Shop name'
                        value={shopName}
                        onChangeText={(text) => setShopName(text)}
                    />
                </View>
                <View style={{ width: "80%" }}>
                    <Text style={{
                        paddingLeft: 0,
                        margin: 10,
                        color: COLOURS.gray,
                        fontSize: 20,
                    }}>Description</Text>
                    <TextInput
                        style={[localStyles.description, { textAlignVertical: 'top', textAlign: 'left', maxHeight: 250 }]}
                        value={shopDescription}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={(text) => setShopDescription(text)}
                    />
                </View>
                <View style={{ width: "80%" }}>
                    <Text style={{
                        paddingLeft: 0,
                        margin: 10,
                        color: COLOURS.gray,
                        fontSize: 20,
                    }}>Address</Text>
                    <TextInput
                        style={[localStyles.description, { textAlignVertical: 'top', textAlign: 'left', maxHeight: 250 }]}
                        value={shopAddress}
                        multiline={true}
                        numberOfLines={2}
                        onChangeText={(text) => setShopAddress(text)}
                    />
                </View>
                <View style={{
                    backgroundColor: '#f0f0f0',
                    borderRadius: 10,
                    padding: 20,
                    marginVertical: 10,
                }}>
                    <View style={localStyles.imageContainer}>
                        {shopImages.map((imageUri, index) => (
                            <TouchableOpacity
                                key={index}
                                style={localStyles.imageWrapper}
                                onPress={() => removeImage(index)}
                            >
                                <Image source={{ uri: imageUri }} style={localStyles.image} />
                                <Text style={localStyles.removeText}>Remove</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={localStyles.addButton} onPress={pickImages}>
                        <Text style={{ color: COLOURS.white, fontSize: 18, marginLeft: 20, marginRight: 20 }}>Upload Shop Images</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ display: "flex", flexDirection: "row" }}>
                    <TimeSlotSelector
                        // index={index}
                        timeType='Opening'
                        // handleTimeSlots={handleTimeSlots}
                        initialValue={shopOpening}
                        setTime={setShopOpening}
                    />
                    <TimeSlotSelector
                        // index={index}
                        timeType='Closing'
                        // handleTimeSlots={handleTimeSlots}
                        initialValue={shopClosing}
                        setTime={setShopClosing}
                    />
                </View>
                <View style={{ width: "80%" }}>
                    <Text style={[localStyles.name, { fontSize: 25, marginTop: 25 }]}>
                        Add Products
                    </Text>
                    {products.map((product, index) => (
                        <View key={index} style={localStyles.productContainer}>
                            <TouchableOpacity style={localStyles.productImageWrapper} onPress={() => pickProductImage(index)}>
                                {product.imageUri ? (
                                    <Image source={{ uri: product.imageUri }} style={localStyles.productImage} />
                                ) : (
                                    <Text style={localStyles.productImagePlaceholder}>Add Image</Text>
                                )}
                            </TouchableOpacity>

                            <TextInput
                                style={localStyles.input}
                                placeholder="Product Name"
                                value={product.name}
                                onChangeText={(text) => updateProductDetails(index, 'name', text)}
                            />
                            <TextInput
                                style={[localStyles.input, { textAlignVertical: 'top', textAlign: 'left', maxHeight: 200 }]}
                                placeholder="Product Description"
                                multiline
                                numberOfLines={4}
                                value={product.description}
                                onChangeText={(text) => updateProductDetails(index, 'description', text)}
                            />
                            <TextInput
                                style={localStyles.input}
                                placeholder="Product Price"
                                keyboardType="numeric"
                                value={product.price}
                                onChangeText={(text) => updateProductDetails(index, 'price', text)}
                            />
                            <View style={localStyles.stockPicker}>
                                <Text style={localStyles.stockText}>In Stock:</Text>
                                <TouchableOpacity
                                    style={[localStyles.stockButton, { backgroundColor: product.inStock ? COLOURS.primary : 'gray' }]}
                                    onPress={() => updateProductDetails(index, 'inStock', true)}
                                >
                                    <Text style={localStyles.stockButtonText}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[localStyles.stockButton, { backgroundColor: !product.inStock ? COLOURS.primary : 'gray' }]}
                                    onPress={() => updateProductDetails(index, 'inStock', false)}
                                >
                                    <Text style={localStyles.stockButtonText}>No</Text>
                                </TouchableOpacity>
                            </View>

                            {products.length > 1 && (
                                <TouchableOpacity style={[localStyles.addButton, { backgroundColor: 'red' }]} onPress={() => deleteProduct(index)}>
                                    <Text style={{ color: COLOURS.white, fontSize: 18, marginLeft: 20, marginRight: 20 }}>Delete Product</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity style={localStyles.addButton} onPress={addProduct}>
                        <Text style={{ color: COLOURS.white, fontSize: 18, marginLeft: 20, marginRight: 20 }}>Add more Products</Text>
                    </TouchableOpacity>
                </View>
                {!edit && <View style={{ marginBottom: 80 }}>
                    <TouchableOpacity
                        disabled={requestStatus === "pending"}
                        style={(requestStatus === "pending") ? localStyles.disabledButton : localStyles.registerButton}
                        onPress={handleCheckRequest}
                    >
                        <Text
                            style={{ color: COLOURS.white, fontSize: 25, marginLeft: 20, marginRight: 20 }}
                        >
                            Register your shop
                        </Text>

                    </TouchableOpacity>
                    {error && (
                        <Text style={styles.error_text(SIZES.xLarge)}>{error}</Text>
                    )}
                </View>}
                {edit && <View style={{ marginBottom: 80 }}>
                    <TouchableOpacity
                        style={localStyles.registerButton}
                        onPress={handleUpdateRequest}
                    >
                        <Text
                            style={{ color: COLOURS.white, fontSize: 25, marginLeft: 20, marginRight: 20 }}
                        >
                            Save Changes
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.registerButton}
                        onPress={() => setEdit(false)}
                    >
                        <Text
                            style={{ color: COLOURS.white, fontSize: 25, marginLeft: 20, marginRight: 20 }}
                        >
                            Cancel Changes
                        </Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[localStyles.registerButton, { backgroundColor: "red" }]}
                        onPress={handleDeleteRequest}
                    >
                        <Text
                            style={{ color: COLOURS.white, fontSize: 25, marginLeft: 20, marginRight: 20 }}
                        >
                            Delete Shop
                        </Text>

                    </TouchableOpacity>
                    {error && (
                        <Text style={styles.error_text(SIZES.xLarge)}>{error}</Text>
                    )}
                </View>}
            </SafeAreaView>
        </ScrollView>
    );
}



const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    name: {
        borderBottomWidth: 1,
        borderColor: COLOURS.primary,
        borderRadius: 10,
        marginVertical: 10,
        padding: 10,
        fontSize: 20,
    },
    description: {
        borderWidth: 1,
        borderColor: COLOURS.primary,
        borderRadius: 10,
        marginVertical: 10,
        padding: 10,
        fontSize: 20,
    },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginVertical: 10,
    },
    imageWrapper: {
        position: "relative",
        margin: 5,
    },
    image: {
        width: 132,
        height: 100,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "black",
    },
    removeText: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 5,
        borderRadius: 5,
        color: COLOURS.white,
    },
    addButton: {
        backgroundColor: COLOURS.primary,
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: "center",
    },
    registerButton: {
        backgroundColor: COLOURS.secondary,
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignSelf: "center",

    },
    disabledButton: {
        backgroundColor: COLOURS.gray2,
        padding: 10,
        borderRadius: 10,
        marginTop: 50,
        alignSelf: "center",
        // cursor:""

    },
    productImage: {
        width: 150,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "black",
    },
    imagePlaceholder: {
        width: 150,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 10,
    },

    productContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 20,
        marginVertical: 10,
    },
    productImageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLOURS.black,
        borderRadius: 10,
        height: 150,
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    productImagePlaceholder: {
        fontSize: 18,
        color: COLOURS.gray,
    },
    input: {
        borderWidth: 1,
        borderColor: COLOURS.primary,
        borderRadius: 10,
        marginVertical: 10,
        padding: 10,
        fontSize: 18,
    },
    stockPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 10,
    },
    stockText: {
        fontSize: 18,
        marginRight: 10,
    },
    stockButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLOURS.primary,
        marginHorizontal: 5,
    },
    stockButtonText: {
        fontSize: 16,
        color: COLOURS.white,
    },
});

export default SwarojgarCreateShop;
