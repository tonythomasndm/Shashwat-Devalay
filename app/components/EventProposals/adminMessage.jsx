import React, { useState, useEffect, createContext } from 'react';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native';
import Message from './message';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { collection, doc, getDocs, orderBy, query, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import MessageAdmin from './messageAdmin';
export const AdminMessageContext = createContext({});


const AdminMessages = () => {
    const [messageList, setMessageList] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
      const chatRoomRef = collection(FIRESTORE_DB, "ChatRoom");
      const q = query(chatRoomRef, orderBy('lastMsgTime', 'desc'));
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
            setMessageList(data);
          }
        });
      } catch (e) {
        console.error("Error fetching messages: ", e);
      }
      return () => unsubscribe();
    }, []);

    return (
        <AdminMessageContext.Provider value={messageList}>
                {messageList.map((item) => (
                  <MessageAdmin
                      infraName={item.infraName}
                      key={item.infraID}
                      lastMessage={item.lastMsg}
                      id={item.id}
                      unreadMessage={item.msgsList.length - item.lastReadMsgIdxBySeeker - 1} //item.unreadMsgCount || 0
                      lastMessageTime={item.lastMsgTime.toDate().toLocaleTimeString('en-GB', { 
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                      })}
                  />
                ))}
        </AdminMessageContext.Provider>
    );
};

export default AdminMessages;