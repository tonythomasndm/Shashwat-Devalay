import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { Image, View } from "react-native";
import AppContext from "../../AppContext";
import AdminSeva from "../Admin/Seva";
import AdminSanskar from "../Admin/Sanskar";
import AdminShiksha from "../Admin/Shiksha";
import AdminSwarojgar from "../Admin/Swarojgar";

import seva_icon from "../../assets/seva-icon.png";
import shiksha_icon from "../../assets/shiksha-icon.png";
import sanskar_icon from "../../assets/sanskar-icon.png";
import swarojgar_icon from "../../assets/swarojgar-icon.png";

import VolunteerSeva from "../Volunteer/Seva";
import SeekerSeva from "../Seeker/Seva";
import VolunteerShiksha from "../Volunteer/Shiksha";
import SeekerShiksha from "../Seeker/Shiksha";
import VolunteerSanskar from "../Volunteer/Sanskar";
import SeekerSanskar from "../Seeker/Sanskar";
import VolunteerSwarojgar from "../Volunteer/Swarojgar";
import SeekerSwarojgar from "../Seeker/Swarojgar";

const Tab = createBottomTabNavigator();
const Home = () => {
  const { mode } = useContext(AppContext);
  const name = (suffix) => {
    return mode+suffix;
  };
  const chooseComponent = (
    adminComponent,
    volunteerComponent,
    seekerComponent
  ) => {
    return mode === "Admin"
      ? adminComponent
      : mode === "Volunteer"
      ? volunteerComponent
      : seekerComponent;
  };
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 13,
          textTransform: "capitalize",
          paddingBottom: 9,
        }, // Adjust the font size here
        tabBarStyle: {
          padding: 0, // Remove padding around tabs
          marginHorizontal: 0, // Remove margin around tabs
          height: 75,
        },
        tabBarIndicatorStyle: {
          backgroundColor: "orange",
          height: 70,
        },
        style: {
          marginHorizontal: 0, // Remove horizontal margin for the tab bar
        },
        tabBarActiveTintColor: "blue", // Color of active tab text
        tabBarInactiveTintColor: "black",
      }}>
      <Tab.Screen
        name={name("Seva")}
        component={chooseComponent(AdminSeva, VolunteerSeva, SeekerSeva)}
        options={{
          title: "Seva",
          tabBarIcon: () => <TabBarIcon image={seva_icon} h={45} w={53} />,

        }}
      />
      <Tab.Screen
        name={name("Shiksha")}
        component={chooseComponent(
          AdminShiksha,
          VolunteerShiksha,
          SeekerShiksha
        )}
        options={{
          title: "Shiksha",
          tabBarIcon: () => <TabBarIcon image={shiksha_icon} h={45} w={52.2} />,
          
        }}
      />
      <Tab.Screen
        name={name("Sanskar")}
        component={chooseComponent(
          AdminSanskar,
          VolunteerSanskar,
          SeekerSanskar
        )}
        options={{
          title: "Sanskar",
          tabBarIcon: () => <TabBarIcon image={sanskar_icon} h={48} w={45.8} />,
          
        }}
      />
      <Tab.Screen
        name={name("Swarojgar")}
        component={chooseComponent(
          AdminSwarojgar,
          VolunteerSwarojgar,
          SeekerSwarojgar
        )}
        options={{
          title: "Swarojgar",
          tabBarIcon: () => (
            <TabBarIcon image={swarojgar_icon} h={45} w={46.6} />
          ),
         
        }}
      />
    </Tab.Navigator>
  );
};
export default Home;

const TabBarIcon = ({ image, w, h }) => {
  return (
    <View>
      <Image source={image} style={{ width: w * 0.7, height: h * 0.7 }} />
    </View>
  );
};
