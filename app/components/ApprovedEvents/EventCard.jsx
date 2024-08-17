import { Text, View, TouchableOpacity } from "react-native";
import { COLOURS, SIZES, styles } from "../../styles/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvilIcons } from "@expo/vector-icons";

const EventCard = ({ item, handlePress }) => {
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric"
  };
  
  const optionsRegistrationDeadline = {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Use 12-hour format (AM/PM)
  };
  const currentDate = new Date();

  const areRegistrationsClosed = (date) => {
    const registrationDeadline = date.toDate();
    return registrationDeadline < currentDate;
  };

  return (
<TouchableOpacity
  style={[
    styles.event_card,
    {
      borderColor: 
        item.type === 'Seva' ? 'orange' :
        item.type === 'Shiksha' ? 'green' :
        item.type === 'Sanskar' ? 'violet' :
        item.type === 'Swarogjar' ? 'blue' : 'defaultColor', // fallback color
      borderWidth: 3, // you can adjust the border width as needed
    }
  ]}
  onPress={() => handlePress(item)}
>
  <View
    style={{
      display: "flex",
      alignContent: "center",
      justifyContent: "center",
      paddingVertical: SIZES.small,
      paddingEnd: SIZES.small,
    }}
  >
    <Text style={{ fontSize: SIZES.medium, fontWeight: 600 }}>
      {item.startDate
        ? item.startDate.toDate().toLocaleDateString("en-GB", options) +
          "-" +
          item.endDate.toDate().toLocaleDateString("en-GB", options)
        : "Null"}
    </Text>
  </View>
  <View style={{ paddingStart: SIZES.small }}>
    <Text style={{ fontSize: SIZES.large, fontWeight: 600 }}>
      {item.title}
    </Text>
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <EvilIcons name='location' size={30} height={30} color='black' />
      <Text style={styles.text_component(SIZES.medium)}>{item.venue}</Text>
    </View>
    {areRegistrationsClosed(item.registrationDeadline) ? (
      <Text style={[styles.error_text(SIZES.medium), { color: "red" }]}>
        Registrations Closed
      </Text>
    ) : (
      <Text style={[styles.error_text(SIZES.medium)]}>
        Registrations closes by {item.registrationDeadline
          .toDate()
          .toLocaleDateString("en-GB", optionsRegistrationDeadline)}{" "}
        !!!
      </Text>
    )}
    <Text style={{ color: COLOURS.primary, fontWeight: 500 }}>
      {item.seekerEstimate} Spots Left!!!
    </Text>
  </View>
</TouchableOpacity>

  );
};

export default EventCard;
