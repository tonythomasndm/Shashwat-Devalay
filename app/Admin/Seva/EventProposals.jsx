import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { COLOURS } from "../../styles";
import { VolunteerSuggestions, SeekerMessages} from '../../components/EventProposals';

const TopTab = createMaterialTopTabNavigator();

const AdminSevaEventProposals = () =>{
    return (
    <TopTab.Navigator
      initialRouteName='Suggestions'
      screenOptions={{
        tabBarLabelStyle: { fontSize: 13, textTransform: "capitalize" },
        tabBarStyle: { padding: 0, marginHorizontal: 0 },
        tabBarIndicatorStyle: { backgroundColor: COLOURS.secondary, height: 80 },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "black",
      }}>
      <TopTab.Screen
        name='Suggestions'
        component={VolunteerSuggestions}
        initialParams={{type:"Seva"}}
        options={{ tabBarLabel: "Suggestions" }}
      />
      <TopTab.Screen
        name='Messages'
        component={SeekerMessages}
        initialParams={{type:"Seva"}}
        options={{ tabBarLabel: "Messages" }}
      />
    </TopTab.Navigator>
  );
}

export default AdminSevaEventProposals;