let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export const audioPlay = (isSoundOn: boolean, audioUrl: string) => {
  if (!currentAudio || currentAudioUrl !== audioUrl) {
    // audioUrl이 바뀌었거나 처음 실행이면 새로 생성
    if (currentAudio) {
      currentAudio.pause();
    }
    currentAudio = new Audio(audioUrl);
    currentAudio.loop = true;
    currentAudio.volume = 1;
    currentAudioUrl = audioUrl;
  }

  if (isSoundOn) {
    currentAudio.play();
  } else {
    currentAudio.pause();
  }
};
