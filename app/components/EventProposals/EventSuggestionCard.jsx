import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { COLOURS, SIZES, styles } from "../../styles/index";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
const EventSuggestionCard = ({ item }) => {
  const [volunteerName, setVolunteerName] = useState("Loading..."); // Default state
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const navigation = useNavigation();
  // Fetch volunteer name when the component mounts
  useEffect(() => {
    const fetchVolunteerName = async () => {
      try {
        if (item.volunteerId) {
          const volunteerDocRef = doc(FIRESTORE_DB, "Volunteer", item.volunteerId); // Access Volunteer collection
          const volunteerDoc = await getDoc(volunteerDocRef);

          if (volunteerDoc.exists()) {
            setVolunteerName(volunteerDoc.data().name); // Set the volunteer's name
          } else {
            setVolunteerName("Unknown Volunteer"); // Fallback if volunteer not found
          }
        }
      } catch (error) {
        console.error("Error fetching volunteer name:", error);
        setVolunteerName("Error fetching name");
      }
    };

    fetchVolunteerName();
  }, [item.volunteerId]); // Re-run if volunteerId changes

  // Reject function to delete the event suggestion
  const handleReject = async () => {
    try {
      // Show confirmation alert before deleting
      Alert.alert(
        "Reject Event",
        "Are you sure you want to reject and delete this event suggestion?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // Delete the document using the eventRef
              await deleteDoc(item.ref);
              Alert.alert("Event Rejected", "Event suggestion has been deleted.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting event suggestion:", error);
      Alert.alert("Error", "There was an error rejecting the event suggestion.");
    }
  };

  // Approve function to handle the approval logic and then delete the event suggestion
  const handleApprove = async () => {
    navigation.navigate('event-page', {
      eventRef: item.ref,
      type: item.type, 
      useCase: "suggestion",
      onApprove: async () => {
        try {
          // Delete the document only after approval
          await deleteDoc(item.ref);
         
        } catch (error) {
          console.error("Error approving and deleting event suggestion:", error);
          Alert.alert("Error", "There was an error deleting the event suggestion.");
        }
      },
    });
  };

  return (
    <View
      style={[
        styles.event_card,
        {
          borderColor:
            item.type === "Seva"
              ? "orange"
              : item.type === "Shiksha"
              ? "green"
              : item.type === "Sanskar"
              ? "violet"
              : item.type === "Swarogjar"
              ? "blue"
              : "defaultColor", // fallback color
          borderWidth: 3, // you can adjust the border width as needed
        },
      ]}
    >
      <View
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          paddingVertical: SIZES.small,
          paddingEnd: SIZES.small,
        }}
      >
        <Text style={{ fontSize: SIZES.medium, fontWeight: 600 }}>
          {item.startDate
            ? item.startDate.toDate().toLocaleDateString("en-GB", options) +
              " - " +
              item.endDate.toDate().toLocaleDateString("en-GB", options)
            : "Null"}
        </Text>
      </View>

      <View style={{ paddingStart: SIZES.small }}>
        <Text style={{ fontSize: SIZES.large, fontWeight: 600 }}>{item.title}</Text>
        <View style={{ alignSelf: "left" }}>
          <Text style={styles.error_text(SIZES.medium)}>{item.areaOfInterest}</Text>
          <Text
            style={[styles.text_component(SIZES.medium), { fontWeight: "bold" }]} // Bolden the volunteer name
          >
            Suggested by {volunteerName} {/* Display volunteer name */}
          </Text>
        </View>
      </View>
      <View style={[styles.rowContainer]}>
        <TouchableOpacity
          style={styles.button(COLOURS.green, "40%")}
          onPress={handleApprove} // Approval now triggers handlePress and deletion
        >
          <Text style={styles.text("center", SIZES.large, COLOURS.white)}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button(COLOURS.red, "40%")}
          onPress={handleReject}  
        >
          <Text style={styles.text("center", SIZES.large, COLOURS.white)}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventSuggestionCard;
