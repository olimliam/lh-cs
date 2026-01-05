import { useCallback, useEffect, useRef, useState } from 'react';

import useIOClient from '@/features/drawer/model/use-io-client';
import { ConsultationStatusEnum } from '@/shared';
import { isAxiosError } from '@/shared/api/api-error.util';
import { cleanupConsultationTimer } from '@/shared/hooks/use-consultation-timer';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { BASE_FONT_FAMILY, ConsultationEndModal } from '@/shared/ui';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import styled from '@emotion/styled';
import {
  endConsultation,
  restartConsultation,
} from '../api/consultation-command-api';
import {
  useCreateConsultation,
  useGetAllConsultationRooms,
} from '../api/consultation-hooks';
import { getConsultationDetail } from '../api/consultation-query-api';
import { ConsultationRoom } from '../model/consultation.types';
import { ConsultationHeader } from './consultation-header';
import { ConsultationList } from './consultation-list';
import CreateConsultationModal from './create-consultation-modal';
import { useProfile } from '@/features/auth';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { parseTimeWithKST } from '@/shared/utils/parse-time-with-kst';
import dayjs from 'dayjs';
import { useServiceUrl } from '@/app/providers';

const EmptyState = styled.div`
  background: #f5f5f5;
  border: 1px dashed rgba(17, 17, 17, 0.4);
  border-radius: 6px;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  flex: 1;

  /* 태블릿 범위 (768px-1024px) */
  @media (min-width: 768px) and (max-width: 1024px) {
    padding: 40px 50px;
    gap: 22px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    padding: 48px 60px;
    gap: 24px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    padding: 24px 30px;
    gap: 16px;
    border-radius: 4px;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    padding: 20px 24px;
    gap: 14px;
  }
`;

const EmptyMessage = styled.p`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 22px;
  line-height: 1.5;
  color: #111111;
  text-align: center;
  margin: 0;

  /* 태블릿 범위 (768px-1024px) */
  @media (min-width: 768px) and (max-width: 1024px) {
    font-size: 25px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    font-size: 28px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 1.4;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const EmptyMessageBold = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.5;
  color: #111111;

  /* 태블릿 범위 (768px-1024px) */
  @media (min-width: 768px) and (max-width: 1024px) {
    font-size: 25px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    font-size: 28px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    font-size: 18px;
    line-height: 1.4;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const LargeCreateButton = styled.button`
  background: #0055a2;
  border: none;
  border-radius: 4px;
  padding: 12px 12px 12px 16px;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* 태블릿 범위 (768px-1024px) */
  @media (min-width: 768px) and (max-width: 1024px) {
    padding: 13px 13px 13px 17px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    padding: 14px 14px 14px 18px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    padding: 10px 10px 10px 14px;
    border-radius: 3px;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    padding: 8px 8px 8px 12px;
    border-radius: 3px;
  }

  &:hover {
    background: #004080;
  }
`;

const LargePlusIcon = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;

  &::before {
    content: '+';
    font-size: 20px;
    font-weight: 500;
  }
`;

const LargeButtonText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 24px;
  line-height: 1.3;
  color: #ffffff;
