import React, { useEffect, useRef, useState } from 'react';
import createAxiosInstance from '../../Instances/axiosInstance';
import {
  ActivityIndicator,
  Image,
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
import TyText from '@components/TyText/TyText';
import { StackProps } from '@navigator';
import { useAppSlice } from '@modules/app';
import { setAuthData, getAuthData, updateAuthDataField } from '@utils/store/authStore';
import { colors } from '@theme';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  saveCredentials,
  getSavedCredentials,
} from '@utils/secureCredentials';
import { toastError, toastInfo, toastSuccess } from '@utils/toast';

const Login = ({ navigation }: StackProps<'LoginStack'>) => {
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
  const { dispatch, setUser, setLoggedIn } = useAppSlice();

  const onLogin = async (override?: { email: string; password: string }) => {
    setLoading(true);
    try {
      const axiosInstance = await createAxiosInstance();
      const loginEmail = override?.email ?? email;
      const loginPassword = override?.password ?? password;
      const response = await axiosInstance.post(`/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      console.log(response.data);
      if ([200, 201].includes(response.status)) {
        const user = response.data.user;
        const normalizedUser = {
          ...user,
          workoutOnboardingCompleted: Boolean(user?.workoutOnboardingCompleted),
        };
        await setAuthData(normalizedUser);
        dispatch(setUser(normalizedUser));
        if (biometricAvailable) {
          if (useBiometrics) {
            await saveCredentials({ email: loginEmail, password: loginPassword });
            await updateAuthDataField('biometricEnabled', true);
            setHasBiometricCredentials(true);
          }
        }
        dispatch(setLoggedIn(!!user));
        toastSuccess('Welcome back', 'You are now signed in.');
      } else {
        toastError('Sign-in failed', 'The email or password entered is incorrect.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to log in. Please try again.';
      console.error('Login error', error?.response?.data || error);
      toastError('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    const lowercaseEmail = text.charAt(0).toLowerCase() + text.slice(1);
    setEmail(lowercaseEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(lowercaseEmail) && password.length >= 6);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setIsValid(email.length > 0 && text.length >= 6);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toastInfo('Email required', 'Please enter your email address first.');
      return;
    }

    try {
      const axiosInstance = await createAxiosInstance();
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: email.trim(),
      });

      if ([200, 201].includes(response.status)) {
        toastSuccess('Password reset sent', 'Check your inbox for the reset link.');
      } else {
        toastError('Error', 'Failed to send password reset email. Please try again.');
      }
    } catch (error: any) {
      toastError(
        'Error',
        error?.response?.data?.message || 'Failed to send password reset email. Please try again.',
      );
    }
  };

  const buttonGradientColors = isValid
    ? ['#7452FF', '#1F7BFF']
    : ['#E6EAF7', '#D9E1F9'];

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const supportsFaceId = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        );
        const supportsBiometric = hasHardware && isEnrolled && supportsFaceId;
        setBiometricAvailable(supportsBiometric);

        const existingPreference = await getAuthData<boolean>('biometricEnabled');
        const enabled = Boolean(existingPreference);
        setUseBiometrics(enabled);

        if (supportsBiometric && enabled) {
          const saved = await getSavedCredentials();
          if (saved?.email) {
            setEmail(saved.email);
            setHasBiometricCredentials(true);
          } else {
            setHasBiometricCredentials(false);
          }
        } else {
          setHasBiometricCredentials(false);
        }
      } catch (error) {
        console.warn('Biometric initialization failed', error);
      }
    })();
  }, []);

  const handleBiometricLogin = async () => {
    if (loading) {
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        toastInfo('Face ID unavailable', 'Please set up Face ID in your device settings.');
        return;
      }

      const preference = await getAuthData<boolean>('biometricEnabled');
      if (!preference) {
        toastInfo('Enable Face ID', 'Turn on Face ID login to use this shortcut.');
        return;
      }

      const saved = await getSavedCredentials();
      if (!saved) {
        toastInfo('No saved credentials', 'Sign in with email and password first.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in with Face ID',
        fallbackLabel: 'Enter Passcode',
        cancelLabel: 'Cancel',
      });

      if (!result.success) {
        if (result.error === 'failed') {
          toastError('Face ID failed', 'We could not verify your identity. Please try again.');
        }
        return;
      }

      setEmail(saved.email);
      setPassword(saved.password);
      setIsValid(true);
      await onLogin(saved);
    } catch (error) {
      console.warn('Face ID sign-in failed', error);
      toastError('Face ID unavailable', 'We could not complete Face ID authentication.');
    }
  };

  return (
    <LinearGradient colors={['#FFF7EE', '#F3F6FF']} style={styles.gradient}>
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
                colors={['rgba(116, 82, 255, 0.22)', 'rgba(116, 82, 255, 0)']}
                style={[styles.orb, styles.orbTopRight]}
              />
              <LinearGradient
                colors={['rgba(33, 212, 253, 0.18)', 'rgba(33, 212, 253, 0)']}
                style={[styles.orb, styles.orbBottomLeft]}
              />
            </View>

            <View style={styles.headerRow}>
              <TouchableOpacity
                accessibilityLabel="Go back"
                style={styles.backButton}
                onPress={() => navigation.navigate('WelcomeStack', { from: 'LoginStack' })}>
                <Ionicons name="arrow-back" size={22} color={colors.primaryPurple} />
              </TouchableOpacity>
              <View style={styles.brandPill}>
                <Image source={require('@assets/images/logo-sm.png')} style={styles.brandIcon} />
                <TyText weight="bold" style={styles.brandText}>
                  workout
                </TyText>
              </View>
            </View>

            <View style={styles.heroSection}>
              <TyText weight="bold" style={styles.welcomeTitle}>
                Sign in to orchestrate your flow
              </TyText>
              <TyText style={styles.welcomeSubtitle}>
                Keep workouts, plans, and progress in sync with a training hub designed for focus.
              </TyText>
            </View>

            <View style={styles.formCard}>
              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>Email</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. alex@workout.fit"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    value={email}
                    onChangeText={handleEmailChange}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <TyText style={styles.fieldLabel}>Password</TyText>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    ref={passwordInputRef}
                    returnKeyType="go"
                    blurOnSubmit
                    onSubmitEditing={() => {
                      if (isValid && !loading) {
                        onLogin();
                      }
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
                <TyText style={styles.forgotText}>Forgot your password?</TyText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                disabled={!isValid || loading}
                onPress={() => onLogin()}>
                <LinearGradient
                  colors={buttonGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradientBackground}>
                  {loading ? (
                    <ActivityIndicator size="small" color={isValid ? colors.white : colors.primaryPurple} />
                  ) : (
                    <TyText weight="bold" style={styles.buttonText}>
                      Continue
                    </TyText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TyText style={styles.infoText}>
                Already training with workout? Use the same email so we can keep your progress in sync.
              </TyText>

              {biometricAvailable && useBiometrics && hasBiometricCredentials && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  disabled={loading}
                  onPress={handleBiometricLogin}>
                  <View style={styles.secondaryButtonBackground}>
                    <Ionicons
                      name="scan-outline"
                      size={20}
                      color={colors.primaryPurple}
                      style={styles.secondaryIcon}
                    />
                    <View>
                      <TyText weight="bold" style={styles.secondaryButtonText}>
                        Sign in with Face ID
                      </TyText>
                      <TyText style={styles.biometricHint}>
                        Saved from your last session. We’ll ask again after sign-in to refresh it.
                      </TyText>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

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
    paddingTop: 8,
    paddingBottom: 28,
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
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.35,
  },
  orbTopRight: {
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    bottom: -110,
    left: -90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#D8E2FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  brandIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  brandText: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  heroSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.textPrimary,
  },
  welcomeSubtitle: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    marginTop: 4,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
    elevation: 6,
  },
  field: {
    marginBottom: 16,
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
    paddingHorizontal: 18,
    paddingVertical: 4,
    shadowColor: '#E5EBFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: colors.primaryPurple,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#B9C6FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 16,
  },
  buttonGradientBackground: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    letterSpacing: 0.4,
    textTransform: 'none',
  },
  infoText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  biometricHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 20,
    marginTop: 4,
  },
  secondaryButtonBackground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primaryPurple,
    fontSize: 15,
  },
  secondaryIcon: {
    marginRight: 4,
  },
});

export default Login;
