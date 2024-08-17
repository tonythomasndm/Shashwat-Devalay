import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLOURS, SIZES, styles } from "../../styles";
import AppContext from "../../../AppContext";
import { useContext, useState, useEffect } from "react";
import { EventCreateEditAndSuggest } from "../EventCreateEditAndSuggest";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const EventPage = ({ route }) => {
  const { mode, seekerId, volunteerId } = useContext(AppContext);
  const [editMode, setEditMode] = useState(false);
  const { eventRef, type, useCase } = route.params;
  const [timeLeft, setTimeLeft] = useState("");
  const [seekersRegistered, setSeekersRegistered] = useState([]);
  const [seekerEstimate, setSeekerEstimate] = useState(0);
  const [volunteersRegistered, setVolunteersRegistered] = useState({});
  //Volunteers Registered Accepted
  const [volunteersApplications, setVolunteersApplications] = useState({});
  //Volunteers Applications Pending
  const [volunteersRejected, setVolunteersRejected] = useState({});
  //Volunteers Rejected for a role
  const [item, setItem] = useState(null); // New state for event details
  const [loading, setLoading] = useState(true); // State to manage loading indicator
  const [selectVolunteerRoleMode, setSelectVolunteerRoleMode] = useState(false);
  const [selectedVolunteerRole, setSelectedVolunteerRole] = useState(null); // State for selected role
  const navigation = useNavigation();

  // Fetch event details using eventRef
  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventSnapshot = await getDoc(eventRef);
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        setItem(eventData);
        setSeekersRegistered(eventData.seekersRegistered);
        setVolunteersRegistered(eventData.volunteersRegistered || {});
        setVolunteersApplications(eventData.volunteersApplications || {});
        setVolunteersRejected(eventData.volunteersRejected || {});
        setSeekerEstimate(eventData.seekerEstimate);
        setLoading(false);
        calculateTimeLeft(eventData.registrationDeadline);
      }
    };

    fetchEventDetails();

    // Listen for changes in the event document
    const unsubscribe = onSnapshot(eventRef, (doc) => {
      const eventData = doc.data();
      setItem(eventData);
      setSeekersRegistered(eventData.seekersRegistered);
      setVolunteersRegistered(eventData.volunteersRegistered || {});
      setVolunteersApplications(eventData.volunteersApplications || {});
      setVolunteersRejected(eventData.volunteersRejected || {});
      setSeekerEstimate(eventData.seekerEstimate);
      calculateTimeLeft(eventData.registrationDeadline);
    });

    return () => unsubscribe();
  }, [eventRef]);

  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  const optionsRegistrationDeadline = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const timeDisplay = (time) => {
    const millis = time.seconds * 1000;
    const date = new Date(millis);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const dateDisplay = (date, options) => {
    const millis = date.seconds * 1000;
    const dateObj = new Date(millis);
    return dateObj.toLocaleDateString("en-GB", options);
  };

  const calculateTimeLeft = (registrationDeadline) => {
    const now = new Date();
    const deadline = new Date(registrationDeadline.seconds * 1000);
    const diff = deadline - now;

    if (diff <= 0) {
      setTimeLeft("Registration deadline has passed");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let timeLeftStr = "";
    if (days > 0) {
      timeLeftStr += `${days} day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
      timeLeftStr += `${hours} hr${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
      timeLeftStr += `${minutes} minute${minutes > 1 ? "s" : ""} `;
    }

    timeLeftStr += "left";
    setTimeLeft(timeLeftStr);
  };

  useEffect(() => {
    if (item) {
      const interval = setInterval(
        () => calculateTimeLeft(item.registrationDeadline),
        6000
      );
      return () => clearInterval(interval);
    }
  }, [item]);

  const hasSeekerRegistered = (seekersRegistered, seekerId) => {
    return seekersRegistered.includes(seekerId);
  };


  //workhere
  // Function to allow the volunteer to select a role before applying for the event
const selectRole = () => {
  console.log("Selecting role");
  setSelectVolunteerRoleMode(true); // Show the role selection component/modal
};

  const registerForEvent = async () => {
    try {
      await runTransaction(FIRESTORE_DB, async (transaction) => {
        const eventSnapshot = await transaction.get(eventRef);
        if (!eventSnapshot.exists()) {
          throw new Error("Event not found");
        }

        const eventData = eventSnapshot.data();
        if (eventData.seekerEstimate > 0) {
          const updatedSeekersRegistered = [
            ...eventData.seekersRegistered,
            seekerId,
          ];
          const updatedSeekerEstimate = eventData.seekerEstimate - 1;
          transaction.update(eventRef, {
            ...eventData,
            seekersRegistered: updatedSeekersRegistered,
            seekerEstimate: updatedSeekerEstimate,
          });
        } else {
          // No spots left, update local state only
          setSeekersRegistered(eventData.seekersRegistered);
          setSeekerEstimate(eventData.seekerEstimate);
        }
      });
    } catch (error) {
      console.error(`Error registering for event:`, error);
    }
  };

  // Function to check if volunteer has applied for the event
const hasApplied = (volunteersApplications, volunteerId) => {
  return volunteersApplications && volunteersApplications[volunteerId];
};

const hasRejected = (volunteersRejected, volunteerId) => {
  return volunteersRejected && volunteersRejected[volunteerId];
};
const hasRegistered = (volunteersRegistered, volunteerId) => {
  return volunteersRegistered && volunteersRegistered[volunteerId];
};

  const withdrawFromEvent = async () => {
    try {
      await runTransaction(FIRESTORE_DB, async (transaction) => {
        const eventSnapshot = await transaction.get(eventRef);
        if (!eventSnapshot.exists()) {
          throw new Error("Event not found");
        }

        const eventData = eventSnapshot.data();
        const updatedSeekersRegistered = eventData.seekersRegistered.filter(
          (id) => id !== seekerId
        );
        const updatedSeekerEstimate = eventData.seekerEstimate + 1;
        transaction.update(eventRef, {
          seekersRegistered: updatedSeekersRegistered,
          seekerEstimate: updatedSeekerEstimate,
        });
      });
    } catch (error) {
      console.error(`Error withdrawing from event:`, error);
    }
  };

  useEffect(() => {
  if (volunteersApplications[volunteerId]) {
    setSelectedVolunteerRole(volunteersApplications[volunteerId]);
  }
}, [volunteersApplications, volunteerId]);

  const deleteEvent = async () => {
    try {
      // Navigate to home before deleting the document
      navigation.navigate("home");
      // Delay to ensure navigation completes before deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await deleteDoc(eventRef);
    } catch (error) {
      console.error(`Error deleting event:`, error);
    }
  };

  const deleteSuggestion = async () => {
    try {
      // Navigate to home before deleting the document
      navigation.navigate("home");
      // Delay to ensure navigation completes before deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await deleteDoc(eventRef);
    } catch (error) {
      console.error(`Error deleting Volunteer suggestion:`, error);
    }
  };

  const acceptSuggestion = async () => {
    try {
      const docsRef = collection(
        FIRESTORE_DB,
        type === "Seva"
          ? "SevaEvents"
          : type === "Shiksha"
          ? "ShikshaEvents"
          : "SanskarEvents"
      );
      await addDoc(docsRef, {
        title: item.title,
        infraId: item.infraId,
        description: item.description,
        seekerEstimate: item.seekerEstimate,
        venue: item.venue,
        volunteerRoles: item.volunteerRoles,
        startDate: item.startDate,
        endDate: item.endDate,
        registrationDeadline: item.registrationDeadline,
        timeSlots: item.timeSlots,
        seekersRegistered: item.seekersRegistered,
        volunteersRegistered: item.volunteersRegistered || {},
        volunteersApplications: item.volunteersApplications || {},
        volunteersRejected: item.volunteersRejected || {},
      });
      Alert.alert(
        "Success",
        "Volunteer suggestion has been accepted."
      );
      deleteSuggestion();
    } catch (error) {
      console.error(`Error accepting Volunteer suggestion:`, error);
    }
  };
  //workhere
  const applyForRole = async () => {
  if (!selectedVolunteerRole) {
    Alert.alert("Error", "Please select a role before applying.");
    return;
  }

  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      if (!eventSnapshot.exists()) {
        throw new Error("Event not found");
      }

      const eventData = eventSnapshot.data();
      const applications = eventData.volunteersApplications || {};
      const volunteerRoles = { ...eventData.volunteerRoles }; // Make a copy of volunteerRoles

      if (applications[volunteerId]) {
        throw new Error("You have already applied for a role.");
      }

      applications[volunteerId] = selectedVolunteerRole;

      // Deduct count for the selected role
      // if (volunteerRoles[selectedVolunteerRole] && parseInt(volunteerRoles[selectedVolunteerRole]) > 0) {
      //   volunteerRoles[selectedVolunteerRole] = (parseInt(volunteerRoles[selectedVolunteerRole]) - 1).toString(); // Deduct count by 1
      // } else {
      //   throw new Error("No spots left for the selected role.");
      // }

      transaction.update(eventRef, {
        volunteersApplications: applications,
        volunteerRoles: volunteerRoles, // Update volunteerRoles in Firestore
      });
    });

    Alert.alert("Success", "You have successfully applied for this role.");
    setSelectVolunteerRoleMode(false); // Hide the role selection
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};


  //workhere
  const withdrawApplication = async () => {
  try {
    await runTransaction(FIRESTORE_DB, async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      if (!eventSnapshot.exists()) {
        throw new Error("Event not found");
      }

      const eventData = eventSnapshot.data();
      const applications = eventData.volunteersApplications || {};
      const volunteerRoles = { ...eventData.volunteerRoles }; // Make a copy of volunteerRoles

      if (!applications[volunteerId]) {
        throw new Error("You have not applied for any role.");
      }

      // Increase count for the withdrawn role
      const withdrawnRole = applications[volunteerId];
      volunteerRoles[withdrawnRole] = (parseInt(volunteerRoles[withdrawnRole]) + 1).toString(); // Increase count by 1

      delete applications[volunteerId];

      transaction.update(eventRef, {
        volunteersApplications: applications,
        volunteerRoles: volunteerRoles, // Update volunteerRoles in Firestore
      });
    });
    Alert.alert(
      "Success",
      "You have successfully withdrawn your application for this role."
    );
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLOURS.blue} />
      </View>
    );
  }
  // Function to determine application status
