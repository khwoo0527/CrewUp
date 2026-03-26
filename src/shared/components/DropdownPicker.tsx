import { useState, useRef } from 'react';
import { View, Text, Pressable, Modal, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/shared/constants';

interface DropdownPickerProps {
  label?: string;
  placeholder: string;
  items: string[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function DropdownPicker({
  label,
  placeholder,
  items,
  value,
  onSelect,
  disabled = false,
}: DropdownPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <View>
      {label ? (
        <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: isOpen ? COLORS.PRIMARY : COLORS.BORDER,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: disabled ? '#f5f5f5' : COLORS.SURFACE,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 16, color: value ? COLORS.TEXT_PRIMARY : COLORS.TEXT_HINT }}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.TEXT_SECONDARY}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', paddingHorizontal: 24 }}
          onPress={() => setIsOpen(false)}
        >
          <View style={{
            backgroundColor: COLORS.SURFACE,
            borderRadius: 16,
            maxHeight: 400,
            overflow: 'hidden',
            ...(Platform.OS === 'web' ? { maxWidth: 400, alignSelf: 'center', width: '100%' } : {}),
          }}>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    backgroundColor: item === value ? '#f0f7f0' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    color: item === value ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY,
                    fontWeight: item === value ? '600' : '400',
                  }}>
                    {item}
                  </Text>
                  {item === value ? (
                    <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
