import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Text,
  StatusBar,
  Dimensions,
  Animated,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useHealthData from '../../hooks/useHealthData';
import VitalCard from './VitalCard';
import PermissionHandler from './PermissionHandler';
import { formatDisplay } from '../../services/health/dataFormatters';

const { width, height } = Dimensions.get('window');

const config = [
  { 
    title: 'Steps', 
    icon: '👟', 
    key: 'steps', 
    gradient: ['#667eea', '#764ba2'], 
    shadowColor: '#667eea',
    unit: 'steps',
    target: 10000,
    category: 'activity'
  },
  { 
    title: 'Heart Rate', 
    icon: '💖', 
    key: 'heartRate', 
    gradient: ['#f093fb', '#f5576c'], 
    shadowColor: '#f093fb',
    unit: 'bpm',
    target: 75,
    category: 'vitals'
  },
  { 
    title: 'Distance', 
    icon: '🏃‍♂️', 
    key: 'distance', 
    gradient: ['#4facfe', '#00f2fe'], 
    shadowColor: '#4facfe',
    unit: 'km',
    target: 5,
    category: 'activity'
  },
  { 
    title: 'Calories', 
    icon: '🔥', 
    key: 'activeCalories', 
    gradient: ['#fa709a', '#fee140'], 
    shadowColor: '#fa709a',
    unit: 'kcal',
    target: 400,
    category: 'activity'
  },
  { 
    title: 'Sleep', 
    icon: '🌙', 
    key: 'sleep', 
    gradient: ['#a8edea', '#fed6e3'], 
    shadowColor: '#a8edea',
    unit: 'hrs',
    target: 8,
    category: 'wellness'
  },
  { 
    title: 'Blood Oxygen', 
    icon: '🫁', 
    key: 'bloodOxygen', 
    gradient: ['#96fbc4', '#f9f047'], 
    shadowColor: '#96fbc4',
    unit: '%',
    target: 98,
    category: 'vitals',
    fallbackValue: '--' // Added fallback for when data is not available
  },
];

const AnimatedCard = ({ item, vitals, index }) => {
  const [cardAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  
  useEffect(() => {
    Animated.delay(index * 100).start(() => {
      Animated.spring(cardAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Get value with proper fallback handling
  const getValue = () => {
    const rawValue = vitals[item.key];
    
    // Handle Blood Oxygen specifically
    if (item.key === 'bloodOxygen') {
      if (rawValue === null || rawValue === undefined || rawValue === 0) {
        return item.fallbackValue || '--';
      }
      return typeof rawValue === 'number' ? rawValue.toFixed(1) : rawValue;
    }
    
    // Handle other values
    if (rawValue === null || rawValue === undefined) {
      return '--';
    }
    
    return formatDisplay[item.key] ? formatDisplay[item.key](rawValue) : rawValue;
  };

  const getProgress = () => {
    const value = vitals[item.key];
    if (!value || !item.target) return 0;
    
    if (item.key === 'bloodOxygen') {
      return value >= 95 ? 100 : (value / 100) * 100;
    }
    
    return Math.min((value / item.target) * 100, 100);
  };

  const getStatusColor = () => {
    const progress = getProgress();
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardAnimation,
          transform: [
            {
              translateY: cardAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: scaleAnimation },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={item.gradient}
          style={[
            styles.card,
            {
              shadowColor: item.shadowColor,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            
            <View style={styles.valueContainer}>
              <Text style={styles.cardValue}>{getValue()}</Text>
              <Text style={styles.cardUnit}>{item.unit}</Text>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${getProgress()}%`,
                      backgroundColor: getStatusColor(),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.targetText}>
                Target: {item.target}{item.unit}
              </Text>
            </View>

            <View style={styles.statusIndicator}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor() }
                ]} 
              />
              <Text style={styles.statusText}>
                {getProgress() >= 80 ? 'Great!' : 
                 getProgress() >= 50 ? 'Good' : 'Needs attention'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Header = ({ onRefresh, refreshing }) => {
  const [headerAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: headerAnimation,
          transform: [
            {
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>Good Morning! ☀️</Text>
            <Text style={styles.headerTitle}>Health Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: refreshing ? '360deg' : '0deg',
                  },
                ],
              }}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const LoadingScreen = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
    <View style={styles.loadingContainer}>
      <Animated.View style={styles.loadingSpinner}>
        <Text style={styles.loadingEmoji}>⚡</Text>
      </Animated.View>
      <Text style={styles.loadingTitle}>Loading Your Health Data</Text>
      <Text style={styles.loadingSubtitle}>Please wait while we gather your vitals...</Text>
      
      <View style={styles.skeletonContainer}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.skeletonCard, { opacity: 1 - (i * 0.1) }]} />
        ))}
      </View>
    </View>
  </SafeAreaView>
);

const ErrorScreen = ({ error, onRefresh }) => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😔</Text>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.retryGradient}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Make sure you have granted health permissions and try refreshing.
      </Text>
    </View>
  </SafeAreaView>
);

export default function VitalsDashboard() {
  const { vitals, loading, error, granted, refresh, openSettings } = useHealthData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Debug log for Blood Oxygen
  useEffect(() => {
    if (vitals) {
      console.log('Blood Oxygen Value:', vitals.bloodOxygen);
      console.log('All Vitals:', vitals);
    }
  }, [vitals]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRefresh={onRefresh} />;
  }

  if (!granted) {
    return <PermissionHandler onOpenSettings={openSettings} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={['#667eea', '#764ba2']}
            progressBackgroundColor="#1a1a2e"
          />
        }
      >
        <Header onRefresh={onRefresh} refreshing={refreshing} />
        
        <View style={styles.cardsContainer}>
          {config.map((item, index) => (
            <AnimatedCard
              key={item.key}
              item={item}
              vitals={vitals}
              index={index}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last sync: {new Date().toLocaleTimeString()}
          </Text>
          <Text style={styles.footerSubtext}>
            Swipe down to refresh • Tap cards for details
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    
    marginBottom: 24,
    
  },
  headerGradient: {
     marginTop: StatusBar.currentHeight || 0,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  refreshButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  refreshIcon: {
    fontSize: 24,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    padding: 0,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  cardValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginRight: 8,
  },
  cardUnit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingEmoji: {
    fontSize: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 40,
  },
  skeletonContainer: {
    width: '100%',
  },
  skeletonCard: {
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  retryGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});