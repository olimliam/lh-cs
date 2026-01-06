import styled from '@emotion/styled';
import styles from '@/shared/styles/Spinners.module.css';

const SpinnerStyle = styled.span<{ size?: number }>`
  width: ${({ size }) => size || 48}px;
  height: ${({ size }) => size || 48}px;

  @media screen and (min-width: 1921px) {
    width: 3.12vw;
    height: 3.12vw;
  }
`;

interface SpinnerProps {
  size?: number;
}
function Spinner({ size }: SpinnerProps) {
  return <SpinnerStyle className={styles.root} size={size} />;
}

export default Spinner;
