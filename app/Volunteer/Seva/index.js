import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import VolunteerSevaEnrolledEvents from "./EnrolledEvents";
import VolunteerSevaNonEnrolledEvents from "./NonEnrolledEvents";
import VolunteerSevaEventSuggest from "./EventSuggest";
import { EventsList } from "../../components/ApprovedEvents";

const TopTab = createMaterialTopTabNavigator();
const VolunteerSeva = () => {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, textTransform: "capitalize" },
        tabBarStyle: { padding: 0, marginHorizontal: 0 },
        tabBarIndicatorStyle: {
          backgroundColor: COLOURS.primary,
          height: "100%",
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "black",
      }}>
      <TopTab.Screen
        name='Enrolled Events'
        component={VolunteerSevaEnrolledEvents}
        options={{ tabBarLabel: "Enrolled Events" }}
      />
      <TopTab.Screen
        name='Pending Events'
        component={EventsList}
        initialParams={{type:"Seva", time:"Pending"}}
        options={{ tabBarLabel: "Pending Events" }}
      />
      <TopTab.Screen
        name='Non Enrolled Events'
        component={VolunteerSevaNonEnrolledEvents}
        options={{ tabBarLabel: "Non Enrolled Events" }}
      />
      <TopTab.Screen
        name='Event Suggest'
        component={VolunteerSevaEventSuggest}
        options={{ tabBarLabel: "Event Suggest" }}
      />
      
    </TopTab.Navigator>
  );
};

export default VolunteerSeva;
