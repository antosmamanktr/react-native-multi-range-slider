import React, { useEffect, useRef } from 'react';
import {
  View,
  PanResponder,
  Animated,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import styles from './styles';
import { MultiRangeSliderProps } from './types';

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = props => {
  const {
    min = 0,
    max = 100,
    value = 0,
    values,
    thumbSize = 24,
    trackHeight = 4,
    step = 1,
    trackStyle,
    selectedTrackStyle,
    thumbStyle,
    leftThumbStyle,
    rightThumbStyle,
    renderThumb,
    minSelectedTrackWidth = 0,
  } = props;

  const trackWidth = useRef<number>(0);

  const isMulti = Array.isArray(values) && values.length === 2;
  const isRangeLocked = min === max;

  const currentValue = useRef<number>(value);
  const leftValue = useRef<number>(isMulti ? values![0] : min);
  const rightValue = useRef<number>(isMulti ? values![1] : max);

  const translateX = useRef(new Animated.Value(0)).current;
  const leftX = useRef(new Animated.Value(0)).current;
  const rightX = useRef(new Animated.Value(0)).current;

  const offset = useRef<number>(0);
  const leftOffset = useRef<number>(0);
  const rightOffset = useRef<number>(0);

  /* ---------------- Helpers ---------------- */

  const getSteppedValue = (raw: number): number => {
    const safeStep = step <= 0 ? 1 : step;
    const stepped =
      Math.round((raw - min) / safeStep) * safeStep + min;

    return Math.min(max, Math.max(min, stepped));
  };

  const getPositionFromValue = (val: number): number => {
    if (!trackWidth.current || max === min) return 0;
    return ((val - min) / (max - min)) * trackWidth.current;
  };

  const getValueFromPosition = (pos: number): number => {
    if (!trackWidth.current) return min;
    const ratio = pos / trackWidth.current;
    return getSteppedValue(min + ratio * (max - min));
  };

  const updateFromProps = () => {
    if (!trackWidth.current) return;

    if (isMulti && values) {
      let left = getSteppedValue(values[0]);
      let right = getSteppedValue(values[1]);

      if (left > right) [left, right] = [right, left];

      leftValue.current = left;
      rightValue.current = right;

      leftX.setValue(getPositionFromValue(left));
      rightX.setValue(getPositionFromValue(right));
    } else {
      const stepped = getSteppedValue(value);
      currentValue.current = stepped;
      translateX.setValue(getPositionFromValue(stepped));
    }
  };

  useEffect(() => {
    updateFromProps();
  }, [value, values, min, max]);

  /* ---------------- Render ---------------- */

  return (
    <View
      style={[
        styles.container,
        {
          height: thumbSize,
          paddingHorizontal: thumbSize / 2,
        },
      ]}
    >
      <Pressable
        style={[
          styles.track,
          { height: trackHeight },
          trackStyle,
        ]}
        onLayout={(e: LayoutChangeEvent) => {
          trackWidth.current = e.nativeEvent.layout.width;
          updateFromProps();
        }}
      >
        {isMulti ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.filled,
              { height: trackHeight },
              selectedTrackStyle,
              {
                left: leftX,
                width: Animated.add(
                  Animated.subtract(rightX, leftX),
                  minSelectedTrackWidth,
                ),
              },
            ]}
          />
        ) : (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.filled,
              { height: trackHeight },
              selectedTrackStyle,
              { width: translateX },
            ]}
          />
        )}
      </Pressable>

      {isMulti ? (
        <>
          <Animated.View
            style={[
              styles.thumb,
              { width: thumbSize, height: thumbSize },
              thumbStyle,
              leftThumbStyle,
              { transform: [{ translateX: leftX }] },
            ]}
          >
            {renderThumb}
          </Animated.View>

          <Animated.View
            style={[
              styles.thumb,
              { width: thumbSize, height: thumbSize },
              thumbStyle,
              rightThumbStyle,
              { transform: [{ translateX: rightX }] },
            ]}
          >
            {renderThumb}
          </Animated.View>
        </>
      ) : (
        <Animated.View
          style={[
            styles.thumb,
            { width: thumbSize, height: thumbSize },
            thumbStyle,
            { transform: [{ translateX }] },
          ]}
        >
          {renderThumb}
        </Animated.View>
      )}
    </View>
  );
};

export default MultiRangeSlider;