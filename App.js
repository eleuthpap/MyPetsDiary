import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Switch, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';

const STORAGE_KEY = '@pet_diary_data';
const INPUT_ICON_COLOR = '#757F9A';

const CalendarCardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 640 640" fill={INPUT_ICON_COLOR}>
    <Path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z" />
  </Svg>
);

const VaccineCardIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 640 640" fill="none">
    <Path stroke="#7F0808" strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" d="M529.5 47C520.1 37.6 504.9 37.6 495.6 47C486.3 56.4 486.2 71.6 495.6 80.9L510.6 95.9L464.5 142L401.5 79C392.1 69.6 376.9 69.6 367.6 79C358.3 88.4 358.2 103.6 367.6 112.9L374.6 119.9L296.5 198L337.5 239C346.9 248.4 346.9 263.6 337.5 272.9C328.1 282.2 312.9 282.3 303.6 272.9L262.6 231.9L216.5 278L257.5 319C266.9 328.4 266.9 343.6 257.5 352.9C248.1 362.2 232.9 362.3 223.6 352.9L182.6 311.9L144.9 349.6C134.4 360.1 128.5 374.3 128.5 389.2L128.5 478L71.5 535C62.1 544.4 62.1 559.6 71.5 568.9C80.9 578.2 96.1 578.3 105.4 568.9L162.4 511.9L251.2 511.9C266.1 511.9 280.3 506 290.8 495.5L520.5 265.8L527.5 272.8C536.9 282.2 552.1 282.2 561.4 272.8C570.7 263.4 570.8 248.2 561.4 238.9L498.4 175.9L544.5 129.8L559.5 144.8C568.9 154.2 584.1 154.2 593.4 144.8C602.7 135.4 602.8 120.2 593.4 110.9L529.4 46.9z" />
  </Svg>
);

const EmptyDiaryIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 640 640" fill="rgba(110, 103, 75, 1.00)">
    <Path d="M197.4 224C193.5 224 190.2 221.2 189.3 217.4C179.1 175.3 141.2 144 96 144C43 144 0 187 0 240C0 269.1 12.9 295.1 33.3 312.7C37.6 316.4 37.6 323.5 33.3 327.2C12.9 344.8 0 370.9 0 399.9C0 452.9 43 495.9 96 495.9C141.2 495.9 179.1 464.6 189.3 422.5C190.2 418.7 193.5 415.9 197.4 415.9L442.5 415.9C446.4 415.9 449.7 418.7 450.6 422.5C460.8 464.6 498.7 495.9 543.9 495.9C596.9 495.9 639.9 452.9 639.9 399.9C639.9 370.8 627 344.8 606.6 327.2C602.3 323.5 602.3 316.4 606.6 312.7C627 295.1 639.9 269 639.9 240C639.9 187 596.9 144 543.9 144C498.7 144 460.8 175.3 450.6 217.4C449.7 221.2 446.4 224 442.5 224L197.4 224z" />
  </Svg>
);

const HistoryIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 640 640" fill="rgb(110, 103, 75)">
    <Path d="M192 112L304 112L304 200C304 239.8 336.2 272 376 272L464 272L464 512C464 520.8 456.8 528 448 528L192 528C183.2 528 176 520.8 176 512L176 128C176 119.2 183.2 112 192 112zM352 131.9L444.1 224L376 224C362.7 224 352 213.3 352 200L352 131.9zM192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 250.5C512 233.5 505.3 217.2 493.3 205.2L370.7 82.7C358.7 70.7 342.5 64 325.5 64L192 64zM248 320C234.7 320 224 330.7 224 344C224 357.3 234.7 368 248 368L392 368C405.3 368 416 357.3 416 344C416 330.7 405.3 320 392 320L248 320zM248 416C234.7 416 224 426.7 224 440C224 453.3 234.7 464 248 464L392 464C405.3 464 416 453.3 416 440C416 426.7 405.3 416 392 416L248 416z" />
  </Svg>
);

const TimePickerIcon = ({ color = INPUT_ICON_COLOR }) => (
  <Svg width={22} height={22} viewBox="0 0 640 640" fill={color}>
    <Path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z" />
  </Svg>
);

const MoreIcon = ({ color = '#243130' }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 7.25A1.75 1.75 0 1 0 12 3.75a1.75 1.75 0 0 0 0 3.5zm0 6.5A1.75 1.75 0 1 0 12 10.25a1.75 1.75 0 0 0 0 3.5zm0 6.5A1.75 1.75 0 1 0 12 16.75a1.75 1.75 0 0 0 0 3.5z" />
  </Svg>
);

const SettingsIcon = ({ color = '#808080' }) => (
  <Svg width={21} height={21} viewBox="0 0 640 640" fill={color}>
    <Path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z" />
  </Svg>
);

const HomeNavIcon = ({ color = 'rgb(142, 138, 110)' }) => (
  <Svg width={21} height={21} viewBox="0 0 640 640" fill={color}>
    <Path d="M304 70.1C313.1 61.9 326.9 61.9 336 70.1L568 278.1C577.9 286.9 578.7 302.1 569.8 312C560.9 321.9 545.8 322.7 535.9 313.8L527.9 306.6L527.9 511.9C527.9 547.2 499.2 575.9 463.9 575.9L175.9 575.9C140.6 575.9 111.9 547.2 111.9 511.9L111.9 306.6L103.9 313.8C94 322.6 78.9 321.8 70 312C61.1 302.2 62 287 71.8 278.1L304 70.1zM320 120.2L160 263.7L160 512C160 520.8 167.2 528 176 528L224 528L224 424C224 384.2 256.2 352 296 352L344 352C383.8 352 416 384.2 416 424L416 528L464 528C472.8 528 480 520.8 480 512L480 263.7L320 120.3zM272 528L368 528L368 424C368 410.7 357.3 400 344 400L296 400C282.7 400 272 410.7 272 424L272 528z" />
  </Svg>
);

const PetsNavIcon = ({ color = 'rgb(142, 138, 110)' }) => (
  <Svg width={21} height={21} viewBox="0 0 640 640" fill={color}>
    <Path d="M298.5 156.9C312.8 199.8 298.2 243.1 265.9 253.7C233.6 264.3 195.8 238.1 181.5 195.2C167.2 152.3 181.8 109 214.1 98.4C246.4 87.8 284.2 114 298.5 156.9zM164.4 262.6C183.3 295 178.7 332.7 154.2 346.7C129.7 360.7 94.5 345.8 75.7 313.4C56.9 281 61.4 243.3 85.9 229.3C110.4 215.3 145.6 230.2 164.4 262.6zM133.2 465.2C185.6 323.9 278.7 288 320 288C361.3 288 454.4 323.9 506.8 465.2C510.4 474.9 512 485.3 512 495.7L512 497.3C512 523.1 491.1 544 465.3 544C453.8 544 442.4 542.6 431.3 539.8L343.3 517.8C328 514 312 514 296.7 517.8L208.7 539.8C197.6 542.6 186.2 544 174.7 544C148.9 544 128 523.1 128 497.3L128 495.7C128 485.3 129.6 474.9 133.2 465.2zM485.8 346.7C461.3 332.7 456.7 295 475.6 262.6C494.5 230.2 529.6 215.3 554.1 229.3C578.6 243.3 583.2 281 564.3 313.4C545.4 345.8 510.3 360.7 485.8 346.7zM374.1 253.7C341.8 243.1 327.2 199.8 341.5 156.9C355.8 114 393.6 87.8 425.9 98.4C458.2 109 472.8 152.3 458.5 195.2C444.2 238.1 406.4 264.3 374.1 253.7z" />
  </Svg>
);

