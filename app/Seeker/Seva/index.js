import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SeekerSevaEnrolledEvents from './EnrolledEvents';
import SeekerSevaNonEnrolledEvents from './NonEnrolledEvents';
import SeekerSevaMessages from './Messages';
import { COLOURS } from '../../styles';
const TopTab = createMaterialTopTabNavigator();

const SeekerSeva = () => {
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
        component={SeekerSevaEnrolledEvents}
        options={{ tabBarLabel: 'Enrolled Events' }}
      />
      <TopTab.Screen
        name="NonEnrolledEvents"
        component={SeekerSevaNonEnrolledEvents}
        options={{ tabBarLabel: 'Non Enrolled Events' }}
      />
      <TopTab.Screen
        name="Messages"
        component={SeekerSevaMessages}
        options={{ tabBarLabel: 'Messages' }}
      />
    </TopTab.Navigator>
  );
};

export default SeekerSeva;
