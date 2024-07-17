//Code Check - Anshika and Daksh

import React, { useState, useEffect } from 'react';
import { VolunteerRequestCard, VolunteerRegisteredCard, VolunteerRejectedCard}  from './volunteerRequestCard';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';

const VolunteerRequests = ({ type, id }) => {
  const [volunteerRequestsData, setVolunteerRequestsData] = useState([]);
  const [volunteerRegisteredData, setVolunteerRegisteredData] = useState([]);
  const [volunteerRejectedData, setVolunteerRejectedData] = useState([]);

  useEffect(() => {
    // Reference to the specific SevaEvent document
    const eventDocRef = doc(FIRESTORE_DB, `${type}Events`, id);
    const listenVolunteerRequests = onSnapshot(eventDocRef, async (eventDoc) => {
      let volunteerApplications = eventDoc.data().volunteersApplications;
      let volunteerRegistrations = eventDoc.data().volunteersRegistered;
      let volunteerRejections = eventDoc.data().volunteersRejected;
      volunteerApplications = Object.entries(volunteerApplications);
      volunteerRegistrations = Object.entries(volunteerRegistrations);
      volunteerRejections = Object.entries(volunteerRejections);
      let volApplicationsMod = [];
      let volRegistrationsMod = [];
      let volRejectionsMod = [];
      for (const o of volunteerApplications) {
        const phoneNo = o[0];
        const role = o[1];
        const volunteerDocRef = doc(FIRESTORE_DB, "Volunteer", phoneNo);
        const volunteerDoc = await getDoc(volunteerDocRef);
        const name = volunteerDoc.data().name;
        volApplicationsMod.push([phoneNo, {'role': role, 'name': name}]);
      }
      for (const o of volunteerRegistrations) {
        const phoneNo = o[0];
        const role = o[1];
        const volunteerDocRef = doc(FIRESTORE_DB, "Volunteer", phoneNo);
        const volunteerDoc = await getDoc(volunteerDocRef);
        const name = volunteerDoc.data().name;
        volRegistrationsMod.push([phoneNo, {'role': role, 'name': name}]);
      }
      for (const o of volunteerRejections) {
        const phoneNo = o[0];
        const role = o[1];
        const volunteerDocRef = doc(FIRESTORE_DB, "Volunteer", phoneNo);
        const volunteerDoc = await getDoc(volunteerDocRef);
        const name = volunteerDoc.data().name;
        volRejectionsMod.push([phoneNo, {'role': role, 'name': name}]);
      }
      setVolunteerRequestsData(volApplicationsMod);
      setVolunteerRegisteredData(volRegistrationsMod);
      setVolunteerRejectedData(volRejectionsMod);
    });
    return () => listenVolunteerRequests();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Requests</Text>
      {volunteerRequestsData.length === 0 ?
      <Text style={{padding: 10, fontSize: 16}}>
        No volunteer applications currently
      </Text> :
      <ScrollView>
        {volunteerRequestsData.map((request, index) => {
          return (<VolunteerRequestCard
            key={index}
            eventId={id}
            name={request[1].name}
            role={request[1].role}
            phoneNo={request[0]}
            type={type}
          />);
        })}
      </ScrollView>}
      <Text style={styles.header}>Registered</Text>
      {volunteerRegisteredData.length === 0 ? 
      <Text style={{padding: 10, fontSize: 16}}>
        No registered volunteers currently
      </Text> :
      <ScrollView>
      {volunteerRegisteredData.map((request, index) => (
          <VolunteerRegisteredCard
            key={index}
            eventId={id}
            name={request[1].name}
            role={request[1].role}
            phoneNo={request[0]}
            type={type}
          />
        ))}
      </ScrollView>}
      <Text style={styles.header}>Rejected</Text>
      {volunteerRejectedData.length === 0 ? 
      <Text style={{padding: 10, fontSize: 16}}>
        No rejected volunteers currently
      </Text> :
      <ScrollView>
      {volunteerRejectedData.map((request, index) => (
          <VolunteerRejectedCard
            key={index}
            eventId={id}
            name={request[1].name}
            role={request[1].role}
            phoneNo={request[0]}
            type={type}
          />
        ))}
      </ScrollView>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 11,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
  },
});

export default VolunteerRequests;
