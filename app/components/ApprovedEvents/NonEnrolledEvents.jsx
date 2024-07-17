import React, { useEffect, useContext, useState } from "react";
import { Text, SafeAreaView, FlatList } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import AppContext from "../../../AppContext";

const NonEnrolledEvents = ({ type }) => {
  const { mode, seekerId, volunteerId, infraId } = useContext(AppContext);
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(
          FIRESTORE_DB,
          type === "Seva"
            ? "SevaEvents"
            : type === "Shiksha"
            ? "ShikshaEvents"
            : "SanskarEvents"
        );

        // Subscribe to real-time updates using onSnapshot
        const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
          const events = snapshot.docs.map((doc) => ({
            type: type,
            ref:doc.ref,
            id: doc.id,
            ...doc.data(),
          }));
          const filteredEvents = filterEvents(events, mode);
          setEventsList(filteredEvents);
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

    fetchEvents();
  }, [type, mode]); // Re-run effect when 'type' prop changes

  // Helper function to filter events for non-enrolled users based on current date
const filterEvents = (events, mode) => {
  const currentDate = new Date();
  switch (mode) {
    case "Seeker":
        const seekerEvents = events
        .filter((event) => event.infraId===infraId)
        .filter((event) => !event.seekersRegistered.includes(seekerId))
        .filter((event) => new Date(event.endDate.seconds * 1000) > currentDate) // Remove past events
        .sort((a, b) => new Date(b.startDate.seconds * 1000) - new Date(a.startDate.seconds * 1000)); // Sort by startDate descending
      return seekerEvents;

    case "Volunteer":
        const volunteerEvents = events
        .filter((event) => {
          
          const keyExists = (volunteerId in event.volunteersApplications) || (volunteerId in event.volunteersRejected) || (volunteerId in event.volunteersRegistered);
          
          console.log();
          if (keyExists) {
            console.log(`Volunteer ID: ${volunteerId} exists.`);
          } else {
            console.log(`Volunteer ID: ${volunteerId} does not exist.`);
          }
          return !keyExists
        }
           
        ) // Check if volunteerId is in volunteersRegistered
         .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
         .filter((event) => event.infraId===infraId)
        .sort((a, b) => new Date(a.endDate.seconds * 1000) - new Date(b.endDate.seconds * 1000)); // Sort by endDate ascending
        console.log("volunteerEvents:"+volunteerEvents);
        return volunteerEvents;

    default:
      return events;
  }
};

  const handlePress = (event) =>{
    navigation.navigate('event-page', {eventRef:event.ref, type:type ,useCase:"display"})
  }

  return (
    <SafeAreaView>
      {error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={eventsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard item={item} handlePress={handlePress} /> }
        />
      )}
    </SafeAreaView>
  );
};

export default NonEnrolledEvents;
