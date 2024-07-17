import React, { useState, useContext, useEffect } from 'react';
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
  FlatList,
  Modal,
} from "react-native";
import { COLOURS, SIZES } from "../../styles/index";
import { styles } from '../../styles/index';
import * as ImagePicker from 'expo-image-picker';
import AppContext from '../../../AppContext';
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, onSnapshot, query, where, doc, getDoc, setDoc, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL,deleteObject,listAll } from "firebase/storage";
import PagerView from 'react-native-pager-view';
import { useNavigation } from '@react-navigation/native';

import ImagePager from './ImagePager';

const ShopHomepage = (props) => {
  let shop;
  let admin;
  let requested;
  const { infraId, mode, seekerId, volunteerId } = useContext(AppContext);

  const userId = (mode === "Volunteer") ? volunteerId : seekerId;

  const [modalVisible, setModalVisible] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [shopNumber, setShopNumber] = useState('');

  if (props.route) {
    shop = props.route.params.shop;
    admin = props.route.params.admin;
    requested = props.route.params.requested;
  } else {
    console.log(props);
    shop = props.shop;
  }
  console.log("shops:", shop);
  if (!shop) {
    return (
      <View style={localStyles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={localStyles.productContainer}
      onPress={() => navigation.navigate('ProductPage', { product: item })}
    >
      <Image source={{ uri: item.imageUri }} style={localStyles.productImage} />
      <Text style={localStyles.productName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleApproveRequest = () => {
    setApprovalModalVisible(true);
  };

  const handleApproveConfirm = async () => {
    const docsRef = collection(FIRESTORE_DB, "Shops");
    const chatroomCollectionRef = collection(FIRESTORE_DB, 'SwarojgarChatRoom');
    const chatroomDocRef = doc(chatroomCollectionRef, shop.id + infraId);
    const docRef = doc(docsRef, shop.id);
    try {
      await setDoc(docRef, {
        infraId: infraId,
        shopName: shop.shopName,
        shopDescription: shop.shopDescription,
        shopAddress: shop.shopAddress,
        openingTime: shop.openingTime,
        closingTime: shop.closingTime,
        products: shop.products,
        shopImages: shop.shopImages,
        phoneNumer: shop.id,
        shopNumber: shopNumber,  // Add the shop number here
      });
      const NOW = new Date();
      await setDoc(chatroomDocRef, {
        msgsList: [],
        lastReadMsgIdxByAdmin: -1,
        infraId: infraId,
        lastMsgTime: Timestamp.fromDate(NOW),
    });
      await deleteDoc(doc(collection(FIRESTORE_DB, "SwarozgarRequests"), shop.id));
      setApprovalModalVisible(false);
      Alert.alert("Approved");
      navigation.navigate("home");
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleRejectRequest = () => {
    setModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    try {
      const rejectionDoc = doc(collection(FIRESTORE_DB, "SwarozgarRequests"), shop.id);
      await setDoc(rejectionDoc, { 
        infraId: infraId,
        remarks: remarks,
        status: "rejected",
        shopName: shop.shopName,
        shopDescription: shop.shopDescription,
        shopAddress: shop.shopAddress,
        openingTime: shop.openingTime,
        closingTime: shop.closingTime,
        products: shop.products,
        shopImages: shop.shopImages,
        phoneNumer: shop.id,
      });
      setModalVisible(false);
      Alert.alert("Rejected");
      navigation.navigate("home");
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      const storage = getStorage();
      const productRef = ref(storage, `${shop.id}/ProductImages`);
      const shopRef = ref(storage, `${shop.id}/ShopImages`);

      // List all files in the folder
      const result1 = await listAll(productRef);
      const result2 = await listAll(shopRef);

      // Iterate over each file and delete it
      const deletePromises = result1.items.map((fileRef) => deleteObject(fileRef));
      const deletePromises2 = result2.items.map((fileRef) => deleteObject(fileRef));

      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      await Promise.all(deletePromises2);
      
      await deleteDoc(doc(collection(FIRESTORE_DB, "Shops"), shop.id));
      await deleteDoc(doc(FIRESTORE_DB, "SwarojgarChatRoom", shop.id + infraId));
      Alert.alert("Shop Deleted");
      navigation.navigate("home");
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <ScrollView>
      <View style={localStyles.container}>
        <View style={localStyles.childContainer}>
          <Text style={localStyles.heading}>{shop.shopName}</Text>
        </View>
        <View style={localStyles.childContainer}>
          <ImagePager shopImages={shop.shopImages} />
        </View>
        <View style={localStyles.childContainer}>
          <Text style={{ fontSize: SIZES.medium }}>{shop.shopDescription}</Text>
        </View>
        <View style={localStyles.childContainer}>
          <Text style={{ fontSize: SIZES.large }}>
            Time and Venue
          </Text>
          <Text>From {shop.openingTime} to {shop.closingTime}</Text>
          <Text>Venue: {shop.shopAddress}</Text>
        </View>
        <View style={localStyles.childContainer}>
          <Text style={{ fontSize: SIZES.xLarge }}>Products</Text>
        </View>
        <View style={localStyles.childContainer}>
          <View style={{marginBottom:"25%",display:"flex",flexWrap:"wrap",flexDirection:"row"}}>
              {Object.entries(shop.products).map(([key, product], index) => (
                  <TouchableOpacity
                    key={index}
                    style={localStyles.productContainer}
                    onPress={() => navigation.navigate('ProductPage', { product })}
                  >
                    <Image source={{ uri: product.imageUri }} style={localStyles.productImage} />
                    <Text style={localStyles.productName}>{product.name}</Text>
                  </TouchableOpacity>
                //   <TouchableOpacity style={localStyles.productContainer}
                //   onPress={() => navigation.navigate('ProductPage', { product: item })}
                // >
                //   <Image source={{ uri: item.imageUri }} style={localStyles.productImage} />
                //   <Text style={localStyles.productName}>{item.name}</Text>
                // </TouchableOpacity>
                ))}

          </View>
        </View>
        {requested && (
          <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: "10%",
          }}>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: COLOURS.green }]}
              onPress={handleApproveRequest}
            >
              <Text
                style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}
              >
                Approve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: "red" }]}
              onPress={handleRejectRequest}
            >
              <Text
                style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {admin && (
          <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: "10%",
          }}>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: "red" }]}
              onPress={handleDeleteRequest}
            >
              <Text
                style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}
              >
                Delete Shop
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={localStyles.modalView}>
          <Text style={localStyles.modalText}>Enter Rejection Remarks:</Text>
          <TextInput
            style={localStyles.input}
            onChangeText={setRemarks}
            value={remarks}
            placeholder="Enter remarks"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: "red" }]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: COLOURS.green }]}
              onPress={handleRejectConfirm}
            >
              <Text style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={approvalModalVisible}
        onRequestClose={() => {
          setApprovalModalVisible(!approvalModalVisible);
        }}
      >
        <View style={localStyles.modalView}>
          <Text style={localStyles.modalText}>Enter Shop Number:</Text>
          <TextInput
            style={localStyles.input}
            onChangeText={setShopNumber}
            value={shopNumber}
            placeholder="Enter shop number"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: "red" }]}
              onPress={() => setApprovalModalVisible(!approvalModalVisible)}
            >
              <Text style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.registerButton, { backgroundColor: COLOURS.green }]}
              onPress={handleApproveConfirm}
            >
              <Text style={{ color: COLOURS.white, fontSize: 20, marginLeft: 20, marginRight: 20 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  imgContainer: {
    flex: 1,
    width: "100%",
    height: 200,
    backgroundColor: "red",
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "100%",
    height: '100%',
    resizeMode: 'cover',
  },
  childContainer: {
    width: "80%",
    marginTop: "5%",
  },
  heading: {
    fontSize: SIZES.xxLarge,
    paddingTop: "2%",
    paddingBottom: "1%",
    marginTop: "5%",
  },
  shopDescription: {
    fontSize: 25,
    margin: 10,
    color: COLOURS.textPrimary,
  },
  shopTimings: {
    fontSize: SIZES.font,
    margin: 10,
    color: COLOURS.textPrimary,
  },
  shopAddress: {
    fontSize: SIZES.font,
    margin: 10,
    color: COLOURS.textPrimary,
  },
  shopPhoneNumber: {
    fontSize: SIZES.font,
    margin: 10,
    color: COLOURS.textPrimary,
  },
  listContainer: {
    paddingVertical: 10,
    marginBottom: "20%",
  },
  productContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: "2%",
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: "40%",
  },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: COLOURS.secondary,
    padding: 10,
    borderRadius: 10,
    margin: 20,
    alignSelf: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    width: '80%',
    paddingLeft: 10,
  },
});

export default ShopHomepage;
