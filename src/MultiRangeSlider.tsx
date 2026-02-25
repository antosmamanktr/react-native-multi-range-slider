import React, { useEffect, useRef } from 'react';
import {
  View,
  PanResponder,
  Animated,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { styles } from './styles';
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
    minSelectedTrackWidth = 6,
  } = props;

  const trackWidth = useRef<number>(0);
  const isMulti = Array.isArray(values);
  const isRangeLocked = min === max;

  const currentValue = useRef<number>(value);
  const leftValue = useRef<number>(isMulti ? values?.[0] ?? min : min);
  const rightValue = useRef<number>(isMulti ? values?.[1] ?? max : max);

  const translateX = useRef(new Animated.Value(0)).current;
  const leftX = useRef(new Animated.Value(0)).current;
  const rightX = useRef(new Animated.Value(0)).current;

  const offset = useRef<number>(0);
  const leftOffset = useRef<number>(0);
  const rightOffset = useRef<number>(0);

  /* ---------------- STEP ---------------- */

  const getSteppedValue = (rawValue: number): number => {
    const safeStep = step <= 0 ? 1 : step;
    const stepped =
      Math.round((rawValue - min) / safeStep) * safeStep + min;

    const clamped = Math.min(max, Math.max(min, stepped));

    return Number(clamped.toFixed(0));
  };

  const getPositionFromValue = (val: number): number => {
    if (!trackWidth.current || max === min) return 0;
    const ratio = (val - min) / (max - min);
    return ratio * trackWidth.current;
  };

  const getValueFromPosition = (pos: number): number => {
    if (!trackWidth.current) return min;
    const ratio = pos / trackWidth.current;
    return getSteppedValue(min + ratio * (max - min));
  };

  /* ---------------- VALUE NORMALIZATION ---------------- */

  const normalizeMultiValues = (): void => {
    if (!isMulti) return;

    let left = leftValue.current;
    let right = rightValue.current;

    if (left > max && right > max) {
      left = max;
      right = max;
    } else if (left < min && right < min) {
      left = min;
      right = min;
    }

    if (left > right) {
      [left, right] = [right, left];
    }

    leftValue.current = getSteppedValue(left);
    rightValue.current = getSteppedValue(right);
  };

  /* ---------------- TRACK PRESS ---------------- */

  const moveToPosition = (locationX: number): void => {
    if (!trackWidth.current || isRangeLocked) return;

    let clampedX = Math.max(0, Math.min(locationX, trackWidth.current));
    const steppedValue = getValueFromPosition(clampedX);
    const steppedPosition = getPositionFromValue(steppedValue);

    if (isMulti) {
      const leftPos = leftX.__getValue();
      const rightPos = rightX.__getValue();

      const distToLeft = Math.abs(clampedX - leftPos);
      const distToRight = Math.abs(clampedX - rightPos);

      if (distToLeft <= distToRight) {
        const finalPos = Math.min(steppedPosition, rightPos);
        leftX.setValue(finalPos);
        leftValue.current = getValueFromPosition(finalPos);
      } else {
        const finalPos = Math.max(steppedPosition, leftPos);
        rightX.setValue(finalPos);
        rightValue.current = getValueFromPosition(finalPos);
      }

      props.onValuesChange?.([leftValue.current, rightValue.current]);
      props.onValuesChangeFinish?.([leftValue.current, rightValue.current]);
    } else {
      translateX.setValue(steppedPosition);
      currentValue.current = steppedValue;

      props.onValueChange?.(currentValue.current);
      props.onValueChangeFinish?.(currentValue.current);
    }
  };

  /* ---------------- PAN ---------------- */

  const createSinglePan = () =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRangeLocked,
      onMoveShouldSetPanResponder: () => !isRangeLocked,

      onPanResponderGrant: () => {
        offset.current = translateX.__getValue();
      },

      onPanResponderMove: (_, gesture) => {
        if (!trackWidth.current || isRangeLocked) return;

        let newPosition = offset.current + gesture.dx;
        newPosition = Math.max(0, Math.min(newPosition, trackWidth.current));

        translateX.setValue(newPosition);
        currentValue.current = getValueFromPosition(newPosition);

        props.onValueChange?.(currentValue.current);
      },

      onPanResponderRelease: () => {
        props.onValueChangeFinish?.(currentValue.current);
      },
    });

  const createMultiPan = () => {
    const leftPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !isRangeLocked,
      onMoveShouldSetPanResponder: () => !isRangeLocked,

      onPanResponderGrant: () => {
        leftOffset.current = leftX.__getValue();
      },

      onPanResponderMove: (_, gesture) => {
        if (!trackWidth.current || isRangeLocked) return;

        const rightPosition = rightX.__getValue();

        let newPosition = leftOffset.current + gesture.dx;
        newPosition = Math.max(0, Math.min(newPosition, rightPosition));

        leftX.setValue(newPosition);
        leftValue.current = getValueFromPosition(newPosition);

        props.onValuesChange?.([leftValue.current, rightValue.current]);
      },

      onPanResponderRelease: () => {
        props.onValuesChangeFinish?.([leftValue.current, rightValue.current]);
      },
    });

    const rightPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !isRangeLocked,
      onMoveShouldSetPanResponder: () => !isRangeLocked,

      onPanResponderGrant: () => {
        rightOffset.current = rightX.__getValue();
      },

      onPanResponderMove: (_, gesture) => {
        if (!trackWidth.current || isRangeLocked) return;

        const leftPosition = leftX.__getValue();

        let newPosition = rightOffset.current + gesture.dx;
        newPosition = Math.max(
          leftPosition,
          Math.min(newPosition, trackWidth.current),
        );

        rightX.setValue(newPosition);
        rightValue.current = getValueFromPosition(newPosition);

        props.onValuesChange?.([leftValue.current, rightValue.current]);
      },

      onPanResponderRelease: () => {
        props.onValuesChangeFinish?.([leftValue.current, rightValue.current]);
      },
    });

    return { leftPanResponder, rightPanResponder };
  };

  const singlePan = useRef(!isMulti ? createSinglePan() : null).current;
  const multiPan = useRef(isMulti ? createMultiPan() : null).current;

  /* ---------------- SYNC ---------------- */

  const updateFromProps = (): void => {
    if (!trackWidth.current) return;

    if (isMulti) {
      normalizeMultiValues();

      leftX.setValue(getPositionFromValue(leftValue.current));
      rightX.setValue(getPositionFromValue(rightValue.current));
    } else {
      currentValue.current = getSteppedValue(value);
      translateX.setValue(getPositionFromValue(currentValue.current));
    }
  };

  useEffect(() => {
    updateFromProps();
  }, []);

  useEffect(() => {
    if (isMulti) {
      leftValue.current = values?.[0] ?? min;
      rightValue.current = values?.[1] ?? max;
    } else {
      currentValue.current = value;
    }
    updateFromProps();
  }, [value, values, min, max]);

  /* ---------------- RENDER ---------------- */

  return (
    <View
      style={[
        styles.container,
        { height: thumbSize, paddingHorizontal: thumbSize / 2 },
      ]}>
      <Pressable
        style={[styles.track, { height: trackHeight }, trackStyle]}
        onLayout={(e: LayoutChangeEvent) => {
          trackWidth.current = e.nativeEvent.layout.width;
          updateFromProps();
        }}
        onPress={e => moveToPosition(e.nativeEvent.locationX)}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.filled,
            { height: trackHeight },
            selectedTrackStyle,
            {
              left: Animated.subtract(leftX, minSelectedTrackWidth / 2),
              width: Animated.add(
                Animated.subtract(rightX, leftX),
                minSelectedTrackWidth,
              ),
            },
          ]}
        />
      </Pressable>

      {isMulti && !isRangeLocked ? (
        <>
          <Animated.View
            {...multiPan?.leftPanResponder.panHandlers}
            style={[
              renderThumb ? styles.thumbExternal : styles.thumb,
              { width: thumbSize, height: thumbSize },
              thumbStyle,
              leftThumbStyle,
              { transform: [{ translateX: leftX }] },
            ]}>
            {renderThumb}
          </Animated.View>

          <Animated.View
            {...multiPan?.rightPanResponder.panHandlers}
            style={[
              renderThumb ? styles.thumbExternal : styles.thumb,
              { width: thumbSize, height: thumbSize },
              thumbStyle,
              rightThumbStyle,
              { transform: [{ translateX: rightX }] },
            ]}>
            {renderThumb}
          </Animated.View>
        </>
      ) : (
        <Animated.View
          {...singlePan?.panHandlers}
          style={[
            renderThumb ? styles.thumbExternal : styles.thumb,
            { width: thumbSize, height: thumbSize },
            thumbStyle,
            { transform: [{ translateX: translateX }] },
          ]}>
          {renderThumb}
        </Animated.View>
      )}
    </View>
  );
};

export default MultiRangeSlider;