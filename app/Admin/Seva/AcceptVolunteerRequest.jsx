//Code Check - Anshika and Daksh
import React from "react";
import { View, Text, Button, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import VolunteerRequest from "./volunteerRequest";

const AcceptVolunteerRequest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, type } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.eventDetails}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <VolunteerRequest type={type} id={item.id}/>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 3,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#17A1FA'
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default AcceptVolunteerRequest;
