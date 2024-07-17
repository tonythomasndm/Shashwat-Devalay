import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { COLOURS, SIZES } from "../../styles/index";
import { styles } from '../../styles/index';
import * as ImagePicker from 'expo-image-picker';
import AppContext from '../../../AppContext';
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, onSnapshot, query, where, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import SwarojgarCreateShop from './CreateShop';
import ShopHomepage from './ShopHomepage';

const SwarojgarYourShop = (props) => {
  const [edit, setEdit] = useState(false);
  const { infraId, mode, seekerId, volunteerId } = useContext(AppContext);
  const userId = (mode === "Volunteer") ? volunteerId : seekerId;
  const owner = props.route.params.owner;
  
  const navigation = useNavigation();
  const [shopDetails, setShopDetails] = useState(null);

  useEffect(() => {
    if (userId) {
      const shopsDocsRef = collection(FIRESTORE_DB, "Shops");

      const unsubscribe = onSnapshot(shopsDocsRef, (snapshot) => {
        const userShopExists = snapshot.docs.some(doc => doc.id === userId);
        const docData = snapshot.docs.find(doc => doc.id === userId);
        if (docData) {
          const data = docData.data();
          setShopDetails(data);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  console.log("owner:", owner);
  console.log("edit:", edit);
  console.log("shopDetails:", shopDetails);

  return (
    <View>
      {owner && (
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
          <TouchableOpacity style={{ backgroundColor: COLOURS.primary, margin: "1.5%" }} onPress={() => setEdit(true)}>
            <Text style={{ marginRight: 20, marginLeft: 20, marginTop: 5, marginBottom: 5, color: COLOURS.white }}> Edit </Text>
          </TouchableOpacity>
        </View>
      )}
      {(edit === true) ? (
        <SwarojgarCreateShop edit={edit} setEdit={setEdit} />
      ) : (
        shopDetails ? (
          <ShopHomepage shop={shopDetails} />
        ) : (
          <Text>Loading shop details...</Text>
        )
      )}
    </View>
  );
}

export default SwarojgarYourShop;
