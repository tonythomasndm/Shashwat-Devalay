import { TouchableOpacity, View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { styles,COLOURS,SIZES } from '../../styles';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SwarojgarBrowseShop,RequestedShops, SellerMessages } from '../../components/Swarojgar';

const TopTab = createMaterialTopTabNavigator();

const AdminSwarojgar = () => {
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
            }}
        >
            <TopTab.Screen
                name="Approved Shops"
                component={SwarojgarBrowseShop}
                initialParams={{ admin: true }}
                options={{ tabBarLabel: "Approved Shops" }}
            />
            
            <TopTab.Screen
                name="Shop Applications"
                component={RequestedShops}
                options={{ tabBarLabel: "Shops Applications" }}
            />

            <TopTab.Screen
                name="Shop chats"
                component={SellerMessages}
                options={{ tabBarLabel: "Shop chats" }}
            />

        </TopTab.Navigator>
    )
}
export default AdminSwarojgar; 