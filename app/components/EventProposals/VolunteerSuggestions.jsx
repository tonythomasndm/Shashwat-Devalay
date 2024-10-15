import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import { Text, SafeAreaView, FlatList, View } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import EventSuggestionCard from "./EventSuggestionCard";
import AppContext from "../../../AppContext";
import RNPickerSelect from "react-native-picker-select";
import { Services } from "../../styles/constants";
import { COLOURS, SIZES, styles } from "../../styles";


const VolunteerSuggestions = ({ route }) => {
  const { type } = route.params;
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(Services[type]?.[0] || ""); // Default to the first service
  const { infraId } = useContext(AppContext);

  useEffect(() => {
    const fetchEventSuggestions = async () => {
      try {
        const eventSuggestionsRef = collection(FIRESTORE_DB, "EventSuggestions");

        // Subscribe to real-time updates using onSnapshot
        const unsubscribe = onSnapshot(eventSuggestionsRef, (snapshot) => {
          const eventSuggestions = snapshot.docs.map((doc) => ({
            ref: doc.ref,
            id: doc.id,
            ...doc.data(),
          }));
          const filteredEventSuggestions = filterEventSuggestions(eventSuggestions, type);
          setEventSuggestions(filteredEventSuggestions);
          setError(""); // Clear error state
        });

        return () => {
          // Unsubscribe from real-time updates when component unmounts
          unsubscribe();
        };
      } catch (error) {
        console.error(`Error fetching ${type} Event docs details:`, error);
        setError(`Error fetching ${type} Event docs details`);
      }
    };
    fetchEventSuggestions();
  }, [type, selectedArea]); // Re-run effect when 'type' prop changes


  const normalizeDate = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return normalizedDate;
  };

  
  // Helper function to filter event suggestions based on current type
  const filterEventSuggestions = (eventSuggestions, type) => {
    const filteredEventSuggestions = eventSuggestions
      .filter((eventSuggestion) => {
        // Helper function to extract the date part only (strip time component)

        return (
          eventSuggestion.type === type && eventSuggestion.areaOfInterest === selectedArea &&
          normalizeDate(eventSuggestion.startDate.toDate()) >= normalizeDate(new Date()) && // Ensure the event hasn't started
          eventSuggestion.infraId === infraId
        );
      })
      .sort((a, b) => normalizeDate(a.startDate.toDate()) - normalizeDate(b.startDate.toDate())); // Sort by startDate
    return filteredEventSuggestions;
  };
  

  return (
    <SafeAreaView style={[styles.container, { maxWidth: "100%", alignSelf: "center" }]}>
      {error ? (
        <Text>{error}</Text>
      ) : (

        <>
          {/* Dropdown to select Area of Interest */}
          <View
            style={{
              borderWidth: 2,
              borderColor: COLOURS.primary,
              borderRadius: 20,
              height: 50, // Fixed height
              maxHeight: 50, // Maximum height
              width: "80%",
              alignSelf: "center",
              justifyContent: "center",
              marginBottom: 20,
              
            }}
          >
            <RNPickerSelect
              onValueChange={(value) => setSelectedArea(value)}
              items={Services[type].map((service) => ({
                label: service,
                value: service,
              }))}
              style={{
                inputIOS: {
                  color: COLOURS.primary, // Use appropriate color
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  // Add additional styles as necessary
                },
                inputAndroid: {
                  color: COLOURS.primary, // Use appropriate color
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  // Add additional styles as necessary
                },
              }}
              placeholder={{ label: "Select Area of Interest", value: null }}
              value={selectedArea}
            />
          </View>

        <FlatList
          data={eventSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventSuggestionCard item={item} />}
        />
        </>
      )}
    </SafeAreaView>
  );
};

export default VolunteerSuggestions;
