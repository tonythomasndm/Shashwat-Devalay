import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AdminShikshaApprovedEvents from './ApprovedEvents';
import AdminShikshaCreateEvent from './CreateEvent';
import AdminShikshaEnrollments from './Enrollments';
import AdminShikshaEventProposals from './EventProposals';
import { COLOURS } from '../../styles';

const TopTab = createMaterialTopTabNavigator();
const AdminShiksha = () => {
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
        name="ApprovedEvents"
        component={AdminShikshaApprovedEvents}
        options={{ tabBarLabel: 'Approved Events' }}
      />
      <TopTab.Screen
        name="CreateEvent"
        component={AdminShikshaCreateEvent}
        options={{ tabBarLabel: 'Create Event' }}
      />
      <TopTab.Screen
        name="EventProposals"
        component={AdminShikshaEventProposals}
        options={{ tabBarLabel: 'Event Proposals' }}
      />
      <TopTab.Screen
        name="Enrollments"
        component={AdminShikshaEnrollments}
        options={{ tabBarLabel: 'Enrollments' }}
      />
    </TopTab.Navigator>
  );
};

export default AdminShiksha;
