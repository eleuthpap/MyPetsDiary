import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Switch, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

const STORAGE_KEY = '@pet_diary_data';

const CalendarCardIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 640 640" fill="#757F9A">
    <Path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z" />
  </Svg>
);

const VaccineCardIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 640 640" fill="none">
    <Path stroke="#7F0808" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" d="M529.5 47C520.1 37.6 504.9 37.6 495.6 47C486.3 56.4 486.2 71.6 495.6 80.9L510.6 95.9L464.5 142L401.5 79C392.1 69.6 376.9 69.6 367.6 79C358.3 88.4 358.2 103.6 367.6 112.9L374.6 119.9L296.5 198L337.5 239C346.9 248.4 346.9 263.6 337.5 272.9C328.1 282.2 312.9 282.3 303.6 272.9L262.6 231.9L216.5 278L257.5 319C266.9 328.4 266.9 343.6 257.5 352.9C248.1 362.2 232.9 362.3 223.6 352.9L182.6 311.9L144.9 349.6C134.4 360.1 128.5 374.3 128.5 389.2L128.5 478L71.5 535C62.1 544.4 62.1 559.6 71.5 568.9C80.9 578.2 96.1 578.3 105.4 568.9L162.4 511.9L251.2 511.9C266.1 511.9 280.3 506 290.8 495.5L520.5 265.8L527.5 272.8C536.9 282.2 552.1 282.2 561.4 272.8C570.7 263.4 570.8 248.2 561.4 238.9L498.4 175.9L544.5 129.8L559.5 144.8C568.9 154.2 584.1 154.2 593.4 144.8C602.7 135.4 602.8 120.2 593.4 110.9L529.4 46.9z" />
  </Svg>
);

const EmptyDiaryIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 640 640" fill="rgba(110, 103, 75, 1.00)">
    <Path d="M197.4 224C193.5 224 190.2 221.2 189.3 217.4C179.1 175.3 141.2 144 96 144C43 144 0 187 0 240C0 269.1 12.9 295.1 33.3 312.7C37.6 316.4 37.6 323.5 33.3 327.2C12.9 344.8 0 370.9 0 399.9C0 452.9 43 495.9 96 495.9C141.2 495.9 179.1 464.6 189.3 422.5C190.2 418.7 193.5 415.9 197.4 415.9L442.5 415.9C446.4 415.9 449.7 418.7 450.6 422.5C460.8 464.6 498.7 495.9 543.9 495.9C596.9 495.9 639.9 452.9 639.9 399.9C639.9 370.8 627 344.8 606.6 327.2C602.3 323.5 602.3 316.4 606.6 312.7C627 295.1 639.9 269 639.9 240C639.9 187 596.9 144 543.9 144C498.7 144 460.8 175.3 450.6 217.4C449.7 221.2 446.4 224 442.5 224L197.4 224z" />
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

