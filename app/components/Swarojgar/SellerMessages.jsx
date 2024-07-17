import React, { useState, useEffect, createContext, useContext } from 'react';
import { FlatList, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Message from './message';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { collection, doc, getDocs, orderBy, query, onSnapshot, where, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AppContext from "../../../AppContext";


export const SellerMessageContext = createContext({});

const SellerMessages = () => {
  
    //const { type } = route.params;
    const { adminId } = useContext(AppContext);
    const [messageList, setMessageList] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
      const chatroomCollectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
      //console.log(infraId);
      const q = query(chatroomCollectionRef, where("infraId", "==", adminId), orderBy('lastMsgTime', 'desc'));
      let unsubscribe;
      try {
        unsubscribe = onSnapshot(q, async (querySnapShot) => {
          let data = [];
          if (!querySnapShot.empty) {
            const promises = querySnapShot.docs.map(async (chatDoc) => {
              const phoneNo = chatDoc.id.substring(0, 10);
              const shopDocRef = doc(FIRESTORE_DB, 'Shops', phoneNo);
              const shopDoc = await getDoc(shopDocRef);
              const shopName = shopDoc.data().shopName;
              const volunteerDocRef = doc(FIRESTORE_DB, 'Volunteer', phoneNo);
              const seekerDocRef = doc(FIRESTORE_DB, 'Seeker', phoneNo);
              let sellerDoc = await getDoc(volunteerDocRef);
              if (!sellerDoc.exists()) {
                sellerDoc = await getDoc(seekerDocRef);
              }
              const sellerName = sellerDoc.data().name;
              return {id: chatDoc.id, 
                shopName: shopName, 
                sellerName: sellerName, 
                ...chatDoc.data()};
            });
            data = await Promise.all(promises);
            console.log('data - ', data);
          }
          setMessageList(data);
        });
      } catch (e) {
        console.error("Error fetching messages: ", e);
      }
      return () => unsubscribe();
    }, []);

    return (
      messageList.length === 0 ?
      <Text style={style.msgText}>
        No shops yet
      </Text> :
      messageList.map((item) => (
        <Message
            senderName={item.sellerName}
            shopName={item.shopName}
            key={item.id}
            lastMessage={item.lastMsg}
            id={item.id}
            unreadMessage={item.msgsList.length - 1 - item.lastReadMsgIdxByAdmin} //item.unreadMsgCount || 0
            lastMessageTime={item.lastMsgTime.toDate().toLocaleTimeString('en-GB', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}
        />
      ))
    );
};

const style = StyleSheet.create({
  msgText: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 30,
    paddingTop: 100,
    padding: 50,
  },
});

export default SellerMessages;