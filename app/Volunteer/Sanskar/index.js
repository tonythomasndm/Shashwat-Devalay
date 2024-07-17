import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import VolunteerSanskarEnrolledEvents from "./EnrolledEvents";
import VolunteerSanskarNonEnrolledEvents from "./NonEnrolledEvents";
import VolunteerSanskarEventSuggest from "./EventSuggest";
import { EventsList } from "../../components/ApprovedEvents";

const TopTab = createMaterialTopTabNavigator();
const VolunteerSanskar = () => {
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
        component={VolunteerSanskarEnrolledEvents}
        options={{ tabBarLabel: "Enrolled Events" }}
      />
      <TopTab.Screen
        name='Pending Events'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Pending"}}
        options={{ tabBarLabel: "Pending Events" }}
      />
      <TopTab.Screen
        name='Non Enrolled Events'
        component={VolunteerSanskarNonEnrolledEvents}
        options={{ tabBarLabel: "Non Enrolled Events" }}
      />
      <TopTab.Screen
        name='Event Suggest'
        component={VolunteerSanskarEventSuggest}
        options={{ tabBarLabel: "Event Suggest" }}
      />
      
    </TopTab.Navigator>
  );
};

export default VolunteerSanskar;
