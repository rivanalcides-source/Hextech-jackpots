import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/theme';

export function Cargando() {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.cian} />
    </View>
  );
}