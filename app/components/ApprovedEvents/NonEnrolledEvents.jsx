import React, { useEffect, useContext, useState, useMemo } from "react";
import { Text, SafeAreaView, FlatList, View } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import EventCard from "./EventCard";
import AppContext from "../../../AppContext";
import { Services } from "../../styles/constants";
import RNPickerSelect from "react-native-picker-select";
import { COLOURS, styles } from "../../styles"; 

const NonEnrolledEvents = ({ type }) => {
  const { mode, seekerId, volunteerId, infraId } = useContext(AppContext);
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState("");
  const [selectedArea, setSelectedArea] = useState(Services[type]?.[0] || ""); // Default to the first service

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = () => {
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
          const filteredEvents = filterEvents(events, mode);
          setEventsList(filteredEvents);
          setError(""); // Clear error state
        });

        return unsubscribe; // Return the unsubscribe function

      } catch (error) {
        console.error(`Error fetching ${type} Event docs details:`, error);
        setError(`Error fetching ${type} Event docs details`);
      }
    };

    const unsubscribe = fetchEvents(); // Assign unsubscribe function

    return () => {
      // Unsubscribe from real-time updates when the component unmounts
      if (unsubscribe) unsubscribe();
    };
  }, [type, mode, infraId, seekerId, volunteerId, selectedArea]); // Added selectedArea to dependencies

  const filterEvents = (events, mode) => {
    const currentDate = new Date();
    const filteredByArea = events.filter(event => event.areaOfInterest === selectedArea);

    switch (mode) {
      case "Seeker":
        return filteredByArea
          .filter((event) => event.infraId === infraId)
          .filter((event) => !event.seekersRegistered.includes(seekerId))
          .filter((event) => new Date(event.endDate.seconds * 1000) > currentDate) // Remove past events
          .sort((a, b) => new Date(b.startDate.seconds * 1000) - new Date(a.startDate.seconds * 1000)); // Sort by startDate descending

      case "Volunteer":
        return filteredByArea
          .filter((event) => {
            const keyExists = 
              volunteerId in event.volunteersApplications || 
              volunteerId in event.volunteersRejected || 
              volunteerId in event.volunteersRegistered;
            return !keyExists;
          })
          .filter((event) => new Date(event.endDate.seconds * 1000) >= currentDate) // Remove past events
          .filter((event) => event.infraId === infraId)
          .sort((a, b) => new Date(a.endDate.seconds * 1000) - new Date(b.endDate.seconds * 1000)); // Sort by endDate ascending

      default:
        return filteredByArea;
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

export default NonEnrolledEvents;
