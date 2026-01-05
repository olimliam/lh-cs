import styled from '@emotion/styled';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// dayjs timezone 플러그인 활성화
dayjs.extend(utc);
dayjs.extend(timezone);

const TimeStampRow = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%; /* 18.2px */

  &:last-child {
    padding-left: 8px;
  }
  & i {
    font-style: normal;
    color: #999;
  }
`;

export const timeStampGenerator = (date: string | null | undefined) => {
  if (!date) return <>-</>;

  // UTC 시간을 한국 시간(Asia/Seoul)으로 변환
  const kstDate = dayjs(date).tz('Asia/Seoul');

  const dateStr = kstDate.format('YYYY-MM-DD');
  const hour = kstDate.format('HH');
  const min = kstDate.format('mm');
  const sec = kstDate.format('ss');

  return (
    <>
      <TimeStampRow>{dateStr}</TimeStampRow>
      <TimeStampRow>
        {hour}:{min}
        <i>:{sec}</i>
      </TimeStampRow>
    </>
  );
};
