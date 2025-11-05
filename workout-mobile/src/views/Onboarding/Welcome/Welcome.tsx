import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackProps } from '@navigator';
import TyText from '@components/TyText/TyText';
import { colors } from '@theme';

const heroPillContent = [
  { icon: 'barbell-outline', label: 'Guided training' },
  { icon: 'play-circle-outline', label: 'Video form cues' },
  { icon: 'flame-outline', label: 'Progress streaks' },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
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
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.35,
  },
  orbTop: {
    top: -140,
    right: -90,
  },
  orbBottom: {
    bottom: -160,
    left: -100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logoLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryPurple,
  },
  logoText: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    color: colors.textSecondary,
  },
  helpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#DCE5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.primaryPurple,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    color: colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 22,
    marginHorizontal: -6,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  heroPillLabel: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  ctaCard: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: '#CFDAFF',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 4,
  },
  ctaDisclaimer: {
    marginTop: 18,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ctaLink: {
    color: colors.primaryPurple,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    letterSpacing: 0.4,
  },
  secondaryText: {
    color: colors.primaryPurple,
    fontSize: 14,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
});

export default function Welcome({ navigation }: StackProps<'WelcomeStack'>) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNeedHelp = async () => {
    const email = 'admin@cleardigita.com';
    const subject = 'Need Help - workout App';
    const body = 'Hi,\n\nI need help with the workout app. Please provide assistance.\n\nThank you!';

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Error',
          'Cannot open email client. Please email admin@cleardigita.com directly.',
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Failed to open email client. Please email admin@cleardigita.com directly.',
      );
    }
  };

  const handleTermsPress = () => {
    // Navigate to terms screen or open terms URL
    Alert.alert('Terms of Service', 'Terms of Service content would be displayed here.');
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy screen or open privacy URL
    Alert.alert('Privacy Policy', 'Privacy Policy content would be displayed here.');
  };

  return (
    <LinearGradient colors={['#FFF6EC', '#F3F6FF']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.safeArea}>
          <View pointerEvents="none" style={styles.decorLayer}>
            <LinearGradient
              colors={['rgba(116, 82, 255, 0.25)', 'rgba(116, 82, 255, 0)']}
              style={[styles.orb, styles.orbTop]}
            />
            <LinearGradient
              colors={['rgba(33, 212, 253, 0.22)', 'rgba(33, 212, 253, 0)']}
              style={[styles.orb, styles.orbBottom]}
            />
          </View>

          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <View style={styles.headerRow}>
              <View style={styles.logoLockup}>
                <View style={styles.logoMark} />
                <TyText weight="bold" style={styles.logoText}>
                  workout
                </TyText>
              </View>
              <TouchableOpacity style={styles.helpButton} onPress={handleNeedHelp}>
                <TyText style={{ color: colors.textPrimary, fontSize: 12, letterSpacing: 0.6 }}>
                  Need help?
                </TyText>
              </TouchableOpacity>
            </View>

            <View style={styles.heroSection}>
              <TyText style={styles.heroEyebrow}>Your workout companion</TyText>
              <TyText weight="bold" style={styles.heroTitle}>
                Train with purpose and momentum.
              </TyText>
              <TyText style={styles.heroSubtitle}>
                Build workouts, follow guided sessions, and track your fitness progress in one
                focused place.
              </TyText>
              <View style={styles.heroPills}>
                {heroPillContent.map(pill => (
                  <View key={pill.label} style={styles.heroPill}>
                    <Ionicons
                      name={pill.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={colors.primaryPurple}
                    />
                    <TyText style={styles.heroPillLabel}>{pill.label}</TyText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.ctaCard}>
              <TouchableOpacity
                style={{ height: 54, borderRadius: 18 }}
                onPress={() => navigation.navigate('CreateAccountStack', { from: 'WelcomeStack' })}>
                <LinearGradient
                  colors={['#7452FF', '#1F7BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TyText weight="bold" style={styles.primaryButtonText}>
                    Start training
                  </TyText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('LoginStack', { from: 'WelcomeStack' })}>
                <TyText style={styles.secondaryText}>I already have an account</TyText>
              </TouchableOpacity>

              <TyText style={styles.ctaDisclaimer}>
                By continuing you agree to our{' '}
                <TyText style={styles.ctaLink} onPress={handleTermsPress}>
                  Terms
                </TyText>{' '}
                and{' '}
                <TyText style={styles.ctaLink} onPress={handlePrivacyPress}>
                  Privacy Policy
                </TyText>
                .
              </TyText>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
