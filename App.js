import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Switch, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pet_diary_data';

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
      <Text style={styles.title}>My Pets Diary</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { flex: 1 }]}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add New Pet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, { flex: 1, backgroundColor: '#2196F3' }]}
          onPress={() => setCalendarVisible(true)}>
          <Text style={styles.addButtonText}>View Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.addButton, { flex: 1, backgroundColor: '#4CAF50' }]}
          onPress={() => setVaccinationListVisible(true)}>
          <Text style={styles.addButtonText}>Vaccinations</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.petList}>
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
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
