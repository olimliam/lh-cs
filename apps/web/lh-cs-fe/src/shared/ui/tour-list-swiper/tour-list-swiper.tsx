import React, { useCallback, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper';

import styled from '@emotion/styled';
import { TourListProps } from '@/shared/ui/tour-list/tour-list';
import { TourResponse } from '@/shared/model/tour.dto';
import { TourButton } from '@/shared/ui/tour-list-swiper/tour-button';

interface TourListSwiperProps extends TourListProps {
  toursData?: TourResponse[];
  tourId: string | undefined;
}

const SwiperContainer = styled.div``;

export const TourListSwiper: React.FC<TourListSwiperProps> = ({
  toursData,
  tourId,
  onSelectTour,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);

  // const totalSlidesWidth = (toursData?.length || 0) * (120 + 12); // 슬라이드 개수 * (슬라이드 너비 + 간격)

  // 애니메이션과 함께 슬라이드를 중앙으로 이동시키는 함수
  const animateToSlide = useCallback(
    (selectedIndex: number) => {
      if (!swiperRef.current || !toursData) return;

      const containerWidth = swiperRef.current.width;
      const slideWidth = 120 + 12; // 슬라이드 너비 + spaceBetween

      const totalSlidesWidth = toursData.length * slideWidth;
      if (totalSlidesWidth <= containerWidth) {
        return; // 슬라이드 전체가 컨테이너보다 작으면 이동할 필요 없음
      }

      const centerOffset = containerWidth / 2 - slideWidth / 2;
      const targetTranslate = -(selectedIndex * slideWidth - centerOffset);

      const finalTranslate = Math.max(
        Math.min(targetTranslate, 0),
        -(toursData.length * slideWidth - containerWidth)
      );

      // 애니메이션과 함께 이동
      if (swiperRef.current.wrapperEl) {
        swiperRef.current.wrapperEl.style.transition =
          'transform 300ms ease-out';
        swiperRef.current.setTranslate(finalTranslate);
        swiperRef.current.updateProgress();

        // 애니메이션 완료 후 transition 제거
        setTimeout(() => {
          if (swiperRef.current?.wrapperEl) {
            swiperRef.current.wrapperEl.style.transition = '';
          }
        }, 300);
      }
    },
    [toursData]
  );

  // 선택된 tour가 변경되면 해당 슬라이드로 이동
  useEffect(() => {
    if (tourId && swiperRef.current && toursData) {
      const selectedIndex = toursData.findIndex((tour) => tour.id === tourId);
      if (selectedIndex >= 0) {
        setTimeout(() => {
          animateToSlide(selectedIndex);
        }, 100); // Swiper 초기화 후 실행
      }
    }
  }, [tourId, toursData, animateToSlide]);

  useEffect(() => {
    const handleResize = () => {
      if (swiperRef.current) {
        // Swiper의 width 등 정보 갱신
        const containerWidth = swiperRef.current.width;
        // 필요시 Swiper 리셋/중앙 이동 등 추가 로직
        // 예시: animateToSlide(selectedIndex);
        console.log('Swiper resized, new width:', containerWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleTourSelect = (selectedTourId: string | undefined) => {
    onSelectTour(selectedTourId);

    // 선택된 항목을 가운데로 스크롤
    if (selectedTourId && swiperRef.current && toursData) {
      const selectedIndex = toursData.findIndex(
        (tour) => tour.id === selectedTourId
      );
      if (selectedIndex >= 0) {
        animateToSlide(selectedIndex);
      }
    }
  };

  return (
    <div className='flex h-full flex-col gap-3'>
      {/* Swiper 슬라이드 컨테이너 */}
      <SwiperContainer className='flex-1 rounded-[6px]'>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={12}
          slidesPerView='auto'
          centeredSlides={false}
          grabCursor={true}
          touchRatio={1}
          touchAngle={45}
        >
          {toursData?.map((option: TourResponse) => (
            <SwiperSlide key={option.id} style={{ width: '120px' }}>
              <TourButton
                option={option}
                size='sm'
                onClick={handleTourSelect}
                currentTourId={tourId!}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </SwiperContainer>
    </div>
  );
};
