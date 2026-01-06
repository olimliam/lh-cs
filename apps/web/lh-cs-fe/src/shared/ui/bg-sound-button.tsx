import { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { audioPlay } from '../utils/audio-play';
import { SoundOnIcon } from './icons/sound-on-icon';
import { SoundOffIcon } from './icons/sound-off-icon';

const SoundBtnWrapper = styled.button`
  position: fixed;
  right: 16px;
  top: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  &:hover {
    opacity: 0.8;
  }
`;

interface SoundProps {
  audioUrl?: string; // Optional audio URL prop
}
export const BgSoundButton = (props: SoundProps) => {
  const [isSoundOn, setIsSoundOn] = useState(false);

  const toggleSound = () => {
    setIsSoundOn((prev) => !prev);
  };

  useEffect(() => {
    audioPlay(isSoundOn, props.audioUrl || '');
  }, [isSoundOn, props.audioUrl]);

  return (
    <SoundBtnWrapper type='button' onClick={toggleSound}>
      {isSoundOn ? (
        <SoundOnIcon width={25} height={24} fill='#fff' />
      ) : (
        <SoundOffIcon width={25} height={24} fill='#fff' />
      )}
    </SoundBtnWrapper>
  );
};
