import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import accept from '../../../assets/accept.png';
import reject from '../../../assets/reject.png';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { deleteField, runTransaction, doc, updateDoc, getDoc } from 'firebase/firestore';
import AppContext from '../../../AppContext';

export const VolunteerRequestCard = ({ eventId, name, role, phoneNo, type }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.column}>
        <Text style={styles.nameText}>
          {name}
        </Text>
        <Text style={styles.roleText}>
          {role}
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
        onPress={() => {acceptVolunteerRequest(eventId, phoneNo, type, role)}}>
          <Image source={accept} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
        onPress={() => {rejectVolunteerRequest(eventId, phoneNo, type, role)}}>
          <Image source={reject} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const VolunteerRegisteredCard = ({ eventId, name, role, phoneNo, type }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.column}>
        <Text style={styles.nameText}>
          {name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.roleText}>
            {role}
          </Text>
          <Text style={styles.roleText}>
            {phoneNo}
          </Text>
        </View>
      </View>
      <TouchableOpacity
      onPress={() => {rejectAcceptedVolunteer(eventId, phoneNo, type, role)}}>
        <Image source={reject} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

export const VolunteerRejectedCard = ({ eventId, name, role, phoneNo, type }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.column}>
        <Text style={styles.nameText}>
          {name}
        </Text>
        <Text style={styles.roleText}>
          {role}
        </Text>
      </View>
      <TouchableOpacity
      onPress={() => {acceptRejectedVolunteer(eventId, phoneNo, type, role)}}>
        <Image source={accept} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const rejectVolunteerRequest = async (eventId, phoneNo, type, role) => {
  const eventDocRef = doc(FIRESTORE_DB, `${type}Events`, eventId);
  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const regFieldPath = `volunteersRejected.${phoneNo}`;
      transaction.update(eventDocRef, {
        [regFieldPath]: role,
      });
      const applyFieldPath = `volunteersApplications.${phoneNo}`;
      transaction.update(eventDocRef, {
        [applyFieldPath]: deleteField(),
      });
    });
  } catch(e) {
    console.log(e);
  }
}

const acceptVolunteerRequest = async (eventId, phoneNo, type, role) => {
  const eventDocRef = doc(FIRESTORE_DB, `${type}Events`, eventId);
  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const eventDoc = await transaction.get(eventDocRef);
      let spotsLeft = eventDoc.data().volunteerRoles[role];
      spotsLeft = parseInt(spotsLeft);
      console.log(spotsLeft);
      if (spotsLeft <= 0) {
        throw new Error("No spots left");
      }
      const regFieldPath = `volunteersRegistered.${phoneNo}`;
      transaction.update(eventDocRef, {
        [regFieldPath]: role,
      });
      const applyFieldPath = `volunteersApplications.${phoneNo}`;
      transaction.update(eventDocRef, {
        [applyFieldPath]: deleteField(),
      });
      spotsLeft--;
      const roleFieldPath = `volunteerRoles.${role}`;
      transaction.update(eventDocRef, {
        [roleFieldPath]: spotsLeft.toString(),
      });
      console.log("Transaction completed successfully");
    });
  } catch(e) {
    if (e.message === "No spots left") {
      Alert.alert("No spots left", "Volunteer not added as no spots left", [
        {text: "Ok"}]);
    } else {
      console.error(e);
    }
  }
}

const rejectAcceptedVolunteer = async (eventId, phoneNo, type, role) => {
  const eventDocRef = doc(FIRESTORE_DB, `${type}Events`, eventId);
  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const eventDoc = await transaction.get(eventDocRef);
      let spotsLeft = eventDoc.data().volunteerRoles[role];
      spotsLeft = parseInt(spotsLeft);
      const regFieldPath = `volunteersRejected.${phoneNo}`;
      transaction.update(eventDocRef, {
        [regFieldPath]: role,
      });
      const applyFieldPath = `volunteersRegistered.${phoneNo}`;
      transaction.update(eventDocRef, {
        [applyFieldPath]: deleteField(),
      });
      spotsLeft++;
      const roleFieldPath = `volunteerRoles.${role}`;
      transaction.update(eventDocRef, {
        [roleFieldPath]: spotsLeft.toString(),
      });
      console.log("Transaction completed successfully");
    });
  } catch(e) {
     console.error(e);
  }
}

const acceptRejectedVolunteer = async (eventId, phoneNo, type, role) => {
  const eventDocRef = doc(FIRESTORE_DB, `${type}Events`, eventId);
  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const eventDoc = await transaction.get(eventDocRef);
      let spotsLeft = eventDoc.data().volunteerRoles[role];
      spotsLeft = parseInt(spotsLeft);
      console.log(spotsLeft);
      if (spotsLeft <= 0) {
        throw new Error("No spots left");
      }
      const regFieldPath = `volunteersRegistered.${phoneNo}`;
      transaction.update(eventDocRef, {
        [regFieldPath]: role,
      });
      const applyFieldPath = `volunteersRejected.${phoneNo}`;
      transaction.update(eventDocRef, {
        [applyFieldPath]: deleteField(),
      });
      spotsLeft--;
      const roleFieldPath = `volunteerRoles.${role}`;
      transaction.update(eventDocRef, {
        [roleFieldPath]: spotsLeft.toString(),
      });
      console.log("Transaction completed successfully");
    });
  } catch(e) {
    if (e.message === "No spots left") {
      Alert.alert("No spots left", "Volunteer not added as no spots left", [
        {text: "Ok"}]);
    } else {
      console.error(e);
    }
  }
}

const styles = StyleSheet.create({
  cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        marginVertical: 7,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
        backgroundColor: "#f0f0f0"
      },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleText: {
    marginRight: 10,
    //fontWeight: 'bold',
    paddingBottom: 2,
    fontSize: 14,
    color: 'gray',
  },
  nameText: {
    fontSize: 18,
    paddingTop: 5,
    fontWeight: 'bold',
  },
  icon: {
    width: 24,
    height: 24,
    padding: 16,
    marginHorizontal: 5,
  },
});