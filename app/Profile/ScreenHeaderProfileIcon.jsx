import { Image, TouchableOpacity,Text } from "react-native"
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const ScreenHeaderProfileIcon=() =>{
    const navigation =useNavigation()
    return(
        <TouchableOpacity style={{marginHorizontal:"2%", paddingVertical:"2%"}} onPress={() => navigation.navigate('profile')}>
           <MaterialIcons name="account-circle" size={45} color="black" />
        </TouchableOpacity>
    )
}

export default ScreenHeaderProfileIcon;