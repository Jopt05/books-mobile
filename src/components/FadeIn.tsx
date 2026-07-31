import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  style?: ViewStyle;
}

const getOffset = (direction: string) => {
  switch (direction) {
    case 'up': return { x: 0, y: 20 };
    case 'down': return { x: 0, y: -20 };
    case 'left': return { x: 20, y: 0 };
    case 'right': return { x: -20, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 500,
  style,
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(getOffset(direction).x)).current;
  const translateY = useRef(new Animated.Value(getOffset(direction).y)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, []);

  return (
    <Animated.View
      style={[
        { opacity, transform: [{ translateX }, { translateY }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
