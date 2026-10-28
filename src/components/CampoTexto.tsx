import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors } from '../constants/theme';

export function CampoTexto(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textoSuave}
      autoCapitalize="none"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.texto,
    fontSize: 16,
    marginBottom: 12,
  },
});