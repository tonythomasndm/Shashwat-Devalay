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
import { useContext, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { FIRESTORE_DB } from "../../../FirebaseConfig";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

function convertTimeStringToTimestamp(timeString) {

  const [timePart, period] = timeString.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);

  let adjustedHours = hours;
  if (period.toLowerCase() === "pm" && adjustedHours !== 12) {
    adjustedHours += 12;
  } else if (period.toLowerCase() === "am" && adjustedHours === 12) {
    adjustedHours = 0;
  }

  const date = new Date(2024, 0, 1, adjustedHours, minutes);
  const timestamp = Timestamp.fromDate(date);

  return timestamp;
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

const EventCreateAndEdit = ({ type, eventDetails, setEditMode, useCase, eventRef }) => {
  const { mode, infraId } = useContext(AppContext);
  const [title, setTitle] = useState(eventDetails.title || "");
  const [description, setDescription] = useState(eventDetails.description || "");
  const [venue, setVenue] = useState(eventDetails.venue || "");
  const [startDate, setStartDate] = useState(eventDetails.startDate ? eventDetails.startDate.toDate() : null);
  const [endDate, setEndDate] = useState(eventDetails.endDate ? eventDetails.endDate.toDate() : null);
  const [registrationDeadline, setRegistrationDeadline] = useState(eventDetails.registrationDeadline ? eventDetails.registrationDeadline.toDate() : null);
  const [seekerEstimate, setSeekerEstimate] = useState(eventDetails.seekerEstimate || 0);
  const [volunteerRoles, setVolunteerRoles] = useState(eventDetails?.volunteerRoles ? Object.entries(eventDetails.volunteerRoles).map(([role, count]) => ({ role, count })) : [{ role: "", count: 0 }]);
  
  const [timeSlots, setTimeSlots] = useState(eventDetails.timeSlots ? eventDetails.timeSlots.map(slot => ({
    startTime:convertTimestampToTimeString(slot.startTime),
    endTime: convertTimestampToTimeString(slot.endTime),
  })) : [{ startTime: null, endTime: null }]);
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [
    isRegistrationDeadlineDatePickerVisible,
    setRegistrationDeadlineDatePickerVisibility,
  ] = useState(false);


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
      startTime: convertTimeStringToTimestamp(slot.startTime),
      endTime: convertTimeStringToTimestamp(slot.endTime),
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
      mode === "Admin"
        ? type === "Seva"
          ? "SevaEvents"
          : type === "Shiksha"
          ? "ShikshaEvents"
          : "SanskarEvents"
        : "EventSuggestions"
    );

    const eventDocRef = doc(eventsCollectionRef);

    try {
      const timeSlotsTimestamps = filteredTimeSlots.map((slot) => ({
        startTime: convertTimeStringToTimestamp(slot.startTime),
        endTime: convertTimeStringToTimestamp(slot.endTime),
      }));
      

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
        registrationDeadline: registrationDeadline,
        timeSlots: timeSlotsTimestamps,
        infraId: infraId,
        volunteersRegistered: {},
        seekersRegistered:[],
        ...(mode === "Volunteer" && { type: type } ),
        volunteersApplications: {},
        volunteersRejected: {},
      });

      resetForm();
      Alert.alert("", "Event added successfully");
    } catch (e) {
      setError(e.message || "An error occurred while saving the event");
    }
  };
  return (
    <ScrollView>
      <SafeAreaView style={[styles.container,{maxWidth:"80%", alignSelf:"center"}]}>
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
          style={styles.textboxes} // { textAlignVertical: 'top', textAlign: 'left' }
          placeholder='Event Description'
          value={description}
          multiline={true}
          numberOfLines={3}
          onChangeText={(text) => setDescription(text)}
        />

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
            style={[styles.textboxes, { flex: 1, minWidth:"auto" }]}
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
          style={[styles.dateTextboxes, { flex: 1, maxWidth: "70%" }]}
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
          style={[styles.dateTextboxes, { flex: 1, maxWidth: "60%" }]}
          >
          <Text style={styles.text("left",SIZES.medium,COLOURS.black)}>
            {endDate ? endDate.toLocaleDateString("en-GB", options) : ""}
          </Text>
        </TouchableOpacity>
        </View>
        <Text style={[styles.text("left",SIZES.large,COLOURS.black),{minWidth:"100%"}]}>
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
        { !eventDetails ?
        <TouchableOpacity
          style={styles.button(COLOURS.primary,"80%")}
          onPress={AddEvent}>
          <Text style={styles.text("center",SIZES.large,COLOURS.white )}>
            {mode === "Admin" ? "Create Event" : "Event Suggest"}
          </Text>
        </TouchableOpacity>
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