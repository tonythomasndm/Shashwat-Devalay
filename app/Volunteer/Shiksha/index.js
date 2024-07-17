import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import VolunteerShikshaEnrolledEvents from "./EnrolledEvents";
import VolunteerShikshaNonEnrolledEvents from "./NonEnrolledEvents";
import VolunteerShikshaEventSuggest from "./EventSuggest";
import { EventsList } from "../../components/ApprovedEvents";

const TopTab = createMaterialTopTabNavigator();
const VolunteerShiksha = () => {
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
        component={VolunteerShikshaEnrolledEvents}
        options={{ tabBarLabel: "Enrolled Events" }}
      />
      <TopTab.Screen
        name='Pending Events'
        component={EventsList}
        initialParams={{type:"Shiksha", time:"Pending"}}
        options={{ tabBarLabel: "Pending Events" }}
      />
      <TopTab.Screen
        name='Non Enrolled Events'
        component={VolunteerShikshaNonEnrolledEvents}
        options={{ tabBarLabel: "Non Enrolled Events" }}
      />
      <TopTab.Screen
        name='Event Suggest'
        component={VolunteerShikshaEventSuggest}
        options={{ tabBarLabel: "Event Suggest" }}
      />
      
    </TopTab.Navigator>
  );
};

export default VolunteerShiksha;
