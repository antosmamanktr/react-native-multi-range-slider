import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    justifyContent: 'center',
  },
  filled: {
    position: 'absolute',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 999,
    elevation: 3,
    alignItems: 'center',
  },
  thumbExternal: {
    position: 'absolute',
    alignItems: 'center',
  },
});