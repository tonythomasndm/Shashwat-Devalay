import { Text, SafeAreaView, FlatList, StyleSheet } from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import EventCard from "../ApprovedEvents/EventCard";
import { useNavigation } from "@react-navigation/native";
import AppContext from "../../../AppContext";
import { useContext, useState, useEffect } from "react";

const AdminEnrollments = ({ type }) => {
    const { adminId } = useContext(AppContext);
    const [eventsList, setEventsList] = useState([]);
    const [error, setError] = useState("");
  
    const navigation = useNavigation();
  
    const filterEvents = (events) => {
      const currentDate = new Date();
          const currentEvents = events
            .filter((event) => {
              const startDate = event.startDate.toDate();
              const endDate = event.endDate.toDate();
              return !(startDate <= currentDate && endDate <= currentDate);
            })
            .sort((a, b) => a.endDate.toDate() - b.endDate.toDate()); // Sort by endDate ascending
          return currentEvents;
  };
  
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const eventsCollectionRef = collection(FIRESTORE_DB, `${type}Events`);
          const thisInfraEventsRef = query(eventsCollectionRef, where('infraId', '==', adminId));
          const card = onSnapshot(thisInfraEventsRef, (snapshot) => {
            const events = snapshot.docs.map((doc) => ({
              ref: doc.ref,
              id: doc.id,
              ...doc.data(),
            }));
            const filteredEvents=filterEvents(events);
            setEventsList(filteredEvents);
            setError("");
          });
  
          return () => {
            card();
          };
        } catch (error) {
          console.error("Error fetching Event docs details:", error);
          setError("Error fetching Event docs details");
        }
      };
  
      fetchEvents();
    }, []);
  
    const handlePress = (item) => {
      navigation.navigate('acceptvolunteerrequest', { item, type});
    };

    return (
      <SafeAreaView>
        {error ? (
          <Text style={styles.msgText}>{error}</Text>
        ) : 
        eventsList.length <= 0 ? 
        <Text style={styles.msgText}>
          No events currently
        </Text> : (
          <FlatList
          data={eventsList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard item={item} handlePress={handlePress} />
          )}
        />
        )}
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    msgText: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignSelf: 'center',
      fontSize: 30,
      paddingTop: 100,
    },
  });
  
  export default AdminEnrollments;