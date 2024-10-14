import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import { Text, SafeAreaView, FlatList } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import EventSuggestionCard from "./EventSuggestionCard";
import AppContext from "../../../AppContext";

const VolunteerSuggestions = ({ route }) => {
  const { type } = route.params;
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [error, setError] = useState("");
  const navigation = useNavigation();
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
  }, [type]); // Re-run effect when 'type' prop changes


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
        
  
        // Check if the event's start date is in the future (compare only date part)
        return (
          eventSuggestion.type === type &&
          normalizeDate(eventSuggestion.startDate.toDate()) >= normalizeDate(new Date()) && // Ensure the event hasn't started
          eventSuggestion.infraId === infraId
        );
      })
      .sort((a, b) => normalizeDate(a.startDate.toDate()) - normalizeDate(b.startDate.toDate())); // Sort by startDate
    return filteredEventSuggestions;
  };
  

  return (
    <SafeAreaView>
      {error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={eventSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventSuggestionCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
};

export default VolunteerSuggestions;
