import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { StackProps } from '@navigator';
import createAxiosInstance from '../../../Instances/axiosInstance';
import { getAuthData } from '@utils/store/authStore';
import Header2 from '@components/Header2/Header2';
import TyText from '@components/TyText/TyText';
import { colors } from '@theme/colors';
import { toastError, toastSuccess } from '@utils/toast';
const UserSettings = ({ navigation }: StackProps<'UserSettingsStack'>) => {
  const getCurrentUser: any = async () => {
    return await getAuthData();
  };
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  const validateEmail = (email: string) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleSave = async () => {
    // Reset errors
    setError({
      email: '',
      firstName: '',
      lastName: '',
    });

    // Validate fields
    let isValid = true;
    if (!validateEmail(email)) {
      setError(prevState => ({
        ...prevState,
        email: 'Please enter a valid email address',
      }));
      isValid = false;
    }
    if (!firstName.trim()) {
      setError(prevState => ({
        ...prevState,
        firstName: 'First name is required',
      }));
      isValid = false;
    }
    if (!lastName.trim()) {
      setError(prevState => ({
        ...prevState,
        lastName: 'Last name is required',
      }));
      isValid = false;
    }

    if (!isValid) return;

    try {
      const axiosInstance = await createAxiosInstance();
      const response = await axiosInstance.post('/auth/profile/update', {
        email,
        firstName,
        lastName,
      });

      if ([200, 201].includes(response.status)) {
        toastSuccess('Profile updated successfully 👋');
      } else {
        toastError('Failed to save changes');
      }
    } catch (err) {
      console.log(err);
      toastError('Failed to save changes');
    }
  };

  useEffect(() => {
    getCurrentUser().then((user: any) => {
      setEmail(user.email);
      setFirstName(user.firstName);
      setLastName(user.lastName);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <Header2 title="User Settings" onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">
          <View style={styles.profileCard}>
            <Image source={{ uri: 'https://avatar.iran.liara.run/public/14' }} style={styles.avatar} />
            <TyText weight="bold" style={styles.userName}>
              {`${firstName} ${lastName}`.trim() || 'Your name'}
            </TyText>
            <TyText style={styles.userSubtitle}>Premium Member</TyText>
          </View>

          <View style={styles.formCard}>
            <TyText style={styles.sectionLabel}>Profile</TyText>
            <View style={styles.formGroup}>
              <TyText style={styles.label}>Email Address</TyText>
              <TextInput
                style={[styles.input, error.email ? styles.errorInput : null]}
                value={email}
                onChangeText={text => setEmail(text.toLowerCase())}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                blurOnSubmit={false}
                returnKeyType="next"
              />
              {error.email ? <Text style={styles.errorMessage}>{error.email}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <TyText style={styles.label}>Full Name</TyText>
              <View style={styles.nameContainer}>
                <TextInput
                  style={[styles.nameInput, error.firstName ? styles.errorInput : null]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={[styles.nameInput, error.lastName ? styles.errorInput : null]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {(error.firstName || error.lastName) && (
                <Text style={styles.errorMessage}>{error.firstName || error.lastName}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <TyText weight="bold" style={styles.saveButtonText}>
                Save changes
              </TyText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
    backgroundColor: colors.surfaceMuted,
  },
  userName: {
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 6,
  },
  userSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    gap: 20,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.textPrimary,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.textPrimary,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: colors.primaryPurple,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#B9C6FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  errorInput: {
    borderColor: '#FF6B6B',
  },
  errorMessage: {
    color: '#FF6B6B',
    marginTop: -4,
    fontSize: 12,
  },
});

export default UserSettings;
