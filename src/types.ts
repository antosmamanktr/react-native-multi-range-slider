import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface MultiRangeSliderProps {
  min?: number;
  max?: number;

  value?: number;                // Single slider
  values?: [number, number];     // Range slider

  thumbSize?: number;
  trackHeight?: number;
  step?: number;

  trackStyle?: StyleProp<ViewStyle>;
  selectedTrackStyle?: StyleProp<ViewStyle>;
  thumbStyle?: StyleProp<ViewStyle>;
  leftThumbStyle?: StyleProp<ViewStyle>;
  rightThumbStyle?: StyleProp<ViewStyle>;

  renderThumb?: ReactNode;
  minSelectedTrackWidth?: number;

  onValueChange?: (value: number) => void;
  onValueChangeFinish?: (value: number) => void;

  onValuesChange?: (values: [number, number]) => void;
  onValuesChangeFinish?: (values: [number, number]) => void;
}