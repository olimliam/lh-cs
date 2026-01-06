import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import SwiperType from 'swiper';
import { Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';

import { MarkerOptionUrls } from '../../types/tour';
import { useViewer } from '../../contexts';

const Root = styled.div<{ isSingle?: boolean }>`
  height: calc(100% - 48px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  ${(props) =>
    props.isSingle &&
    `
    padding: 24px 0;
    @media (max-width: 768px) {
      padding: 0;
    }
  `}
`;

const SwiperWrapper = styled(Swiper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &.top-slider {
    height: 100%;

    .swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;

      .slider-image-wrapper {
        width: 100%;
        height: 100%;
        background: transparent;

        .slider-image {
          width: 100%;
          height: 100%;
          object-position: center;
          object-fit: contain;
        }
      }
    }
  }

  &.thumb-slider {
    width: 100%;
    height: auto;

    .swiper-slide {
      width: 178px;
      height: 100px;

      @media (max-width: 768px) {
        width: 96px;
        height: 54px;
      }
    }
  }
`;

const NavigationWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 108;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  > div {
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;

    &.carousel-button-prev,
    &.carousel-button-next {
      width: 36px;
      cursor: pointer;
    }
  }

  i {
    width: 16px;
    height: 16px;
  }
`;

const ImageCount = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
`;

const SliderThumb = styled.div<{ isActive: boolean; src: string }>`
  width: 100%;
  height: 100%;
  object-position: center;
  border-radius: 4px;
  opacity: 1;
  cursor: pointer;
  background: ${(props) =>
    props.isActive
      ? `url(${props.src}) lightgray 50% / cover no-repeat`
      : `linear-gradient(0deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0.60) 100%), url(${props.src}) lightgray 50% / cover no-repeat`};
`;

const ThumbWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ImageContent = (props: { option: MarkerOptionUrls }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const { state } = useViewer();

  const swiperEl = useRef<SwiperClass>();

  const handleActiveIndexChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  useEffect(() => {
    setActiveIndex(0);
    swiperEl.current?.slideTo(0);

    return () => {
      swiperEl.current?.navigation?.init();
      swiperEl.current?.thumbs?.init();
    };
  }, [state.markerContent.markerId]);

  return (
    <Root isSingle={props.option.urls.length == 1}>
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <SwiperWrapper
          className='top-slider'
          modules={[Thumbs, Navigation]}
          thumbs={{ swiper: thumbsSwiper }}
          navigation={{
            prevEl: '.carousel-button-prev',
            nextEl: '.carousel-button-next',
          }}
          onSwiper={(swiper) => (swiperEl.current = swiper)}
          onActiveIndexChange={(swiper) => handleActiveIndexChange(swiper)}
        >
          {props.option.urls.map((url, idx) => (
            <SwiperSlide key={idx}>
              <div className='slider-image-wrapper'>
                <img className='slider-image' src={url} loading='lazy' />
              </div>
            </SwiperSlide>
          ))}
          {props.option.urls.length > 1 && (
            <NavigationWrapper>
              <div className='carousel-button-prev'>
                <i className='ic-arrow-left-lg' />
              </div>
              <ImageCount>
                {activeIndex + 1} / {props.option.urls.length}
              </ImageCount>
              <div className='carousel-button-next'>
                <i className='ic-arrow-right-lg' />
              </div>
            </NavigationWrapper>
          )}
        </SwiperWrapper>
      </div>
      {props.option.urls.length > 1 && (
        <ThumbWrapper>
          <SwiperWrapper
            className='thumb-slider'
            style={{ height: '100%', flex: 1 }}
            modules={[Thumbs]}
            slidesPerView='auto'
            slidesPerGroup={1}
            spaceBetween={20}
            onSwiper={(swiper) => setThumbsSwiper(swiper)}
          >
            {props.option.urls.map((url, idx) => (
              <SwiperSlide key={idx}>
                <SliderThumb isActive={idx === activeIndex} src={url} />
              </SwiperSlide>
            ))}
          </SwiperWrapper>
        </ThumbWrapper>
      )}
    </Root>
  );
};

ImageContent.displayName = 'ImageContent';

export default ImageContent;
