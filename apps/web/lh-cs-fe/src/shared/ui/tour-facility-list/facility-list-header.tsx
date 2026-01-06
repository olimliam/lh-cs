interface FacilityListHeaderProps {
  count: number;
}

export const FacilityListHeader = ({ count }: FacilityListHeaderProps) => {
  return (
    <div className='flex gap-1.5 md:flex-row md:justify-between lg:flex-col'>
      <div className='flex items-center gap-1.5 md:flex-row'>
        <span className='text-[20px] font-semibold leading-[1.3] text-[#111111]'>
          유지보수 설비 선택
        </span>
        <span className='rounded-[4px] bg-white px-1.5 text-[16px] font-semibold text-[#111111]'>
          {count}
        </span>
      </div>
      <span className='text-[14px] font-medium leading-[1.3] text-[#666666]'>
        ※ 건축, 기계, 전기·통신 항목에서 1개만 선택할 수 있습니다.
      </span>
    </div>
  );
};
