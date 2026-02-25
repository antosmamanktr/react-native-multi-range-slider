import { ViewStyle } from 'react-native';
import React from 'react';

export interface MultiRangeSliderProps {
  min?: number;
  max?: number;
  value?: number;
  values?: [number, number];
  thumbSize?: number;
  trackHeight?: number;
  step?: number;
  trackStyle?: ViewStyle;
  selectedTrackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  leftThumbStyle?: ViewStyle;
  rightThumbStyle?: ViewStyle;
  renderThumb?: React.ReactNode;
  minSelectedTrackWidth?: number;
  onValueChange?: (value: number) => void;
  onValueChangeFinish?: (value: number) => void;
  onValuesChange?: (values: [number, number]) => void;
  onValuesChangeFinish?: (values: [number, number]) => void;
}