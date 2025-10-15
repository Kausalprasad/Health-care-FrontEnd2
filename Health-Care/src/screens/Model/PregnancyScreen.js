// App.js - React Native Expo Version
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from "../../config/config"

export default function PregnancyScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const [pregnancyData, setPregnancyData] = useState({
    month: '',
    age: '',
    weight: '',
    height: '',
    conditions: '',
    symptoms: '',
    diet_type: 'vegetarian',
    activity_level: 'moderate',
  });

  const [babyData, setBabyData] = useState({
    age_months: '',
    weight: '',
    height: '',
    gender: 'male',
    feeding_type: 'breast milk',
    health_concerns: '',
    milestones_achieved: '',
  });

  const handlePregnancySubmit = async () => {
    if (!pregnancyData.month || !pregnancyData.age || !pregnancyData.weight || !pregnancyData.height) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const payload = {
        month: parseInt(pregnancyData.month),
        age: parseInt(pregnancyData.age),
        weight: parseFloat(pregnancyData.weight),
        height: parseFloat(pregnancyData.height),
        conditions: pregnancyData.conditions.split(',').map(c => c.trim()).filter(c => c),
        symptoms: pregnancyData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        diet_type: pregnancyData.diet_type,
        activity_level: pregnancyData.activity_level,
      };


      const response = await fetch(`${BASE_URL}/api/pregnancy/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setRecommendations(data.recommendations);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBabySubmit = async () => {
    if (!babyData.age_months || !babyData.weight || !babyData.height) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const payload = {
        age_months: parseInt(babyData.age_months),
        weight: parseFloat(babyData.weight),
        height: parseFloat(babyData.height),
        gender: babyData.gender,
        feeding_type: babyData.feeding_type,
        health_concerns: babyData.health_concerns.split(',').map(h => h.trim()).filter(h => h),
        milestones_achieved: babyData.milestones_achieved.split(',').map(m => m.trim()).filter(m => m),
      };
      const response = await fetch(`${BASE_URL}/api/baby/recommend`,{
     
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setRecommendations(data.recommendations);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setRecommendations(null);
    setError(null);
    setPregnancyData({
      month: '', age: '', weight: '', height: '',
      conditions: '', symptoms: '', diet_type: 'vegetarian', activity_level: 'moderate',
    });
    setBabyData({
      age_months: '', weight: '', height: '', gender: 'male',
      feeding_type: 'breast milk', health_concerns: '', milestones_achieved: '',
    });
  };

  // Home Screen
  if (!selectedType) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient colors={['#fce7f3', '#dbeafe', '#f3e8ff']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.mainTitle}>Welcome to Care Support 💝</Text>
              <Text style={styles.subtitle}>Choose the type of care you need</Text>
            </View>

            <View style={styles.cardsContainer}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedType('pregnancy')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.iconCircle}>
                  <Text style={styles.iconText}>💗</Text>
                </LinearGradient>
                <Text style={styles.cardTitle}>Pregnancy Care</Text>
                <Text style={styles.cardDescription}>
                  Get personalized recommendations for your pregnancy journey
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedType('baby')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#60a5fa', '#3b82f6']} style={styles.iconCircle}>
                  <Text style={styles.iconText}>👶</Text>
                </LinearGradient>
                <Text style={styles.cardTitle}>Baby Care</Text>
                <Text style={styles.cardDescription}>
                  Expert guidance for your baby's development and health
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Form Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#fce7f3', '#dbeafe', '#f3e8ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.formScrollContent}>
          <TouchableOpacity onPress={resetForm} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to selection</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formIconText}>
                {selectedType === 'pregnancy' ? '💗' : '👶'}
              </Text>
              <Text style={styles.formTitle}>
                {selectedType === 'pregnancy' ? 'Pregnancy Care' : 'Baby Care'}
              </Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            {!recommendations ? (
              selectedType === 'pregnancy' ? (
                <View style={styles.form}>
                  <View style={styles.row}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Pregnancy Month *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g., 5"
                        value={pregnancyData.month}
                        onChangeText={(text) => setPregnancyData({...pregnancyData, month: text})}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Your Age *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g., 27"
                        value={pregnancyData.age}
                        onChangeText={(text) => setPregnancyData({...pregnancyData, age: text})}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Weight (kg) *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="e.g., 65"
                        value={pregnancyData.weight}
                        onChangeText={(text) => setPregnancyData({...pregnancyData, weight: text})}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Height (cm) *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g., 162"
                        value={pregnancyData.height}
                        onChangeText={(text) => setPregnancyData({...pregnancyData, height: text})}
                      />
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Diet Type</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={pregnancyData.diet_type}
                        onValueChange={(value) => setPregnancyData({...pregnancyData, diet_type: value})}
                        style={styles.picker}
                      >
                        <Picker.Item label="Vegetarian" value="vegetarian" />
                        <Picker.Item label="Non-Vegetarian" value="non-vegetarian" />
                        <Picker.Item label="Vegan" value="vegan" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Activity Level</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={pregnancyData.activity_level}
                        onValueChange={(value) => setPregnancyData({...pregnancyData, activity_level: value})}
                        style={styles.picker}
                      >
                        <Picker.Item label="Low" value="low" />
                        <Picker.Item label="Moderate" value="moderate" />
                        <Picker.Item label="High" value="high" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Health Conditions (comma separated)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., anemia, diabetes"
                      value={pregnancyData.conditions}
                      onChangeText={(text) => setPregnancyData({...pregnancyData, conditions: text})}
                    />
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Symptoms (comma separated)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., fatigue, nausea"
                      value={pregnancyData.symptoms}
                      onChangeText={(text) => setPregnancyData({...pregnancyData, symptoms: text})}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handlePregnancySubmit}
                    disabled={loading}
                  >
                    <LinearGradient colors={['#ec4899', '#db2777']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Get Recommendations</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.row}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Baby Age (months) *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g., 3"
                        value={babyData.age_months}
                        onChangeText={(text) => setBabyData({...babyData, age_months: text})}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Weight (kg) *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="e.g., 6.5"
                        value={babyData.weight}
                        onChangeText={(text) => setBabyData({...babyData, weight: text})}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Height (cm) *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g., 62"
                        value={babyData.height}
                        onChangeText={(text) => setBabyData({...babyData, height: text})}
                      />
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={babyData.gender}
                        onValueChange={(value) => setBabyData({...babyData, gender: value})}
                        style={styles.picker}
                      >
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Feeding Type</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={babyData.feeding_type}
                        onValueChange={(value) => setBabyData({...babyData, feeding_type: value})}
                        style={styles.picker}
                      >
                        <Picker.Item label="Breast Milk" value="breast milk" />
                        <Picker.Item label="Formula" value="formula" />
                        <Picker.Item label="Mixed" value="mixed" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Health Concerns (comma separated)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., colic, rash"
                      value={babyData.health_concerns}
                      onChangeText={(text) => setBabyData({...babyData, health_concerns: text})}
                    />
                  </View>

                  <View style={styles.fullInputContainer}>
                    <Text style={styles.label}>Milestones Achieved (comma separated)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., holds head up, smiles"
                      value={babyData.milestones_achieved}
                      onChangeText={(text) => setBabyData({...babyData, milestones_achieved: text})}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleBabySubmit}
                    disabled={loading}
                  >
                    <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.buttonGradient}>
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Get Recommendations</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.recommendationsContainer}>
                <View style={styles.successHeader}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successText}>Recommendations Ready!</Text>
                </View>
                <View style={styles.recommendationsBox}>
                  <ScrollView>
                    <Text style={styles.recommendationsText}>{recommendations}</Text>
                  </ScrollView>
                </View>
                <TouchableOpacity style={styles.newConsultButton} onPress={resetForm}>
                  <Text style={styles.newConsultText}>Start New Consultation</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  formScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  formIconText: {
    fontSize: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  form: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
  },
  fullInputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationsContainer: {
    gap: 20,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successIcon: {
    fontSize: 24,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  recommendationsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recommendationsText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
  },
  newConsultButton: {
    backgroundColor: '#e5e7eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  newConsultText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold',
  },
});