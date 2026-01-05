import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateConsultationModal from './create-consultation-modal';

// Mock the text-styles components
vi.mock('../../text-styles', () => ({
  ModalTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  ModalButtonText: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => <span style={style}>{children}</span>,
}));

describe('CreateConsultationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when open is true', () => {
    render(<CreateConsultationModal {...defaultProps} />);

    expect(screen.getByText('상담 코드')).toBeInTheDocument();
    expect(
      screen.getByLabelText('상담 코드를 입력해 주세요')
    ).toBeInTheDocument();
    expect(screen.getByText('평형 선택')).toBeInTheDocument();
    expect(screen.getByText('유지보수 설비 선택')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CreateConsultationModal {...defaultProps} />);

    expect(screen.queryByText('상담 코드')).not.toBeInTheDocument();
  });

  it('calls onConfirm with correct data when form is submitted', () => {
    render(<CreateConsultationModal {...defaultProps} />);

    // Fill in the form
    const codeInput = screen.getByLabelText('상담 코드를 입력해 주세요');
    fireEvent.change(codeInput, { target: { value: 'TEST123' } });

    // Select house type by finding the radio button with value A1
    const houseTypeRadio = screen.getByDisplayValue('A1');
    fireEvent.click(houseTypeRadio);

    // Select facility type by finding the radio button with specific value
    const facilityRadio = screen.getByDisplayValue('실내기계 무터방');
    fireEvent.click(facilityRadio);

    // Submit the form
    const submitButton = screen.getByText('상담실 개설하기');
    fireEvent.click(submitButton);

    expect(mockOnConfirm).toHaveBeenCalledWith({
      consultationCode: 'TEST123',
      houseType: 'A1',
      facilityType: '실내기계 무터방',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<CreateConsultationModal {...defaultProps} />);

    const cancelButton = screen.getByText('취소하기');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
