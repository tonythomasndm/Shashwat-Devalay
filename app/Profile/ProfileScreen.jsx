import React, { useContext, useState, useEffect } from "react";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { collection, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { SIZES, styles, COLOURS } from "../styles";
import AppContext from "./../../AppContext";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const { mode, adminId, infraId, volunteerId, seekerId, location, setInfraId, setVolunteerId, setAdminId, setSeekerId } = useContext(AppContext);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState(""); // State for password
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState();
  const [infrastructureName, setInfrastructureName] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const fetchDetails = async () => {
      let id = "";
      if (mode === "Admin") {
        id = adminId;
      } else if (mode === "Volunteer") {
        id = volunteerId;
      } else if (mode === "Seeker") {
        id = seekerId;
      }

      if (mode && id) {
        try {
          const docRef = doc(collection(FIRESTORE_DB, mode), id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const fetchedData = docSnap.data();
            setData(fetchedData);
          } else {
            setError(`No such ${mode} entry found`);
          }

          if (infraId) {
            const infrastructureDocRef = doc(collection(FIRESTORE_DB, "Infrastructure"), infraId);
            const infrastructureDocSnap = await getDoc(infrastructureDocRef);
            if (infrastructureDocSnap.exists()) {
              const fetchedInfrastructureData = infrastructureDocSnap.data();
              setInfrastructureName(fetchedInfrastructureData.name);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${mode} details:`, error);
          setError(`Error fetching ${mode} details`);
        }
      } else {
        setError(`Mode not set or Id not provided - No details to display`);
      }
    };

    fetchDetails();
  }, [adminId, volunteerId, seekerId, mode, location, infraId]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setCity(data.city || "");
      setPhoneNumber(data.phoneNumber || "");
      setPassword(data.password || ""); // Set password from fetched data
      setEditMode(false);
      setError("");
    }
  }, [data]);

  const updateDetails = async () => {
    let id = "";
    if (mode === "Admin") {
      id = adminId;
    } else if (mode === "Volunteer") {
      id = volunteerId;
    } else if (mode === "Seeker") {
      id = seekerId;
    }

    if (id) {
      try {
        const docsRef = collection(FIRESTORE_DB, mode);
        const docRef = doc(docsRef, id);
        await setDoc(docRef, {
          name,
          phoneNumber,
          city,
          password, // Save password in Firestore
          latitude: location?.coords?.latitude,
          longitude: location?.coords?.longitude,
        });

        setEditMode(false);
        setError("");
      } catch (error) {
        console.error(`Error updating ${mode} details:`, error);
        setError(`Error updating ${mode} details`);
      }
    } else {
      setError(`ID is missing, cannot update ${mode} details`);
    }
  };

  const deleteProfile = async () => {
    let id = "";
    if (mode === "Admin") {
      id = adminId;
    } else if (mode === "Volunteer") {
      id = volunteerId;
    } else if (mode === "Seeker") {
      id = seekerId;
    }

    if (id) {
      try {
        const docRef = doc(FIRESTORE_DB, mode, id);
        await deleteDoc(docRef);

        navigation.navigate("welcome");
      } catch (error) {
        console.error(`Error deleting ${mode} profile:`, error);
        setError(`Error deleting ${mode} profile`);
      }
    } else {
      setError(`ID is missing, cannot delete ${mode} profile`);
    }
  };

  const logOut = async () => {
    try {
      await AsyncStorage.removeItem("phoneNumber");
      await AsyncStorage.removeItem("mode");

      setAdminId("");
      setVolunteerId(null);
      setSeekerId("");
      setInfraId("");

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'welcome' }],
        })
      );
    } catch (error) {
      console.error(`Error logging out:`, error);
      setError(`Error logging out`);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.rowContainer}>
          <Text style={[styles.header(SIZES.large), {fontWeight:'600'}]}>Mode: {mode}</Text>
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.text("left", SIZES.medium, COLOURS.primary)}>Name:</Text>
          {editMode ? (
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={[styles.textboxes, { flex: 1, marginLeft: 10 }]}
            />
          ) : (
            <Text style={[styles.profileBlank, { flex: 1, marginLeft: 10 }]}>{name}</Text>
          )}
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.text("left", SIZES.medium, COLOURS.primary)}>City:</Text>
          {editMode ? (
            <TextInput
              value={city}
              onChangeText={(text) => setCity(text)}
              style={[styles.textboxes, { flex: 1, marginLeft: 10 }]}
            />
          ) : (
            <Text style={[styles.profileBlank, { flex: 1, marginLeft: 10 }]}>{city}</Text>
          )}
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.text("left", SIZES.medium, COLOURS.primary)}>Phone Number:</Text>
          <Text style={[styles.profileBlank, { flex: 1, marginLeft: 10 }]}>{phoneNumber}</Text>
        </View>
        {editMode && (<Text style={styles.error_text(SIZES.medium)}>Phone Number cannot be changed</Text>)}

        <View style={styles.rowContainer}>
          <Text style={styles.text("left", SIZES.medium, COLOURS.primary)}>Password:</Text>
          {editMode ? (
            <TextInput
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true} // To hide the password
              style={[styles.textboxes, { flex: 1, marginLeft: 10 }]}
            />
          ) : (
            <Text style={[styles.profileBlank, { flex: 1, marginLeft: 10 }]}>******</Text> // Hide password when not in edit mode
          )}
        </View>

        <View style={styles.rowContainer}>
          <Text style={styles.text("left", SIZES.medium, COLOURS.primary)}>Infrastructure</Text>
          <Text style={[styles.profileBlank, { flex: 1, marginLeft: 10 }]}>{infrastructureName}</Text>
        </View>

        <View style={styles.rowContainer}>
          {editMode ? (
            <TouchableOpacity
              style={styles.button(COLOURS.primary, "70%")}
              onPress={updateDetails}>
              <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
                Save the Details
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button(COLOURS.primary, "60%")}
              onPress={() => setEditMode(true)}>
              <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
                Edit the Details
              </Text>
            </TouchableOpacity>
          )}

          {editMode && (
            <TouchableOpacity
              style={styles.button(COLOURS.red, "60%")}
              onPress={() => deleteProfile()}>
              <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
                Delete Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
            style={styles.button(COLOURS.red, "60%")}
            onPress={deleteProfile}>
            <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
              Delete Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button(COLOURS.green, "60%")}
            onPress={logOut}>
            <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
              Log Out
            </Text>
          </TouchableOpacity>
          <Text style={styles.error_text(SIZES.medium)}>{error}</Text>
      </SafeAreaView>
    </ScrollView>
  );
};

export default ProfileScreen;
