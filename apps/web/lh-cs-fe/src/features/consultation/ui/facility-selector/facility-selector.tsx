import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '@/shared/ui/typography/typography.styles';
import { Check } from '@mui/icons-material';
import { FacilityTypeEnum } from '@/shared/model/facility-type.enum';

const SelectorContainer = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const SelectorHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SelectorTitle = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 20px;
  color: #111111;
`;

const CountBadge = styled(Box)`
  background: rgba(17, 17, 17, 1);
  border-radius: 4px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CountText = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  color: #111111;
  line-height: 1.3;
`;

const SelectorDescription = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  color: #666666;
`;

const FacilityTabs = styled(Box)`
  flex: 1;
  background: white;
  border-radius: 6px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const TabList = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const TabButton = styled(Box)<{ active?: boolean }>`
  background: ${(props) => {
    if (props.active) return '#a38644';
    return '#999999';
  }};
  color: white;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:first-of-type {
    border-radius: 6px 0 0 0;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const TabTitle = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 20px;
  color: white;
`;

const TabCountBadge = styled(Box)<{ active?: boolean }>`
  background: ${(props) =>
    props.active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)'};
  border-radius: 4px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabCountText = styled(Typography)<{ active?: boolean }>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  color: ${(props) => (props.active ? '#46360b' : '#3f560e')};
  line-height: 1.3;
`;

const TabContent = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FacilityList = styled(Box)`
  flex: 1;
  overflow-y: auto;
`;

const FacilityItem = styled(Box)<{ selected?: boolean; highlighted?: boolean }>`
  background: ${(props) => {
    if (props.selected && props.highlighted) return '#fff9ef';
    if (props.selected) return '#f7ffef';
    if (props.highlighted) return '#fffcf7';
    return 'white';
  }};
  border-bottom: 1px solid #eeeeee;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const FacilityInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const FacilityNumber = styled(Box)<{ active?: boolean; highlighted?: boolean }>`
  background: ${(props) => {
    if (props.active && props.highlighted) return 'rgba(163, 134, 68, 0.2)';
    if (props.active) return 'rgba(144, 178, 93, 0.2)';
    if (props.highlighted) return 'rgba(163, 134, 68, 0.2)';
    return 'rgba(68, 106, 163, 0.2)';
  }};
  border-radius: 2px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FacilityNumberText = styled(Typography)<{
  active?: boolean;
  highlighted?: boolean;
}>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 12px;
  color: ${(props) => {
    if (props.active && props.highlighted) return '#46360b';
    if (props.active) return '#3f560e';
    if (props.highlighted) return '#46360b';
    return '#0a2145';
  }};
  text-align: center;
`;

const FacilityName = styled(Typography)<{
  selected?: boolean;
  highlighted?: boolean;
}>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: ${(props) => (props.selected || props.highlighted ? 700 : 500)};
  font-size: 16px;
  color: ${(props) => {
    if (props.selected && props.highlighted) return '#46360b';
    if (props.selected) return '#3f560e';
    if (props.highlighted) return '#46360b';
    return '#111111';
  }};
  flex: 1;
`;

const SelectionCheckbox = styled(Box)<{ selected?: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 0.75px solid ${(props) => (props.selected ? '#8fc31f' : '#b3b3b3')};
  background: ${(props) => (props.selected ? '#8fc31f' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface Facility {
  id: string;
  name: string;
  category: FacilityTypeEnum;
  highlighted?: boolean;
}

const facilities: Facility[] = [
  // Architecture facilities
  {
    id: 'arch_1',
    name: '실외기실 루버창',
    category: FacilityTypeEnum.CONSTRUCTION,
  },
  {
    id: 'arch_2',
    name: '에어컨 매립배관',
    category: FacilityTypeEnum.CONSTRUCTION,
  },
  {
    id: 'arch_3',
    name: '양변기 로우탱크 내부',
    category: FacilityTypeEnum.CONSTRUCTION,
    highlighted: true,
  },
  {
    id: 'arch_4',
    name: '발코니 난간(형상)',
    category: FacilityTypeEnum.CONSTRUCTION,
  },
  {
    id: 'arch_5',
    name: '현관문 클로저(형상)',
    category: FacilityTypeEnum.CONSTRUCTION,
    highlighted: true,
  },
  {
    id: 'arch_6',
    name: '욕실 점검구(형상)',
    category: FacilityTypeEnum.CONSTRUCTION,
  },

  // Mechanical facilities
  { id: 'mech_1', name: '가스차단기', category: FacilityTypeEnum.MACHINE },
  { id: 'mech_2', name: '온수분배기', category: FacilityTypeEnum.MACHINE },
  { id: 'mech_3', name: '환기시스템 등', category: FacilityTypeEnum.MACHINE },
  { id: 'mech_4', name: '렌지후드', category: FacilityTypeEnum.MACHINE },
  { id: 'mech_5', name: '보일러', category: FacilityTypeEnum.MACHINE },
  { id: 'mech_6', name: '터치수전', category: FacilityTypeEnum.MACHINE },
  {
    id: 'mech_7',
    name: '대피소 피난사다리',
    category: FacilityTypeEnum.MACHINE,
  },
  {
    id: 'mech_8',
    name: '스프링클러',
    category: FacilityTypeEnum.MACHINE,
    highlighted: true,
  },
  { id: 'mech_9', name: '수도계량기', category: FacilityTypeEnum.MACHINE },
  {
    id: 'mech_10',
    name: '가스감지기',
    category: FacilityTypeEnum.MACHINE,
    highlighted: true,
  },

  // Electrical facilities
  {
    id: 'elec_1',
    name: '스마트스위치',
    category: FacilityTypeEnum.ELECTRICITY,
  },
  {
    id: 'elec_2',
    name: 'IOT 콘센트',
    category: FacilityTypeEnum.ELECTRICITY,
    highlighted: true,
  },
  {
    id: 'elec_3',
    name: '자동폐쇄장치',
    category: FacilityTypeEnum.ELECTRICITY,
  },
  {
    id: 'elec_4',
    name: '월패드',
    category: FacilityTypeEnum.ELECTRICITY,
    highlighted: true,
  },
  { id: 'elec_5', name: '동체감지기', category: FacilityTypeEnum.ELECTRICITY },
];

const tabConfigs = {
  architecture: {
    title: '건축',
    color: '#a38644',
    count: 6,
  },
  mechanical: {
    title: '기계',
    color: '#90b25d',
    count: 13,
  },
  electrical: {
    title: '전기 · 통신',
    color: '#446aa3',
    count: 10,
  },
};

interface FacilitySelectorProps {
  selectedFacilities: string[];
  onFacilitiesChange: (facilities: string[]) => void;
}

export const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  selectedFacilities,
  onFacilitiesChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<FacilityTypeEnum>(
    FacilityTypeEnum.CONSTRUCTION
  );

  const handleFacilityToggle = (facilityId: string) => {
    if (selectedFacilities.includes(facilityId)) {
      onFacilitiesChange(selectedFacilities.filter((id) => id !== facilityId));
    } else {
      onFacilitiesChange([...selectedFacilities, facilityId]);
    }
  };

  const filteredFacilities = facilities.filter(
    (facility) => facility.category === activeTab
  );

  return (
    <SelectorContainer>
      <SelectorHeader>
        <SelectorTitle>유지보수 설비 선택</SelectorTitle>
        <CountBadge>
          <CountText>29</CountText>
        </CountBadge>
      </SelectorHeader>
      <SelectorDescription>
        건축, 기계, 전기·통신 항목에서 1개만 선택할 수 있습니다.
      </SelectorDescription>

      <FacilityTabs>
        <TabList>
          {(Object.keys(tabConfigs) as FacilityTypeEnum[]).map((tabType) => {
            const config = tabConfigs[tabType];
            const isActive = activeTab === tabType;
            return (
              <TabButton
                key={tabType}
                active={isActive}
                onClick={() => setActiveTab(tabType)}
              >
                <TabTitle>{config.title}</TabTitle>
                <TabCountBadge active={isActive}>
                  <TabCountText active={isActive}>{config.count}</TabCountText>
                </TabCountBadge>
              </TabButton>
            );
          })}
        </TabList>

        <TabContent>
          <FacilityList>
            {filteredFacilities.map((facility, index) => {
              const isSelected = selectedFacilities.includes(facility.id);
              return (
                <FacilityItem
                  key={facility.id}
                  selected={isSelected}
                  highlighted={facility.highlighted}
                  onClick={() => handleFacilityToggle(facility.id)}
                >
                  <FacilityInfo>
                    <FacilityNumber
                      active={activeTab === FacilityTypeEnum.MACHINE}
                      highlighted={facility.highlighted}
                    >
                      <FacilityNumberText
                        active={activeTab === FacilityTypeEnum.MACHINE}
                        highlighted={facility.highlighted}
                      >
                        {index + 1}
                      </FacilityNumberText>
                    </FacilityNumber>
                    <FacilityName
                      selected={isSelected}
                      highlighted={facility.highlighted}
                    >
                      {facility.name}
                    </FacilityName>
                  </FacilityInfo>
                  <SelectionCheckbox selected={isSelected}>
                    {isSelected && (
                      <Check sx={{ fontSize: 14, color: 'white' }} />
                    )}
                  </SelectionCheckbox>
                </FacilityItem>
              );
            })}
          </FacilityList>
        </TabContent>
      </FacilityTabs>
    </SelectorContainer>
  );
};
