import React, { useEffect, useState, useContext } from "react";
import { Text, SafeAreaView, FlatList, View } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import AppContext from "../../../AppContext";
import { Services } from "../../styles/constants";
import RNPickerSelect from "react-native-picker-select";
import { COLOURS, styles } from "../../styles"; // Assuming your style file

const EventsList = ({ route }) => {
  const { type, time } = route.params;
  const { infraId, volunteerId } = useContext(AppContext);
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(Services[type]?.[0] || ""); // Default to the first service
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

          // Now apply filtering based on both time and selected area of interest
          const filteredEvents = filterEvents(events, time, selectedArea);
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
  }, [type, time, selectedArea]); // Re-run effect when 'type', 'time', or 'selectedArea' changes

  // Helper function to filter events based on current date and area of interest
  const filterEvents = (events, time, selectedArea) => {
    const currentDate = new Date();
    // Filter by area of interest
    let filteredEvents = events.filter(event => event.areaOfInterest === selectedArea);

    switch (time) {
      case "Past":
        return filteredEvents
          .filter(event => new Date(event.endDate.seconds * 1000) < currentDate && event.infraId === infraId)
          .sort((a, b) => b.endDate.seconds - a.endDate.seconds);

      case "Current":
        return filteredEvents
          .filter(event => 
            new Date(event.startDate.seconds * 1000) <= currentDate && 
            new Date(event.endDate.seconds * 1000) >= currentDate && 
            event.infraId === infraId
          )
          .sort((a, b) => a.endDate.seconds - b.endDate.seconds);

      case "Future":
        return filteredEvents
          .filter(event => new Date(event.startDate.seconds * 1000) > currentDate && event.infraId === infraId)
          .sort((a, b) => a.startDate.seconds - b.startDate.seconds);

      case "Accepted":
        return filteredEvents
          .filter(event => 
            volunteerId in event.volunteersRegistered && 
            new Date(event.endDate.seconds * 1000) >= currentDate && 
            event.infraId === infraId
          )
          .sort((a, b) => a.registrationDeadline.seconds - b.registrationDeadline.seconds);

      case "Rejected":
        return filteredEvents
          .filter(event => 
            volunteerId in event.volunteersRejected && 
            new Date(event.endDate.seconds * 1000) >= currentDate && 
            event.infraId === infraId
          )
          .sort((a, b) => a.registrationDeadline.seconds - b.registrationDeadline.seconds);

      case "Pending":
        return filteredEvents
          .filter(event => 
            volunteerId in event.volunteersApplications && 
            new Date(event.endDate.seconds * 1000) >= currentDate && 
            event.infraId === infraId
          )
          .sort((a, b) => a.registrationDeadline.seconds - b.registrationDeadline.seconds);

      default:
        return filteredEvents;
    }
  };

  const handlePress = (event) => {
    navigation.navigate("event-page", { eventRef: event.ref, type: type, useCase: "display" });
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
              height: "30%", // Fixed height for the dropdown
              width: "80%", // Width of the container
              alignSelf: "center", // Center the container
              justifyContent: "center", // Center content vertically
              marginBottom: 20, // Add some space below the dropdown
              overflow: "hidden" // To prevent any overflow if needed
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


          {/* Event List */}
          <FlatList
            data={eventsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard item={item} handlePress={handlePress} />}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default EventsList;
