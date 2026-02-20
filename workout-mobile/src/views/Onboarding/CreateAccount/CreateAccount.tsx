import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Alert from '@components/Alert/Alert';
import * as Device from 'expo-device';
import { StackProps } from '@navigator';
import TyText from '@components/TyText/TyText';
import createAxiosInstance from '../../../Instances/axiosInstance';
import { colors } from '@theme';

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 8,
  },
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.35,
  },
  orbTop: {
    top: -110,
    right: -90,
  },
  orbBottom: {
    bottom: -130,
    left: -90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#D8E2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryPurple,
    marginRight: 8,
  },
  brandText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  heroSection: {
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    shadowColor: '#E5EBFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  inputIcon: {
    color: colors.textMuted,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 44,
    color: colors.textPrimary,
    fontSize: 16,
  },
  footerCopy: {
    marginTop: 18,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primaryPurple,
  },
  secondaryAction: {
    marginTop: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  secondaryText: {
    fontSize: 13,
    color: colors.primaryPurple,
    fontWeight: '600',
  },
});

export default function CreateAccount({ navigation }: StackProps<'CreateAccountStack'>) {
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getDeviceId = async () => {
      try {
        const id = Device.osInternalBuildId ?? Device.osBuildId ?? Device.deviceName;
        console.log('Device ID:', id);
      } catch (error: any) {
        console.log('Device ID error:', error?.message);
      }
    };

    getDeviceId();
  }, []);

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    validateForm(text, lastName, email, password);
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    validateForm(firstName, text, email, password);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateForm(firstName, lastName, text, password);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validateForm(firstName, lastName, email, text);
  };

  const validateForm = (
    firstNameText: string,
    lastNameText: string,
    emailText: string,
    passwordText: string,
  ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(emailText);
    const isPasswordValid = passwordText.length >= 6;
    const isFirstNameValid = firstNameText.trim().length > 0;
    const isLastNameValid = lastNameText.trim().length > 0;
    setIsValid(isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid);
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    const data: any = { firstName, lastName, email, password };

    try {
      const axiosInstance = await createAxiosInstance();
      const response = await axiosInstance.post(`/auth/register`, data);

      if ([200, 201].includes(response.status)) {
        navigation.navigate('LoginStack', { from: 'Home', email });
      } else {
        Alert.alert('Submission failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFF6EC', '#F4F6FB']} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.safeArea}>
            <View pointerEvents="none" style={styles.decorLayer}>
              <LinearGradient
                colors={['rgba(116, 82, 255, 0.18)', 'rgba(116, 82, 255, 0)']}
                style={[styles.orb, styles.orbTop]}
              />
              <LinearGradient
                colors={['rgba(33, 212, 253, 0.18)', 'rgba(33, 212, 253, 0)']}
                style={[styles.orb, styles.orbBottom]}
              />
            </View>

            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color={colors.primaryPurple} />
              </TouchableOpacity>
              <View style={styles.brandLockup}>
                <View style={styles.brandDot} />
                <TyText weight="bold" style={styles.brandText}>
                  workout
                </TyText>
              </View>
            </View>

            <View style={styles.heroSection}>
              <TyText weight="bold" style={styles.heroTitle}>
                Set up your training profile
              </TyText>
              <TyText style={styles.heroSubtitle}>
                Tell us a bit about you so we can personalize workouts, reminders, and progress
                tracking.
              </TyText>
            </View>

            <View style={styles.formCard}>
              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>First name</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Alex"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={handleFirstNameChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="given-name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => lastNameInputRef.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>Last name</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-circle-outline" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Johnson"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={handleLastNameChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="family-name"
                    ref={lastNameInputRef}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>Email</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@workout.fit"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    ref={emailInputRef}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>Password</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    ref={passwordInputRef}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      if (isValid && !loading) {
                        handleSubmit();
                      }
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={{ height: 52, borderRadius: 18 }}
                disabled={!isValid || loading}
                onPress={handleSubmit}>
                <LinearGradient
                  colors={
                    isValid
                      ? ['#7452FF', '#1F7BFF']
                      : ['#E6EAF7', '#D9E1F9']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <ActivityIndicator size="small" color={isValid ? colors.white : colors.primaryPurple} />
                  ) : (
                    <TyText weight="bold" style={styles.primaryButtonText}>
                      Create account
                    </TyText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TyText style={styles.footerCopy}>
                By signing up you agree to our{' '}
                <TyText
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('WelcomeStack', { from: 'Terms' })}>
                  Terms
                </TyText>{' '}
                and{' '}
                <TyText
                  style={styles.footerLink}
                  onPress={() => navigation.navigate('WelcomeStack', { from: 'Privacy' })}>
                  Privacy Policy
                </TyText>
                .
              </TyText>
            </View>

            <View style={styles.secondaryAction}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginStack', { from: 'CreateAccountStack' })}>
                <TyText style={styles.secondaryText}>
                  Already training with workout? Sign in to continue.
                </TyText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
