import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  avatarSource?: string;
  notificationsCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  onAvatarPress,
  onNotificationPress,
  avatarSource,
  notificationsCount,
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onAvatarPress}>
        {avatarSource ? (
          <Image source={{ uri: avatarSource }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNotificationPress} style={styles.notificationContainer}>
        <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        {notificationsCount && notificationsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationsCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#121212',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F96418',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D84315',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;
