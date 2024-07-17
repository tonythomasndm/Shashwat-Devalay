import React, { useState, useEffect, createContext, useContext } from 'react';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native';
import Message from './message';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { collection, doc, getDocs, orderBy, query, onSnapshot, where, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AppContext from "../../../AppContext";


export const SeekerMessageContext = createContext({});

const SeekerMessages = ({ route }) => {
  
    const { type } = route.params;
    const { adminId } = useContext(AppContext);
    const [messageList, setMessageList] = useState([]);
    const navigation = useNavigation();


    useEffect(() => {
      const chatRoomRef = collection(FIRESTORE_DB, `${type}ChatRoom`);
      //console.log(infraId);
      const q = query(chatRoomRef, where("infraId", "==", adminId), orderBy('lastMsgTime', 'desc'));
      let unsubscribe;
      try {
        unsubscribe = onSnapshot(q, (querySnapShot) => {
          let data = [];
          if (!querySnapShot.empty) {
            querySnapShot.forEach((doc) => {
              data.push({id: doc.id, ...doc.data()});
            }, (error) => {
              console.error(error.message);
          });
          }
          setMessageList(data);
        });

      } catch (e) {
        console.error("Error fetching messages: ", e);
      }
      return () => unsubscribe();
    }, []);

    return (
        <SeekerMessageContext.Provider value={messageList}>
                {messageList.map((item) => (
                  <Message
                      senderName={item.seekerName}
                      key={item.id}
                      lastMessage={item.lastMsg}
                      id={item.id}
                      type={type}
                      unreadMessage={item.msgsList.length - 1 - item.lastReadMsgIdxByAdmin} //item.unreadMsgCount || 0
                      lastMessageTime={item.lastMsgTime.toDate().toLocaleTimeString('en-GB', { 
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                      })}
                  />
                ))}
        </SeekerMessageContext.Provider>
    );
};

export default SeekerMessages;