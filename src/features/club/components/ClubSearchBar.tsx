import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/shared/constants';

interface ClubSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function ClubSearchBar({ value, onChangeText }: ClubSearchBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.SURFACE,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
      }}
    >
      <Ionicons name="search-outline" size={20} color={COLORS.TEXT_HINT} />
      <TextInput
        style={{ flex: 1, fontSize: 15, color: COLORS.TEXT_PRIMARY }}
        placeholder="동호회 이름으로 검색"
        placeholderTextColor={COLORS.TEXT_HINT}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
