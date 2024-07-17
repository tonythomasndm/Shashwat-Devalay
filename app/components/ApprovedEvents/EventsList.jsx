import React, { useEffect, useState, useContext } from "react";
import { Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import AppContext from "../../../AppContext";

const EventsList = ({ route }) => {
  const { type, time } = route.params;
  const { infraId, volunteerId } = useContext(AppContext)
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
          const filteredEvents = filterEvents(events, time);
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
  }, [type, time]); // Re-run effect when 'type' prop changes

  // Helper function to filter events based on current date
  const filterEvents = (events, time) => {
    const currentDate = new Date();
    switch (time) {
      case "Past":
        const pastEvents = events
          .filter((event) => {
            const endDate = event.endDate.toDate();
            return endDate < currentDate && event.infraId=== infraId;
          })
          .sort((a, b) => b.endDate.toDate() - a.endDate.toDate()); // Sort by endDate descending
        return pastEvents;

      case "Current":
        const currentEvents = events
          .filter((event) => {
            const startDate = event.startDate.toDate();
            const endDate = event.endDate.toDate();
            return startDate <= currentDate && endDate >= currentDate && event.infraId=== infraId;
          })
          .sort((a, b) => a.endDate.toDate() - b.endDate.toDate()); // Sort by endDate ascending

        return currentEvents;

      case "Future":
        const futureEvents = events
          .filter((event) => {
            const startDate = event.startDate.toDate();
            return startDate > currentDate && event.infraId=== infraId;
          })
          .sort((a, b) => a.startDate.toDate() - b.startDate.toDate()); // Sort by startDate ascending
        return futureEvents;
      
      case "Accepted" :
        const acceptedEvents = events
        .filter((event) => {
          const keyExists = volunteerId in event.volunteersRegistered;
          if (keyExists) {
            console.log(`Volunteer ID: ${volunteerId} exists.`);
          } else {
            console.log(`Volunteer ID: ${volunteerId} does not exist.`);
          }
          return keyExists
        })
        .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
         .filter((event) => event.infraId===infraId)
        .sort((a, b) => a.registrationDeadline.toDate() - b.registrationDeadline.toDate());
        return acceptedEvents;

        case "Rejected" :
          const rejectedEvents = events
          .filter((event) => {
            const keyExists = volunteerId in event.volunteersRejected;
            if (keyExists) {
              console.log(`Volunteer ID: ${volunteerId} exists.`);
            } else {
              console.log(`Volunteer ID: ${volunteerId} does not exist.`);
            }
            return keyExists
          })
          .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
           .filter((event) => event.infraId===infraId)
          .sort((a, b) => a.registrationDeadline.toDate() - b.registrationDeadline.toDate());
          return rejectedEvents;
        case "Pending" :
            const pendingEvents = events
            .filter((event) => {
              const keyExists = volunteerId in event.volunteersApplications;
              if (keyExists) {
                console.log(`Volunteer ID: ${volunteerId} exists.`);
              } else {
                console.log(`Volunteer ID: ${volunteerId} does not exist.`);
              }
              return keyExists
            })
            .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
             .filter((event) => event.infraId===infraId)
            .sort((a, b) => a.registrationDeadline.toDate() - b.registrationDeadline.toDate());
            return pendingEvents;


      default:
        return events;
    }
  };

  const handlePress = (event) =>{
    navigation.navigate('event-page', {eventRef:event.ref, type:type, useCase:"display"})
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

export default EventsList;
