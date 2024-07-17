import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AdminSevaApprovedEvents from './ApprovedEvents';
import AdminSevaCreateEvent from './CreateEvent';
import AdminSevaEnrollments from './Enrollments';
import AdminSevaEventProposals from './EventProposals';
import { COLOURS } from '../../styles';

const TopTab = createMaterialTopTabNavigator();
const AdminSeva = () => {
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
        component={AdminSevaApprovedEvents}
        options={{ tabBarLabel: 'Approved Events' }}
      />
      <TopTab.Screen
        name="CreateEvent"
        component={AdminSevaCreateEvent}
        options={{ tabBarLabel: 'Create Event' }}
      />
      <TopTab.Screen
        name="EventProposals"
        component={AdminSevaEventProposals}
        options={{ tabBarLabel: 'Event Proposals' }}
      />
      <TopTab.Screen
        name="Enrollments"
        component={AdminSevaEnrollments}
        options={{ tabBarLabel: 'Enrollments' }}
      />
    </TopTab.Navigator>
  );
};

export default AdminSeva;
