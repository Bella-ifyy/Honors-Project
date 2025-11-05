import React from 'react';
import { View, StyleSheet, Text, Platform, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@theme';

type HeaderVariant = 'warm' | 'cool';

const HEADER_THEMES: Record<HeaderVariant, {
  gradient: [string, string];
  cardBorder: string;
  shadowColor: string;
  logoBackground: string;
  logoBorder: string;
  actionBackground: string;
  actionBorder: string;
  actionPressed: string;
}> = {
  warm: {
    gradient: ['#FDFEFF', '#F2F7FF'],
    cardBorder: 'rgba(228, 232, 243, 1)',
    shadowColor: 'rgba(170, 196, 255, 0.4)',
    logoBackground: '#E8F0FF',
    logoBorder: 'rgba(31, 123, 255, 0.25)',
    actionBackground: '#FFFFFF',
    actionBorder: 'rgba(228, 232, 243, 1)',
    actionPressed: '#EDF3FF',
  },
  cool: {
    gradient: ['#1F7BFF', '#7452FF'],
    cardBorder: 'rgba(24, 58, 116, 0.2)',
    shadowColor: 'rgba(31, 123, 255, 0.45)',
    logoBackground: 'rgba(255,255,255,0.15)',
    logoBorder: 'rgba(255,255,255,0.25)',
    actionBackground: 'rgba(255,255,255,0.15)',
    actionBorder: 'rgba(255,255,255,0.3)',
    actionPressed: 'rgba(255,255,255,0.35)',
  },
};

interface GlobalHeaderProps {
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  variant?: HeaderVariant;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onSearchPress,
  onNotificationsPress,
  variant = 'warm',
}) => {
  const theme = HEADER_THEMES[variant];

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.cardSurface, { borderColor: theme.cardBorder, shadowColor: theme.shadowColor }]}>
        <View style={styles.headerRow}>
          <View style={styles.brandWrapper}>
            <View
              style={[styles.logoBadge, { backgroundColor: theme.logoBackground, borderColor: theme.logoBorder }]}
            >
              <Image
                source={require('@assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.title}>workout</Text>
              <Text style={styles.subtitle}>Make every day intentional</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onSearchPress}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.actionBackground, borderColor: theme.actionBorder },
                pressed && { backgroundColor: theme.actionPressed },
              ]}>
              <Ionicons name="search-outline" size={20} color={colors.primaryBlue} />
            </Pressable>
            <Pressable
              onPress={onNotificationsPress}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.actionBackground, borderColor: theme.actionBorder },
                pressed && { backgroundColor: theme.actionPressed },
              ]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primaryBlue} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 8 : 12,
  },
  cardSurface: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 1,
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.14,
        shadowRadius: 26,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default GlobalHeader;
