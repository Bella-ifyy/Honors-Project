import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StatusBar,
} from 'react-native';
import { StackProps } from '@navigator';
import createAxiosInstance from '../../../Instances/axiosInstance';
import { clearAuthData } from '@utils/store/authStore';
import { useAppSlice } from '@modules/app';
import Header2 from '@components/Header2/Header2';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme';
import { toastError, toastSuccess } from '@utils/toast';

const DeleteAccount = ({ navigation }: StackProps<'DeleteAccountStack'>) => {
  const { dispatch, setLoggedIn } = useAppSlice();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState({
    password: '',
    confirmText: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    // Reset errors
    setError({
      password: '',
      confirmText: '',
    });

    // Validate fields
    let isValid = true;
    if (!password.trim()) {
      setError(prevState => ({
        ...prevState,
        password: 'Password is required to confirm deletion',
      }));
      isValid = false;
    }

    if (confirmText.toUpperCase() !== 'DELETE') {
      setError(prevState => ({
        ...prevState,
        confirmText: 'Please type DELETE to confirm',
      }));
      isValid = false;
    }

    if (!isValid) return;

    // Show final confirmation dialog
    Alert.alert(
      'Delete Account?',
      'This action is permanent and cannot be undone. All your data will be deleted immediately.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const axiosInstance = await createAxiosInstance();
              const response = await axiosInstance.post('/auth/account/delete', {
                password,
              });

              if ([200, 201, 204].includes(response.status)) {
                toastSuccess('Account deleted successfully');

                // Clear local data and logout
                await clearAuthData();
                dispatch(setLoggedIn(false));
                navigation.navigate('LoginStack', { from: 'DeleteAccount' });
              } else {
                toastError('Failed to delete account');
                setIsDeleting(false);
              }
            } catch (err: any) {
              console.error(err);
              const errorMessage =
                err?.response?.data?.message || 'Failed to delete account. Please check your password.';
              toastError(errorMessage);
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent={false} />
      <Header2 title="Delete Account" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Warning Section */}
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={48} color="#ff3b30" />
          <Text style={styles.warningTitle}>Permanent Account Deletion</Text>
          <Text style={styles.warningText}>
            This action cannot be undone. Deleting your account will:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>• Permanently delete your workouts and plans</Text>
            <Text style={styles.warningItem}>• Remove all progress history and streaks</Text>
            <Text style={styles.warningItem}>• Clear saved reminders and preferences</Text>
            <Text style={styles.warningItem}>• Delete your profile and account data</Text>
          </View>
        </View>

        {/* Confirmation Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Enter your password to confirm</Text>
          <TextInput
            style={[styles.input, error.password ? styles.errorInput : null]}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#555"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isDeleting}
          />
          {error.password ? <Text style={styles.errorMessage}>{error.password}</Text> : null}

          <Text style={styles.label}>Type DELETE to confirm</Text>
          <TextInput
            style={[styles.input, error.confirmText ? styles.errorInput : null]}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="DELETE"
            placeholderTextColor="#555"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeleting}
          />
          {error.confirmText ? <Text style={styles.errorMessage}>{error.confirmText}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}>
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isDeleting}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  warningContainer: {
    backgroundColor: '#FFF4F1',
    borderWidth: 1,
    borderColor: '#FFD4C9',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#FCD5D3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C2410C',
    marginTop: 12,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  warningList: {
    alignSelf: 'stretch',
  },
  warningItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  form: {
    marginBottom: 8,
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.textPrimary,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#FF9C8F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  deleteButtonDisabled: {
    backgroundColor: '#F7A29A',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#ff3b30',
  },
  errorMessage: {
    color: '#ff3b30',
    marginTop: -6,
    marginBottom: 6,
    fontSize: 12,
  },
});

export default DeleteAccount;