const ProfileNavIcon = ({ color }) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const savePetsData = async (petsData) => {
  try {
    const jsonValue = JSON.stringify(petsData);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    Alert.alert('Error', 'Failed to save data');
  }
};

const loadPetsData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    Alert.alert('Error', 'Failed to load data');
    return [];
  }
};

const copyImageToAppStorage = async (asset) => {
  const extension = asset.mimeType?.split('/')[1] || 'jpg';
  const sourceUri = `${FileSystem.documentDirectory}pet-source-${Date.now()}.${extension}`;
  const destination = `${FileSystem.documentDirectory}pet-${Date.now()}.jpg`;

  await FileSystem.copyAsync({ from: asset.uri, to: sourceUri });
  const jpeg = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  await FileSystem.copyAsync({ from: jpeg.uri, to: destination });
  await FileSystem.deleteAsync(sourceUri, { idempotent: true });
  return destination;
};

export default function App() {
  const scrollViewRef = useRef(null);
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [markedDates, setMarkedDates] = useState({});
  const [vaccinationListVisible, setVaccinationListVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [petMenuVisible, setPetMenuVisible] = useState(false);
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  const [photoOptionsPet, setPhotoOptionsPet] = useState(null);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);

  // Load saved data when app starts
  useEffect(() => {
    const loadData = async () => {
      const savedPets = await loadPetsData();
      setPets(savedPets);
    };
    loadData();
  }, []);
  const [selectedPet, setSelectedPet] = useState(null);
  const [newPet, setNewPet] = useState({
    name: '',
    birthYear: '',
    sex: 'Female',
    image: null,
    vaccinations: [],
    appointments: []
  });
  const [isMale, setIsMale] = useState(false);
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '' });
  const [newAppointment, setNewAppointment] = useState({ reason: '', date: '', time: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [dateAppointments, setDateAppointments] = useState([]);
  const [showVaccineDatePicker, setShowVaccineDatePicker] = useState(false);
  const [showAppointmentDatePicker, setShowAppointmentDatePicker] = useState(false);
  const [showAppointmentTimePicker, setShowAppointmentTimePicker] = useState(false);

  // Function to calculate age from birth year
  const calculateAge = (birthYear) => {
    if (!birthYear) return '';
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);
    return age >= 0 ? age : 0;
  };

  // Update calendar markers whenever pets array changes
  useEffect(() => {
    updateCalendarMarkers();
  }, [pets]);

  // Function to update the calendar markers based on appointments
  const updateCalendarMarkers = () => {
    const markers = {};
    pets.forEach(pet => {
      pet.appointments.forEach(appointment => {
        const date = appointment.date;
        if (markers[date]) {
          markers[date].dots.push({
            color: '#2196F3',
            key: `${pet.id}-${appointment.reason}`
          });
        } else {
          markers[date] = {
            dots: [{
              color: '#2196F3',
              key: `${pet.id}-${appointment.reason}`
            }],
            marked: true,
            dotColor: '#2196F3',
            selected: date === selectedDate
          };
        }
      });
    });
    setMarkedDates(markers);
  };

  // Function to handle date selection in calendar
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getAllVaccinations = () => {
    return pets.map(pet => ({
      petName: pet.name,
      petId: pet.id,
      vaccinations: pet.vaccinations.map((vacc, index) => ({
        ...vacc,
        index // keep track of the index for removal
      }))
    })).filter(pet => pet.vaccinations.length > 0);
  };

  const onVaccineDateChange = (_, selectedDate) => {
    setShowVaccineDatePicker(false);
    if (selectedDate) {
      setNewVaccine(prev => ({ ...prev, date: formatDate(selectedDate) }));
    }
  };

  const selectVaccineDate = (day) => {
    setNewVaccine(prev => ({ ...prev, date: day.dateString }));
    setShowVaccineDatePicker(false);
  };

  const formatDateForPicker = (date) => {
    if (!date) return 'Choose a date';
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onAppointmentDateChange = (_, selectedDate) => {
    setShowAppointmentDatePicker(false);
    if (selectedDate) {
      setNewAppointment(prev => ({ ...prev, date: formatDate(selectedDate) }));
    }
  };

  const selectAppointmentDate = (day) => {
    setNewAppointment(prev => ({ ...prev, date: day.dateString }));
    setShowAppointmentDatePicker(false);
  };

  const onAppointmentTimeChange = (_, selectedDate) => {
    setShowAppointmentTimePicker(false);
    if (selectedDate) {
      setNewAppointment(prev => ({ ...prev, time: formatTime(selectedDate) }));
    }
  };

  const handleDateSelect = (day) => {
    const selected = day.dateString;
    setSelectedDate(selected);
    
    // Find all appointments for this date
    const appointments = [];
    pets.forEach(pet => {
      pet.appointments.forEach(app => {
        if (app.date === selected) {
          appointments.push({
            ...app,
            petName: pet.name
          });
        }
      });
    });
    setDateAppointments(appointments);
    
    // Update markers to show selected date
    const updatedMarkers = { ...markedDates };
    Object.keys(updatedMarkers).forEach(date => {
      updatedMarkers[date] = {
        ...updatedMarkers[date],
        selected: date === selected
      };
    });
    if (!updatedMarkers[selected]) {
      updatedMarkers[selected] = {
        selected: true,
        dots: []
      };
    } else {
      updatedMarkers[selected] = {
        ...updatedMarkers[selected],
        selected: true
      };
    }
    setMarkedDates(updatedMarkers);
  };

  const openPhotoOptions = (pet = null) => {
    setPhotoOptionsPet(pet);
    setPhotoOptionsVisible(true);
  };

  const removePhoto = async () => {
    if (photoOptionsPet) {
      const updatedPet = { ...photoOptionsPet, image: null };
      const updatedPets = pets.map(p => p.id === photoOptionsPet.id ? updatedPet : p);
      setPets(updatedPets);
      await savePetsData(updatedPets);
      setSelectedPet(updatedPet);
    } else {
      setNewPet(current => ({ ...current, image: null }));
    }
    setPhotoOptionsVisible(false);
  };

  const pickImage = async (pet = null) => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to grant permission to access your photos.");
        return;
      }

      // Launch image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        // Android may return a content:// URI that <Image> cannot read later.
        // Copy it into this app's document directory before displaying or saving it.
        const imageUri = await copyImageToAppStorage(pickerResult.assets[0]);
        
        if (pet) {
          // If editing existing pet
          const updatedPet = { ...pet, image: imageUri };
          const updatedPets = pets.map(p => p.id === pet.id ? updatedPet : p);
          setPets(updatedPets);
          await savePetsData(updatedPets);
          setSelectedPet(updatedPet);
        } else {
          // If adding new pet
          setNewPet(current => ({ ...current, image: imageUri }));
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const addPet = async () => {
    if (newPet.name && newPet.birthYear) {
      const updatedPets = [...pets, { ...newPet, id: Date.now() }];
      setPets(updatedPets);
      await savePetsData(updatedPets);
      setNewPet({ name: '', birthYear: '', sex: 'Female', image: null, vaccinations: [], appointments: [] });
      setIsMale(false);
      setModalVisible(false);
    }
  };

  const updatePet = async (updatedPet) => {
    const updatedPets = pets.map(pet => pet.id === updatedPet.id ? updatedPet : pet);
    setPets(updatedPets);
    await savePetsData(updatedPets);
  };

  const deletePet = (id) => {
    Alert.alert(
      "Delete Pet",
      "Are you sure you want to delete this pet?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            const updatedPets = pets.filter(pet => pet.id !== id);
            setPets(updatedPets);
            await savePetsData(updatedPets);
          }
        }
      ]
    );
  };

  const openPetMenu = (pet) => {
    setSelectedPet(pet);
    setPetMenuVisible(true);
  };

  const addVaccination = () => {
    if (newVaccine.name && newVaccine.date && selectedPet) {
      const updatedPet = {
        ...selectedPet,
        vaccinations: [...selectedPet.vaccinations, newVaccine]
      };
      updatePet(updatedPet);
      setNewVaccine({ name: '', date: '' });
      setVaccineModalVisible(false);
    }
  };

  const removeVaccination = (petId, index) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      const updatedVaccinations = pet.vaccinations.filter((_, i) => i !== index);
      updatePet({ ...pet, vaccinations: updatedVaccinations });
    }
  };

  const addAppointment = () => {
    if (newAppointment.reason && newAppointment.date && newAppointment.time && selectedPet) {
      const updatedPet = {
        ...selectedPet,
        appointments: [...selectedPet.appointments, newAppointment]
      };
      updatePet(updatedPet);
      setNewAppointment({ reason: '', date: '', time: '' });
      setAppointmentModalVisible(false);
      updateCalendarMarkers(); // Update calendar markers when adding new appointment
    }
  };

  const removeAppointment = (petId, index) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      const updatedAppointments = pet.appointments.filter((_, i) => i !== index);
      updatePet({ ...pet, appointments: updatedAppointments });
      updateCalendarMarkers(); // Update calendar markers when removing appointment
    }
  };

  const openPetHistory = (pet) => {
    setSelectedPet(pet);
    setHistoryModalVisible(true);
  };

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {currentPage === 'home' ? (
        <>
      <ScrollView ref={scrollViewRef} style={styles.pageScroll} contentContainerStyle={styles.homePageContent}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>My Pets Diary</Text>
          <Text style={styles.subtitle}>
            {pets.length === 0
              ? 'Keep every little moment in one place.'
              : `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} in your family`}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsMenuVisible(true)}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      <View style={styles.homeActions}>
        <TouchableOpacity 
          style={styles.primaryAction}
          onPress={() => {
            setNewPet({ name: '', birthYear: '', sex: 'Female', image: null, vaccinations: [], appointments: [] });
            setIsMale(false);
            setModalVisible(true);
          }}>
          <View style={styles.primaryActionIcon}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
          <View>
            <Text style={styles.primaryActionTitle}>{pets.length > 0 ? 'Add another pet' : 'Add a pet'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryAction, styles.calendarAction]}
            onPress={() => setCalendarVisible(true)}>
            <View style={styles.secondaryActionIcon}>
              <CalendarCardIcon />
            </View>
            <Text style={styles.secondaryActionTitle}>Calendar</Text>
            <Text style={styles.secondaryActionSubtitle}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, styles.vaccineAction]}
            onPress={() => setVaccinationListVisible(true)}>
            <View style={styles.secondaryActionIcon}>
              <VaccineCardIcon />
            </View>
            <Text style={styles.secondaryActionTitle}>Vaccines</Text>
            <Text style={styles.secondaryActionSubtitle}>Health records</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.petList}>
        {pets.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <EmptyDiaryIcon />
            </View>
            <Text style={styles.emptyStateTitle}>Your diary is ready</Text>
            <Text style={styles.emptyStateText}>
              Add your first pet to keep their appointments, vaccinations, and memories together.
            </Text>
          </View>
        )}
        {pets.map(pet => (
          <View key={pet.id} style={styles.petCard}>
            <View style={styles.petPhotoContainer}>
              <TouchableOpacity onPress={() => pet.image ? openPhotoOptions(pet) : pickImage(pet)}>
                {pet.image ? (
                  <Image
                    source={{ uri: pet.image }}
                    style={styles.petImage}
                    resizeMode="cover"
                    onError={() => Alert.alert('Photo error', 'The selected image could not be loaded. Please choose it again.')}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.petMenuButton} onPress={() => openPetMenu(pet)}>
                <MoreIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.petDetails}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petMeta}>
                {pet.birthYear ? `${calculateAge(pet.birthYear)} years old` : 'Age unknown'} · {pet.sex} · Born {pet.birthYear || 'Unknown'}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vaccinations:</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedPet(pet);
                    setVaccineModalVisible(true);
                  }}>
                  <Text style={styles.addItemText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {pet.vaccinations.map((vacc, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text>{vacc.name} - {vacc.date}</Text>
                  <TouchableOpacity onPress={() => removeVaccination(pet.id, index)}>
                    <Text style={styles.removeItemText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Appointments:</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedPet(pet);
                    setAppointmentModalVisible(true);
                  }}>
                  <Text style={styles.addItemText}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {pet.appointments.map((app, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text>{app.reason}</Text>
                  <Text>{app.date} at {app.time}</Text>
                  <TouchableOpacity onPress={() => removeAppointment(pet.id, index)}>
                    <Text style={styles.removeItemText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.historyRow}
              onPress={() => openPetHistory(pet)}>
              <View style={styles.historyRowContent}>
                <View style={styles.historyRowIcon}>
                  <HistoryIcon />
                </View>
                <View>
                  <Text style={styles.historyRowTitle}>View all records</Text>
                  <Text style={styles.historyRowSubtitle}>
                    {(pet.vaccinations.length + pet.appointments.length) === 0
                      ? 'No health records recorded yet'
                      : `${pet.vaccinations.length + pet.appointments.length} ${(pet.vaccinations.length + pet.appointments.length) === 1 ? 'record' : 'records'} recorded`}
                  </Text>
                </View>
              </View>
              <Text style={styles.historyRowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.petsPage} contentContainerStyle={styles.petsPageContent}>
          <View style={styles.petsPageHeader}>
            <View style={styles.petsPageHeaderRow}>
              <View>
                <Text style={styles.petsPageTitle}>My Pets</Text>
                <Text style={styles.petsPageSubtitle}>
                  {pets.length === 0
                    ? 'Your pet profiles will appear here.'
                    : `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} in your family`}
                </Text>
              </View>
              <TouchableOpacity style={styles.petsHomeButton} onPress={() => setCurrentPage('home')}>
                <Text style={styles.petsHomeButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.petsPageList}>
            {pets.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <EmptyDiaryIcon />
                </View>
                <Text style={styles.emptyStateTitle}>No pets yet</Text>
                <Text style={styles.emptyStateText}>Add a pet from Home to see their profile here.</Text>
              </View>
            ) : (
              pets.map(pet => (
                <View key={pet.id} style={styles.petOverviewCard}>
                  {pet.image ? (
                    <Image source={{ uri: pet.image }} style={styles.petOverviewImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.petOverviewImagePlaceholder}>
                      <Text style={styles.petOverviewInitial}>{pet.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.petOverviewCopy}>
                    <Text style={styles.petOverviewName}>{pet.name}</Text>
                    <Text style={styles.petOverviewDetails}>
                      {pet.birthYear ? `${calculateAge(pet.birthYear)} years old` : 'Age unknown'} · {pet.sex}
                    </Text>
                    <Text style={styles.petOverviewDetails}>
                      {(pet.appointments || []).length} {(pet.appointments || []).length === 1 ? 'appointment' : 'appointments'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalView, styles.editPetModalView]}>
          <Text style={styles.editPetModalTitle}>Add new pet</Text>
          <Text style={styles.editPetModalSubtitle}>Create a profile to keep their care records together.</Text>
          <TouchableOpacity 
            style={styles.addPetPhotoPicker}
            onPress={() => newPet.image ? openPhotoOptions() : pickImage(null)}>
            {newPet.image ? (
              <Image 
                source={{ uri: newPet.image }} 
                style={styles.addPetPhotoPreview}
                resizeMode="cover"
                onError={() => Alert.alert('Photo error', 'The selected image could not be loaded. Please choose it again.')}
              />
            ) : (
              <View style={styles.addPetPhotoPlaceholder}>
                <Text style={styles.addPetPhotoText}>+ Add a photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.editPetFieldLabel}>Pet name</Text>
          <TextInput
            style={styles.editPetInput}
            placeholder="e.g. Luna"
            placeholderTextColor="#8A938A"
            value={newPet.name}
            onChangeText={(text) => setNewPet({...newPet, name: text})}
          />
          <Text style={styles.editPetFieldLabel}>Birth year</Text>
          <TextInput
            style={styles.editPetInput}
            placeholder="e.g. 2020"
            placeholderTextColor="#8A938A"
            value={newPet.birthYear}
            onChangeText={(text) => setNewPet({...newPet, birthYear: text})}
            keyboardType="numeric"
            maxLength={4}
          />
          {newPet.birthYear && (
            <Text style={styles.ageDisplay}>
              Current Age: {calculateAge(newPet.birthYear)} years old
            </Text>
          )}
          <Text style={styles.editPetFieldLabel}>Sex</Text>
          <View style={styles.editPetSexPicker}>
            <Text style={[styles.editPetSexLabel, !isMale && styles.editPetSexLabelActive]}>Female</Text>
            <Switch
              value={isMale}
              onValueChange={(value) => {
                setIsMale(value);
                setNewPet({...newPet, sex: value ? 'Male' : 'Female'});
              }}
              trackColor={{ false: '#DDEBDD', true: '#BAD07B' }}
              thumbColor={isMale ? '#52635B' : '#FFFFFF'}
            />
            <Text style={[styles.editPetSexLabel, isMale && styles.editPetSexLabelActive]}>Male</Text>
          </View>
          <View style={styles.editPetActions}>
            <TouchableOpacity style={styles.editPetCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.editPetCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editPetSubmitButton} onPress={addPet}>
              <Text style={styles.editPetSubmitButtonText}>Add pet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pet Health History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={[styles.modalView, styles.historyModalView]}>
          <View style={styles.historyModalHeader}>
            <View>
              <Text style={styles.historyModalTitle}>
                Health history
              </Text>
              <Text style={styles.historyModalSubtitle}>{selectedPet?.name || 'Pet'}'s records</Text>
            </View>
            <TouchableOpacity
              style={styles.historyModalCloseButton}
              onPress={() => setHistoryModalVisible(false)}>
              <Text style={styles.historyModalCloseButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.historyRecordsList} showsVerticalScrollIndicator={false}>
            {(selectedPet?.vaccinations || []).length > 0 && (
              <>
                <Text style={styles.historySectionTitle}>Vaccinations</Text>
                {selectedPet.vaccinations.map((vaccination, index) => (
                  <View key={`${vaccination.name}-${vaccination.date}-${index}`} style={styles.historyRecord}>
                    <Text style={styles.historyRecordTitle}>{vaccination.name}</Text>
                    <Text style={styles.historyRecordMeta}>Given on {vaccination.date}</Text>
                  </View>
                ))}
              </>
            )}
            {(selectedPet?.appointments || []).length > 0 && (
              <>
                <Text style={styles.historySectionTitle}>Appointments</Text>
                {selectedPet.appointments.map((appointment, index) => (
                  <View key={`${appointment.reason}-${appointment.date}-${appointment.time}-${index}`} style={styles.historyRecord}>
                    <Text style={styles.historyRecordTitle}>{appointment.reason}</Text>
                    <Text style={styles.historyRecordMeta}>{appointment.date} at {appointment.time}</Text>
                  </View>
                ))}
              </>
            )}
            {(selectedPet?.vaccinations || []).length === 0 && (selectedPet?.appointments || []).length === 0 && (
              <Text style={styles.historyEmptyText}>No health records recorded yet.</Text>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.historyDoneButton} onPress={() => setHistoryModalVisible(false)}>
            <Text style={styles.historyDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Edit Pet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalView, styles.editPetModalView]}>
          <Text style={styles.editPetModalTitle}>Edit pet</Text>
          <Text style={styles.editPetModalSubtitle}>Update {selectedPet?.name || 'your pet'}'s profile details.</Text>

          <Text style={styles.editPetFieldLabel}>Pet name</Text>
          <TextInput
            style={styles.editPetInput}
            placeholder="e.g. Luna"
            placeholderTextColor="#8A938A"
            value={selectedPet?.name || ''}
            onChangeText={(text) => setSelectedPet({...selectedPet, name: text})}
          />

          <Text style={styles.editPetFieldLabel}>Birth year</Text>
          <TextInput
            style={styles.editPetInput}
            placeholder="e.g. 2020"
            placeholderTextColor="#8A938A"
            value={selectedPet?.birthYear || ''}
            onChangeText={(text) => setSelectedPet({...selectedPet, birthYear: text})}
            keyboardType="numeric"
            maxLength={4}
          />
          {selectedPet?.birthYear && (
            <Text style={styles.ageDisplay}>
              Current Age: {calculateAge(selectedPet.birthYear)} years old
            </Text>
          )}
          <Text style={styles.editPetFieldLabel}>Sex</Text>
          <View style={styles.editPetSexPicker}>
            <Text style={[styles.editPetSexLabel, !isMale && styles.editPetSexLabelActive]}>Female</Text>
            <Switch
              value={isMale}
              onValueChange={(value) => {
                setIsMale(value);
                setSelectedPet({...selectedPet, sex: value ? 'Male' : 'Female'});
              }}
              trackColor={{ false: '#DDEBDD', true: '#BAD07B' }}
              thumbColor={isMale ? '#52635B' : '#FFFFFF'}
            />
            <Text style={[styles.editPetSexLabel, isMale && styles.editPetSexLabelActive]}>Male</Text>
          </View>
          <View style={styles.editPetActions}>
            <TouchableOpacity style={styles.editPetCancelButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.editPetCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editPetSubmitButton}
              onPress={() => {
                updatePet(selectedPet);
                setEditModalVisible(false);
              }}>
              <Text style={styles.editPetSubmitButtonText}>Save changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Vaccination Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vaccineModalVisible}
        onRequestClose={() => setVaccineModalVisible(false)}
      >
        <View style={[styles.modalView, styles.vaccinationModalView]}>
          <Text style={styles.vaccinationModalTitle}>Add vaccination</Text>
          <Text style={styles.vaccinationModalSubtitle}>Keep your pet's health record up to date.</Text>

          <Text style={styles.vaccinationFieldLabel}>Vaccine name</Text>
          <TextInput
            style={styles.vaccinationInput}
            placeholder="e.g. Rabies"
            placeholderTextColor="#8A938A"
            value={newVaccine.name}
            onChangeText={(text) => setNewVaccine({...newVaccine, name: text})}
          />

          <Text style={styles.vaccinationFieldLabel}>Date given</Text>
          <TouchableOpacity
            style={styles.vaccinationDatePickerButton}
            onPress={() => setShowVaccineDatePicker(true)}>
            <View style={styles.vaccinationDatePickerIcon}><CalendarCardIcon /></View>
            <View style={styles.vaccinationDatePickerCopy}>
              <Text style={styles.vaccinationDatePickerLabel}>Vaccination date</Text>
              <Text style={newVaccine.date ? styles.vaccinationDatePickerValue : styles.vaccinationDatePickerPlaceholder}>
                {newVaccine.date || 'Choose a date'}
              </Text>
            </View>
            <Text style={styles.vaccinationDatePickerArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.vaccinationActions}>
            <TouchableOpacity
              style={styles.vaccinationCancelButton}
              onPress={() => setVaccineModalVisible(false)}>
              <Text style={styles.vaccinationCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vaccinationSubmitButton} onPress={addVaccination}>
              <Text style={styles.vaccinationSubmitButtonText}>Save vaccine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showVaccineDatePicker}
        onRequestClose={() => setShowVaccineDatePicker(false)}
      >
        <View style={styles.vaccineDateModalBackdrop}>
          <View style={styles.vaccineDateModal}>
            <View style={styles.vaccineDateModalHeader}>
              <View>
                <Text style={styles.vaccineDateModalLabel}>Select date</Text>
                <Text style={styles.vaccineDateModalValue}>{formatDateForPicker(newVaccine.date)}</Text>
              </View>
              <TouchableOpacity
                style={styles.vaccineDateModalCloseButton}
                onPress={() => setShowVaccineDatePicker(false)}>
                <Text style={styles.vaccineDateModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              current={newVaccine.date || undefined}
              onDayPress={selectVaccineDate}
              markedDates={newVaccine.date ? {
                [newVaccine.date]: { selected: true, selectedColor: '#BAD07B', selectedTextColor: '#243130' }
              } : {}}
              theme={{
                arrowColor: '#52635B',
                calendarBackground: '#FFFFFF',
                dayTextColor: '#243130',
                monthTextColor: '#243130',
                textDayFontFamily: 'Inter_500Medium',
                textDayHeaderFontFamily: 'Inter_600SemiBold',
                textMonthFontFamily: 'Inter_700Bold',
                textDayHeaderFontSize: 11,
                textMonthFontSize: 15,
                todayTextColor: '#52635B',
              }}
            />
            <TouchableOpacity
              style={styles.vaccineDateModalCancelButton}
              onPress={() => setShowVaccineDatePicker(false)}>
              <Text style={styles.vaccineDateModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appointmentModalVisible}
        onRequestClose={() => setAppointmentModalVisible(false)}
      >
        <View style={[styles.modalView, styles.appointmentModalView]}>
          <Text style={styles.appointmentModalTitle}>Schedule appointment</Text>
          <Text style={styles.appointmentModalSubtitle}>Add a visit to your pet's care calendar.</Text>

          <Text style={styles.appointmentFieldLabel}>Reason for visit</Text>
          <TextInput
            style={styles.appointmentInput}
            placeholder="e.g. Annual check-up"
            placeholderTextColor="#8A938A"
            value={newAppointment.reason}
            onChangeText={(text) => setNewAppointment({...newAppointment, reason: text})}
          />

          <Text style={styles.appointmentFieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.appointmentPickerButton}
            onPress={() => setShowAppointmentDatePicker(true)}>
            <View style={styles.appointmentPickerIcon}><CalendarCardIcon /></View>
            <View style={styles.appointmentPickerCopy}>
              <Text style={styles.appointmentPickerLabel}>Appointment date</Text>
              <Text style={newAppointment.date ? styles.appointmentPickerValue : styles.appointmentPickerPlaceholder}>
                {newAppointment.date || 'Choose a date'}
              </Text>
            </View>
            <Text style={styles.appointmentPickerArrow}>›</Text>
          </TouchableOpacity>

          <Text style={styles.appointmentFieldLabel}>Time</Text>
          <TouchableOpacity
            style={styles.appointmentPickerButton}
            onPress={() => setShowAppointmentTimePicker(true)}>
            <View style={styles.appointmentTimeIcon}>
              <TimePickerIcon />
            </View>
            <View style={styles.appointmentPickerCopy}>
              <Text style={styles.appointmentPickerLabel}>Appointment time</Text>
              <Text style={newAppointment.time ? styles.appointmentPickerValue : styles.appointmentPickerPlaceholder}>
                {newAppointment.time || 'Choose a time'}
              </Text>
            </View>
            <Text style={styles.appointmentPickerArrow}>›</Text>
          </TouchableOpacity>
          {showAppointmentTimePicker && (
            <DateTimePicker
              value={newAppointment.time ? new Date(`2000-01-01T${newAppointment.time}:00`) : new Date()}
              mode="time"
              onValueChange={onAppointmentTimeChange}
              onDismiss={() => setShowAppointmentTimePicker(false)}
            />
          )}
          <View style={styles.appointmentActions}>
            <TouchableOpacity
              style={styles.appointmentCancelButton}
              onPress={() => setAppointmentModalVisible(false)}>
              <Text style={styles.appointmentCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.appointmentSubmitButton} onPress={addAppointment}>
              <Text style={styles.appointmentSubmitButtonText}>Save appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showAppointmentDatePicker}
        onRequestClose={() => setShowAppointmentDatePicker(false)}
      >
        <View style={styles.vaccineDateModalBackdrop}>
          <View style={styles.vaccineDateModal}>
            <View style={styles.vaccineDateModalHeader}>
              <View>
                <Text style={styles.vaccineDateModalLabel}>Select date</Text>
                <Text style={styles.vaccineDateModalValue}>{formatDateForPicker(newAppointment.date)}</Text>
              </View>
              <TouchableOpacity
                style={styles.vaccineDateModalCloseButton}
                onPress={() => setShowAppointmentDatePicker(false)}>
                <Text style={styles.vaccineDateModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              current={newAppointment.date || undefined}
              onDayPress={selectAppointmentDate}
              markedDates={newAppointment.date ? {
                [newAppointment.date]: { selected: true, selectedColor: '#BAD07B', selectedTextColor: '#243130' }
              } : {}}
              theme={{
                arrowColor: '#52635B',
                calendarBackground: '#FFFFFF',
                dayTextColor: '#243130',
                monthTextColor: '#243130',
                textDayFontFamily: 'Inter_500Medium',
                textDayHeaderFontFamily: 'Inter_600SemiBold',
                textMonthFontFamily: 'Inter_700Bold',
                textDayHeaderFontSize: 11,
                textMonthFontSize: 15,
                todayTextColor: '#52635B',
              }}
            />
            <TouchableOpacity
              style={styles.vaccineDateModalCancelButton}
              onPress={() => setShowAppointmentDatePicker(false)}>
              <Text style={styles.vaccineDateModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarVisible}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.calendarModalBackdrop} showsVerticalScrollIndicator={false}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={[styles.modalTitle, styles.calendarTitle]}>Appointments Calendar</Text>
              <TouchableOpacity
                style={styles.calendarCloseButton}
                onPress={() => setCalendarVisible(false)}>
                <Text style={styles.calendarCloseButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              style={styles.calendar}
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              markingType={'multi-dot'}
              theme={{
                selectedDayBackgroundColor: '#2196F3',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#2196F3',
                dotColor: '#2196F3',
              }}
            />

            {selectedDate && (
              <View style={styles.appointmentList}>
                <Text style={styles.dateTitle}>
                  Appointments for {selectedDate}:
                </Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {dateAppointments.length > 0 ? (
                    dateAppointments.map((app, index) => (
                      <View key={index} style={styles.appointmentItem}>
                        <Text style={styles.appointmentPetName}>{app.petName}</Text>
                        <Text style={styles.appointmentReason}>{app.reason}</Text>
                        <Text style={styles.appointmentTime}>{app.time}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noAppointments}>No appointments for this date</Text>
                  )}
                </ScrollView>
              </View>
            )}

          </View>
        </ScrollView>
      </Modal>

      {/* Vaccination List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vaccinationListVisible}
        onRequestClose={() => setVaccinationListVisible(false)}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
      >
        <View style={[styles.modalView, styles.vaccinationRecordsModalView]}>
          <View style={styles.vaccinationRecordsHeader}>
            <View>
              <Text style={styles.vaccinationRecordsTitle}>Vaccination records</Text>
              <Text style={styles.vaccinationRecordsSubtitle}>All vaccines across your pets</Text>
            </View>
            <TouchableOpacity
              style={styles.historyModalCloseButton}
              onPress={() => setVaccinationListVisible(false)}>
              <Text style={styles.historyModalCloseButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.vaccinationRecordsList} showsVerticalScrollIndicator={false}>
            {getAllVaccinations().map((pet, petIndex) => (
              <View key={petIndex} style={styles.vaccinationOverviewPet}>
                <Text style={styles.vaccinationOverviewPetName}>{pet.petName}</Text>
                {pet.vaccinations.map((vacc, index) => (
                  <View key={`${vacc.name}-${vacc.date}-${index}`} style={styles.vaccineRecordCard}>
                    <View style={styles.vaccineRecordCopy}>
                      <Text style={styles.vaccineRecordName}>{vacc.name}</Text>
                      <Text style={styles.vaccineRecordDate}>Given on {vacc.date}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.vaccineRecordRemoveButton}
                      onPress={() => removeVaccination(pet.petId, vacc.index)}>
                      <Text style={styles.vaccineRecordRemoveText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
            {getAllVaccinations().length === 0 && (
              <Text style={styles.vaccinationRecordsEmptyText}>No vaccination records found.</Text>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={styles.historyDoneButton}
            onPress={() => setVaccinationListVisible(false)}>
            <Text style={styles.historyDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Pet actions menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={petMenuVisible}
        onRequestClose={() => setPetMenuVisible(false)}
      >
        <View style={styles.actionMenuBackdrop}>
          <View style={styles.actionMenu}>
            <Text style={styles.actionMenuTitle}>{selectedPet?.name || 'Pet'}</Text>
            <Text style={styles.actionMenuSubtitle}>Manage this pet's profile</Text>
            <TouchableOpacity
              style={styles.actionMenuButton}
              onPress={() => {
                setPetMenuVisible(false);
                setIsMale(selectedPet?.sex === 'Male');
                setEditModalVisible(true);
              }}>
              <Text style={styles.actionMenuButtonText}>Edit pet</Text>
              <Text style={styles.actionMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionMenuButton, styles.actionMenuDestructiveButton]}
              onPress={() => {
                setPetMenuVisible(false);
                if (selectedPet) deletePet(selectedPet.id);
              }}>
              <Text style={styles.actionMenuDestructiveText}>Delete pet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionMenuCancelButton} onPress={() => setPetMenuVisible(false)}>
              <Text style={styles.actionMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo actions menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={photoOptionsVisible}
        onRequestClose={() => setPhotoOptionsVisible(false)}
      >
        <View style={styles.actionMenuBackdrop}>
          <View style={styles.actionMenu}>
            <Text style={styles.actionMenuTitle}>Photo options</Text>
            <Text style={styles.actionMenuSubtitle}>Update your pet's photo</Text>
            <TouchableOpacity
              style={styles.actionMenuButton}
              onPress={() => {
                const pet = photoOptionsPet;
                setPhotoOptionsVisible(false);
                pickImage(pet);
              }}>
              <Text style={styles.actionMenuButtonText}>Choose new photo</Text>
              <Text style={styles.actionMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionMenuButton, styles.actionMenuDestructiveButton]} onPress={removePhoto}>
              <Text style={styles.actionMenuDestructiveText}>Remove photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionMenuCancelButton} onPress={() => setPhotoOptionsVisible(false)}>
              <Text style={styles.actionMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings menu */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsMenuVisible}
        onRequestClose={() => setSettingsMenuVisible(false)}
      >
        <View style={styles.sidebarBackdrop}>
          <TouchableOpacity
            style={styles.sidebarDismissArea}
            activeOpacity={1}
            onPress={() => setSettingsMenuVisible(false)}
          />
          <View style={styles.settingsSidebar}>
            <View style={styles.settingsSidebarHeader}>
              <View>
                <Text style={styles.settingsSidebarTitle}>Settings</Text>
                <Text style={styles.settingsSidebarSubtitle}>Manage your account and pets</Text>
              </View>
              <TouchableOpacity
                style={styles.settingsSidebarCloseButton}
                onPress={() => setSettingsMenuVisible(false)}>
                <Text style={styles.settingsSidebarCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingsSidebarList}>
              <TouchableOpacity
                style={styles.settingsSidebarItem}
                onPress={() => {
                  setSettingsMenuVisible(false);
                  setCurrentPage('pets');
                }}>
                <View style={styles.settingsSidebarItemIcon}>
                  <PetsNavIcon color="#52635B" />
                </View>
                <View style={styles.settingsSidebarItemCopy}>
                  <Text style={styles.settingsSidebarItemText}>My pets</Text>
                  <Text style={styles.settingsSidebarItemDescription}>Pet profiles and details</Text>
                </View>
                <Text style={styles.settingsSidebarArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.settingsSidebarDivider} />
              <TouchableOpacity
                style={styles.settingsSidebarItem}
                onPress={() => {
                  setSettingsMenuVisible(false);
                  Alert.alert('Profile', 'Profile settings will be available here.');
                }}>
                <View style={styles.settingsSidebarItemIcon}>
                  <ProfileNavIcon color="#52635B" />
                </View>
                <View style={styles.settingsSidebarItemCopy}>
                  <Text style={styles.settingsSidebarItemText}>My profile</Text>
                  <Text style={styles.settingsSidebarItemDescription}>Personal information</Text>
                </View>
                <Text style={styles.settingsSidebarArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: Platform.OS === 'android' ? 36 : 20,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroCopy: {
    flex: 1,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  settingsButtonText: {
    color: '#52635B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  title: {
    color: '#1E3024',
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
  },
  homeActions: {
    marginBottom: 20,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#A1BBB2',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 14,
  },
  primaryActionIcon: {
    alignItems: 'center',
    backgroundColor: '#DDEBDD',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  actionIconText: {
    color: '#A1BBB2',
    fontSize: 20,
    fontWeight: '300',
    includeFontPadding: false,
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryActionTitle: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  primaryActionSubtitle: {
    color: '#68746B',
    fontSize: 13,
    marginTop: 2,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  secondaryAction: {
    borderRadius: 16,
    flex: 1,
    minHeight: 104,
    padding: 14,
  },
  calendarAction: {
    backgroundColor: '#C9D3DD',
  },
  vaccineAction: {
    backgroundColor: '#F2D8B7',
  },
  secondaryActionIcon: {
    marginBottom: 10,
  },
  secondaryActionTitle: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  secondaryActionSubtitle: {
    color: '#68746B',
    fontSize: 11,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pageScroll: {
    flex: 1,
  },
  homePageContent: {
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
  },
  petList: {
  },
  petListContent: {
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
  },
  petsPage: {
    flex: 1,
  },
  petsPageContent: {
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
  },
  petsPageHeader: {
    marginBottom: 20,
  },
  petsPageHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  petsHomeButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 10,
  },
  petsHomeButtonText: {
    color: '#52635B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  petsPageTitle: {
    color: '#1E3024',
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
  },
  petsPageSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  petsPageList: {
  },
  petOverviewCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  petOverviewImage: {
    borderRadius: 32,
    height: 64,
    marginRight: 14,
    width: 64,
  },
  petOverviewImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: '#DDEBDD',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginRight: 14,
    width: 64,
  },
  petOverviewInitial: {
    color: '#A1BBB2',
    fontSize: 24,
    fontWeight: '800',
  },
  petOverviewCopy: {
    flex: 1,
  },
  petOverviewName: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  petOverviewDetails: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
  },
  historyRow: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  historyRowTitle: {
    color: '#253529',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  historyRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  historyRowIcon: {
    marginRight: 10,
  },
  historyRowSubtitle: {
    color: '#68746B',
    fontSize: 13,
    marginTop: 2,
  },
  historyRowArrow: {
    color: '#A1BBB2',
    fontSize: 26,
    fontWeight: '400',
  },
  bottomNavigation: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: -20,
    marginBottom: 14,
    paddingVertical: 14,
  },
  navigationItem: {
    alignItems: 'center',
    flex: 1,
  },
  navigationItemActive: {
    color: '#A1BBB2',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginTop: 4,
  },
  navigationItemText: {
    color: '#68746B',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 28,
    paddingVertical: 30,
  },
  emptyStateIcon: {
    marginBottom: 10,
  },
  emptyStateTitle: {
    color: '#253529',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },
  emptyStateText: {
    color: '#68746B',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
    overflow: 'visible',
  },
  petPhotoContainer: {
    position: 'relative',
    width: '100%',
  },
  calendarButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  petName: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  petDetails: {
    marginTop: 14,
  },
  petMeta: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginTop: 10,
  },
  healthSection: {
    backgroundColor: '#F7F8F4',
    borderRadius: 14,
    marginTop: 16,
    padding: 13,
  },
  healthSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  healthSectionTitle: {
    color: '#253529',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  healthSectionSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  healthSectionAddButton: {
    alignItems: 'center',
    backgroundColor: '#DDEBDD',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 10,
  },
  healthSectionAddText: {
    color: '#40544A',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  healthSectionEmptyText: {
    color: '#7B857B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    paddingVertical: 5,
  },
  vaccineRecordCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 7,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  vaccineRecordCopy: {
    flex: 1,
  },
  vaccineRecordName: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  vaccineRecordDate: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 3,
  },
  vaccineRecordRemoveButton: {
    alignItems: 'center',
    backgroundColor: '#FFF5F4',
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  vaccineRecordRemoveText: {
    color: '#B3261E',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 100,
  },
  vaccinationModalView: {
    alignItems: 'stretch',
    borderRadius: 24,
    marginTop: 90,
    padding: 24,
  },
  vaccinationRecordsModalView: {
    alignItems: 'stretch',
    borderRadius: 24,
    marginTop: 76,
    padding: 24,
  },
  vaccinationRecordsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  vaccinationRecordsTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
  },
  vaccinationRecordsSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
  },
  vaccinationRecordsList: {
    maxHeight: 330,
  },
  vaccinationOverviewPet: {
    marginBottom: 14,
  },
  vaccinationOverviewPetName: {
    color: '#52635B',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginBottom: 8,
  },
  vaccinationRecordsEmptyText: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingVertical: 26,
    textAlign: 'center',
  },
  vaccinationModalTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
    marginBottom: 4,
  },
  vaccinationModalSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
  },
  vaccinationFieldLabel: {
    color: '#445047',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 7,
  },
  vaccinationInput: {
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    color: '#243130',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    height: 48,
    marginBottom: 17,
    paddingHorizontal: 13,
  },
  vaccinationDatePickerButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderColor: '#D8DED6',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 22,
    minHeight: 64,
    paddingHorizontal: 10,
  },
  vaccinationDatePickerIcon: {
    alignItems: 'center',
    backgroundColor: '#E8EFE7',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    marginRight: 11,
    width: 40,
  },
  vaccinationDatePickerCopy: {
    flex: 1,
  },
  vaccinationDatePickerLabel: {
    color: '#68746B',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 2,
  },
  vaccinationDatePickerValue: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  vaccinationDatePickerPlaceholder: {
    color: '#7B857B',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  vaccinationDatePickerArrow: {
    color: '#A1BBB2',
    fontSize: 26,
    fontWeight: '400',
    marginLeft: 6,
  },
  vaccinationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  vaccinationCancelButton: {
    alignItems: 'center',
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  vaccinationCancelButtonText: {
    color: '#536055',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  vaccinationSubmitButton: {
    alignItems: 'center',
    backgroundColor: '#BAD07B',
    borderRadius: 12,
    flex: 1.35,
    height: 44,
    justifyContent: 'center',
  },
  vaccinationSubmitButtonText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  vaccineDateModalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(24, 36, 29, 0.28)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  vaccineDateModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    elevation: 8,
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: '100%',
  },
  vaccineDateModalHeader: {
    alignItems: 'flex-start',
    borderBottomColor: '#E5E9E2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 14,
  },
  vaccineDateModalLabel: {
    color: '#68746B',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 4,
  },
  vaccineDateModalValue: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 19,
  },
  vaccineDateModalCloseButton: {
    alignItems: 'center',
    backgroundColor: '#F1F3EE',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  vaccineDateModalCloseText: {
    color: '#52635B',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 25,
  },
  vaccineDateModalCancelButton: {
    alignItems: 'center',
    borderColor: '#D8DED6',
    borderRadius: 11,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginTop: 10,
  },
  vaccineDateModalCancelText: {
    color: '#536055',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  appointmentModalView: {
    alignItems: 'stretch',
    borderRadius: 24,
    marginTop: 68,
    padding: 24,
  },
  appointmentModalTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
    marginBottom: 4,
  },
  appointmentModalSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  appointmentFieldLabel: {
    color: '#445047',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 7,
  },
  appointmentInput: {
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    color: '#243130',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    height: 48,
    marginBottom: 15,
    paddingHorizontal: 13,
  },
  appointmentPickerButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderColor: '#D8DED6',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 15,
    minHeight: 60,
    paddingHorizontal: 10,
  },
  appointmentPickerIcon: {
    alignItems: 'center',
    backgroundColor: '#E8EFE7',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: 11,
    width: 38,
  },
  appointmentTimeIcon: {
    alignItems: 'center',
    backgroundColor: '#E8EFE7',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: 11,
    width: 38,
  },
  appointmentPickerCopy: {
    flex: 1,
  },
  appointmentPickerLabel: {
    color: '#68746B',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 2,
  },
  appointmentPickerValue: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  appointmentPickerPlaceholder: {
    color: '#7B857B',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  appointmentPickerArrow: {
    color: '#A1BBB2',
    fontSize: 26,
    fontWeight: '400',
    marginLeft: 6,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  appointmentCancelButton: {
    alignItems: 'center',
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  appointmentCancelButtonText: {
    color: '#536055',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  appointmentSubmitButton: {
    alignItems: 'center',
    backgroundColor: '#BAD07B',
    borderRadius: 12,
    flex: 1.45,
    height: 44,
    justifyContent: 'center',
  },
  appointmentSubmitButtonText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  sectionActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  historyLinkText: {
    color: '#68746B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  historyModalView: {
    alignItems: 'stretch',
    borderRadius: 24,
    marginTop: 85,
    padding: 24,
  },
  historyModalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  historyModalTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
  },
  historyModalSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
  },
  historyModalCloseButton: {
    alignItems: 'center',
    backgroundColor: '#F1F3EE',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  historyModalCloseButtonText: {
    color: '#243130',
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 27,
  },
  historyRecordsList: {
    maxHeight: 310,
  },
  historyRecord: {
    backgroundColor: '#F7F8F4',
    borderColor: '#E5E9E2',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historySectionTitle: {
    color: '#52635B',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  historyRecordTitle: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  historyRecordMeta: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  historyEmptyText: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    paddingVertical: 24,
    textAlign: 'center',
  },
  historyDoneButton: {
    alignItems: 'center',
    backgroundColor: '#A1BBB2',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginTop: 14,
  },
  historyDoneButtonText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  calendarModalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  calendarTitle: {
    marginBottom: 0,
  },
  calendarCloseButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  calendarCloseButtonText: {
    color: '#243130',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
    width: '100%',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  toggleLabel: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  petImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#F1F3EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#68746B',
    fontSize: 13,
  },
  petMenuButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 36,
  },
  imagePickerButton: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  addPetPhotoPicker: {
    alignSelf: 'stretch',
    marginBottom: 18,
  },
  addPetPhotoPreview: {
    backgroundColor: '#F1F3EE',
    borderRadius: 14,
    height: 118,
    width: '100%',
  },
  addPetPhotoPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderColor: '#D8DED6',
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 92,
    justifyContent: 'center',
  },
  addPetPhotoText: {
    color: '#52635B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholderSmall: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    width: '100%',
    marginBottom: 10,
  },
  appointmentList: {
    width: '100%',
    marginTop: 10,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appointmentItem: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  appointmentPetName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  appointmentReason: {
    fontSize: 14,
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
  },
  noAppointments: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  datePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  datePickerButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  vaccinationList: {
    width: '100%',
    maxHeight: '80%',
  },
  vaccinationPetSection: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  vaccinationPetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  vaccinationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  vaccinationInfo: {
    flex: 1,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  vaccinationDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  noVaccinations: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  addItemText: {
    color: '#A1BBB2',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  removeItemText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
  ageDisplay: {
    color: '#52635B',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  editPetModalView: {
    alignItems: 'stretch',
    borderRadius: 24,
    marginTop: 82,
    padding: 24,
  },
  editPetModalTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
    marginBottom: 4,
  },
  editPetModalSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
  },
  editPetFieldLabel: {
    color: '#445047',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 7,
  },
  editPetInput: {
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    color: '#243130',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    height: 48,
    marginBottom: 16,
    paddingHorizontal: 13,
  },
  editPetSexPicker: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
    minHeight: 52,
  },
  editPetSexLabel: {
    color: '#7B857B',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginHorizontal: 12,
  },
  editPetSexLabelActive: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
  },
  editPetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editPetCancelButton: {
    alignItems: 'center',
    borderColor: '#D8DED6',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  editPetCancelButtonText: {
    color: '#536055',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  editPetSubmitButton: {
    alignItems: 'center',
    backgroundColor: '#BAD07B',
    borderRadius: 12,
    flex: 1.4,
    height: 44,
    justifyContent: 'center',
  },
  editPetSubmitButtonText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  actionMenuBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(24, 36, 29, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  actionMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxWidth: 440,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: '100%',
  },
  actionMenuTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  actionMenuSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 17,
    marginTop: 4,
  },
  actionMenuButton: {
    alignItems: 'center',
    backgroundColor: '#F7F8F4',
    borderColor: '#E5E9E2',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
    minHeight: 51,
    paddingHorizontal: 14,
  },
  actionMenuButtonText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  actionMenuArrow: {
    color: '#A1BBB2',
    fontSize: 26,
    lineHeight: 28,
  },
  actionMenuDestructiveButton: {
    backgroundColor: '#FFF5F4',
    borderColor: '#F4D6D2',
  },
  actionMenuDestructiveText: {
    color: '#B3261E',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  actionMenuCancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionMenuCancelText: {
    color: '#52635B',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  sidebarBackdrop: {
    backgroundColor: 'rgba(24, 36, 29, 0.32)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sidebarDismissArea: {
    flex: 1,
  },
  settingsSidebar: {
    backgroundColor: '#FFFFFF',
    elevation: 10,
    height: '100%',
    maxWidth: 340,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 52 : 64,
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: '84%',
  },
  settingsSidebarHeader: {
    alignItems: 'flex-start',
    borderBottomColor: '#E5E9E2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
  },
  settingsSidebarTitle: {
    color: '#243130',
    fontFamily: 'Inter_700Bold',
    fontSize: 23,
  },
  settingsSidebarSubtitle: {
    color: '#68746B',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 4,
  },
  settingsSidebarCloseButton: {
    alignItems: 'center',
    backgroundColor: '#F1F3EE',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  settingsSidebarCloseText: {
    color: '#52635B',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 26,
  },
  settingsSidebarList: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E9E2',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsSidebarItem: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  settingsSidebarDivider: {
    backgroundColor: '#E5E9E2',
    height: 1,
    marginLeft: 64,
  },
  settingsSidebarItemIcon: {
    alignItems: 'center',
    backgroundColor: '#E8EFE7',
    borderRadius: 11,
    height: 42,
    justifyContent: 'center',
    marginRight: 11,
    width: 42,
  },
  settingsSidebarItemCopy: {
    flex: 1,
  },
  settingsSidebarItemText: {
    color: '#243130',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  settingsSidebarItemDescription: {
    color: '#7B857B',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 3,
  },
  settingsSidebarArrow: {
    color: '#A1BBB2',
    fontSize: 26,
    lineHeight: 28,
  },
});
