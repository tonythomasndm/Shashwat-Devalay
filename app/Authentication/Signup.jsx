import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles, SIZES, COLOURS } from "../styles";
import { useContext, useState } from "react";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { doc, collection, setDoc, getDoc } from "firebase/firestore";
import AppContext from "./../../AppContext";

const nameInHindi = '\u0928\u093E\u092E';
const phoneInHindi = '\u092B\u093C\u094B\u0928';
const cityInHindi = '\u0936\u0939\u0930';
const passwordInHindi = '\u092A\u093E\u0938\u0935\u0930\u094D\u0921';

const Signup = () => {
  const { setAdminId, setVolunteerId, setSeekerId, mode, setInfraId, location } = useContext(AppContext);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [infrastructureName, setInfrastructureName] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const validateForm = () => {
    if (phoneNumber.length < 10 || name.length === 0 || city.length === 0 || password.length === 0) {
      setError("Please complete all fields!");
      return false;
    }
    return true;
  };

  const signupDetails = async () => {
    if (!validateForm()) return;

    const docsRef = collection(FIRESTORE_DB, mode);
    const docRef = doc(docsRef, phoneNumber);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setError("An account with this phone number already exists!");
        return;
      }

      await setDoc(docRef, {
        name: name,
        city: city,
        password: password,
        phoneNumber: phoneNumber,
        latitude: location["coords"]["latitude"],
        longitude: location["coords"]["longitude"],
      });

      if (mode === "Admin") {
        const infrastructureDocsRef = collection(FIRESTORE_DB, "Infrastructure");
        const infrastructureDocRef = doc(infrastructureDocsRef, phoneNumber);
        await setDoc(infrastructureDocRef, {
          name: infrastructureName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          adminId: phoneNumber,
        });
        setAdminId(phoneNumber);
        setInfraId(phoneNumber);
      } else if (mode === "Volunteer") {
        setVolunteerId(phoneNumber);
      } else {
        setSeekerId(phoneNumber);
      }

      navigation.replace("home");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header(SIZES.xLarge)}>
          Create your {mode} account
        </Text>

        <ScrollView contentContainerStyle={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: "80%" }}>
          <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>
            {nameInHindi}
          </Text>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.textboxes}
          />
          <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>
            {phoneInHindi}
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            keyboardType="phone-pad"
            style={styles.textboxes}
          />
          <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>
            {cityInHindi}
          </Text>
          <TextInput
            value={city}
            onChangeText={(text) => setCity(text)}
            style={styles.textboxes}
          />
          {mode === "Admin" && (
            <View style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>
                Infrastructure Name
              </Text>
              <TextInput
                value={infrastructureName}
                onChangeText={(text) => setInfrastructureName(text)}
                style={styles.textboxes}
              />
            </View>
          )}
          <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>
            {passwordInHindi}
          </Text>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.textboxes}
            autoComplete="off"
            secureTextEntry={true}
          />
          {error && (
            <Text style={styles.error_text(SIZES.medium)}>{error}</Text>
          )}
          <TouchableOpacity
            style={styles.button(COLOURS.primary, "80%")}
            onPress={signupDetails}
          >
            <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
              Create your account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Signup;
