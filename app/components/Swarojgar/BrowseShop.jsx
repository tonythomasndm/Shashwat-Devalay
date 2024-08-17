import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';

const SwarojgarBrowseShop = (props) => {
  const [shopsList, setShopsList] = useState([]);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  let admin;
  if(props.route){

     admin=props.route.params.admin;
  }
  else admin=false;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const shopsRef = collection(FIRESTORE_DB, "Shops");

        // Subscribe to real-time updates using onSnapshot
        const unsubscribe = onSnapshot(shopsRef, (snapshot) => {
          const shops = snapshot.docs.map((doc) => ({
            ref: doc.ref,
            id: doc.id,
            ...doc.data(),
          }));
          setShopsList(shops);
          //Arpan shops to be filtered by infra
          setError(""); // Clear error state
        });

        return () => {
          // Unsubscribe from real-time updates when component unmounts
          unsubscribe();
        };
      } catch (error) {
        console.error(`Error fetching Event docs details:`, error);
        setError(`Error fetching Event docs details`);
      }
    };

    fetchEvents();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const truncateDescription = (description) => {
    const words = description.split(' ');
    if (words.length > 18) {
      return words.slice(0, 18).join(' ') + ' ..';
    }
    return description;
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          shopsList.map((shop) => (
            <View key={shop.id}>
            <TouchableOpacity 
            onPress={()=>navigation.navigate('ShopHomePage',{ shop:shop,admin:admin })}
            >
              <View  style={styles.card}>
              <View style={styles.forImage}>
                <Image source={{ uri: shop.shopImages[0] }} style={styles.image} />
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{shop.shopName}</Text>
                <Text style={styles.description}>{truncateDescription(shop.shopDescription)}</Text>
                <Text style={styles.shopNumber}>Shop No: {shop.shopNumber}</Text>
                <Text style={styles.time}>Timings: {shop.openingTime} - {shop.closingTime}</Text>
              </View>
            </View>
            </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  forImage: {
    flexShrink: 0,
  },
  image: {
    width: 120,
    height: 170,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  name: {
    color: "#17A1FA",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  shopNumber: {
    fontSize: 14,
    color: '#888',
  },
  time: {
    fontSize: 14,
    color: '#888',
  },
});

export default SwarojgarBrowseShop;
