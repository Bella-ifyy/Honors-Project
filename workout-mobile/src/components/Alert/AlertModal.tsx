import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

interface AlertModalProps {
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isVisible,
  onClose,
  type = 'success',
  message,
}) => {
  const icon = type === 'success' ? 'checkmark-circle-outline' : 'close-circle-outline';
  const color = type === 'success' ? '#28A745' : '#DC3545';

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut">
      <View style={styles.modalContainer}>
        <Ionicons name={icon} size={60} color={color} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onClose}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlertModal;
