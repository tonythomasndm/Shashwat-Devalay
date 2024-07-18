import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity, ScrollView, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles, SIZES, COLOURS } from "../styles";
import { useContext, useState } from "react";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { doc, collection, setDoc, addDoc, getDoc } from "firebase/firestore";
import AppContext from "./../../AppContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const Signup = () => {
  const { setAdminId, setVolunteerId, setSeekerId, mode, setInfraId, location } = useContext(AppContext);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [infrastructureName, setInfrastructureName] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const options = { day: "numeric", month: "short", year: "numeric" };

  const handleConfirm = (date) => {
    setDateOfBirth(date);
    setDatePickerVisibility(false);
  };

  const navigation = useNavigation();

  const validateFirstStep = () => {
    if (phoneNumber.length < 10 || name.length === 0 || !dateOfBirth || gender.length === 0) {
      setError("Please complete all fields!");
      return false;
    }
    return true;
  };

  const signupDetails = async () => {
    if (address.length === 0 || pincode.length < 6 || password.length === 0) {
      setError("Please complete all fields!");
      return;
    }
  
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
        address: address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        password: password,
        phoneNumber: phoneNumber,
        pincode: pincode,
        gender: gender,
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
  

  const genderOptions = [
    { label: 'Male', value: 'Male', width: "24.5%" },
    { label: 'Female', value: 'Female', width: "30.5%" },
    { label: 'Other', value: 'Other', width: "26%" }
  ];

  const renderGenderOption = ({ item }) => (
    <TouchableOpacity
      style={styles.smallButton(gender === item.value ? COLOURS.primary : COLOURS.white, item.width)}
      onPress={() => setGender(item.value)}>
      <Text style={styles.text("center", SIZES.medium, gender === item.value ? COLOURS.lightWhite : COLOURS.black)}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header(SIZES.xLarge)}>
          Create your {mode} account
        </Text>

        {currentStep === 1 ? (
          <ScrollView contentContainerStyle={{display:"flex",justifyContent:"center", alignItems:"center", minWidth:"80%"}}>
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Name</Text>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              style={styles.textboxes}
            />
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Date of Birth</Text>
            <TouchableOpacity
              onPress={() => setDatePickerVisibility(true)}
              style={styles.textboxes}>
              <Text style={{ color: "black", fontSize: SIZES.medium }}>
                {dateOfBirth ? dateOfBirth.toLocaleDateString("en-GB", options) : ""}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode='date'
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Gender</Text>
            <FlatList
              data={genderOptions}
              renderItem={renderGenderOption}
              keyExtractor={(item) => item.value}
              horizontal={true}
              contentContainerStyle={{ width:"100%", justifyContent: 'space-around', marginVertical: 10 }}
            />
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              keyboardType="phone-pad"
              style={styles.textboxes}
            />
            {error && (
              <Text style={styles.error_text(SIZES.medium)}>{error}</Text>
            )}
            <TouchableOpacity
              style={styles.button(COLOURS.primary, "80%")}
              onPress={() => {
                if (validateFirstStep()) {
                  setCurrentStep(2);
                  setError(""); // Clear error when moving to the next step
                }
              }}>
              <Text style={styles.text("center", SIZES.large, COLOURS.lightWhite)}>
                Next
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{display:"flex",justifyContent:"center", alignItems:"center", minWidth:"80%"}}>
            {mode=="Admin" && <View style={{display:"flex",justifyContent:"center", alignItems:"center", width:"100%"}}><Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Infrastructure Name</Text>
            <TextInput
              value={infrastructureName}
              onChangeText={(text) => setInfrastructureName(text)}
              style={styles.textboxes}
            /></View>}
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Address</Text>
            <TextInput
              value={address}
              onChangeText={(text) => setAddress(text)}
              style={styles.textboxes}
            />
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Pincode</Text>
            <TextInput
              value={pincode}
              onChangeText={(text) => setPincode(text)}
              keyboardType="number-pad"
              style={styles.textboxes}
            />
            <Text style={styles.text("left", SIZES.large, COLOURS.primary)}>Password</Text>
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
              onPress={signupDetails}>
              <Text style={styles.text("center", SIZES.large,COLOURS.lightWhite)}>
                Create your account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button("", "80%")}
              onPress={() => setCurrentStep(1)}>
              <Text style={styles.text("center", SIZES.large,COLOURS.black)}>
                Back
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

export default Signup;
