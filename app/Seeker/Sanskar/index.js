import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SeekerSanskarEnrolledEvents from './EnrolledEvents';
import SeekerSanskarNonEnrolledEvents from './NonEnrolledEvents';
import SeekerSanskarMessages from './Messages';
import { COLOURS } from '../../styles';
const TopTab = createMaterialTopTabNavigator();

const SeekerSanskar = () => {
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
        component={SeekerSanskarEnrolledEvents}
        options={{ tabBarLabel: 'Enrolled Events' }}
      />
      <TopTab.Screen
        name="NonEnrolledEvents"
        component={SeekerSanskarNonEnrolledEvents}
        options={{ tabBarLabel: 'Non Enrolled Events' }}
      />
      <TopTab.Screen
        name="Messages"
        component={SeekerSanskarMessages}
        options={{ tabBarLabel: 'Messages' }}
      />
    </TopTab.Navigator>
  );
};

export default SeekerSanskar;
