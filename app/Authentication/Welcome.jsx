import React, { useContext, useEffect } from "react";
import { SafeAreaView, Text, Image, FlatList, View, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Roles } from "../styles/constants";
import { styles, SIZES } from "../styles";
import AppContext from "../../AppContext";
import * as Location from "expo-location";
import { collection, onSnapshot } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";

//Create a function for ShopExists - Tony ///////////////

const welcomeToShashwatDevalay = '\u0936\u093E\u0936\u094D\u0935\u0924 \u0926\u0947\u0935\u093E\u0932\u092F \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948';
const selectYourRoleInHindi = '\u0905\u092A\u0928\u0940 \u092D\u0942\u092E\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902';

const Welcome = () => {
    const { mode, setMode, location, setLocation, infraId, setInfraId, setShopExists } = useContext(AppContext);
    const navigation = useNavigation();

    function calculateDistance(loc1Latitude, loc1Longitude, loc2Latitude, loc2Longitude) {
        return Math.sqrt(
            Math.pow(loc1Latitude - loc2Latitude, 2) +
            Math.pow(loc1Longitude - loc2Longitude, 2)
        );
        
    }

    const getInfraId = async () => {
        try {
            const infrastructureDocsRef = collection(FIRESTORE_DB, "Infrastructure");

            // Subscribe to real-time updates using onSnapshot
            const unsubscribe = onSnapshot(infrastructureDocsRef, (snapshot) => {
                const infrastructureDocs = snapshot.docs.map((doc) => ({
                    ref: doc.ref,
                    id: doc.id,
                    ...doc.data(),
                }));
                
                if (location) {
                    const sortedInfrastructureDocs = infrastructureDocs.sort((a, b) => {
                        return calculateDistance(a.latitude,a.longitude,location.coords.latitude, location.coords.longitude)
                         - calculateDistance(b.latitude,b.longitude, location.coords.latitude,location.coords.longitude);
                    });
                    setInfraId(sortedInfrastructureDocs[0].adminId);
                    console.log("Closest infrastructure adminId:", sortedInfrastructureDocs[0].adminId);
                } else {
                    console.error("Location is not defined");
                }
            });

            return () => {
                // Unsubscribe from real-time updates when component unmounts
                unsubscribe();
            };
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const getLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert("Location permission denied");
                return;
            }

            let locationRetrieved = await Location.getCurrentPositionAsync({});
            setLocation(locationRetrieved);
        } catch (error) {
            Alert.alert("Error requesting location permission:", error);
        }
    };

    useEffect(() => {
        getLocation();
    }, [mode]);

    useEffect(() => {
        if (location) {
            getInfraId();
        }
    }, [location]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <Text style={styles.header(SIZES.xLarge)}>
                            {welcomeToShashwatDevalay}
                        </Text>
                        <Text style={styles.header(SIZES.xLarge)}>
                            {selectYourRoleInHindi}
                        </Text>
                    </View>
                }
                data={Roles}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card,{width:'auto'}]}
                        onPress={() => {
                            setMode(item.mode);
                            navigation.navigate("login");
                        }}
                    >
                        <Image
                            source={item.iconURL}
                            resizeMode="contain"
                            style={{ width: 120, height: 81 }}
                        />
                        <Text style={styles.text("center", SIZES.large)}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

export default Welcome;
