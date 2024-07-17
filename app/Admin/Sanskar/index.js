import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AdminSanskarApprovedEvents from './ApprovedEvents';
import AdminSanskarCreateEvent from './CreateEvent';
import AdminSanskarEnrollments from './Enrollments';
import AdminSanskarEventProposals from './EventProposals';
import { COLOURS } from '../../styles';
const TopTab = createMaterialTopTabNavigator();
const AdminSanskar = () => {
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
        component={AdminSanskarApprovedEvents}
        options={{ tabBarLabel: 'Approved Events' }}
      />
      <TopTab.Screen
        name="CreateEvent"
        component={AdminSanskarCreateEvent}
        options={{ tabBarLabel: 'Create Event' }}
      />
      <TopTab.Screen
        name="EventProposals"
        component={AdminSanskarEventProposals}
        options={{ tabBarLabel: 'Event Proposals' }}
      />
      <TopTab.Screen
        name="Enrollments"
        component={AdminSanskarEnrollments}
        options={{ tabBarLabel: 'Enrollments' }}
      />
    </TopTab.Navigator>
  );
};

export default AdminSanskar;
