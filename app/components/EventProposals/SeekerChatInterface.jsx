import React, { useContext, useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";
import { COLOURS } from "../../styles/index";
import send_icon from "../../../assets/send_icon.png"
import { collection, doc, getDoc, Timestamp, onSnapshot, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import AppContext from "../../../AppContext";
import Ionicons from '@expo/vector-icons/Ionicons';

const SeekerChatInterface = ({ type }) => {
    const { seekerId, infraId } = useContext(AppContext);
    const chatroomId = seekerId + infraId;
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const flatListRef = useRef();

    useEffect(() => {
        const chatroomCollectionRef = collection(FIRESTORE_DB, `${type}ChatRoom`);
        const chatroomDocRef = doc(chatroomCollectionRef, chatroomId);
        let unsubscribe;
        try {
            unsubscribe = onSnapshot(chatroomDocRef, (doc) => {
                setMessages([]);
                if (doc.exists()) {
                    const { msgsList } = doc.data();
                    setMessages(msgsList);
                }
            }, (error) => {
                console.error(error.message);
            });
        } catch(e) {
            console.error(e.message || "Error on listening to doc");
        } finally {
            setLoading(false);
        }
        return () => unsubscribe();
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
            <Header name="Admin" />
            <FlatList style={style.messageList}
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
            <Footer message={inputMessage} setMessage={setInputMessage} 
                seekerId={seekerId} infraId={infraId} type={type} />
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

    if (!msg.sentBySeeker) {
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

const Header = ({ name }) => {
    return (
        <View style={style.header}>
            <Text style={style.header_text}>
                {name}
            </Text>
        </View>
    );
}

const Footer = ({ message, setMessage, seekerId, infraId, type }) => {
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
                style={
                    {
                        backgroundColor: COLOURS.primary, // Use your primary color as the background
                        
                        borderRadius: 10,
                        alignItems: 'center', // Center the icon horizontally
                        justifyContent: 'center', // Center the icon vertically
                        width: "15%", // Set a fixed width
                        height: 50, // Set a fixed height 

                    }
            }
                onPress={() => addMessageToDatabase(message, setMessage, seekerId, infraId, type)}
                >
                <Ionicons name="send" size={30} color={COLOURS.lightWhite} />
            </TouchableOpacity>
        </View>
    );
}

const addMessageToDatabase = async (message, setMessage, seekerId, infraId, type) => {
    if (message == "") {
        return;
    }
    const chatroomId = seekerId + infraId;
    const NOW = new Date();
    const newMsg = {
        msgContent: message,
        msgTime: Timestamp.fromDate(NOW),
        sentBySeeker: true,
    };
    const chatroomCollectionRef = collection(FIRESTORE_DB, `${type}ChatRoom`);
    const chatroomDocRef = doc(chatroomCollectionRef, chatroomId);
    const seekerCollectionRef = collection(FIRESTORE_DB, "Seeker");
    const seekerDocRef = doc(seekerCollectionRef, seekerId);
    const infraCollectionRef = collection(FIRESTORE_DB, "Infrastructure");
    const infraDocRef = doc(infraCollectionRef, infraId);
    try {
        const chatroomDoc = await getDoc(chatroomDocRef);
        const seekerDoc = await getDoc(seekerDocRef);
        const infraDoc = await getDoc(infraDocRef);
        const infraName = infraDoc.data().name;
        const seekerName = seekerDoc.data().name;
        if (chatroomDoc.exists()) {
            await updateDoc(chatroomDocRef, {
                msgsList: arrayUnion(newMsg),
                lastMsg: message,
                lastMsgTime: Timestamp.fromDate(NOW),
            });
        } else {
            await setDoc(chatroomDocRef, {
                msgsList: [newMsg],
                lastMsg: message,
                lastMsgTime: Timestamp.fromDate(NOW),
                seeker: seekerDocRef,
                seekerName: seekerName,
                lastReadMsgIdxByAdmin: -1,
                lastReadMsgIdxBySeeker: -1,
                infraName: infraName,
                infraId: infraId,
            });
        }
    } catch (e) {
        console.error("Couldn't connect to firebase");
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
        justifyContent: 'space-between'
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
        flex: 1,
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

export default SeekerChatInterface;