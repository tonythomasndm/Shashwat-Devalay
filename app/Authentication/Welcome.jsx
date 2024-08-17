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
                            Welcome to SarvSeva
                        </Text>
                        <Text style={styles.header(SIZES.xLarge)}>
                            Select your role
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
