import { Image, TouchableOpacity,Text } from "react-native"
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ScreenHeaderProfileIcon=() =>{
    const navigation =useNavigation()
    return(
        <TouchableOpacity style={{marginHorizontal:20, paddingVertical:"2%"}} onPress={() => navigation.navigate('profile')}>
           <MaterialCommunityIcons name="account-circle-outline" size={45} color="black" />
        </TouchableOpacity>
    )
}

export default ScreenHeaderProfileIcon;