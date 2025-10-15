import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from "../../config/config"


const InsuranceScreen = () => {
  const [activeTab, setActiveTab] = useState('predict');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [billResult, setBillResult] = useState(null);
  
  // Prediction Form State
  const [predictionForm, setPredictionForm] = useState({
    operation_name: '',
    operation_cost: '',
    insurance_company: 'HealthPlus',
    policy_type: 'Gold',
    patient_age: '',
    pre_existing_conditions: '0',
    emergency_case: '0'
  });

  // Bill Form State
  const [billForm, setBillForm] = useState({
    patient_name: '',
    operation_name: '',
    operation_cost: '',
    insurance_company: 'HealthPlus',
    policy_type: 'Gold',
    claim_approved: ''
  });

  const handlePrediction = async () => {
    if (!predictionForm.operation_name || !predictionForm.operation_cost || !predictionForm.patient_age) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
        const response = await fetch(`${BASE_URL}/api/insurance/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...predictionForm,
          operation_cost: parseFloat(predictionForm.operation_cost),
          patient_age: parseInt(predictionForm.patient_age),
          pre_existing_conditions: parseInt(predictionForm.pre_existing_conditions),
          emergency_case: parseInt(predictionForm.emergency_case)
        })
      });
      const data = await response.json();
      setPredictionResult(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleBill = async () => {
    if (!billForm.patient_name || !billForm.operation_name || !billForm.operation_cost || !billForm.claim_approved) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
       const response = await fetch(`${BASE_URL}/api/insurance/bill`, {
    
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...billForm,
          operation_cost: parseFloat(billForm.operation_cost),
          claim_approved: parseFloat(billForm.claim_approved)
        })
      });
      const data = await response.json();
      setBillResult(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Insurance Claim Prediction</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Operation Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Knee Replacement"
          value={predictionForm.operation_name}
          onChangeText={(text) => setPredictionForm({...predictionForm, operation_name: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Operation Cost (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="250000"
          keyboardType="numeric"
          value={predictionForm.operation_cost}
          onChangeText={(text) => setPredictionForm({...predictionForm, operation_cost: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patient Age *</Text>
        <TextInput
          style={styles.input}
          placeholder="45"
          keyboardType="numeric"
          value={predictionForm.patient_age}
          onChangeText={(text) => setPredictionForm({...predictionForm, patient_age: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Insurance Company</Text>
        <View style={styles.pickerContainer}>
          {['HealthPlus', 'MediCare', 'LifeCare', 'StarHealth'].map((company) => (
            <TouchableOpacity
              key={company}
              style={[
                styles.pickerOption,
                predictionForm.insurance_company === company && styles.pickerOptionActive
              ]}
              onPress={() => setPredictionForm({...predictionForm, insurance_company: company})}
            >
              <Text style={[
                styles.pickerText,
                predictionForm.insurance_company === company && styles.pickerTextActive
              ]}>{company}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Policy Type</Text>
        <View style={styles.pickerContainer}>
          {['Gold', 'Silver', 'Platinum'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pickerOption,
                predictionForm.policy_type === type && styles.pickerOptionActive
              ]}
              onPress={() => setPredictionForm({...predictionForm, policy_type: type})}
            >
              <Text style={[
                styles.pickerText,
                predictionForm.policy_type === type && styles.pickerTextActive
              ]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pre-existing Conditions</Text>
        <View style={styles.pickerContainer}>
          {['0', '1', '2', '3+'].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.pickerOption,
                predictionForm.pre_existing_conditions === count && styles.pickerOptionActive
              ]}
              onPress={() => setPredictionForm({...predictionForm, pre_existing_conditions: count})}
            >
              <Text style={[
                styles.pickerText,
                predictionForm.pre_existing_conditions === count && styles.pickerTextActive
              ]}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Emergency Case</Text>
        <View style={styles.pickerContainer}>
          {[{label: 'No', value: '0'}, {label: 'Yes', value: '1'}].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pickerOption,
                predictionForm.emergency_case === option.value && styles.pickerOptionActive
              ]}
              onPress={() => setPredictionForm({...predictionForm, emergency_case: option.value})}
            >
              <Text style={[
                styles.pickerText,
                predictionForm.emergency_case === option.value && styles.pickerTextActive
              ]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handlePrediction} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Get Prediction</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBillForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Generate Medical Bill</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient name"
          value={billForm.patient_name}
          onChangeText={(text) => setBillForm({...billForm, patient_name: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Operation Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Heart Bypass"
          value={billForm.operation_name}
          onChangeText={(text) => setBillForm({...billForm, operation_name: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Operation Cost (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="500000"
          keyboardType="numeric"
          value={billForm.operation_cost}
          onChangeText={(text) => setBillForm({...billForm, operation_cost: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Claim Approved (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="375000"
          keyboardType="numeric"
          value={billForm.claim_approved}
          onChangeText={(text) => setBillForm({...billForm, claim_approved: text})}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Insurance Company</Text>
        <View style={styles.pickerContainer}>
          {['HealthPlus', 'MediCare', 'LifeCare', 'StarHealth'].map((company) => (
            <TouchableOpacity
              key={company}
              style={[
                styles.pickerOption,
                billForm.insurance_company === company && styles.pickerOptionActive
              ]}
              onPress={() => setBillForm({...billForm, insurance_company: company})}
            >
              <Text style={[
                styles.pickerText,
                billForm.insurance_company === company && styles.pickerTextActive
              ]}>{company}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleBill} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Generate Bill</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPredictionResult = () => (
    <Modal visible={!!predictionResult} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Prediction Result</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Operation</Text>
            <Text style={styles.resultValue}>{predictionResult?.operation_name}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Total Cost</Text>
            <Text style={styles.resultValue}>₹{predictionResult?.operation_cost?.toLocaleString()}</Text>
          </View>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightLabel}>Claim Approved</Text>
            <Text style={styles.highlightValue}>₹{predictionResult?.claim_approved?.toLocaleString()}</Text>
            <Text style={styles.percentageText}>{predictionResult?.approval_percentage}% Coverage</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Patient Payment</Text>
            <Text style={styles.resultValueWarning}>₹{predictionResult?.patient_payment?.toLocaleString()}</Text>
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setPredictionResult(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBillResult = () => (
    <Modal visible={!!billResult} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalScrollContent}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Medical Bill</Text>
            
            <View style={styles.billHeader}>
              <Text style={styles.billNumber}>Bill #{billResult?.bill_number}</Text>
              <Text style={styles.billDate}>{billResult?.bill_date}</Text>
            </View>

            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{billResult?.patient_info?.name}</Text>
              <Text style={styles.patientDetail}>Hospital: {billResult?.patient_info?.hospital}</Text>
              <Text style={styles.patientDetail}>Operation: {billResult?.patient_info?.operation}</Text>
            </View>

            <Text style={styles.sectionHeader}>Cost Breakdown</Text>
            {billResult?.cost_breakdown && Object.entries(billResult.cost_breakdown).map(([key, value]) => (
              <View key={key} style={styles.billRow}>
                <Text style={styles.billLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.billValue}>₹{value?.toLocaleString()}</Text>
              </View>
            ))}

            <Text style={styles.sectionHeader}>Insurance Claim</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>CLAIM APPROVED</Text>
              <Text style={styles.billValueSuccess}>₹{billResult?.insurance_claim?.claim_approved?.toLocaleString()}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>CLAIM REJECTED</Text>
              <Text style={styles.billValueWarning}>₹{billResult?.insurance_claim?.claim_rejected?.toLocaleString()}</Text>
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bill</Text>
                <Text style={styles.totalValue}>₹{billResult?.payment_summary?.total_bill_amount?.toLocaleString()}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Insurance Covers</Text>
                <Text style={styles.totalValueSuccess}>-₹{billResult?.payment_summary?.insurance_covers?.toLocaleString()}</Text>
              </View>
              <View style={styles.finalTotal}>
                <Text style={styles.finalLabel}>Patient Must Pay</Text>
                <Text style={styles.finalValue}>₹{billResult?.payment_summary?.patient_must_pay?.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setBillResult(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Insurance Management</Text>
        <Text style={styles.headerSubtitle}>Predict claims & generate bills</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'predict' && styles.tabActive]}
          onPress={() => setActiveTab('predict')}
        >
          <Text style={[styles.tabText, activeTab === 'predict' && styles.tabTextActive]}>
            Prediction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bill' && styles.tabActive]}
          onPress={() => setActiveTab('bill')}
        >
          <Text style={[styles.tabText, activeTab === 'bill' && styles.tabTextActive]}>
            Generate Bill
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'predict' ? renderPredictionForm() : renderBillForm()}
      </ScrollView>

      {renderPredictionResult()}
      {renderBillResult()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pickerOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  pickerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pickerTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    width: '90%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  resultValueWarning: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  highlightCard: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  highlightValue: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  closeButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  billHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 16,
  },
  billNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  billDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  patientInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  patientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billLabel: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  billValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  billValueSuccess: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  billValueWarning: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  totalSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalValueSuccess: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#667eea',
  },
  finalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  finalValue: {
    fontSize: 22,
    color: '#667eea',
    fontWeight: 'bold',
  },
});

export default InsuranceScreen;