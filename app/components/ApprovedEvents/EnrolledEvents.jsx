import React, { useEffect, useContext, useState, useMemo } from "react";
import { Text, SafeAreaView, FlatList } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import AppContext from "../../../AppContext";

const EnrolledEvents = ({ type }) => {
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
            ref: doc.ref,
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
  }, [type, mode, infraId, seekerId, volunteerId]); // Include relevant dependencies

  // Helper function to filter events based on current date
  const filterEvents = useMemo(() => (events, mode) => {
    const currentDate = new Date();
    switch (mode) {
      case "Seeker":
        return events
          .filter((event) => event.infraId === infraId)
          .filter((event) => event.seekersRegistered.includes(seekerId))
          .filter((event) => new Date(event.endDate.seconds * 1000) > currentDate) // Remove past events
          .sort((a, b) => new Date(b.startDate.seconds * 1000) - new Date(a.startDate.seconds * 1000)); // Sort by startDate descending

      case "Volunteer":
        return events
          .filter((event) => volunteerId in event.volunteersRegistered)
          .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
          .filter((event) => event.infraId === infraId)
          .sort((a, b) => new Date(a.endDate.seconds * 1000) - new Date(b.endDate.seconds * 1000)); // Sort by endDate ascending

      default:
        return events;
    }
  }, [infraId, seekerId, volunteerId, mode]);

  const handlePress = (event) => {
    navigation.navigate('event-page', { eventRef: event.ref, type: type, useCase: "display" });
  };

  return (
    <SafeAreaView>
      {error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={eventsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard item={item} handlePress={handlePress} />}
        />
      )}
    </SafeAreaView>
  );
};

export default EnrolledEvents;
