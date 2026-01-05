import styled from '@emotion/styled';

const ContentsBox = styled.ul`
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #f9f9f9;
`;

const ContentLi = styled.li`
  width: 100%;
  & p {
    color: #333;
    font-size: 20px;
    font-weight: 700;
  }
  & span {
    color: #666;
  }
  &:not(:last-of-type) {
    border-bottom: 1px solid #ccc;
    padding-bottom: 16px;
  }
`;

export const RegisterPolicyContent = () => {
  return (
    <div>
      <ContentsBox>
        <ContentLi>
          <p>수집 · 이용 목적</p>
          <span>'LH집속속' 상담사 및 관리자 서비스 제공</span>
        </ContentLi>
        <ContentLi>
          <p>수집 항목</p>
          <span>성명, 부서 명, 전화번호</span>
        </ContentLi>
        <ContentLi>
          <p>보유 · 이용기간</p>
          <span>이용 목적 달성 시까지</span>
        </ContentLi>
      </ContentsBox>

      <p className='pt-4 text-[#666]'>
        위의 개인정보 수집ㆍ이용에 대한 동의를 거부할 권리가 있습니다. <br />
        그러나 동의를 거부할 경우, 서비스 이용이 제한됩니다.
      </p>
    </div>
  );
};
