import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';


const MessageAdmin = (props) => {
  const { infraName, lastMessage, unreadMessage, lastMessageTime, id, type } = props;
  //console.log("props-d "+props.id);
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={()=>navigation.navigate("admin-chatinterface",{doc_ref: id, type: type})}>
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.infraName}>{infraName}</Text>
        <View style={{paddingTop: 5}}>
          <Text style={styles.lastMessage}>
            {lastMessage}
            </Text>
        </View>
      </View>
    <View style={styles.statusContainer}>
      {unreadMessage > 0 && (
        <View style={styles.unreadMessageCircle}>
          <Text style={styles.unreadMessageText}>{unreadMessage}</Text>
        </View>
      )}
      <Text style={styles.lastMessageTime}>{lastMessageTime}</Text>
    </View>
  </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 10,
    flexShrink: 1,
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  infraName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  lastMessage: {
    color: '#555',
    fontSize: 14,
  },
  unreadMessageCircle: {
    backgroundColor: 'dodgerblue',
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  unreadMessageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessageTime: {
    color: '#aaa',
    fontSize: 12,
  },

});

export default MessageAdmin;