const applicationStatus = (volunteersRegistered, volunteersApplications, volunteersRejected, volunteerId) => {
  if (volunteersRegistered && volunteersRegistered[volunteerId]) {
    return "Registered for role "+volunteersRegistered[volunteerId];
  } else if (volunteersApplications && volunteersApplications[volunteerId]) {
    return "Application Pending for role "+volunteersApplications[volunteerId];
  } else if (volunteersRejected && volunteersRejected[volunteerId]) {
    return "Rejected for " + volunteersRejected[volunteerId];
  } else {
    return "Not applied for any role";
  }
};


 return (
    <View>
        {editMode ? (
          <EventCreateEditAndSuggest type={type} eventDetails={item} setEditMode={setEditMode} useCase={useCase} eventRef={eventRef}/>
        ) : (
          <ScrollView>
      <SafeAreaView style={styles.container}>
          <View style={{ marginBottom: "20%", paddingHorizontal: SIZES.small }}>
            <Text style={[styles.header(SIZES.xxLarge), { textAlign: "left", fontWeight: "bold", lineSpacing: "15%", padding: 0, margin: 0 }]}>
              {item.title}
            </Text>
            <Text style={[styles.text("left", SIZES.medium, COLOURS.gray), { lineHeight: SIZES.medium * 2, padding: 0, margin: 0, paddingTop: "3%", minWidth: "100%"}]}>
              {item.description}
            </Text>

            <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingVertical: "5%"}]}>Date</Text>
            <Text style={[styles.text("left", SIZES.medium, COLOURS.gray), { lineSpacing: "15%", padding: 0, margin: 0 }]}>
              {dateDisplay(item.startDate, options) + " to " + dateDisplay(item.endDate, options)}
            </Text>
            <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingVertical: "5%" }]}>Time Slots</Text>
            {item.timeSlots.map((timeSlot, index) => (
  <Text
    key={index}
    style={[
      styles.text("left", SIZES.medium, COLOURS.gray),
      {
        minWidth: "80%",
        lineHeight: SIZES.medium * 1.5, // Adjusts line spacing
        padding: "5%",
        borderBottomWidth: index !== item.timeSlots.length - 1 ? 2 : 0, // Remove border for the last item
        borderColor: COLOURS.gray2,
        margin: 0,
      }
    ]}
  >
    {timeDisplay(timeSlot.startTime) + " to " + timeDisplay(timeSlot.endTime)}
  </Text>
))}


            <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingVertical: "5%" }]}>Venue</Text>
            <Text style={[styles.text("left", SIZES.medium, COLOURS.gray), { lineSpacing: "15%", padding: 0, margin: 0 }]}>{item.venue}</Text>
            {mode !== "Seeker" && (
              <View>
                <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingTop:"5%",paddingBottom: "1%" }]}>
                  Volunteer Roles left
                </Text>
                {Object.entries(item.volunteerRoles).map(([role, count], index) => (
                  count > 0 && (
                    <Text key={index} style={[styles.text("left", SIZES.large, COLOURS.primary), { lineHeight: SIZES.medium * 2,fontWeight:"bold", padding: 0, margin: 0, paddingTop: "1%" }]}>
                      {`${role} : ${count}`}
                    </Text>
                  )
                ))}
              </View>
            )}
            <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingVertical: "5%" }]}>Registration Deadline</Text>
            <Text style={[styles.text("left", SIZES.medium, COLOURS.gray), { lineSpacing: "15%", fontWeight: "bold", padding: 0, margin: 0 }]}>{dateDisplay(item.registrationDeadline, optionsRegistrationDeadline)}</Text>
            <Text style={[styles.text("left", SIZES.medium, COLOURS.red), { lineSpacing: "15%", fontWeight: "bold", padding: 0, margin: 0, marginTop: 10 }]}>{timeLeft}</Text>

            {timeLeft !== "Registration deadline has passed" && mode!=="Volunteer" &&  (
              seekerEstimate > 10 ? (
                <Text style={[styles.text("left", SIZES.medium, COLOURS.green), { lineSpacing: "15%", fontWeight: "bold", padding: 0, margin: 0, marginTop: 10 }]}>{seekerEstimate} spots left !!!</Text>
              ) : (
                <Text style={[styles.text("left", SIZES.medium, COLOURS.red), { lineSpacing: "15%", fontWeight: "bold", padding: 0, margin: 0, marginTop: 10 }]}>{seekerEstimate} spots left</Text>
              )
            )}