`;

export const ConsultationContainer = () => {
  const { data: profileData } = useProfile();
  const displayRole = profileData?.role ?? UserRoleEnum.ADMIN;
  const serviceUrl = useServiceUrl();
  const [consultationRooms, setConsultationRooms] = useState<
    ConsultationRoom[]
  >([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConsultationEndModalOpen, setIsConsultationEndModalOpen] =
    useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string>('0');
  const autoEndRequestedRef = useRef<Set<string>>(new Set());
  const toastMessages = useToastMessages();

  // WebSocket 연결 (상담실 상태 업데이트 수신용)
  const { isConnected } = useIOClient(import.meta.env.VITE_WS_URL, {
    sessionId: 'admin-user', // 백엔드에서 알림을 보내는 채널과 일치
    onMessage: (messageStr: string) => {
      try {
        const message = JSON.parse(messageStr);

        // 상담 상태 변경은 WebRTC Host가 postMessage로 전달하는 이벤트만 사용한다.
        // WebSocket에서는 알림/메타 처리만 수행.
        if (
          message.type === WsEmitEventsEnum.MANAGER_END ||
          message.type === WsEmitEventsEnum.CONSULTATION_ENDED
        ) {
          console.log('Received consultation ended message:', message);
          refetchConsultationData();
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error, messageStr);
      }
    },
  });

  const updateRoomStatus = useCallback((msg: any) => {
    // consultationId 추출 로직 개선: data.consultationId 또는 sessionId 사용
    const consultationId = msg.data?.consultationId || msg.sessionId;

    if (!consultationId) {
      console.warn('consultationId를 찾을 수 없습니다:', msg);
      return;
    }
    setConsultationRooms((prev) =>
      prev.map((room) => {
        if (room.id === consultationId) {
          // 연결 상태에 따라 상담 상태 결정
          const isAdminConnected = msg.data.managerId || false;
          const isVisitorConnected = msg.data.visitorId || false;

          // 웹소켓 상태 업데이트
          const newStatus: ConsultationStatusEnum = msg.data.status;

          // 상담 종료 시 타이머 정리
          if (room.status !== ConsultationStatusEnum.CONSULTING) {
            cleanupConsultationTimer(room.id);
          }

          const updatedRoom = {
            ...room,
            status: newStatus,
            // 연결 상태 정보 업데이트
            connectedUsers: {
              admin: isAdminConnected,
              visitor: isVisitorConnected,
            },
            // 상담 시작 시간 업데이트 (WebSocket에서 전송된 값)
            consultingStartedAt: msg.data.consultingStartedAt
              ? typeof msg.data.consultingStartedAt === 'string'
                ? new Date(msg.data.consultingStartedAt)
                : msg.data.consultingStartedAt
              : room.consultingStartedAt,
            // 업데이트 시간 기록
            lastUpdated: new Date().toISOString(),
          };

          return updatedRoom;
        }

        return room;
      })
    );
  }, []);

  // 상담 상세 화면에서 전달되는 postMessage 수신해 상태 동기화
  useEffect(() => {
    const handleStatusSync = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data || {};
      if (type !== 'CONSULTATION_STATUS_SYNC') return;
      if (!data?.consultationId || !data?.status) return;

      updateRoomStatus({
        data: {
          consultationId: data.consultationId,
          status: data.status,
          managerId: data.managerId,
          visitorId: data.visitorConnected
            ? data.visitorId || 'visitor'
            : undefined,
          consultingStartedAt: data.consultingStartedAt,
        },
        sessionId: data.consultationId,
      });
    };

    window.addEventListener('message', handleStatusSync);
    return () => {
      window.removeEventListener('message', handleStatusSync);
    };
  }, [updateRoomStatus]);

  const handleCardItemClicked = async (roomId: string, tourCdnId: string) => {
    const room = consultationRooms.find((room) => room.id === roomId);

    if (!room) {
      console.error('상담실을 찾을 수 없습니다:', roomId);
      return;
    }

    // 종료 중인 상담실인 경우 재시작 처리
    if (room.status === ConsultationStatusEnum.END) {
      try {
        // 1. 재시작 API 호출
        await restartConsultation(roomId);

        // 2. 로컬 상태 업데이트
        setConsultationRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  status: ConsultationStatusEnum.READY,
                  endRequestedAt: undefined,
                }
              : r
          )
        );

        openNewConsultationRoom(roomId, tourCdnId);

        return;
      } catch (error) {
        console.error('상담실 재시작 실패:', error);
        return;
      }
    } else if (room.status === ConsultationStatusEnum.CONSULTING) {
      toastMessages.showAlreadyEnteredRoom();
      return;
    } else if (room.status === ConsultationStatusEnum.READY) {
      // 상담실에서 입장하기 버튼을 눌렀을 때. (=고객이 먼저 입장한 경우)
      try {
        // 1. 현재 consultation 상태 API 호출로 실제 상태 확인
        const consultationDetail = await getConsultationDetail(roomId);
        console.log('READY 상태 상담실 상태 확인:', roomId, consultationDetail);

        if (consultationDetail.status === ConsultationStatusEnum.CONSULTING) {
          // 실제로는 CONSULTING 상태라면 입장 불가 토스트 메시지 출력 후 종료
          toastMessages.showAlreadyEnteredRoom();
          return;
        }

        // READY 상태라면 상담실 입장
        openNewConsultationRoom(roomId, tourCdnId);

        return;
      } catch (error) {
        console.error('상담실 상태 확인 실패:', error);
        return;
      }
    }

    // 일반적인 상담실 입장
    // window.open(`/tour/${roomId}/?tourCdnId=${tourCdnId}`, '_blank');
    openNewConsultationRoom(roomId, tourCdnId);
  };

  const openNewConsultationRoom = (roomId: string, tourCdnId: string) => {
    // 3. 재시작 후 상담실 입장
    setTimeout(() => {
      // 사용자 화면 크기에 맞춰서 팝업 크기 조정
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;

      // 화면 크기의 80%를 기본으로 하되, 최소/최대 크기 제한
      const popupWidth = Math.min(
        Math.max(screenWidth * 0.8, 1024),
        screenWidth - 100
      );
      const popupHeight = Math.min(
        Math.max(screenHeight * 0.8, 768),
        screenHeight - 100
      );

      // 팝업을 화면 중앙에 위치
      const left = (screenWidth - popupWidth) / 2;
      const top = (screenHeight - popupHeight) / 2;

      window.open(
        `/admin/host/${roomId}/?tourCdnId=${tourCdnId}`,
        '_blank',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    }, 500); // 상태 업데이트 후 약간의 지연
  };

  const handleCopyInfo = async (room: ConsultationRoom) => {
    // 클립보드 복사 로직
    const roomInfo = `상담실 URL: ${serviceUrl}/visitor/${room.id}/?tourCdnId=${room.tourCdnId}\n입장 코드: ${room.enterCode || 'N/A'}\n상담사: ${room.consultantName}`;

    try {
      // 최신 브라우저의 Clipboard API 사용
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(roomInfo);
        toastMessages.showInfoCopied();
      } else {
        // 폴백: 전통적인 방법 사용
        const textArea = document.createElement('textarea');
        textArea.value = roomInfo;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          toastMessages.showInfoCopied();
        } catch (err) {
          console.error('복사 실패:', err);
          // 복사 실패 시 사용자에게 수동 복사 안내
          prompt('다음 정보를 수동으로 복사하세요:', roomInfo);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('클립보드 복사 오류:', err);
      // 에러 발생 시 사용자에게 수동 복사 안내
      prompt('다음 정보를 수동으로 복사하세요:', roomInfo);
    }
  };

  const handleOpenCreateRoom = () => {
    // 상담실 생성 개수를 초과한 경우
    if (displayRole === UserRoleEnum.CONSULTANT) {
      const maxRoomCount = Number(
        import.meta.env.VITE_CONSULTATION_MAX_ROOM_COUNT
      );
      if (consultationRooms.length >= maxRoomCount) {
        toastMessages.showMaxRoomExceeded();
        return;
      }
    }

    setIsCreateModalOpen(true);
  };

  const { data: consultationData, refetch: refetchConsultationData } =
    useGetAllConsultationRooms();

  const { mutateAsync: createConsultation, isSuccess: isCreateSuccess } =
    useCreateConsultation();

  // 자동 종료 재시도 횟수 추적 (무한 재시도 방지)
  const autoEndAttemptMapRef = useRef<Map<string, number>>(new Map());
  const MAX_AUTO_END_RETRY = 3;

  useEffect(() => {
    if (consultationData) {
      setConsultationRooms(consultationData);
    }
  }, [consultationData]);

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      consultationRooms.forEach((room) => {
        cleanupConsultationTimer(room.id);
      });
    };
  }, [consultationRooms]);

  useEffect(() => {
    if (isCreateSuccess) {
      refetchConsultationData();
    }
  }, [isCreateSuccess, refetchConsultationData]);

  const handleCreateConfirm = async (data: {
    consultationCode: string;
    tourId: string;
    facilityId: string;
  }) => {
    try {
      const consultationData = await createConsultation({
        tourId: data.tourId,
        startTourFacilityId: data.facilityId,
        consultationCode: data.consultationCode,
      });

      setConsultationRooms((prev) => [...prev, consultationData!]);
      setIsCreateModalOpen(false);

      // 성공 토스트 표시
      toastMessages.showRoomCreated();

      return true;
    } catch (error) {
      console.error('Failed to create consultation room:', error);
      // 에러 세부 정보 로그
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        toastMessages.showError(error.message);
      }
      return false;
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleEndConsultRoom = useCallback(
    async (roomId: string) => {
      try {
        // 1. 상담 종료 API 호출 (5분 지연 종료 시작)
        await endConsultation(roomId);

        // 2. 모달 닫기
        setIsConsultationEndModalOpen(false);

        // 3. 상담실 상태를 END로 업데이트
        setConsultationRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  status: ConsultationStatusEnum.END,
                  endRequestedAt: new Date().toISOString(),
                }
              : room
          )
        );

        // 디버깅 log 주석처리
        // console.log(
        //   `상담 종료 요청 성공: ${roomId} - 5분 후에 완전히 종료됩니다.`
        // );
        toastMessages.showRoomEndInitiated();
      } catch (error) {
        console.error('상담 종료 실패:', error);
        const message =
          error instanceof Error
            ? error.message
            : '상담 종료 중 오류가 발생했습니다.';
        // TODO: 에러 토스트 메시지 추가 필요
        toastMessages.showError(message);
        throw error;
      }
    },
    [toastMessages]
  );

  const handleEndRoom = (roomId: string) => {
    setIsConsultationEndModalOpen(true);
    setTargetRoomId(roomId);
  };

  // 대기 30분 초과 시 자동 종료 요청
  const requestAutoEnd = useCallback(
    async (roomId: string) => {
      const attempts = autoEndAttemptMapRef.current.get(roomId) ?? 0;
      if (
        autoEndRequestedRef.current.has(roomId) &&
        attempts >= MAX_AUTO_END_RETRY
      ) {
        // 이미 최대 재시도에 도달한 방은 추가 호출하지 않음
        return;
      }
      autoEndAttemptMapRef.current.set(roomId, attempts + 1);
      autoEndRequestedRef.current.add(roomId);
      try {
        await handleEndConsultRoom(roomId);
        // 성공 시 시도 횟수/플래그 정리
        autoEndAttemptMapRef.current.delete(roomId);
        autoEndRequestedRef.current.delete(roomId);
      } catch (error) {
        // 이미 종료된 방 에러면 더 이상 재시도하지 않는다.
        if (isAxiosError(error)) {
          const code = (error.response?.data as any)?.code;
          if (code === 'CONSULTATION_ALREADY_ENDED') {
            autoEndAttemptMapRef.current.delete(roomId);
            return;
          }
        }
        // 실패 시 재시도 가능하도록 플래그는 유지하되, 시도 횟수로 제한
        if (attempts + 1 >= MAX_AUTO_END_RETRY) {
          console.error(
            `[auto-end] ${roomId} reached max retry (${MAX_AUTO_END_RETRY}). Stop retrying.`
          );
        } else {
          // 플래그 유지: 다음 주기에서 재시도
          console.warn(
            `[auto-end] ${roomId} will retry (attempt ${attempts + 1}/${MAX_AUTO_END_RETRY}).`
          );
        }
      }
    },
    [handleEndConsultRoom]
  );

  const handleTimerDone = (consultationId: string) => {
    console.log(`Timer done for consultation: ${consultationId}`);
    // 상담실 목록 데이터 새로고침
    refetchConsultationData();
  };

  // 상담실 대기 시간이 30분을 넘으면 자동 종료 요청
  useEffect(() => {
    // const THIRTY_MINUTES = 30 * 60 * 1000;
    // const HUNDRED_MINUTES = 100 * 60 * 1000;

    // const checkAutoEnd = () => {
    //   const now = Date.now();

    //   consultationRooms.forEach((room) => {
    //     // 이미 종료 요청 중이면 스킵
    //     if (room.endRequestedAt) return;

    //     if (room.status === ConsultationStatusEnum.READY) {
    //       const createdAt = new Date(room.createdAt).getTime();
    //       if (Number.isNaN(createdAt)) return;

    //       if (now - createdAt >= THIRTY_MINUTES) {
    //         requestAutoEnd(room.id);
    //       }
    //       return;
    //     }

    //     if (room.status === ConsultationStatusEnum.CONSULTING) {
    //       const startedAt = room.consultingStartedAt
    //         ? new Date(room.consultingStartedAt).getTime()
    //         : null;
    //       if (!startedAt || Number.isNaN(startedAt)) return;
    //       // 100분 초과 시 종료 요청
    //       if (now - startedAt >= HUNDRED_MINUTES) {
    //         requestAutoEnd(room.id);
    //       }
    //     }
    //   });
    // };
    // consultation-container.tsx의 1분 체크 로직
    const checkAutoEnd = () => {
      consultationRooms.forEach((room) => {
        // 이미 종료 요청 중이면 스킵
        if (room.endRequestedAt) return;
        const createdAt = parseTimeWithKST(room.createdAt);
        const consultingStartedAt = room.consultingStartedAt
          ? parseTimeWithKST(room.consultingStartedAt)
          : null;

        const now = dayjs();

        // READY 30분 초과 체크
        if (room.status === ConsultationStatusEnum.READY) {
          if (now.diff(createdAt, 'minute') >= 30) {
            // auto-end 로직
            requestAutoEnd(room.id);
          }
          return;
        }

        // CONSULTING 100분 초과 체크
        if (
          room.status === ConsultationStatusEnum.CONSULTING &&
          consultingStartedAt
        ) {
          if (now.diff(consultingStartedAt, 'minute') >= 100) {
            // auto-end 로직
            requestAutoEnd(room.id);
          }
        }
      });
    };

    // 즉시 한 번 체크하고, 이후 1분 주기로 체크
    checkAutoEnd();
    const intervalId = window.setInterval(checkAutoEnd, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [consultationRooms, requestAutoEnd]);

  return (
    <>
      <>
        {/* WebSocket 연결 상태 표시 (디버깅용) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: isConnected ? '#10b981' : '#ef4444',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 1000,
            }}
          >
            WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        )}

        <ConsultationHeader
          consultationRooms={consultationRooms}
          onCreateRoom={handleOpenCreateRoom}
        />

        {/* 상담실이 없을 때 */}
        {consultationRooms.length === 0 && (
          <EmptyState>
            <EmptyMessage>
              현재 개설된 상담실이 없습니다.
              <br />
              상담 시, <EmptyMessageBold>"상담실 개설하기"</EmptyMessageBold>를
              클릭해 주세요.
            </EmptyMessage>
            <LargeCreateButton onClick={handleOpenCreateRoom}>
              <LargePlusIcon />
              <LargeButtonText>상담실 개설하기</LargeButtonText>
            </LargeCreateButton>
          </EmptyState>
        )}

        {/* 상담실 목록 */}
        <div className='h-full w-full overflow-y-auto'>
          <ConsultationList
            consultationRooms={consultationRooms}
            onEnterRoom={handleCardItemClicked}
            onEndRoom={handleEndRoom}
            onCopyInfo={handleCopyInfo}
            onTimerDone={handleTimerDone}
          />
        </div>
      </>

      <ErrorBoundary fallback={<></>}>
        <CreateConsultationModal
          open={isCreateModalOpen}
          onClose={handleCreateCancel}
          onConfirm={handleCreateConfirm}
        />
      </ErrorBoundary>
      <ConsultationEndModal
        open={isConsultationEndModalOpen}
        onClose={() => setIsConsultationEndModalOpen(false)}
        onConfirm={() => handleEndConsultRoom(targetRoomId)}
      />
    </>
  );
};
