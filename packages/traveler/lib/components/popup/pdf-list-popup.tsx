import styled from '@emotion/styled';

const Root = styled.div`
  width: calc(100% - 40px);
  height: calc(100vh - 160px);
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 51;
  border-radius: 8px;
  background: #1a1a1a;
`;

const Title = styled.div`
  width: 100%;
  padding: 8px 16px;
  color: #f9fafb;
  font-size: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid #374151;
`;

const Button = styled.button`
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

function PDFListPopup(props: {
  children?: React.ReactNode;
  onClose?: () => void;
}) {
  // 임시 message 함수
  const message = (key: string) => key;

  return (
    <Root>
      <Title>
        <p
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexGrow: 1,
          }}
        >
          {message('목차')}
        </p>
        <Button onClick={props.onClose}>
          <i className='ic-close' />
        </Button>
      </Title>
      {props.children}
    </Root>
  );
}

export default PDFListPopup;