export default function App() {
  const [pets, setPets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [vaccinationListVisible, setVaccinationListVisible] = useState(false);

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

  const onVaccineDateChange = (event, selectedDate) => {
    setShowVaccineDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      setNewVaccine(prev => ({ ...prev, date: formatDate(selectedDate) }));
    }
  };

  const onAppointmentDateChange = (event, selectedDate) => {
    setShowAppointmentDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      setNewAppointment(prev => ({ ...prev, date: formatDate(selectedDate) }));
    }
  };

  const onAppointmentTimeChange = (event, selectedDate) => {
    setShowAppointmentTimePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
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

  const handleImageOptions = (pet) => {
    Alert.alert(
      "Photo Options",
      "What would you like to do?",
      [
        {
          text: "Choose New Photo",
          onPress: () => pickImage(pet)
        },
        {
          text: "Remove Photo",
          onPress: () => {
            if (pet) {
              const updatedPet = { ...pet, image: null };
              setPets(currentPets =>
                currentPets.map(p => p.id === pet.id ? updatedPet : p)
              );
              setSelectedPet(updatedPet);
            } else {
              setNewPet(current => ({ ...current, image: null }));
            }
          },
          style: 'destructive'
        },
        {
          text: "Cancel",
          style: 'cancel'
        }
      ]
    );
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const imageUri = pickerResult.assets[0].uri;
        
        if (pet) {
          // If editing existing pet
          const updatedPet = { ...pet, image: imageUri };
          setPets(currentPets => 
            currentPets.map(p => p.id === pet.id ? updatedPet : p)
          );
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

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>PET CARE, SIMPLIFIED</Text>
          <Text style={styles.title}>My Pets Diary</Text>
          <Text style={styles.subtitle}>
            {pets.length === 0
              ? 'Keep every little moment in one place.'
              : `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} in your family`}
          </Text>
        </View>
      </View>

      <View style={styles.homeActions}>
        <TouchableOpacity 
          style={styles.primaryAction}
          onPress={() => setModalVisible(true)}>
          <View style={styles.primaryActionIcon}>
            <Text style={styles.actionIconText}>＋</Text>
          </View>
          <View>
            <Text style={styles.primaryActionTitle}>Add a pet</Text>
            <Text style={styles.primaryActionSubtitle}>Create their little profile</Text>
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

      <ScrollView style={styles.petList} contentContainerStyle={styles.petListContent}>
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deletePet(pet.id)}>
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setSelectedPet(pet);
                  setEditModalVisible(true);
                  setIsMale(pet.sex === 'Male');
                }}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => pet.image ? handleImageOptions(pet) : pickImage(pet)}>
              {pet.image ? (
                <Image 
                  source={{ uri: pet.image }} 
                  style={styles.petImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text>Tap to add photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.petName}>{pet.name}</Text>
            <Text>Age: {pet.birthYear ? calculateAge(pet.birthYear) : (pet.age || 'Unknown')} years old</Text>
            <Text>Birth Year: {pet.birthYear || 'Unknown'}</Text>
            <Text>Sex: {pet.sex}</Text>
            
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
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add New Pet</Text>
          <TouchableOpacity 
            style={styles.imagePickerButton} 
            onPress={() => newPet.image ? handleImageOptions(null) : pickImage(null)}>
            {newPet.image ? (
              <Image 
                source={{ uri: newPet.image }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholderSmall}>
                <Text>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Pet Name"
            placeholderTextColor="#999"
            value={newPet.name}
            onChangeText={(text) => setNewPet({...newPet, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Birth Year (e.g., 2020)"
            placeholderTextColor="#999"
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
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Female</Text>
            <Switch
              value={isMale}
              onValueChange={(value) => {
                setIsMale(value);
                setNewPet({...newPet, sex: value ? 'Male' : 'Female'});
              }}
              trackColor={{ false: '#ff69b4', true: '#4169e1' }}
              thumbColor={isMale ? '#1e90ff' : '#ff1493'}
            />
            <Text style={styles.toggleLabel}>Male</Text>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={addPet}>
            <Text style={styles.submitButtonText}>Add Pet</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Pet</Text>
          <TextInput
            style={styles.input}
            placeholder="Pet Name"
            placeholderTextColor="#999"
            value={selectedPet?.name}
            onChangeText={(text) => setSelectedPet({...selectedPet, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Birth Year (e.g., 2020)"
            placeholderTextColor="#999"
            value={selectedPet?.birthYear || selectedPet?.age}
            onChangeText={(text) => setSelectedPet({...selectedPet, birthYear: text})}
            keyboardType="numeric"
            maxLength={4}
          />
          {selectedPet?.birthYear && (
            <Text style={styles.ageDisplay}>
              Current Age: {calculateAge(selectedPet.birthYear)} years old
            </Text>
          )}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Female</Text>
            <Switch
              value={isMale}
              onValueChange={(value) => {
                setIsMale(value);
                setSelectedPet({...selectedPet, sex: value ? 'Male' : 'Female'});
              }}
              trackColor={{ false: '#ff69b4', true: '#4169e1' }}
              thumbColor={isMale ? '#1e90ff' : '#ff1493'}
            />
            <Text style={styles.toggleLabel}>Male</Text>
          </View>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={() => {
              updatePet(selectedPet);
              setEditModalVisible(false);
            }}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setEditModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Vaccination Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vaccineModalVisible}
        onRequestClose={() => setVaccineModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Vaccination</Text>
          <TextInput
            style={styles.input}
            placeholder="Vaccination Name"
            placeholderTextColor="#999"
            value={newVaccine.name}
            onChangeText={(text) => setNewVaccine({...newVaccine, name: text})}
          />
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowVaccineDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {newVaccine.date || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showVaccineDatePicker && (
            <DateTimePicker
              value={newVaccine.date ? new Date(newVaccine.date) : new Date()}
              mode="date"
              onChange={onVaccineDateChange}
            />
          )}
          <TouchableOpacity style={styles.submitButton} onPress={addVaccination}>
            <Text style={styles.submitButtonText}>Add Vaccination</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setVaccineModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={appointmentModalVisible}
        onRequestClose={() => setAppointmentModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Schedule Appointment</Text>
          <TextInput
            style={styles.input}
            placeholder="Reason for Visit"
            placeholderTextColor="#999"
            value={newAppointment.reason}
            onChangeText={(text) => setNewAppointment({...newAppointment, reason: text})}
          />
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowAppointmentDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {newAppointment.date || 'Select Date'}
            </Text>
          </TouchableOpacity>
          {showAppointmentDatePicker && (
            <DateTimePicker
              value={newAppointment.date ? new Date(newAppointment.date) : new Date()}
              mode="date"
              onChange={onAppointmentDateChange}
            />
          )}

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowAppointmentTimePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {newAppointment.time || 'Select Time'}
            </Text>
          </TouchableOpacity>
          {showAppointmentTimePicker && (
            <DateTimePicker
              value={newAppointment.time ? new Date(`2000-01-01T${newAppointment.time}:00`) : new Date()}
              mode="time"
              onChange={onAppointmentTimeChange}
            />
          )}
          <TouchableOpacity style={styles.submitButton} onPress={addAppointment}>
            <Text style={styles.submitButtonText}>Schedule Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setAppointmentModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={calendarVisible}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Appointments Calendar</Text>
          
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
                      <Text style={styles.petName}>{app.petName}</Text>
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

          <TouchableOpacity 
            style={[styles.submitButton, { marginTop: 10 }]}
            onPress={() => setCalendarVisible(false)}>
            <Text style={styles.submitButtonText}>Close Calendar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Vaccination List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vaccinationListVisible}
        onRequestClose={() => setVaccinationListVisible(false)}
      >
        <View style={[styles.modalView, { paddingTop: 40 }]}>
          <Text style={styles.modalTitle}>Vaccination Records</Text>
          
          <ScrollView style={styles.vaccinationList}>
            {getAllVaccinations().map((pet, petIndex) => (
              <View key={petIndex} style={styles.vaccinationPetSection}>
                <Text style={styles.vaccinationPetName}>{pet.petName}</Text>
                {pet.vaccinations.map((vacc, index) => (
                  <View key={index} style={styles.vaccinationItem}>
                    <View style={styles.vaccinationInfo}>
                      <Text style={styles.vaccinationName}>{vacc.name}</Text>
                      <Text style={styles.vaccinationDate}>{vacc.date}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeVaccination(pet.petId, vacc.index)}>
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
            {getAllVaccinations().length === 0 && (
              <Text style={styles.noVaccinations}>No vaccination records found</Text>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.submitButton, { marginTop: 10 }]}
            onPress={() => setVaccinationListVisible(false)}>
            <Text style={styles.submitButtonText}>Close</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: 56,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: '#6A7A6A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  title: {
    color: '#1E3024',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#68746B',
    fontSize: 13,
    marginTop: 3,
  },
  homeActions: {
    marginBottom: 24,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#39764A',
    borderRadius: 20,
    flexDirection: 'row',
    minHeight: 82,
    paddingHorizontal: 18,
    shadowColor: '#265432',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryActionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    marginRight: 14,
    width: 46,
  },
  actionIconText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  primaryActionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  primaryActionSubtitle: {
    color: '#DDEEDF',
    fontSize: 13,
    marginTop: 2,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  secondaryAction: {
    borderRadius: 18,
    flex: 1,
    minHeight: 118,
    padding: 15,
  },
  calendarAction: {
    backgroundColor: '#C9D3DD',
  },
  vaccineAction: {
    backgroundColor: '#F2D8B7',
  },
  secondaryActionIcon: {
    marginBottom: 12,
  },
  secondaryActionTitle: {
    color: '#243130',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionSubtitle: {
    color: '#68746B',
    fontSize: 12,
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
  petList: {
    flex: 1,
  },
  petListContent: {
    paddingBottom: 24,
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
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'visible',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  calendarButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section: {
    marginTop: 10,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    marginTop: 40,
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    marginTop: 40,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerButton: {
    width: '100%',
    marginBottom: 15,
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
  petName: {
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
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(206, 76, 76, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#ff4444',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  editButton: {
    position: 'absolute',
    right: 46,
    top: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  editButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  addItemText: {
    color: '#4CAF50',
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
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
});
