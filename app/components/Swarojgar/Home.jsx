import React, { useContext, useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { collection, onSnapshot } from "firebase/firestore";
import { COLOURS } from "../../styles";
import SwarojgarCreateShop from "./CreateShop";
import SwarojgarBrowseShop from "./BrowseShop";
import SwarojgarYourShop from "./YourShop";
import AppContext from "../../../AppContext";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import SellerChatInterface from "./SellerChatInterface";

const TopTab = createMaterialTopTabNavigator();

const SwarojgarHome = () => {
  const { shopExists, setShopExists, mode, seekerId, volunteerId } = useContext(AppContext);
  const userId = mode === "Volunteer" ? volunteerId : seekerId;
  const [shopDetails, setShopDetails] = useState(null);

  useEffect(() => {
    if (userId) {
      const shopsDocsRef = collection(FIRESTORE_DB, "Shops");

      const unsubscribe = onSnapshot(shopsDocsRef, (snapshot) => {
        const userShopExists = snapshot.docs.some(doc => doc.id === userId);
        setShopExists(userShopExists);
        const docData = snapshot.docs.find(doc => doc.id === userId);
        if (docData) {
          const data = docData.data();
          setShopDetails(data);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  console.log("shopDetails:", shopDetails);

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
        name="Browse Shop"
        component={SwarojgarBrowseShop}
        initialParams={{ admin: false, userId }}
        options={{ tabBarLabel: "Browse Shops" }}
      />
      {shopExists ? (
        <TopTab.Screen
          name="Your Shop"
          component={SwarojgarYourShop}
          initialParams={{ owner: true, shopDetails: shopDetails }}
          options={{ tabBarLabel: "Your Shop" }}
        />
      ) : (
        <TopTab.Screen
          name="Create Shop"
          component={SwarojgarCreateShop}
          options={{ tabBarLabel: "Create Shop" }}
        />
      )}
      <TopTab.Screen
        name="Chat with Admin"
        component={SellerChatInterface}
        options={{ tabBarLabel: "Chat with Admin" }}
      />
    </TopTab.Navigator>
  );
};

export default SwarojgarHome;
