import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SeekerShikshaEnrolledEvents from './EnrolledEvents';
import SeekerShikshaNonEnrolledEvents from './NonEnrolledEvents';
import SeekerShikshaMessages from './Messages';
import { COLOURS } from '../../styles';
const TopTab = createMaterialTopTabNavigator();

const SeekerShiksha = () => {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize:13, textTransform: 'capitalize' },
        tabBarStyle: { padding: 0, marginHorizontal: 0 },
        tabBarIndicatorStyle: { backgroundColor: COLOURS.primary, height: "100%" },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'black',
      }}
    >
      <TopTab.Screen
        name="EnrolledEvents"
        component={SeekerShikshaEnrolledEvents}
        options={{ tabBarLabel: 'Enrolled Events' }}
      />
      <TopTab.Screen
        name="NonEnrolledEvents"
        component={SeekerShikshaNonEnrolledEvents}
        options={{ tabBarLabel: 'Non Enrolled Events' }}
      />
      <TopTab.Screen
        name="Messages"
        component={SeekerShikshaMessages}
        options={{ tabBarLabel: 'Messages' }}
      />
    </TopTab.Navigator>
  );
};

export default SeekerShiksha;
