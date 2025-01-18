import React from 'react';
import styled from 'styled-components';
import { Smile } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { theme } from '../assets/styles/theme';

const EmojiButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${theme.fontSizes.large};
  color: ${theme.colors.primary};
  transition: color ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.secondary};
  }
`;

const PickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1000;
`;

function EmojiPicker({ onEmojiSelect, showPicker, setShowPicker }) {
  return (
    <div style={{ position: 'relative' }}>
      <EmojiButton onClick={() => setShowPicker(!showPicker)}>
        <Smile />
      </EmojiButton>
      {showPicker && (
        <PickerContainer>
          <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="light"
            set="apple"
          />
        </PickerContainer>
      )}
    </div>
  );
}

export default EmojiPicker;

