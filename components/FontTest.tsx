import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  testText: {
    fontSize: 24,
    marginVertical: 10,
  },
  qurovaText: {
    fontFamily: 'qurova-regular',
    fontSize: 24,
    marginVertical: 10,
  },
  systemText: {
    fontSize: 24,
    marginVertical: 10,
  },
});

export function FontTest() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.systemText}>System Font (Default)</ThemedText>
      <ThemedText style={styles.qurovaText}>Qurova Font Test</ThemedText>
      <ThemedText style={[styles.qurovaText, { fontFamily: 'Qurova-Regular' }]}>
        Qurova-Regular (Capitalized)
      </ThemedText>
    </View>
  );
}
