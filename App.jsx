import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { COLOURS} from './app/styles';
import AppContext from './AppContext';
import { Welcome,Login,Signup } from './app/Authentication';
import { AdminChatInterface, SeekerChatInterface } from './app/components/EventProposals';
import { AdminSwarojgarChatInterface } from './app/components/Swarojgar';
import { ProfileScreen, ScreenHeaderProfileIcon } from './app/Profile';
import { Home } from './app/home';
import { EventPage } from './app/components/ApprovedEvents';
import AcceptVolunteerRequest from './app/Admin/Seva/AcceptVolunteerRequest';
import { ShopHomepage,ProductPage } from './app/components/Swarojgar';

const Stack = createNativeStackNavigator();

const shashwatDevalayInHindi = '\u0936\u093E\u0936\u094D\u0935\u0924 \u0926\u0947\u0935\u093E\u0932\u092F';

const App = () => {
	const [adminId, setAdminId] = useState("");
	const [volunteerId, setVolunteerId] = useState("");
	const [seekerId, setSeekerId] = useState("");
	const [infraId, setInfraId] = useState("");
	const [location, setLocation] = useState(null);
	const [mode, setMode] = useState("");
	const [shopExists, setShopExists] = useState(false);
	return (
		<AppContext.Provider value={{adminId,setAdminId,volunteerId,setVolunteerId,seekerId,setSeekerId, infraId, setInfraId, mode,setMode,location,setLocation, shopExists, setShopExists}}>
			<NavigationContainer>
				<Stack.Navigator initialRouteName='welcome'>
					<Stack.Group screenOptions={{
						headerStyle:{ backgroundColor: COLOURS.lightWhite
						},
						headerShadowVisible:false,
						headerTitle:shashwatDevalayInHindi}}>
						<Stack.Screen name="welcome" component={Welcome} />
						<Stack.Screen name="login" component={Login}/>
						<Stack.Screen name="signup" component={Signup}/>
						<Stack.Screen name="profile" component={ProfileScreen}/>
						</Stack.Group>
						<Stack.Group screenOptions={{
						headerStyle:{ backgroundColor: COLOURS.lightWhite
						},
						headerShadowVisible:false,
						headerRight: ()=>(<ScreenHeaderProfileIcon/>),
						headerTitle:shashwatDevalayInHindi}}>
						<Stack.Screen name="admin-chatinterface" component={AdminChatInterface}/>
						<Stack.Screen name="admin-swarojgar-chatinterface" component={AdminSwarojgarChatInterface}/>
						<Stack.Screen name="seeker-chatinterface" component={SeekerChatInterface}/>
						<Stack.Screen name="acceptvolunteerrequest" component={AcceptVolunteerRequest}/>
						<Stack.Screen name="ShopHomePage" component={ShopHomepage}/>
						<Stack.Screen name="ProductPage" component={ProductPage}/>
					</Stack.Group>
					<Stack.Group screenOptions={{
						headerStyle:{ backgroundColor: COLOURS.lightWhite
						},
						headerTitleStyle: {
							fontWeight: 'bold',
						},
						headerShadowVisible:false,
						headerRight: ()=>(<ScreenHeaderProfileIcon/>),
						headerTitle:shashwatDevalayInHindi}}>
						
						<Stack.Screen name="home" component={Home}/>
						<Stack.Screen name="event-page" component={EventPage}/>
					</Stack.Group>
				</Stack.Navigator>
			</NavigationContainer>
		</AppContext.Provider>
	);
}

export default App;