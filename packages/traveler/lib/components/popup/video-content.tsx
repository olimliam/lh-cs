import styled from '@emotion/styled';

import { MarkerOptionUrl, TourMarkerVideoType } from '../../types/tour';

import Videojs from './videojs';

const VideoIframe = styled.iframe`
  width: 100%;
  height: 100%;
  background: black;
  border: none;
`;

// 임시 video parser 함수들
const parseVideo = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return { type: TourMarkerVideoType.youtube, id: '' };
  } else if (url.includes('vimeo.com')) {
    return { type: TourMarkerVideoType.vimeo, id: '' };
  } else {
    return { type: TourMarkerVideoType.html5, id: '' };
  }
};
/** Vimeo ID 추출: 다양한 Vimeo URL 패턴을 지원 */
const extractVimeoId = (url: string): string | null => {
  try {
    const u = new URL(url);

    // 1) player 도메인: https://player.vimeo.com/video/{id}
    //    예시) https://player.vimeo.com/video/1123128145
    if (/^player\.vimeo\.com$/i.test(u.hostname)) {
      const segs = u.pathname.split('/').filter(Boolean);
      const idx = segs.findIndex((s) => s.toLowerCase() === 'video');
      const cand = idx >= 0 ? segs[idx + 1] : undefined;
      if (cand && /^\d{6,12}$/.test(cand)) return cand;
    }

    // 2) 일반 vimeo 도메인들
    //    예시)
    //      - 기본: https://vimeo.com/1123128145
    //      - 공유 해시: https://vimeo.com/1116013308/59fc0e3107?ts=0&share=copy
    //      - 채널: https://vimeo.com/channels/staffpicks/9876543
    //      - 그룹: https://vimeo.com/groups/foo/videos/24681357
    //      - 앨범: https://vimeo.com/album/1234567/video/7654321
    //      - 다른 경로: https://vimeo.com/video/11223344
    //      - 쿼리 파라미터(드묾): https://vimeo.com/anything?clip_id=123456789
    if (/vimeo\.com$/i.test(u.hostname)) {
      // (a) 쿼리 파라미터로 오는 경우 방어 (드물지만 존재)
      const qp = u.searchParams.get('clip_id') || u.searchParams.get('video');
      if (qp && /^\d{6,12}$/.test(qp)) return qp;

      // (b) path 세그먼트에서 "마지막 숫자 세그먼트(6~12자리)" 선택
      const segs = u.pathname.split('/').filter(Boolean);
      const numericSegs = segs.filter((s) => /^\d{6,12}$/.test(s));
      if (numericSegs.length) return numericSegs[numericSegs.length - 1];
    }
  } catch (error) {
    // 시큐어 코딩: URL 파싱 실패 시 정규식 fallback
    // 예시) player: https://player.vimeo.com/video/1123128145
    //       일반:  https://vimeo.com/1116013308/59fc0e3107?ts=0&share=copy
    console.debug('[extractVimeoId] URL 파싱 실패, 정규식으로 fallback:', error);
    const fallback =
      /(?:player\.vimeo\.com\/video\/|vimeo\.com\/(?:.*?\/)?)((?:\d{6,12}))(?:[/?#]|$)/i;
    const m = url.match(fallback);
    if (m?.[1]) return m[1];
  }
  return null;
};

const getVideoUrl = (
  url: string,
  options: { autoplay: boolean; muted: boolean }
) => {
  if (/vimeo\.com/i.test(url)) {
    const id = extractVimeoId(url);
    if (!id) return url; // ID 못 찾으면 원본 유지
    const base = `https://player.vimeo.com/video/${id}`;
    const qs = new URLSearchParams();
    if (options.autoplay) qs.set('autoplay', '1');
    if (options.muted) qs.set('muted', '1');
    // 필요하면 여기서 더 추가 가능: qs.set('controls', '0') 등
    const query = qs.toString();
    return query ? `${base}?${query}` : base;
  }
  return url; // 임시로 원본 URL 반환
};

const VideoContent = (props: { markerId: string; option: MarkerOptionUrl }) => {
  const videoId = `marker-video-${props.markerId}`;

  const parsedVideo = parseVideo(props.option.url);
  const parsedUrl =
    parsedVideo.type == TourMarkerVideoType.html5
      ? props.option.url
      : getVideoUrl(props.option.url, {
          autoplay: true,
          muted: true,
        });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {parsedVideo.type === TourMarkerVideoType.vimeo && (
        <VideoIframe
          id={videoId}
          src={parsedUrl}
          allowFullScreen
          allow={'autoplay'}
        />
      )}
      {(parsedVideo.type === TourMarkerVideoType.html5 ||
        parsedVideo.type === TourMarkerVideoType.youtube) && (
        <Videojs
          id={videoId}
          parsedUrl={parsedUrl || ''}
          option={props.option}
          parsedVideo={parsedVideo}
        />
      )}
    </div>
  );
};

VideoContent.displayName = 'VideoContent';

export default VideoContent;
