// import { notify } from '@/components/Snackbar';



export function useShare() {
  // const { message } = useLang();

  const doShare = (url: string, message: string) => {
    navigator.clipboard.writeText(url);
    // 커밋을 위한 임시처리
    console.debug(message);
    //TODO: notify 만들기
    // notify({
    //   type: 'success',
    //   message: message,
    // });
  };

  const shareFacebook = (url: string) => {
    window.open(`https://facebook.com/sharer/sharer.php?u=${url}`);
  };

  const shareX = (url: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${url}`);
  };

  const isKakaoShareUrl = (url: string) => {
    return url.search(import.meta.env.VITE_HOME_URL) > -1;
  };

  const shareKakao = (param: {
    title?: string;
    url?: string;
    desc?: string;
    thumbUrl?: string;
    buttonTitle?: string;
  }) => {
    const { Kakao } = window;
    if (!Kakao.isInitialized()) {
      Kakao.init(import.meta.env.VITE_KAKAO_KEY);
    }

    Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: param.title || '',
        description: param.desc || '',
        imageUrl: param.thumbUrl || '',
        link: {
          webUrl: param.url || '',
          mobileWebUrl: param.url || '',
        },
      },
      buttons: [
        {
          title: param.buttonTitle || '자세히 보기',
          link: {
            webUrl: param.url || '',
            mobileWebUrl: param.url || '',
          },
        },
      ],
    });
  };

  return {
    doShare,
    isKakaoShareUrl,
    shareKakao,
    shareFacebook,
    shareX,
  };
}
