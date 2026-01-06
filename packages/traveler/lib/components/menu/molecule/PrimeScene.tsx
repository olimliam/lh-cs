import { Swiper, SwiperSlide } from 'swiper/react';
import cx from 'classnames';

import ContentRoot from '../atom/ContentRoot';

import { usePrimeSceneSearch } from '../../../hooks/usePrimeScene';
import {
  ControlBarPositionConst,
  ControlBarStyleConst,
  MenuTypeConst,
} from '../../../types/controller-bar';
import { useToolbar } from '../../../contexts/ToolBarContext';
import { useViewer } from '../../../contexts/ViewerContext';

function PrimeScene() {
  const { barPosition, barStyle } = useToolbar();
  const { state } = useViewer();

  const { primeScenes, handleSceneClick } = usePrimeSceneSearch();

  const isXPosition =
    barPosition === ControlBarPositionConst.LEFT ||
    barPosition === ControlBarPositionConst.RIGHT;

  return (
    <ContentRoot
      className={cx('tablet:py-5 w-full py-6', isXPosition && 'h-full !w-auto')}
      type={MenuTypeConst.IMPORTANT}
    >
      <Swiper
        className={cx('px-5', isXPosition && 'h-full')}
        slidesPerView={'auto'}
        // direction={isXPosition ? 'vertical' : 'horizontal'}
        direction={isXPosition ? 'vertical' : 'horizontal'}
        spaceBetween={16}
        speed={1000}
      >
        {primeScenes.map((imp) => (
          <SwiperSlide
            key={imp.id}
            className='flex !h-auto !w-auto cursor-pointer flex-col items-center gap-y-1'
            onClick={() => handleSceneClick(imp.id)}
          >
            <div
              className='tablet:w-24 aspect-video w-40 rounded'
              style={{
                backgroundImage:
                  'url(' + (imp.thumb || '../../../assets/svgs/thumbnail_image.svg') + ')',
                backgroundSize: '100% auto',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 calc((100% / 6) * 2.5)',
                color: 'red',
              }}
            />
            <p
              className={cx(
                'text-xs',
                imp.id === state.currentSceneID && 'font-bold',
                barStyle === ControlBarStyleConst.ROUND_WHITE
                  ? 'text-gray-800'
                  : 'text-white'
              )}
            >
              {imp.title}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </ContentRoot>
  );
}

export default PrimeScene;
