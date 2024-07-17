import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, Text,View, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles, SIZES, COLOURS } from "../styles";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { doc, collection, getDoc } from "firebase/firestore";
import AppContext from "./../../AppContext";

const Login = () => {
  const { setAdminId, setVolunteerId, setSeekerId, mode, setInfraId, location} = useContext(AppContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedPassword = await AsyncStorage.getItem("password");
        const storedMode = await AsyncStorage.getItem("mode");

        if (
          storedPhoneNumber &&
          storedPassword &&
          storedMode &&
          storedMode === mode // Check if stored mode matches current mode
        ) {
          setPhoneNumber(storedPhoneNumber);
          setPassword(storedPassword);
          loginAuthentication(storedPhoneNumber, storedPassword);
        }
      } catch (error) {
        console.error("Auto-login error:", error);
      }
    };

    autoLogin();
  }, []); // Run only on component mount

  const loginAuthentication = async (phone, pass) => {
    const docsRef = collection(FIRESTORE_DB, mode);
    const docRef = doc(docsRef, phone);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        if (pass === docSnap.data().password) {
          switch (mode) {
            case "Admin":
              setAdminId(phone);
              setInfraId(phone);
              break;
            case "Volunteer":
              setVolunteerId(phone);
              break;
            case "Seeker":
              setSeekerId(phone);
              break;
            default:
              setError("Invalid user mode.");
              return;
          }
          navigation.replace("home");
        } else {
          setError("Entered Password is Incorrect");
          Alert.alert("Password Error","Entered Password is Incorrect");
        }
      } else {
        setError("No such phone number is registered");
        Alert.alert("Phone Number Error","No such phone number is registered");
       
      }
    } catch (e) {
      setError(e.message || "An error occurred");
    }
  };

  const handleLogin = async () => {
    if (phoneNumber.length === 0 || password.length === 0) {
      setError("Incomplete Details!");
      Alert.alert("Login Error","Incomplete Details!");
      setPhoneNumber("");
      setPassword("");
      return;
    }

    try {
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
      await AsyncStorage.setItem("password", password);
      await AsyncStorage.setItem("mode", mode);
      loginAuthentication(phoneNumber, password);
    } catch (error) {
      console.error("Error saving credentials:", error);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header(SIZES.xLarge)}>Login into your account</Text>
        <Text style={styles.text("left",SIZES.large, COLOURS.primary)}>Phone number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          style={styles.textboxes}
          keyboardType="number-pad"
        />

        <Text style={styles.text("left",SIZES.large, COLOURS.primary)}>Password</Text>
        
           <TextInput
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
          underlineColorAndroid="transparent" // Still didnt work - Add this line to remove the yellow color
          style={styles.textboxes}
        />
        <TouchableOpacity
          style={styles.button(COLOURS.primary, "80%")}
          onPress={handleLogin}
        >
          <Text style={styles.text("center", SIZES.large,COLOURS.lightWhite)}>
            Login as {mode}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button("", "80%")}
          onPress={() => navigation.navigate("signup")}
        >
          <Text style={styles.text("center", SIZES.large, COLOURS.black)}>
            Create a new account
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Login;