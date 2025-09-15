import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthCheckupApp = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('static');

  const handleTongueHealth = () => navigation.navigate('TongueDiseaseChecker');
  const handleAnemicPredictor = () => navigation.navigate('NailAnalysis');
  const handleSkinHealth = () => navigation.navigate('SkinCheck');
  const handleEyeHealth = () => navigation.navigate('EyeScreen');
  const handleMelanomaDetection = () => navigation.navigate('MelanomaScreen');
   const handleHairHealth = () => navigation.navigate('HairCheckScreen');

  const StaticAnalysisContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={handleTongueHealth}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Tongue Health</Text>
              <Text style={styles.cardSubtitle}>Analyze your tongue condition</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleAnemicPredictor}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Anemic Predictor</Text>
              <Text style={styles.cardSubtitle}>Upload an image of your nails</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>

          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={handleSkinHealth}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Skin Health</Text>
              <Text style={styles.cardSubtitle}>Get skin health analysis</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card} onPress={handleEyeHealth}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Eye Health</Text>
              <Text style={styles.cardSubtitle}>Eye health recommendations</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>

          </View>
        </TouchableOpacity>


      </View>
      
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={handleHairHealth}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Hair Health</Text>
              <Text style={styles.cardSubtitle}>Get Hair health analysis</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>
          </View>
        </TouchableOpacity>


        <TouchableOpacity style={styles.card} onPress={handleEyeHealth}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Eye Health</Text>
              <Text style={styles.cardSubtitle}>Eye health recommendations</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/camara.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>

          </View>
        </TouchableOpacity>


      </View>

    </View>
  );

  const LiveAnalysisContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.card, styles.liveCard]} onPress={handleMelanomaDetection}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Detect Melanoma</Text>
              <Text style={styles.cardSubtitle}>Live melanoma risk detection</Text>
            </View>
            <View style={styles.iconContainer}>
              <Image
                source={require('../../../assets/icons/viedo.png')}
                style={{ width: 35, height: 35, resizeMode: 'contain' }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Health Checkup</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'static' && styles.activeTab]}
          onPress={() => setActiveTab('static')}
        >
          <Text style={[styles.tabText, activeTab === 'static' && styles.activeTabText]}>
            Static Analysis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.activeTab]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.tabText, activeTab === 'live' && styles.activeTabText]}>
            Live Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'static' ? <StaticAnalysisContent /> : <LiveAnalysisContent />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    marginTop: StatusBar.currentHeight || 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#7475B4' },
  tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
  activeTabText: { color: '#7475B4', fontWeight: '600' },
  contentContainer: { flex: 1, padding:10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  liveCard: { marginRight: '50%' },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

export default HealthCheckupApp;
