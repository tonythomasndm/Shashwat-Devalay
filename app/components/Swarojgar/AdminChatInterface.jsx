import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from "react-native";
import { COLOURS } from "../../styles/index";
import delete_icon from "../../../assets/Delete.png"
import send_icon from "../../../assets/send_icon.png"
import { collection, doc, getDoc, Timestamp, onSnapshot, updateDoc, arrayUnion, deleteDoc, increment, runTransaction } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { useNavigation, useRoute } from '@react-navigation/native';

const AdminSwarojgarChatInterface = () => {
    const navigator = useNavigation();
    const route = useRoute();
    const { doc_ref, sellerName } = route.params;
    const seekerId = doc_ref.substr(0, 10);

    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [seekerName, setSeekerName] = useState("");
    const flatListRef = useRef();

    useEffect(() => {
        const chatroomCollectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
        const chatroomDocRef = doc(chatroomCollectionRef, doc_ref);
        let unsubscribeChatroom;
        try {
            unsubscribeChatroom = onSnapshot(chatroomDocRef, (doc) => {
                setMessages([]);
                if (doc.exists()) {
                    const { seekerName, msgsList } = doc.data();
                    setMessages(msgsList);
                    setSeekerName(seekerName);
                }
            }, (error) => {
                console.error(error.message);
            }
        );
        } catch(e) {
            console.error(e.message || "Error on listening to doc");
        } finally {
            setLoading(false);
        }
        return () => unsubscribeChatroom();
    }, []);
    
    useEffect(() => {
        const chatroomCollectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
        const chatroomDocRef = doc(chatroomCollectionRef, doc_ref);
        const seekerDocRef = doc(FIRESTORE_DB, "Seeker", seekerId);
        const volunteerDocRef = doc(FIRESTORE_DB, "Volunteer", seekerId);
        const updateLastReadMsg = async () => {
            try {
                await runTransaction(FIRESTORE_DB, async (transaction) => {
                    const chatroomDoc = await transaction.get(chatroomDocRef);
                    const msgsListLength = chatroomDoc.data().msgsList.length - 1;
                    let seekerDoc = await transaction.get(seekerDocRef);
                    if (!seekerDoc.exists()) {
                        seekerDoc = await transaction.get(volunteerDocRef);
                    }
                    const seekerName = seekerDoc.data().name;
                    transaction.update(chatroomDocRef, {
                        lastReadMsgIdxByAdmin: msgsListLength,
                        seekerName: seekerName, });
                });
            } catch(e) {
                console.error(e);
            }
        }
        updateLastReadMsg();
    }, []);

    useEffect(() => {
        // Scroll to the bottom whenever messages update
        if (flatListRef.current && messages?.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);
    
    if (loading) {
        return (
            <View style={style.loading_text}>
                <Text style={{ fontSize: 16}}>
                    Loading...
                </Text>
            </View>
        );
    }
    
    return (
        <View style={style.container}>
            <Header name={seekerName} doc_ref={doc_ref} navigator={navigator}/>
            <FlatList 
            style={style.messageList}
            ref={flatListRef}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                data={messages}
                renderItem={({ item }) =>
                    <TouchableOpacity>
                        <Message msg={item} />
                    </TouchableOpacity>}
                keyExtractor={item => item.msgTime.seconds.toString() +
                    item.msgTime.nanoseconds.toString()}
            />
            <Footer message={inputMessage} setMessage={setInputMessage} doc_ref={doc_ref}/>
        </View>
    );
}

const Message = ({ msg }) => {
    const NOW = new Date();
    const msgDate = msg.msgTime.toDate();
    let date = "";
    if (NOW.getDate() === msgDate.getDate() && NOW.getMonth() === msgDate.getMonth()
        && NOW.getFullYear() === msgDate.getFullYear()) {
            date = msgDate.toLocaleTimeString('en-GB', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
    } else {
        date = msg.msgTime.toDate().toDateString();
    }
    
    if (msg.sentBySeeker) {
        return (
            <View style={{ paddingBottom: 10, alignSelf: 'flex-start' }}>
                <View style={{ flexDirection: 'row', width: "80%", flexWrap: 'wrap' }}>
                    <Text style={style.messageBySeeker}>
                        {msg.msgContent}
                    </Text>
                    <Text style={{ color: 'black', fontSize: 12, paddingLeft: 10 }}>
                        {date}
                    </Text>
                </View>
            </View>
        );
    } else {
        return (
            <View style={{ paddingBottom: 10, alignSelf: 'flex-end' }}>
                <View style={{ flexDirection: 'row', width: "80%", flexWrap: 'wrap' }}>
                    <Text style={{ color: 'black', fontSize: 12, paddingRight: 10 }}>
                        {date}
                    </Text>
                    <Text style={style.messageByAdmin}>
                        {msg.msgContent}
                    </Text>
                </View>
            </View>
        );
    }

}

const Header = ({ name, doc_ref, navigator}) => {
    return (
        <View style={style.header}>
            <Text style={style.header_text}>
                {name}
            </Text>
            <TouchableOpacity
                onPress={() => deleteDatabase(doc_ref, navigator)}>
                <Image
                    source={delete_icon}
                />
            </TouchableOpacity>
        </View>
    );
}

const Footer = ({ message, setMessage, doc_ref }) => {
    return (
        <View style={style.footer}>
            <TextInput
                style={style.input_box}
                onChangeText={setMessage}
                value={message}
                placeholder="Type a message"
                multiline
            />
            <TouchableOpacity
                onPress={() => addMessageToDatabase(message, setMessage, doc_ref)}>
                <Image
                    source={send_icon}
                />
            </TouchableOpacity>
        </View>
    );
}

const deleteDatabase = async (doc_ref, navigator) => {
    const collectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
    const docRef = doc(collectionRef, doc_ref);
    try {
        await deleteDoc(docRef);
    } catch (e) {
        console.error(e.message || "Couldn't connect to firebase");
    } finally {
        Alert.alert('', 'Chat deleted!', [
            {
              text: 'OK',
              onPress: () => navigator.goBack(),
            },
          ]);
    }
}

const addMessageToDatabase = async (message, setMessage, doc_ref) => {
    if (message == "") {
        return;
    }
    const NOW = new Date();
    const newMsg = {
        msgContent: message,
        msgTime: Timestamp.fromDate(NOW),
        sentBySeeker: false,
    };
    const collectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
    const docRef = doc(collectionRef, doc_ref);
    try {
        await updateDoc(docRef, {
            msgsList: arrayUnion(newMsg),
            lastMsg: message,
            lastMsgTime: Timestamp.fromDate(NOW),
            lastReadMsgIdxByAdmin: increment(1),
        });
    } catch (e) {
        console.error(e.message || "Couldn't connect to firebase");
    }
    setMessage("");
}

const style = StyleSheet.create({
    loading_text: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    header: {
        width: "100%",
        height: 70,
        backgroundColor: "white",
        borderBottomColor: 'black',
        borderBottomWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: COLOURS.gray2,
        borderBottomColor: 'black',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    footer: {
        width: "100%",
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    header_text: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    input_box: {
        backgroundColor: 'white',
        width: "85%",
        height: "100%",
        fontSize: 18,
        borderRadius: 15,
        paddingLeft: 10,
    },
    messageList: {
        width: "100%",
        backgroundColor: '#F8F8FF',
        flexDirection: 'column',
        padding: 10,
        paddingRight: 10,
    },
    messageBySeeker: {
        padding: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#4E8EF5',
        color: 'white',
        borderRadius: 10,
        fontSize: 16,
    },
    messageByAdmin: {
        padding: 10,
        alignSelf: 'flex-end',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 10,
        fontSize: 16,
        flexShrink: 1,
    },
})

export default AdminSwarojgarChatInterface;