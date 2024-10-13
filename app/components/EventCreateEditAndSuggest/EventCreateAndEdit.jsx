import {
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SIZES, COLOURS, styles } from "../../styles";
import AppContext from "../../../AppContext";
import { useContext, useState, useEffect } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { Services } from "../../styles/constants";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";


function convertTimeStringToTimestamp(timeString, baseDate) {
  let period = timeString.slice(-2).toLowerCase(); // Extract AM/PM
  let timePart = timeString.slice(0, 5); // Extract the time (e.g., "12:34")
  const [hours, minutes] = timePart.split(":").map(Number);

  let adjustedHours = hours;
  if (period === "pm" && adjustedHours !== 12) {
    adjustedHours += 12;
  } else if (period === "am" && adjustedHours === 12) {
    adjustedHours = 0;
  }

  // Use the base date for the event instead of a fixed date
  const date = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    adjustedHours,
    minutes
  );

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  return Timestamp.fromDate(date); // Firestore Timestamp
}


function convertTimestampToTimeString(timestamp) {
  // Get the Date object from the Firestore Timestamp
  const date = timestamp.toDate();

  // Extract hours and minutes from the Date object
  let hours = date.getHours();
  let minutes = date.getMinutes();

  // Convert hours to 12-hour format and determine period (AM/PM)
  let period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

  // Convert hours and minutes to string format with leading zeros if needed
  const hoursString = String(hours).padStart(2, "0");
  const minutesString = String(minutes).padStart(2, "0");

  // Concatenate hours, minutes, and period to form the time string
  const timeString = `${hoursString}:${minutesString} ${period}`;

  return timeString;
}

