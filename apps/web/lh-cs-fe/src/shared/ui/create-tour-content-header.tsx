import styled from '@emotion/styled';
import { media } from '../utils';

const TitleLayout = styled.div`
  display: flex;
  gap: 6px;
  flex-direction: column;

  ${media.tablet`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `}
`;

interface CreateTourContentHeaderProps {
  contentTitle: string;
  subTitle?: string;
  count: number;
}

export const CreateTourContentHeader = ({
  contentTitle,
  subTitle,
  count,
}: CreateTourContentHeaderProps) => {
  return (
    <TitleLayout>
      <div className='flex items-center gap-1.5 md:flex-row'>
        <span className='text-[20px] font-semibold leading-[1.3] text-[#111111]'>
          {contentTitle}
        </span>
        <span className='rounded-[4px] bg-[rgba(17,17,17,0.10)] px-1.5 text-[16px] font-semibold text-[#111111]'>
          {count}
        </span>
      </div>
      {subTitle && (
        <span className='text-[14px] font-medium leading-[1.3] text-[#666666]'>
          {subTitle}
        </span>
      )}
    </TitleLayout>
  );
};
