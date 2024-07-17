import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import {
  EventsList
} from "../../components/ApprovedEvents";

const TopTab = createMaterialTopTabNavigator();

const AdminSanskarApprovedEvent = () => {

  return (
    <TopTab.Navigator
      initialRouteName='Current'
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, textTransform: "capitalize" },
        tabBarStyle: { padding: 0, marginHorizontal: 0 },
        tabBarIndicatorStyle: { backgroundColor: COLOURS.secondary, height: 80 },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "black",
      }}>
      <TopTab.Screen
        name='Past'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Past"}}
        options={{ tabBarLabel: "Past" }}
      />
      <TopTab.Screen
        name='Current'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Current"}}
        options={{ tabBarLabel: "Current" }}
      />
      <TopTab.Screen
        name='Future'
        component={EventsList}
        initialParams={{type:"Sanskar", time:"Future"}}
        options={{ tabBarLabel: "Future"}}
      />
    </TopTab.Navigator>
  );
};

export default AdminSanskarApprovedEvent;
