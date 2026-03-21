import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { Colors } from '../theme';

const { width } = Dimensions.get('window');

interface AnimatedLogoProps {
  colors: any;
  onAnimationComplete?: () => void;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ colors, onAnimationComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 12 });

    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
          <Sparkles color="#fff" size={48} />
        </View>
        <Animated.Text style={[styles.title, { color: colors.text }]}>
          Prompt Profile
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { color: colors.subtext }]}>
          Personal Intelligence System
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center'
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.7
  }
});
