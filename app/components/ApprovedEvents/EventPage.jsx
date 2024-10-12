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
import { EventCreateAndEdit} from "../EventCreateEditAndSuggest";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import {
  onSnapshot,
  getDoc,
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

  if (useCase === "suggestion") {
    return (
      <View>
        <EventCreateAndEdit
          type={type}
          useCase={useCase} 
          eventRef={eventRef}
        />
      </View>
    );
  }
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
  <ScrollView>
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: "20%", paddingHorizontal: SIZES.small }}>
        
        {/* Title and Description */}
        <Text style={[styles.header(SIZES.xxLarge), styles.boldText, styles.leftText]}>{item.title}</Text>
        <Text style={[styles.text(SIZES.medium, COLOURS.gray), styles.description]}>{item.description}</Text>

        {/* Date and Time */}
        <Text style={[styles.header(SIZES.large), styles.boldText]}>Date</Text>
        <Text style={[styles.text(SIZES.medium, COLOURS.gray)]}>
          {`${dateDisplay(item.startDate, options)} to ${dateDisplay(item.endDate, options)}`}
        </Text>

        {/* Time Slots */}
        <Text style={[styles.header(SIZES.large), styles.boldText]}>Time Slots</Text>
        {item.timeSlots.map((timeSlot, index) => (
          <Text key={index} style={[styles.text(SIZES.medium, COLOURS.gray), styles.timeSlot]}>
            {`${timeDisplay(timeSlot.startTime)} to ${timeDisplay(timeSlot.endTime)}`}
          </Text>
        ))}

        {/* Venue */}
        <Text style={[styles.header(SIZES.large), styles.boldText]}>Venue</Text>
        <Text style={[styles.text(SIZES.medium, COLOURS.gray)]}>{item.venue}</Text>

        {/* Volunteer Section for Admin */}
        {mode !== "Seeker" && (
          <View>
            <Text style={[styles.header(SIZES.large), styles.boldText]}>Volunteer Roles Left</Text>
            {Object.entries(item.volunteerRoles).map(([role, count], index) => (
              count > 0 && (
                <Text key={index} style={[styles.text(SIZES.large, COLOURS.primary), styles.boldText]}>
                  {`${role} : ${count}`}
                </Text>
              )
            ))}
          </View>
        )}

        {/* Registration Deadline */}
        <Text style={[styles.header(SIZES.large), styles.boldText]}>Registration Deadline</Text>
        <Text style={[styles.text(SIZES.medium, COLOURS.gray), styles.boldText]}>{dateDisplay(item.registrationDeadline, optionsRegistrationDeadline)}</Text>
        <Text style={[styles.text(SIZES.medium, COLOURS.red), styles.boldText, styles.marginTop10]}>{timeLeft}</Text>

        {/* Registration Section for Seeker */}
        {timeLeft !== "Registration deadline has passed" && mode !== "Volunteer" && (
          seekerEstimate > 10 ? (
            <Text style={[styles.text(SIZES.medium, COLOURS.green), styles.boldText, styles.marginTop10]}>{seekerEstimate} spots left !!!</Text>
          ) : (
            <Text style={[styles.text(SIZES.medium, COLOURS.red), styles.boldText, styles.marginTop10]}>{seekerEstimate} spots left</Text>
          )
        )}

        {/* Action Buttons for Seeker */}
        {mode === "Seeker" && (
          <View>
            {timeLeft !== "Registration deadline has passed" ? (
              !hasSeekerRegistered(seekersRegistered, seekerId) ? (
                seekerEstimate > 0 ? (
                  <TouchableOpacity style={[styles.button(COLOURS.primary, "60%")]} onPress={registerForEvent}>
                    <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Register</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.text("center", SIZES.large, COLOURS.red), styles.boldText]}>No spots left</Text>
                )
              ) : (
                <TouchableOpacity style={[styles.button(COLOURS.black, "60%")]} onPress={withdrawFromEvent}>
                  <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Withdraw</Text>
                </TouchableOpacity>
              )
            ) : (
              hasSeekerRegistered(seekersRegistered, seekerId) ? (
                <Text style={[styles.text("center", SIZES.large, COLOURS.primary), styles.boldText]}>You have registered for this event</Text>
              ) : (
                <Text style={[styles.text("center", SIZES.large, COLOURS.red), styles.boldText]}>You have not registered for this event</Text>
              )
            )}
          </View>
        )}

        {/* Admin Controls */}
        {mode === "Admin" && !editMode && (
          <View>
            <TouchableOpacity style={[styles.button(COLOURS.primary, "60%")]} onPress={() => setEditMode(true)}>
              <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Edit the details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button(COLOURS.red, "60%")]} onPress={deleteEvent}>
              <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Delete the event</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Volunteer Section */}
        {mode === "Volunteer" && (
          <View>
            <Text style={[styles.header(SIZES.large), styles.boldText]}>Your Application Status</Text>
            <Text style={[styles.text(SIZES.medium, COLOURS.primary), styles.boldText]}>
              {applicationStatus(volunteersRegistered, volunteersApplications, volunteersRejected, volunteerId)}
            </Text>

            {/* Apply/Withdraw Volunteer */}
            {timeLeft !== "Registration deadline has passed" && !hasRegistered(volunteersRegistered, volunteerId) && !hasRejected(volunteersRejected, volunteerId) && (
              !hasApplied(volunteersApplications, volunteerId) ? (
                <View>
                  {selectVolunteerRoleMode ? (
                    <>
                      <View style={[styles.event_card]}>
                        <Picker selectedValue={selectedVolunteerRole} onValueChange={(itemValue) => setSelectedVolunteerRole(itemValue)}>
                          {Object.entries(item.volunteerRoles).map(([role, count]) => (
                            count > 0 && (
                              <Picker.Item key={role} label={role} value={role} />
                            )
                          ))}
                        </Picker>
                      </View>
                      <TouchableOpacity style={[styles.button(COLOURS.primary, "60%")]} onPress={applyForRole}>
                        <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Apply for role</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={[styles.button(COLOURS.primary, "60%")]} onPress={selectRole}>
                      <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Choose a role</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                !volunteersRejected[volunteerId] ? (
                  <View>
                    <TouchableOpacity style={[styles.button(COLOURS.gray, "80%")]} onPress={withdrawApplication}>
                      <Text style={[styles.text("center", SIZES.large, COLOURS.white)]}>Withdraw from the role</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.text("center", SIZES.large, COLOURS.primary), styles.boldText]}>
                      Rejected for {item.volunteersRejected[volunteerId]}
                    </Text>
                  </View>
                )
              )
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  </ScrollView>
);
}

export default EventPage ;
