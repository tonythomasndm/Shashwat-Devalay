import React from 'react'
import EnrolledEvents from '../../components/ApprovedEvents/EnrolledEvents';
import { Text, View, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import { EventsList } from '../../components/ApprovedEvents';

const TopTab = createMaterialTopTabNavigator();
const VolunteerSanskarEnrolledEvents = () => {
  return (
    <TopTab.Navigator
      initialRouteName='Accepted'
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, textTransform: "capitalize" },
        tabBarStyle: { padding: 0, marginHorizontal: 0 },
        tabBarIndicatorStyle: { backgroundColor: COLOURS.secondary, height: 80 },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "black",
      }}>
      <TopTab.Screen
        name='Accepted'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Accepted"}}
        options={{ tabBarLabel: "Accepted" }}
      />
      <TopTab.Screen
        name='Rejected'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Rejected"}}
        options={{ tabBarLabel: "Rejected" }}
      />
      
    </TopTab.Navigator>
  )
}

export default VolunteerSanskarEnrolledEvents;
