import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { View, PanResponder, Animated, Pressable } from "react-native";
import styles from "./styles";
const MultiRangeSlider = (props) => {
    const { min = 0, max = 100, step = 1, value, onValuesChangeStart, onValuesChange, onValuesChangeFinish, thumbSize = 24, trackHeight = 4, trackStyle, selectedTrackStyle, thumbStyle, leftThumbStyle, rightThumbStyle, customMarker, customMarkerLeft, customMarkerRight, minSelectedTrackWidth = 0, minMarkerOverlapDistance = 0, disabled, vertical, verticalHeight = 200, scrollRef, thumbAnimation = true, thumbScaleValue = 1.2, } = props;
    /* ---------------- Scroll Control ---------------- */
    const setScrollEnabled = (enabled) => {
        if (scrollRef?.current?.setNativeProps) {
            scrollRef.current.setNativeProps({ scrollEnabled: enabled });
        }
    };
    const disableScroll = () => setScrollEnabled(false);
    const enableScroll = () => setScrollEnabled(true);
    /* ------------------------------------------------ */
    const trackSize = useRef(0);
    const isMulti = Array.isArray(value);
    const isRangeLocked = min === max || disabled;
    const currentValue = useRef(typeof value === "number" ? value : min);
    const leftValue = useRef(isMulti ? value[0] : min);
    const rightValue = useRef(isMulti ? value[1] : max);
    const main = useRef(new Animated.Value(0)).current;
    const left = useRef(new Animated.Value(0)).current;
    const right = useRef(new Animated.Value(0)).current;
    const offset = useRef(0);
    const leftOffset = useRef(0);
    const rightOffset = useRef(0);
    const mainScale = useRef(new Animated.Value(1)).current;
    const leftScale = useRef(new Animated.Value(1)).current;
    const rightScale = useRef(new Animated.Value(1)).current;
    const animateScale = (anim, to) => {
        if (!thumbAnimation)
            return;
        Animated.spring(anim, {
            toValue: to,
            useNativeDriver: false, // 👈 change this
            friction: 5,
            tension: 150,
        }).start();
    };
    const axisDelta = (_, g) => (vertical ? g.dy : g.dx);
    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const emitStart = () => {
        if (isMulti)
            onValuesChangeStart?.([leftValue.current, rightValue.current]);
        else
            onValuesChangeStart?.(currentValue.current);
    };
    const emitChange = (v) => {
        onValuesChange?.(v);
    };
    const emitFinish = () => {
        if (isMulti)
            onValuesChangeFinish?.([leftValue.current, rightValue.current]);
        else
            onValuesChangeFinish?.(currentValue.current);
    };
    const getSteppedValue = (raw) => {
        const safeStep = step <= 0 ? 1 : step;
        const stepped = Math.round((raw - min) / safeStep) * safeStep + min;
        return Math.min(max, Math.max(min, stepped));
    };
    const getPositionFromValue = (val) => {
        if (!trackSize.current || max === min)
            return 0;
        const ratio = (val - min) / (max - min);
        return ratio * trackSize.current;
    };
    const getValueFromPosition = (pos) => {
        if (!trackSize.current)
            return min;
        const ratio = pos / trackSize.current;
        return getSteppedValue(min + ratio * (max - min));
    };
    const updateFromProps = () => {
        if (!trackSize.current)
            return;
        if (isMulti) {
            let l = getSteppedValue(value[0]);
            let r = getSteppedValue(value[1]);
            if (l > r)
                [l, r] = [r, l];
            leftValue.current = l;
            rightValue.current = r;
            left.setValue(getPositionFromValue(l));
            right.setValue(getPositionFromValue(r));
        }
        else {
            const stepped = getSteppedValue(value);
            currentValue.current = stepped;
            main.setValue(getPositionFromValue(stepped));
        }
    };
    useEffect(updateFromProps, [value, min, max]);
    const overlap = minMarkerOverlapDistance;
    const leftMax = () => clamp(right.__getValue() - overlap, 0, trackSize.current);
    const rightMin = () => clamp(left.__getValue() + overlap, 0, trackSize.current);
    const translateStyle = (v) => vertical
        ? { transform: [{ translateY: v }] }
        : { transform: [{ translateX: v }] };
    const pressLocation = (e) => vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX;
    const moveToPosition = (loc) => {
        if (!trackSize.current || isRangeLocked)
            return;
        let p = clamp(loc, 0, trackSize.current);
        if (isMulti) {
            const l = left.__getValue();
            const r = right.__getValue();
            if (Math.abs(p - l) <= Math.abs(p - r)) {
                const pos = Math.min(p, r - overlap);
                left.setValue(pos);
                leftValue.current = getValueFromPosition(pos);
            }
            else {
                const pos = Math.max(p, l + overlap);
                right.setValue(pos);
                rightValue.current = getValueFromPosition(pos);
            }
            emitChange([leftValue.current, rightValue.current]);
        }
        else {
            main.setValue(p);
            currentValue.current = getValueFromPosition(p);
            emitChange(currentValue.current);
        }
    };
    const renderLeftMarker = () => {
        if (customMarker)
            return customMarker();
        if (customMarkerLeft)
            return customMarkerLeft();
        return null;
    };
    const renderRightMarker = () => {
        if (customMarker)
            return customMarker();
        if (customMarkerRight)
            return customMarkerRight();
        return null;
    };
    const renderSingleMarker = () => {
        if (customMarker)
            return customMarker();
        return null;
    };
    const singlePan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => !isRangeLocked,
        onPanResponderGrant: () => {
            disableScroll();
            animateScale(mainScale, thumbScaleValue);
            offset.current = main.__getValue();
            emitStart();
        },
        onPanResponderMove: (_, g) => {
            let pos = offset.current + axisDelta(_, g);
            pos = clamp(pos, 0, trackSize.current);
            main.setValue(pos);
            currentValue.current = getValueFromPosition(pos);
            emitChange(currentValue.current);
        },
        onPanResponderRelease: () => {
            enableScroll(); // ✅
            emitFinish();
            animateScale(mainScale, 1);
        },
        onPanResponderTerminate: () => {
            enableScroll(); // ✅
            animateScale(mainScale, 1);
        },
    })).current;
    const leftPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => !isRangeLocked,
        onPanResponderGrant: () => {
            disableScroll();
            animateScale(leftScale, thumbScaleValue);
            leftOffset.current = left.__getValue();
            emitStart();
        },
        onPanResponderMove: (_, g) => {
            let pos = leftOffset.current + axisDelta(_, g);
            pos = clamp(pos, 0, leftMax());
            left.setValue(pos);
            leftValue.current = getValueFromPosition(pos);
            emitChange([leftValue.current, rightValue.current]);
        },
        onPanResponderRelease: () => {
            enableScroll(); // ✅
            emitFinish();
            animateScale(leftScale, 1);
        },
        onPanResponderTerminate: () => {
            enableScroll(); // ✅
            animateScale(leftScale, 1);
        },
    })).current;
    const rightPan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => !isRangeLocked,
        onPanResponderGrant: () => {
            disableScroll();
            animateScale(rightScale, thumbScaleValue);
            rightOffset.current = right.__getValue();
            emitStart();
        },
        onPanResponderMove: (_, g) => {
            let pos = rightOffset.current + axisDelta(_, g);
            pos = clamp(pos, rightMin(), trackSize.current);
            right.setValue(pos);
            rightValue.current = getValueFromPosition(pos);
            emitChange([leftValue.current, rightValue.current]);
        },
        onPanResponderRelease: () => {
            enableScroll(); // ✅
            emitFinish();
            animateScale(rightScale, 1);
        },
        onPanResponderTerminate: () => {
            enableScroll(); // ✅
            animateScale(rightScale, 1);
        },
    })).current;
    return (_jsxs(View, { style: [
            styles.container,
            vertical && { height: verticalHeight },
            vertical && styles.verticalContainer,
            vertical
                ? { width: thumbSize, paddingVertical: thumbSize / 2 }
                : { height: thumbSize, paddingHorizontal: thumbSize / 2 },
        ], children: [_jsx(Pressable, { style: [
                    styles.track,
                    vertical ? { width: trackHeight, flex: 1 } : { height: trackHeight },
                    trackStyle,
                ], onLayout: (e) => {
                    trackSize.current = vertical
                        ? e.nativeEvent.layout.height
                        : e.nativeEvent.layout.width;
                    updateFromProps();
                }, onPress: (e) => moveToPosition(pressLocation(e)), children: isMulti ? (_jsx(Animated.View, { pointerEvents: "none", style: [
                        styles.filled,
                        vertical
                            ? {
                                width: trackHeight,
                                top: left,
                                height: Animated.add(Animated.subtract(right, left), minSelectedTrackWidth),
                            }
                            : {
                                height: trackHeight,
                                left: left,
                                width: Animated.add(Animated.subtract(right, left), minSelectedTrackWidth),
                            },
                        selectedTrackStyle,
                    ] })) : (_jsx(Animated.View, { pointerEvents: "none", style: [
                        styles.filled,
                        vertical
                            ? { width: trackHeight, height: main, top: 0 }
                            : { height: trackHeight, width: main, left: 0 },
                        selectedTrackStyle,
                    ] })) }), isMulti ? (_jsxs(_Fragment, { children: [_jsx(Animated.View, { ...leftPan.panHandlers, style: [
                            customMarker || customMarkerLeft
                                ? styles.emptyThumb
                                : styles.thumb,
                            !customMarker && !customMarkerLeft && thumbStyle,
                            !customMarker && !customMarkerLeft && leftThumbStyle,
                            { width: thumbSize, height: thumbSize },
                            {
                                transform: [
                                    ...(vertical
                                        ? [{ translateY: left }]
                                        : [{ translateX: left }]),
                                    { scale: leftScale },
                                ],
                            },
                        ], children: renderLeftMarker() }), _jsx(Animated.View, { ...rightPan.panHandlers, style: [
                            customMarker || customMarkerRight
                                ? styles.emptyThumb
                                : styles.thumb,
                            !customMarker && !customMarkerRight && thumbStyle,
                            !customMarker && !customMarkerRight && rightThumbStyle,
                            { width: thumbSize, height: thumbSize },
                            {
                                transform: [
                                    ...(vertical
                                        ? [{ translateY: right }]
                                        : [{ translateX: right }]),
                                    { scale: rightScale },
                                ],
                            },
                        ], children: renderRightMarker() })] })) : (_jsx(Animated.View, { ...singlePan.panHandlers, style: [
                    customMarker ? styles.emptyThumb : styles.thumb,
                    thumbStyle,
                    { width: thumbSize, height: thumbSize },
                    {
                        transform: [
                            ...(vertical ? [{ translateY: main }] : [{ translateX: main }]),
                            { scale: mainScale },
                        ],
                    },
                ], children: renderSingleMarker() }))] }));
};
export default MultiRangeSlider;
//# sourceMappingURL=MultiRangeSlider.js.map