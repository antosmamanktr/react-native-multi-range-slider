import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  verticalContainer: {
    alignItems: 'center',
  },
  track: {
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
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 999,
    elevation: 3,
    alignItems: 'center',
    top: 0,
  },
   emptyThumb: {
    position: 'absolute',
    alignItems: 'center',
    top: 0,
  },
});
