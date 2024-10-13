import {
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SIZES, COLOURS, styles } from "../../styles";
import AppContext from "../../../AppContext";
import { useContext, useState } from "react";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Services } from "../../styles/constants";

const EventSuggest = ({ type }) => {
  const { infraId, volunteerId } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState(""); // Track which date is being selected ('start' or 'end')

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  const serviceOptions = Services[type] || [];

  const handleAddSuggestion = async () => {
    if (title.length === 0 || areaOfInterest.length === 0) {
      setError("Please fill in all the details.");
      return;
    }

    const eventsCollectionRef = collection(FIRESTORE_DB, "EventSuggestions");
    const eventDocRef = doc(eventsCollectionRef);
    try {
      await setDoc(eventDocRef, {
        title: title,
        areaOfInterest: areaOfInterest,
        startDate: Timestamp.fromDate(startDate), // Convert to Firestore Timestamp
        endDate: Timestamp.fromDate(endDate), // Convert to Firestore Timestamp
        infraId: infraId,
        volunteerId: volunteerId,
        type: type,
      });

      setTitle("");
      setAreaOfInterest("");
      setStartDate(null);
      setEndDate(null);
      setError("");
      Alert.alert("Success", "Event suggestion submitted successfully!");
    } catch (e) {
      setError(e.message || "An error occurred while saving the event.");
    }
  };

  // Handlers for Date Pickers
  const showDatePicker = (type) => {
    setDateType(type); // Set the type ('start' or 'end')
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date) => {
    if (dateType === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    hideDatePicker();
  };

  return (
    <ScrollView>
      <SafeAreaView
        style={[styles.container, { maxWidth: "100%", alignSelf: "center" }]}
      >
        <Text style={styles.header(SIZES.xLarge)}>Event Suggestion Form</Text>

        <TextInput
          style={[styles.fillBlank(SIZES.large), { margin: SIZES.xLarge }]}
          placeholder="Event Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />

        <View
          style={{
            borderWidth: 2,
            borderColor: COLOURS.primary,
            borderRadius: 50,
            height: "13%", // Fixed height for the container
            width: "80%",
            alignSelf: "center", // Center the container
            justifyContent: "center",
          }}
        >
          <RNPickerSelect
            onValueChange={(value) => setAreaOfInterest(value)}
            items={serviceOptions.map((service) => ({
              label: service,
              value: service,
            }))}
            style={{
              inputIOS: stylesPicker.pickerIOS,
              inputAndroid: stylesPicker.pickerAndroid,
            }}
            placeholder={{ label: "Select Area of Interest", value: null }}
            value={areaOfInterest}
          />
        </View>

        {/* Date Picker for Start Date */}
        <View style={[styles.rowContainer, { padding: 10 }]}>
          <Text style={styles.text("left", SIZES.large, COLOURS.black)}>
            Start Date
          </Text>
          <TouchableOpacity
            onPress={() => showDatePicker("start")}
            style={[styles.dateTextboxes, { flex: 1, maxWidth: "50%" }]}
          >
            <Text style={styles.text("left", SIZES.medium, COLOURS.black)}>
              {startDate ? startDate.toLocaleDateString("en-GB", options) : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker for End Date */}
        <View style={[styles.rowContainer, { padding: 10 }]}>
          <Text style={styles.text("left", SIZES.large, COLOURS.black)}>
            End Date
          </Text>
          <TouchableOpacity
            onPress={() => showDatePicker("end")}
            style={[styles.dateTextboxes, { flex: 1, maxWidth: "50%" }]}
          >
            <Text style={styles.text("left", SIZES.medium, COLOURS.black)}>
              {endDate ? endDate.toLocaleDateString("en-GB", options) : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unified DateTime Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          date={dateType === "start" ? startDate || new Date() : endDate || new Date()}
        />

        {error && <Text style={styles.error_text(SIZES.medium)}>{error}</Text>}

        <TouchableOpacity
          style={styles.button(COLOURS.primary, "80%")}
          onPress={handleAddSuggestion}
        >
          <Text style={styles.text("center", SIZES.large, COLOURS.white)}>
            Submit Suggestion
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
};

export default EventSuggest;

const stylesPicker = {
  pickerIOS: {
    height: "10%",
    flex: 1,
    alignSelf: "center",
    width: "80%",
    fontSize: "20%",
    color: COLOURS.black,
  },
  pickerAndroid: {
    height: "10%",
    flex: 1,
    alignSelf: "center",
    width: "80%",
    fontSize: "20%",
    color: COLOURS.black,
  },
};
