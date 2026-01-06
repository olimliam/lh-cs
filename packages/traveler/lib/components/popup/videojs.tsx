import { useEffect, useLayoutEffect, useRef } from 'react';

import styled from '@emotion/styled';

import { MarkerOptionUrl, TourMarkerVideoType } from '../../types/tour';

const Video = styled.video`
  position: relative;
  width: 100%;
  height: 100%;
`;

// 임시 videojs 타입 정의
interface VideoJsPlayer {
  dispose: () => void;
  src: (sources: any[]) => void;
}

// 임시 videojs 함수 (실제로는 video.js 라이브러리를 사용)
const videojs = (_element: HTMLVideoElement, _options: any): VideoJsPlayer => {
  // 임시 구현
  return {
    dispose: () => {},
    src: () => {},
  };
};

// 간단한 query string parser
const parseQueryString = (query: string) => {
  const params: Record<string, string> = {};
  const pairs = query.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    params[key] = decodeURIComponent(value || '');
  }
  return params;
};

function Videojs(props: {
  id?: string;
  parsedUrl: string;
  option: MarkerOptionUrl;
  parsedVideo: {
    type: 'youtube' | 'vimeo' | 'html5';
    id: string;
  };
}) {
  const { parsedUrl } = props;

  const video = useRef<HTMLVideoElement | null>(null);
  const videoPlayer = useRef<VideoJsPlayer | null>(null);

  const options = () => {
    const opt = {
      id: props.id,
      controls: true,
      autoplay: true,
      muted: true,
      techOrder: [] as string[],
      sources: [
        {
          src: parsedUrl || '',
          type: 'video/mp4',
        },
        {
          src: parsedUrl || '',
          type: 'video/webm',
        },
        {
          src: parsedUrl || '',
          type: 'video/ogg',
        },
        {
          src: parsedUrl || '',
          type: 'video/youtube',
        },
      ],
      poster: '/src/assets/images/poster.jpg',
    };

    if (props.parsedVideo.type == TourMarkerVideoType.youtube) {
      opt.techOrder.push(TourMarkerVideoType.youtube);
    } else {
      const q = props.option.url.split('?')[1];

      if (q) {
        const p = parseQueryString(q);

        const toBoolean = (t: any) => {
          if (t === 'true') {
            return true;
          } else {
            return false;
          }
        };

        if (Object.keys(p).find((x) => x === 'muted')) {
          opt.muted = toBoolean(p.muted);
        }

        if (Object.keys(p).find((x) => x === 'autoplay')) {
          opt.autoplay = toBoolean(p.autoplay);
        }

        if (Object.keys(p).find((x) => x === 'controls')) {
          opt.controls = toBoolean(p.controls);
        }
      }

      opt.techOrder.push(TourMarkerVideoType.html5);
    }

    return opt;
  };

  useLayoutEffect(() => {
    if (props.parsedVideo.type != TourMarkerVideoType.vimeo) {
      videoPlayer.current = videojs(video.current!, options());
    }

    return () => {
      if (videoPlayer.current) {
        videoPlayer.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (videoPlayer.current) {
      videoPlayer.current.src([
        {
          src: parsedUrl || '',
          type: 'video/mp4',
        },
        {
          src: parsedUrl || '',
          type: 'video/webm',
        },
        {
          src: parsedUrl || '',
          type: 'video/ogg',
        },
        {
          src: parsedUrl || '',
          type: 'video/youtube',
        },
      ]);
    }
  }, [props.parsedUrl]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Video className='video-js' muted autoPlay ref={video} />
    </div>
  );
}

export default Videojs;
