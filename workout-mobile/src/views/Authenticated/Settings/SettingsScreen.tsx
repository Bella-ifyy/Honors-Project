import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Constants from 'expo-constants';
import { StackProps } from '@navigator/stack';
import { clearAuthData, getAuthData } from '@utils/store/authStore';
import { useAppSlice } from '@modules/app';
import { colors } from '@theme';
import { toastInfo } from '@utils/toast';

const SettingsScreen = ({ navigation, route }: StackProps<'SettingsStack'>) => {
  const { dispatch, setLoggedIn } = useAppSlice();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const name = await getAuthData<string>('name');
      const email = await getAuthData<string>('email');
      if (name) setUserName(name);
      if (email) setUserEmail(email);
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    dispatch(setLoggedIn(false));
    await clearAuthData();
    navigation.reset({ index: 0, routes: [{ name: 'LoginStack' }] });
    toastInfo('Logged out', 'You can sign back in anytime.');
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#F4F8FF', '#EEF3FF', '#F7F9FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <View style={styles.heroSection}>
        <LinearGradient
          colors={['#F6EDFF', '#E7F1FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="barbell" size={26} color={colors.primaryBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Profile</Text>
            <Text style={styles.heroSubtitle}>Update your training profile and account details</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <SettingsRow
            icon="account-edit"
            label="Profile"
            description="Keep your workout profile up to date"
            onPress={() => navigation.navigate('UserSettingsStack', { from: 'Settings' })}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <SettingsRow
            icon="delete-forever"
            label="Delete account"
            description="Erase your training data and profile"
            onPress={() => navigation.navigate('DeleteAccountStack', { from: 'Settings' })}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
          <LinearGradient
            colors={['#F5576C', '#F093FB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}>
            <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </View>
  );
};

const SettingsRow = ({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    activeOpacity={0.75}
    onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color={colors.primaryBlue} />
    </View>
    <View style={styles.menuCopy}>
      <Text style={styles.menuText}>{label}</Text>
      <Text style={styles.menuDescription}>{description}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#666666" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 26 : 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  profileCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  profileGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileEmail: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.75)',
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuCopy: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuDescription: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textMuted,
    fontSize: 12,
  },
});

export default SettingsScreen;
