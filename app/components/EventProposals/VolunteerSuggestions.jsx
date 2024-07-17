import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useContext } from "react";
import { Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import EventCard from "./../ApprovedEvents/EventCard";
import AppContext from "../../../AppContext";

const VolunteerSuggestions = ({route}) => {
    const { type } = route.params;
    const [eventSuggestions, setEventSuggestions] = useState([]);
    const [error, setError] = useState("");
    const navigation = useNavigation();
    const { infraId } = useContext(AppContext)
    useEffect(() => {
    const fetchEventSuggestions = async () => {
      try {
        const eventSuggestionsRef = collection(
          FIRESTORE_DB, "EventSuggestions"
        );

        // Subscribe to real-time updates using onSnapshot
        const unsubscribe = onSnapshot(eventSuggestionsRef, (snapshot) => {
          const eventSuggestions = snapshot.docs.map((doc) => ({
            ref:doc.ref,
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

    // Helper function to filter event suggestions based on current type
    const filterEventSuggestions = (eventSuggestions, type) => {
        const filteredEventSuggestions = eventSuggestions
        .filter((eventSuggestion) => {
            return eventSuggestion.type === type && eventSuggestion.registrationDeadline.toDate() > new Date() && eventSuggestion.infraId === infraId;
        })
        .sort((a, b) => a.registrationDeadline.toDate() - b.registrationDeadline.toDate());
        return filteredEventSuggestions;
    };

    const handlePress = (event) =>{
        navigation.navigate('event-page', {eventRef:event.ref, type:type ,useCase:"suggestion"})
    }

    return (
       <SafeAreaView>
      {error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={eventSuggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard item={item} handlePress={handlePress} /> }
        />
      )}
    </SafeAreaView>
    )
}

export default VolunteerSuggestions;
