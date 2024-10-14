import React, { useEffect, useContext, useState, useMemo } from "react";
import { Text, SafeAreaView, FlatList, View } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import { Services } from "../../styles/constants";
import { COLOURS, styles } from "../../styles"; // Assuming your style file
import AppContext from "../../../AppContext";
import RNPickerSelect from 'react-native-picker-select'; // Make sure to import this if it's used

const EnrolledEvents = ({ type }) => {
  const { mode, seekerId, volunteerId, infraId } = useContext(AppContext);
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(Services[type]?.[0] || ""); // Default to the first service
  const navigation = useNavigation();

  const normalizeDate = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return normalizedDate;
  };

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

        const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
          const events = snapshot.docs.map((doc) => ({
            type: type,
            ref: doc.ref,
            id: doc.id,
            ...doc.data(),
          }));

          // Use the memoized filterEvents function
          const filteredEvents = filterEvents(events);
          setEventsList(filteredEvents);
          setError(""); // Clear error state
        });

        return () => {
          unsubscribe(); // Unsubscribe on component unmount
        };
      } catch (error) {
        console.error(`Error fetching ${type} Event docs details:`, error);
        setError(`Error fetching ${type} Event docs details`);
      }
    };

    fetchEvents();
  }, [type, mode, infraId, seekerId, volunteerId, selectedArea]); // Dependencies for fetching events

  // Helper function to filter events based on current date and selected area
  const filterEvents = useMemo(() => {
    return (events) => {
      let filteredEvents = events.filter(event => event.areaOfInterest === selectedArea);
      const currentDate = new Date();

      switch (mode) {
        case "Seeker":
          return filteredEvents
            .filter((event) => event.infraId === infraId)
            .filter((event) => event.seekersRegistered.includes(seekerId))
            .filter((event) => new Date(event.endDate.seconds * 1000) > currentDate) // Remove past events
            .sort((a, b) => new Date(b.startDate.seconds * 1000) - new Date(a.startDate.seconds * 1000)); // Sort by startDate descending

        case "Volunteer":
          return filteredEvents
            .filter((event) => event.volunteersRegistered.includes(volunteerId)) // Changed to includes for array check
            .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
            .filter((event) => event.infraId === infraId)
            .sort((a, b) => new Date(a.endDate.seconds * 1000) - new Date(b.endDate.seconds * 1000)); // Sort by endDate ascending

        default:
          return filteredEvents;
      }
    };
  }, [infraId, seekerId, volunteerId, mode, selectedArea]); // Dependencies for filtering

  const handlePress = (event) => {
    navigation.navigate('event-page', { eventRef: event.ref, type: type, useCase: "display" });
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
                },
                inputAndroid: {
                  color: COLOURS.primary, // Use appropriate color
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                },
              }}
              placeholder={{ label: "Select Area of Interest", value: null }}
              value={selectedArea}
            />
          </View>

          {/* Event List */}
          <FlatList
          style={{width:"100%"}}
            data={eventsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventCard item={item} handlePress={handlePress} />}
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default EnrolledEvents;
