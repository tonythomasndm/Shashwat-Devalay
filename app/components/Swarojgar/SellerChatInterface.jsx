import React, { useContext, useEffect, useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";
import { COLOURS } from "../../styles/index";
import send_icon from "../../../assets/send_icon.png"
import { collection, doc, getDoc, Timestamp, onSnapshot, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import AppContext from "../../../AppContext";

const SellerChatInterface = () => {
    const { seekerId, volunteerId, infraId, mode } = useContext(AppContext);
    let sellerId;
    if (mode === "Seeker") {
        sellerId = seekerId;
    }
    else {
        sellerId = volunteerId;
    }
    const chatroomId = sellerId + infraId;
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [hasShop, setHasShop] = useState(true);
    const flatListRef = useRef();

    useEffect(() => {
        console.log('chatroom Id - ', chatroomId);
        const chatroomCollectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
        const shopCollectionRef = collection(FIRESTORE_DB, 'Shops');
        const chatroomDocRef = doc(chatroomCollectionRef, chatroomId);
        const shopDocRef = doc(shopCollectionRef, sellerId);
        let unsubscribe;
        try {
            unsubscribe = onSnapshot(chatroomDocRef, async (doc) => {
                const shopDoc = await getDoc(shopDocRef);
                setMessages([]);
                if (doc.exists()) {
                    const { msgsList } = doc.data();
                    setMessages(msgsList);
                } else if (shopDoc.exists()) {
                    setMessages([]);
                } else {
                    setHasShop(false);
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

    if (hasShop === false) {
        return (
        <Text style={style.msgText}>
            Create a shop to chat with Admin
        </Text>
        );
    } else {
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
                sellerId={sellerId} infraId={infraId} mode={mode}/>
        </View>
        );
    }
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

const Footer = ({ message, setMessage, sellerId, infraId, mode }) => {
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
                onPress={() => addMessageToDatabase(message, setMessage, sellerId, infraId, mode)}>
                <Image
                    source={send_icon}
                />
            </TouchableOpacity>
        </View>
    );
}

const addMessageToDatabase = async (message, setMessage, sellerId, infraId, mode) => {
    if (message == "") {
        return;
    }
    const chatroomId = sellerId + infraId;
    const NOW = new Date();
    const newMsg = {
        msgContent: message,
        msgTime: Timestamp.fromDate(NOW),
        sentBySeeker: true,
    };
    const chatroomCollectionRef = collection(FIRESTORE_DB, `SwarojgarChatRoom`);
    const chatroomDocRef = doc(chatroomCollectionRef, chatroomId);
    const sellerCollectionRef = collection(FIRESTORE_DB, mode);
    const sellerDocRef = doc(sellerCollectionRef, sellerId);
    const infraCollectionRef = collection(FIRESTORE_DB, "Infrastructure");
    const infraDocRef = doc(infraCollectionRef, infraId);
    try {
        const chatroomDoc = await getDoc(chatroomDocRef);
        const customerDoc = await getDoc(sellerDocRef);
        const customerName = customerDoc.data().name;
        if (chatroomDoc.exists()) {
            await updateDoc(chatroomDocRef, {
                msgsList: arrayUnion(newMsg),
                lastMsg: message,
                lastMsgTime: Timestamp.fromDate(NOW),
            });
        } else {
            console.error('Shop added but chatroom not added!');
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
    msgText: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
        fontSize: 30,
        paddingTop: 100,
        padding: 50,
      },
})

export default SellerChatInterface;