const EventCreateAndEdit = ({ type, useCase, eventRef, setEditMode, onApprove }) => {
  const { mode, infraId } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [registrationDeadline, setRegistrationDeadline] = useState(null);
  const [seekerEstimate, setSeekerEstimate] = useState(0);
  const [volunteerRoles, setVolunteerRoles] = useState([{ role: "", count: 0 }]);
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ startTime: null, endTime: null }]);
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isRegistrationDeadlineDatePickerVisible, setRegistrationDeadlineDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventRef) {
        try {
          const eventDoc = await getDoc(eventRef);
          if (eventDoc.exists()) {
            const eventDetails = eventDoc.data();
            setTitle(eventDetails.title || "");
            setDescription(eventDetails.description || "");
            setVenue(eventDetails.venue || "");
            setStartDate(eventDetails.startDate ? eventDetails.startDate.toDate() : null);
            setEndDate(eventDetails.endDate ? eventDetails.endDate.toDate() : null);
            setRegistrationDeadline(eventDetails.registrationDeadline ? eventDetails.registrationDeadline.toDate() : null);
            setSeekerEstimate(eventDetails.seekerEstimate || 0);
            setAreaOfInterest(eventDetails.areaOfInterest || "");
            setVolunteerRoles(eventDetails.volunteerRoles ? Object.entries(eventDetails.volunteerRoles).map(([role, count]) => ({ role, count })) : [{ role: "", count: 0 }]);
            setTimeSlots(eventDetails.timeSlots ? eventDetails.timeSlots.map(slot => ({
              startTime: convertTimestampToTimeString(slot.startTime),
              endTime: convertTimestampToTimeString(slot.endTime),
            })) : [{ startTime: null, endTime: null }]);
          }
        } catch (e) {
          setError("Error fetching event details");
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      } else {
        setLoading(false); // No eventRef, set loading to false
      }
    };

    fetchEventDetails();
  }, [eventRef]);

  // Add a loading state check before rendering the main content
  if (loading) {
    return <Text>Loading...</Text>; // You can customize this loading indicator
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

  const handleRoles = (index, key, value) => {
    const updatedRoles = [...volunteerRoles];
    updatedRoles[index][key] = value;
    setVolunteerRoles(updatedRoles);
  };

  const UpdateEvent = async () => {
  const filteredTimeSlots = timeSlots.filter(
    (slot) => slot.startTime != null && slot.endTime != null
  );
  setTimeSlots(filteredTimeSlots);
  const filteredVolunteerRoles = volunteerRoles.filter(
    (item) => item.role !== "" && item.count !== 0
  );
  setVolunteerRoles(filteredVolunteerRoles);

  if (
    title.length === 0 ||
    venue.length === 0 ||
    seekerEstimate === 0 ||
    description.length === 0 ||
    startDate === null ||
    endDate === null ||
    registrationDeadline === null ||
    areaOfInterest.length === 0||
    volunteerRoles.length === 0 ||
    timeSlots.length === 0 ||
    timeSlots.some((slot) => slot.startTime === null || slot.endTime === null)
  ) {
    setError("Incomplete Details! Please check your details again");
    if (filteredVolunteerRoles.length === 0) {
      setVolunteerRoles([{ role: "", count: 0 }]);
    }
    if (filteredTimeSlots.length === 0) {
      setTimeSlots([{ startTime: null, endTime: null }]);
    }
    return;
  }

  try {
    const timeSlotsTimestamps = filteredTimeSlots.map((slot) => ({
      startTime: convertTimeStringToTimestamp(slot.startTime, startDate),
      endTime: convertTimeStringToTimestamp(slot.endTime, startDate),
    }));

    await setDoc(eventRef,{
      title: title,
      description: description,
      seekerEstimate: seekerEstimate,
      venue: venue,
      volunteerRoles: Object.fromEntries(
        filteredVolunteerRoles.map((item) => [item.role, item.count.toString()])
      ),
      startDate: startDate,
      endDate: endDate,
      registrationDeadline: registrationDeadline,
      timeSlots: timeSlotsTimestamps,
      infraId: infraId,
      areaOfInterest: areaOfInterest,
      volunteersRejected:{},
      volunteersRegistered: {},
      seekersRegistered:[],
        ...((mode === "Admin" || mode==="Volunteer") && { type: type } ),
      volunteersApplications: {}
    });

    resetForm();
    Alert.alert("Event Updated", "Event updated successfully");
    setEditMode(false);
  } catch (e) {
    setError(e.message || "An error occurred while updating the event");
  }
};


  const handleTimeSlots = (index, timeType, time) => {
    const updatedTimeSlots = [...timeSlots];
    updatedTimeSlots[index][timeType] = time;
    setTimeSlots(updatedTimeSlots);
  };
  const CancelSuggestion = () =>{
    onApprove();
    navigation.goBack();
  }

  const removeMoreRolesOrTimeSlots = (isVolunteerRolesOrTimeSlots, indexToRemove) => {
    if (isVolunteerRolesOrTimeSlots === "Volunteer Roles") {
      const updatedVolunteerRoles = volunteerRoles.filter(
        (_, index) => index !== indexToRemove
      );
      setVolunteerRoles(updatedVolunteerRoles);
    } else if (isVolunteerRolesOrTimeSlots === "Time Slots") {
      const updatedTimeSlots = timeSlots.filter(
        (_, index) => index !== indexToRemove
      );
      setTimeSlots(updatedTimeSlots);
    }
  };

  const handleDatePickerModalConfirm = (date) => {
    if (isStartDatePickerVisible) {
      setStartDate(date);
      setStartDatePickerVisibility(false);
    } else if (isEndDatePickerVisible) {
      setEndDate(date);
      setEndDatePickerVisibility(false);
    } else if (isRegistrationDeadlineDatePickerVisible) {
      setRegistrationDeadline(date);
      setRegistrationDeadlineDatePickerVisibility(false);
    }
  };
  const handleDatePickerModalCancel = () => {
    setStartDatePickerVisibility(false);
    setEndDatePickerVisibility(false);
    setRegistrationDeadlineDatePickerVisibility(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVenue("");
    setSeekerEstimate(0);
    setStartDate(null);
    setEndDate(null);
    setAreaOfInterest("");
    setRegistrationDeadline(null);
    setVolunteerRoles([{ role: "", count: "" }]);
    setTimeSlots([]);
    setTimeSlots([{ startTime: null, endTime: null }]);
    setError("");
  };

  const CancelEdit = () => {
    setEditMode(false);
  }

  const AddEvent = async () => {
    const filteredTimeSlots = timeSlots.filter(
      (slot) => slot.startTime != null && slot.endTime != null
    );
    setTimeSlots(filteredTimeSlots);
    const filteredVolunteerRoles = volunteerRoles.filter(
      (item) => item.role !== "" && item.count !== 0
    );
    setVolunteerRoles(filteredVolunteerRoles);
    

    if (
      title.length === 0 ||
      venue.length === 0 ||
      seekerEstimate === 0 ||
      description.length === 0 ||
      startDate === null ||
      endDate === null ||
      areaOfInterest.length === 0 ||
      registrationDeadline === null ||
      volunteerRoles.length === 0 ||
      timeSlots.length === 0 || timeSlots.some((slot) => slot.startTime === null || slot.endTime === null) ) {
      setError("Incomplete Details! Please check your details again");
      if (filteredVolunteerRoles.length === 0) {
        setVolunteerRoles([{ role: "", count: 0 }]);
      }
      if (filteredTimeSlots.length === 0) {
        setTimeSlots([{ startTime: null, endTime: null }]);
      }
      return;
    }
    const eventsCollectionRef = collection(
      FIRESTORE_DB,
      type === "Seva"
          ? "SevaEvents"
          : type === "Shiksha"
          ? "ShikshaEvents"
          : "SanskarEvents"
    );

    const eventDocRef = doc(eventsCollectionRef);

    try {
      const timeSlotsTimestamps = filteredTimeSlots.map((slot) => ({
        startTime: convertTimeStringToTimestamp(slot.startTime, startDate),
        endTime: convertTimeStringToTimestamp(slot.endTime, startDate),
      }));
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(registrationDeadline.getTime())) {
        setError("Invalid dates. Please ensure all date fields are correct.");
        return;
      }
      
      

      await setDoc(eventDocRef, {
        title: title,
        description: description,
        seekerEstimate: seekerEstimate,
        venue: venue,
        volunteerRoles: Object.fromEntries(
          filteredVolunteerRoles.map((item) => [item.role, item.count.toString()])
        ),
        startDate: startDate,
        endDate: endDate,
        areaOfInterest:areaOfInterest,
        registrationDeadline: registrationDeadline,
        timeSlots: timeSlotsTimestamps,
        infraId: infraId,
        volunteersRegistered: {},
        seekersRegistered:[],
        ...(mode === "Volunteer" && { type: type } ),
        volunteersApplications: {},
        volunteersRejected: {},
      });
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(registrationDeadline.getTime())) {
  setError("Invalid dates. Please ensure all date fields are correct.");
  return;
}


      resetForm();
      Alert.alert("", "Event added successfully");
      if(useCase==="suggestion"){
      onApprove();
      Alert.alert("Event Approved", "Event suggestion has been approved.");
      navigation.goBack();}
    } catch (e) {
      setError(e.message || "An error occurred while saving the event");
    }
  };




  return (
    <ScrollView>
      <SafeAreaView style={[styles.container,{maxWidth:"100%", alignSelf:"center"}]}>
        <Text style={styles.header(SIZES.xLarge)}>
          Fill in the event details
        </Text>
        <TextInput
          style={[styles.fillBlank(SIZES.large),{margin:SIZES.xLarge}]}
          placeholder='Event Title'
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <TextInput
          style={styles.textboxes}
          placeholder='Event Description'
          value={description}
          multiline={true}
          numberOfLines={3}
          onChangeText={(text) => setDescription(text)}
        />
       
        <Text style={[styles.text("center",SIZES.large,COLOURS.black),{marginTop:"5%"}]}>
            Select Area Of Interest
          </Text>
         <View
            style={{
              borderWidth: 2,
              borderColor: COLOURS.primary,
              borderRadius: 30,
              minWidth:"80%",
              marginBottom:"5%"
            }}
          >
            <RNPickerSelect
              onValueChange={(value) => setAreaOfInterest(value)}
              items={Services[type].map((service) => ({
                label: service,
                value: service,
              }))}
              style={{
                inputIOS: {
                  color: COLOURS.primary, 
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                },
                inputAndroid: {
                  color: COLOURS.primary,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                },
              }}
              placeholder={{ label: "Select Area of Interest", value: null }}
              value={areaOfInterest}
            />
          </View> 
          
        <TextInput
          style={[styles.fillBlank(SIZES.medium),{margin:SIZES.xLarge}]}
          placeholder='Venue'
          value={venue}
          onChangeText={(text) => setVenue(text)}
        />

        <View style={styles.rowContainer}>
          <Text style={styles.text("left",SIZES.large,COLOURS.black)}>
            Seeker Estimate
          </Text>
          <TextInput
            style={[styles.textboxes, { flex: 1, maxWidth:"30%" }]}
            placeholder=''
            keyboardType='numeric'
            value={
              seekerEstimate.toString() === "0" ? "" : seekerEstimate.toString()
            }
            onChangeText={(text) => {
              const intValue = parseInt(text, 10); // Convert text to integer
              if (!isNaN(intValue)) {
                // Ensure it's a valid integer
                setSeekerEstimate(intValue); // Set the seeker estimate as an integer
              } else {
                setSeekerEstimate(0); // Set a default value (e.g., 0) if input is invalid
              }
            }}
          />
        </View>
        <View style={styles.rowContainer}>
        <Text style={styles.text("left",SIZES.large,COLOURS.black)}>
          Start Date
        </Text>
        <TouchableOpacity
          onPress={() => setStartDatePickerVisibility(true)}
          style={[styles.dateTextboxes, { flex: 1, maxWidth: "40%" }]}
          >
          <Text style={styles.text("left",SIZES.medium,COLOURS.black)}>
            {startDate ? startDate.toLocaleDateString("en-GB", options) : ""}
          </Text>
        </TouchableOpacity>
        </View>
         <View style={styles.rowContainer}>
        <Text style={styles.text("left",SIZES.large,COLOURS.black)}>End Date</Text>
        <TouchableOpacity
          onPress={() => setEndDatePickerVisibility(true)}
          style={[styles.dateTextboxes, { flex: 1, maxWidth: "40%" }]}
          >
          <Text style={styles.text("left",SIZES.medium,COLOURS.black)}>
            {endDate ? endDate.toLocaleDateString("en-GB", options) : ""}
          </Text>
        </TouchableOpacity>
        </View>
        <Text style={[styles.text("center",SIZES.large,COLOURS.black),{minWidth:"100%"}]}>
          Select Registration Deadline 
        </Text>
        <TouchableOpacity
          onPress={() => setRegistrationDeadlineDatePickerVisibility(true)}
          style={[styles.dateTextboxes, { flex: 1, maxWidth: "100%" }]}>
          <Text style={styles.text("center",SIZES.large,COLOURS.black)}>
            {registrationDeadline
              ? registrationDeadline.toLocaleDateString("en-GB", optionsRegistrationDeadline)
              : ""}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={
            isStartDatePickerVisible ||
            isEndDatePickerVisible ||
            isRegistrationDeadlineDatePickerVisible
          }
          mode={(isStartDatePickerVisible || isEndDatePickerVisible && 'date') || (isRegistrationDeadlineDatePickerVisible && 'datetime')}
          onConfirm={handleDatePickerModalConfirm}
          onCancel={handleDatePickerModalCancel}
        />
        <Text style={[styles.text("center",SIZES.large,COLOURS.black),{marginTop:"3%"}]}>
          Volunteers Required
        </Text>
        {volunteerRoles.map((volunteerRoleandCount, index) => (
          <View style={styles.rowContainer} key={index}>
            <TextInput
              style={[styles.fillBlank(SIZES.medium), { width: "35%" }]}
              placeholder='Role'
              value={volunteerRoleandCount.role}
              onChangeText={(text) => handleRoles(index, "role", text)}
            />
            <TextInput
              style={[styles.fillBlank(SIZES.medium), { width: "30%" }]}
              placeholder='Count'
              keyboardType='numeric'
              value={volunteerRoleandCount.count}
              onChangeText={(text) => {
                const intValue = parseInt(text, 10); // Convert text to integer
                if (!isNaN(intValue)) {
                  // Ensure it's a valid integer
                  handleRoles(index, "count", intValue); // Set the seeker estimate as an integer
                } else {
                  handleRoles(index, "count", 0); // Set a default value (e.g., 0) if input is invalid
                }
              }}
            />
            {volunteerRoles.length>1 &&  <TouchableOpacity
              onPress={() =>
                removeMoreRolesOrTimeSlots("Volunteer Roles", index)
              }
              style={{ marginVertical: SIZES.small }}>
              <MaterialIcons name='cancel' size={24} color={COLOURS.red} />
            </TouchableOpacity>}
          </View>
        ))}
        <TouchableOpacity
          style={styles.button(COLOURS.primary,"60%")}
          onPress={() => {
            setVolunteerRoles((previousVolunteerRoles) => [
              ...previousVolunteerRoles,
              { role: "", count: 0 },
            ]);
          }}>
          <Text style={styles.text("center", SIZES.large,COLOURS.white)}>
            Add More Roles
          </Text>
        </TouchableOpacity>
        <Text style={[styles.text("center",SIZES.large,COLOURS.black),{marginTop:"3%"}]}>
          Fill in the time slots
        </Text>

        {/* // You need to check from here for responsiveness */}
        {timeSlots.map((timeSlot, index) => (
          <View style={styles.rowContainer} key={index}>
            {timeSlots.length>1 && <Text>{index + 1}.</Text>}
            <TimeSlotSelector
              index={index}
              timeType='startTime'
              handleTimeSlots={handleTimeSlots}
              initialValue={timeSlot.startTime}
            />
            <TimeSlotSelector
              index={index}
              timeType='endTime'
              handleTimeSlots={handleTimeSlots}
              initialValue={timeSlot.endTime}
            />
            {timeSlots.length>1 && <TouchableOpacity
              onPress={() => removeMoreRolesOrTimeSlots("Time Slots", index)}
              style={{ marginVertical: SIZES.small }}>
              <MaterialIcons name='cancel' size={24} color={COLOURS.red} />
            </TouchableOpacity>}
          </View>
        ))}
        {isChecked && (
          <TouchableOpacity
            style={styles.button(COLOURS.primary,"60%")}
            onPress={() =>
              setTimeSlots((prevTimeSlots) => [
                ...prevTimeSlots,
                { startTime: "", endTime: "" },
              ])
            }>
            <Text style={styles.text("center",SIZES.large, COLOURS.white )}>
              Add Time Slots
            </Text>
          </TouchableOpacity>
        )}
        <View>
          <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: SIZES.large,
                  height: SIZES.large,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: "black",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                {isChecked && (
                  <Text
                    style={{
                      color: "black",
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "center",
                    }}>
                    ✓
                  </Text>
                )}
              </View>
              <Text style={{ margin: SIZES.small }}>
                Do you want to add more timeslots
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* // Till here */}



        {error && <Text style={styles.error_text(SIZES.medium)}>{error}</Text>}
        { useCase !=="display" ? <View>
        <TouchableOpacity
          style={styles.button(COLOURS.primary,"80%")}
          onPress={AddEvent}>
          <Text style={styles.text("center",SIZES.large,COLOURS.white )}>
            Create Event
          </Text>
        </TouchableOpacity>

        {useCase==="suggestion" && <TouchableOpacity
          style={styles.button(COLOURS.red,"80%")}
          onPress={CancelSuggestion}>
          <Text style={styles.text("center",SIZES.large,COLOURS.white )}>
            Cancel Suggestion
          </Text>
        </TouchableOpacity>}
        </View>
        :
        <View>
        <TouchableOpacity
          style={styles.button(COLOURS.primary,"80%")}
          onPress={()=>UpdateEvent(eventRef)}>
          <Text style={styles.text("center",SIZES.large,COLOURS.white )}>
            Update Event
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button(COLOURS.red,"80%")}
          onPress={CancelEdit}>
          <Text style={styles.text("center",SIZES.large,COLOURS.white )}>
            Cancel Edit
          </Text>
        </TouchableOpacity>
        </View>
      
      
      }
      </SafeAreaView>
    </ScrollView>
  );
};

export default EventCreateAndEdit;
const TimeSlotSelector = ({ index, timeType, handleTimeSlots, initialValue }) => {
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedTime, setSelectedTime] = useState(initialValue || null);

  // Function to handle time selection and update time slots
  const handleTimeConfirm = (time) => {
    const formattedTime = time.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    setSelectedTime(formattedTime); // Update selectedTime with formatted time
    handleTimeSlots(index, timeType, formattedTime); // Update time slot in main state
    setTimePickerVisibility(false); // Hide time picker
  };

  return (
    <View style={styles.timeSlotContainer}>
      <TouchableOpacity
        onPress={() => setTimePickerVisibility(true)}
        style={[styles.fillBlank(SIZES.medium),{width:"auto"}]}>
        <Text style={{ color: COLOURS.black, fontSize: 16 }}>
          {selectedTime
            ? selectedTime
            : timeType === "startTime"
            ? "Start Time"
            : "End Time"}
        </Text>
      </TouchableOpacity>

      {/* Render DateTimePickerModal when isTimePickerVisible is true */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode='time'
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisibility(false)}
      />
    </View>
  );
};