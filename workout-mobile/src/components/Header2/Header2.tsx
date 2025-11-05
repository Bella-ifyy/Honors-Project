import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TyText from '@components/TyText/TyText';
import { colors } from '@theme';

// Define the prop types for the Header component
interface HeaderProps {
  title: string;
  onBackPress: () => void;
  onMorePress?: () => void; // Optional if there is no handler needed for "more" icon
}

const Header2: React.FC<HeaderProps> = ({ title, onBackPress, onMorePress }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color={colors.primaryPurple} />
      </TouchableOpacity>
      <TyText weight="bold" style={styles.headerTitle}>{title}</TyText>
      {onMorePress && (
        <TouchableOpacity onPress={onMorePress} style={styles.moreIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  moreIcon: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
});

export default Header2;
