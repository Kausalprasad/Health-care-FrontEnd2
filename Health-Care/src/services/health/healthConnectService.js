import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  openHealthConnectSettings,
} from 'react-native-health-connect';

class HealthConnectService {
  constructor() {
    this.permissions = [];
  }

  async initialize() {
    if (Platform.OS !== 'android') throw new Error('Android only');
    const ok = await initialize();
    if (!ok) throw new Error('Health Connect unavailable');
    return ok;
  }

  async requestPermissions(types = []) {
    const perms = types.length
      ? types
      : [
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
          { accessType: 'read', recordType: 'SleepSession' },
          { accessType: 'read', recordType: 'OxygenSaturation' },
        ];
    this.permissions = await requestPermission(perms);
    return this.permissions;
  }

  hasPermission(recordType) {
    return this.permissions.some(p => p.recordType === recordType);
  }

  async read(recordType, filter) {
    if (!this.hasPermission(recordType)) return [];
    const res = await readRecords(recordType, { timeRangeFilter: filter });
    return res.records;
  }

  openSettings() {
    return openHealthConnectSettings();
  }
}

export default new HealthConnectService();
