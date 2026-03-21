import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  StyleProp,
  Modal,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { Colors } from '../theme';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

import Animated, { FadeIn } from 'react-native-reanimated';

interface AppCardProps {
  children: React.ReactNode;
  colors: any;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppCard = ({ children, colors, style, accessibilityLabel }: AppCardProps) => (
  <View 
    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    accessible={!!accessibilityLabel}
    accessibilityLabel={accessibilityLabel}
  >
    {children}
  </View>
);

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'fade';
  style?: StyleProp<ViewStyle>;
}

export const FadeInView = ({ children, delay = 0, style }: FadeInViewProps) => {
  // Use a simple FadeIn which is most likely to be stable across Reanimated versions
  return (
    <Animated.View entering={FadeIn.delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
};

interface SectionHeaderProps {
  title: string;
  colors: any;
  rightText?: string;
  onRightPress?: () => void;
}

export const SectionHeader = ({ title, colors, rightText, onRightPress }: SectionHeaderProps) => (
  <View style={styles.sectionHeaderRow} accessibilityRole="header">
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    {rightText && (
      <TouchableOpacity 
        onPress={onRightPress}
        accessibilityLabel={rightText}
        accessibilityRole="button"
      >
        <Text style={[styles.seeAll, { color: colors.primary }]}>{rightText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface ListItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  colors: any;
  showArrow?: boolean;
  accessibilityLabel?: string;
}

export const ListItem = ({
  icon,
  title,
  subtitle,
  right,
  onPress,
  colors,
  showArrow = true,
  accessibilityLabel
}: ListItemProps) => {
  const Content = (
    <View style={styles.listItem}>
      <View style={[styles.iconContainer, { backgroundColor: colors.overlay }]}>
        {icon}
      </View>
      <View style={styles.listTextContainer}>
        <Text style={[styles.listTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.listSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.listRight}>
        {right}
        {onPress && showArrow && !right && (
          <ChevronRight size={20} color={colors.subtext} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel || `${title}, ${subtitle || ''}`}
        accessibilityRole="button"
      >
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  colors: any;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const PrimaryButton = ({
  title,
  onPress,
  colors,
  style,
  textStyle,
  disabled,
  loading,
  icon
}: PrimaryButtonProps) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      { backgroundColor: colors.primary },
      disabled && { opacity: 0.5 },
      style
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
  >
    <View style={styles.buttonContent}>
      {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
      <Text style={[styles.primaryButtonText, textStyle]}>
        {loading ? 'Processing...' : title}
      </Text>
    </View>
  </TouchableOpacity>
);

interface SegmentedControlProps {
  options: { label: string; value: string; icon?: React.ReactNode }[];
  selectedValue: string;
  onSelect: (value: any) => void;
  colors: any;
}

export const SegmentedControl = ({ options, selectedValue, onSelect, colors }: SegmentedControlProps) => (
  <View style={[styles.segmentedContainer, { backgroundColor: colors.overlay }]} accessibilityRole="tablist">
    {options.map((option) => {
      const isSelected = option.value === selectedValue;
      return (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.segment,
            isSelected && { backgroundColor: colors.card, ...styles.selectedSegment }
          ]}
          onPress={() => onSelect(option.value)}
          activeOpacity={0.9}
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={option.label}
        >
          {option.icon && (
            <View style={{ marginRight: 6 }}>
              {React.cloneElement(option.icon as React.ReactElement<any>, {
                size: 16,
                color: isSelected ? colors.primary : colors.subtext
              })}
            </View>
          )}
          <Text style={[
            styles.segmentText,
            { color: isSelected ? colors.text : colors.subtext },
            isSelected && { fontWeight: '700' }
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  options: { label: string; icon: React.ReactNode; onPress: () => void; color?: string }[];
  colors: any;
}


export const GlassCard = ({ children, style, accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; accessibilityLabel?: string }) => (
  <View 
    style={[styles.glassCard, style]}
    accessible={!!accessibilityLabel}
    accessibilityLabel={accessibilityLabel}
  >
    {children}
  </View>
);

export const PremiumButton = ({ title, onPress, loading, icon, style }: { title: string; onPress: () => void; loading?: boolean; icon?: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <TouchableOpacity
    style={[styles.premiumButton, style, loading && { opacity: 0.7 }]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={[Colors.light.primary, '#6366f1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.buttonGradient}
    >
      {loading ? (
        <Text style={styles.buttonText}>Processing...</Text>
      ) : (
        <View style={styles.buttonInner}>
          {icon}
          <Text style={[styles.buttonText, { marginLeft: icon ? 8 : 0 }]}>{title}</Text>
        </View>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export const GradientBackground = ({ children }: { children: React.ReactNode }) => (
  <LinearGradient
    colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
    style={{ flex: 1 }}
  >
    {children}
  </LinearGradient>
);

export const Spacing = ({ size = 'm' }: { size?: 's' | 'm' | 'l' | 'xl' }) => {
  const sizes = { s: 8, m: 16, l: 24, xl: 32 };
  return <View style={{ height: sizes[size] }} />;
};

import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolate } from 'react-native-reanimated';

export const Shimmer = ({ width: w, height: h, borderRadius = 10, style }: { width: any; height: any; borderRadius?: number; style?: any }) => {
  const highlight = useSharedValue(0);

  useEffect(() => {
    highlight.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(highlight.value, [0, 1], [-w, w]);
    return { transform: [{ translateX }] };
  });

  return (
    <View style={[{ width: w, height: h, backgroundColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', borderRadius }, style]}>
      <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export const ActionMenu = ({ visible, onClose, options, colors }: ActionMenuProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.menuHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.menuTitle, { color: colors.text }]}>Add to Profile</Text>
            <View style={styles.optionsGrid}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuOption}
                  onPress={() => { option.onPress(); onClose(); }}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: option.color || colors.overlay }]}>
                    {React.cloneElement(option.icon as any, { size: 28, color: '#fff' })}
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.closeMenuBtn, { backgroundColor: colors.overlay }]} onPress={onClose}>
              <Text style={[styles.closeMenuText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export const MaxContentWidth = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ width: '100%', maxWidth: 800, alignSelf: 'center' }, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700'
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginVertical: 8,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedSegment: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  menuHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  menuOption: {
    alignItems: 'center',
    width: width / 4,
  },
  menuIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeMenuBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  closeMenuText: {
    fontSize: 16,
    fontWeight: '700',
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  premiumButton: {
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