<View style={{padding:"3%"}}/> 
            {mode === "Seeker" && 
                (timeLeft !== "Registration deadline has passed" ?   (
                    !hasSeekerRegistered(seekersRegistered, seekerId) ? (
                      seekerEstimate > 0 ? (
                    <TouchableOpacity
                      style={[styles.button(COLOURS.primary,"80%")]}
                      onPress={registerForEvent}
                    >
                      <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                        Register
                      </Text>
                    </TouchableOpacity>
                    ):(
                      <View style={styles.button(COLOURS.black,"80%")}>
                      <Text style={[styles.text("center", SIZES.large, COLOURS.white)]} >No spots left</Text></View>
                    )
                    ):(
                      <TouchableOpacity
                      style={[styles.button(COLOURS.black,"80%")]}
                      onPress={ withdrawFromEvent}
                    >
                      <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                        Withdraw
                      </Text>
                    </TouchableOpacity>
                    ) 
                  ):(
                    hasSeekerRegistered(seekersRegistered, seekerId) ? (
                      <Text style={[styles.text("center", SIZES.large, COLOURS.primary),{fontWeight:"bold"}]}>You have registered for this event</Text>
                    )
                    :(
                     
                      <Text style={[styles.text("center", SIZES.large, COLOURS.red),{fontWeight:"bold"}]}>You have not registered for this event</Text>)
                  ))
            }
            {
              mode === "Admin" &&
              (
                useCase === "display" ? (
                  !editMode && (
                              <View>
                                <TouchableOpacity
                                  style={[styles.button(COLOURS.primary,"80%")]}
                                  onPress={() => setEditMode(true)}
                                >
                                  <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                                    Edit the details
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.button(COLOURS.red,"80%")]}
                                  onPress={deleteEvent}
                                >
                                  <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                                    Delete the event
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) 
                            )
              :(

               <View>
                <TouchableOpacity
                 style={[styles.button(COLOURS.primary,"80%"),{marginVertical:"3%",maxWidth:"90%", alignSelf:"center"}]}
                                  onPress={() => setEditMode(true)} >
                                    <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                                    Edit the details
                                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                 style={[styles.button(COLOURS.green,"80%"), {marginVertical:"3%",maxWidth:"90%", alignSelf:"center"}]}
                                  onPress={acceptSuggestion} >
                                    <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                                    Accept Suggestion
                                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                 style={[styles.button(COLOURS.red,"80%"), {marginVertical:"3%",maxWidth:"90%", alignSelf:"center"}]}
                                  onPress={deleteSuggestion} >
                                    <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
                                    Delete Suggestion
                                  </Text>
                </TouchableOpacity>
                </View>
              ))
            }
            {
              mode === "Volunteer" && ( <View>
              <Text style={[styles.header(SIZES.large), { textAlign: "left", fontWeight: 600, lineSpacing: "15%", padding: 0, margin: 0, paddingVertical: "5%" }]}>Your Application Status</Text>
              <Text style={[styles.text("left", SIZES.medium, COLOURS.primary), { lineSpacing: "15%", padding: 0, margin: 0, fontWeight:"bold" }]}>{applicationStatus(volunteersRegistered, volunteersApplications, volunteersRejected, volunteerId)}</Text>
            </View>)
            }
            {/* Above here the code is correct and are not to be changed - you can change the functions applyforevent/ unapplyforevent / selectrole  functions - You need to implement the logic for the volunteer to apply for an event and withdraw from it realtime  */}
            {mode === "Volunteer" &&
            (
  timeLeft !== "Registration deadline has passed" && !hasRegistered(volunteersRegistered,volunteerId) && !hasRejected(volunteersRejected,volunteerId) ? (
    !hasApplied(volunteersApplications, volunteerId)  ? (


      <View>

        {selectVolunteerRoleMode && (<>
  <View style={[styles.event_card]}>
    <Picker 
      selectedValue={selectedVolunteerRole}
      onValueChange={(itemValue, itemIndex) => setSelectedVolunteerRole(itemValue)}
    >
      {/* Display available roles */}
      {Object.entries(item.volunteerRoles).map(([role, count]) => (
        count > 0 && (
          <Picker.Item key={role} label={role} value={role} />
        )
      ))}
    </Picker>
  </View>
  <TouchableOpacity
          style={[styles.button(COLOURS.primary, "80%")]}
          onPress={applyForRole}
        >
          <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
            Apply for role
          </Text>
        </TouchableOpacity>
  </>
)}
        {!selectVolunteerRoleMode && <TouchableOpacity
          style={[styles.button(COLOURS.primary, "80%")]}
          onPress={selectRole}
        >
          <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
            Choose a role
          </Text>
        </TouchableOpacity>}
      </View>
    ) : (
      !volunteersRejected[volunteerId] ? (
      <View>
        <TouchableOpacity
          style={styles.button(COLOURS.gray, "80%")}
          onPress={() => withdrawApplication()}
        >
          <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>
            Withdraw from the role
          </Text>
        </TouchableOpacity>
      </View>):(
        <View>
            <Text style={[styles.text("center", SIZES.large, COLOURS.primary),{fontWeight:"bold"}]}>
              Rejected for {item.volunteersRejected[volunteerId]}
            </Text>
        </View>
      )
    )
  ) : (
    <View>
        <Text style={[styles.text("center", SIZES.large, COLOURS.primary),{fontWeight:"bold"}]}>
          {
            
          }
        </Text>
    </View>
  )
)
}

{/* // Inside the component's JSX where you display roles and allow selection */}


 {/* Below here the code is correct and are not to be changed - you can change the functions applyforevent/ unapplyforevent / selectrole  functions - You need to implement the logic for the volunteer to apply for an event and withdraw from it realtime  */}

          </View>
           </SafeAreaView>
    </ScrollView>
        )}
     </View>
  );
};


export default EventPage ;
