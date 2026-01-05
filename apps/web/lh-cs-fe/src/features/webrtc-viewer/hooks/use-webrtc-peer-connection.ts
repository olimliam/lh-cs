import { useRef, useCallback, useState } from 'react';
import { ICE_SERVERS } from '../constants/webrtc-config';

const PREFERRED_VIDEO_MIME_TYPES = ['video/H264', 'video/VP8'];
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];

type CodecInfo = RTCRtpCodec;
type CodecInfoList = CodecInfo[];

const getIceTransportPolicy = (): RTCIceTransportPolicy => {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : undefined;

  return hostname && LOCAL_HOSTNAMES.includes(hostname) ? 'all' : 'relay';
};

const buildCodecPreferenceList = (
  codecs: CodecInfoList,
  preferredMimeTypes: string[]
): CodecInfoList => {
  const orderedCodecs: CodecInfoList = [];
  const appendedIndexes = new Set<number>();
  const lowerCasedPreferred = preferredMimeTypes.map((mime) =>
    mime.toLowerCase()
  );

  const appendCodecWithRtxNeighbor = (index: number) => {
    if (appendedIndexes.has(index)) {
      return;
    }

    const codec = codecs[index];
    orderedCodecs.push(codec);
    appendedIndexes.add(index);

    const neighbor = codecs[index + 1];
    if (
      neighbor &&
      !appendedIndexes.has(index + 1) &&
      neighbor.mimeType.toLowerCase() === 'video/rtx'
    ) {
      orderedCodecs.push(neighbor);
      appendedIndexes.add(index + 1);
    }
  };

  lowerCasedPreferred.forEach((preferredMime) => {
    codecs.forEach((codec, index) => {
      if (codec.mimeType.toLowerCase() === preferredMime) {
        appendCodecWithRtxNeighbor(index);
      }
    });
  });

  codecs.forEach((_, index) => {
    appendCodecWithRtxNeighbor(index);
  });

  return orderedCodecs;
};

const applyPreferredVideoCodecs = (pc: RTCPeerConnection) => {
  if (
    typeof RTCRtpSender === 'undefined' ||
    typeof RTCRtpSender.getCapabilities !== 'function' ||
    typeof pc.getTransceivers !== 'function'
  ) {
    return;
  }

  const capabilities = RTCRtpSender.getCapabilities('video');
  if (!capabilities?.codecs?.length) {
    return;
  }

  const reorderedCodecs = buildCodecPreferenceList(
    capabilities.codecs,
    PREFERRED_VIDEO_MIME_TYPES
  );

  pc.getTransceivers()
    .filter(
      (transceiver) =>
        transceiver.sender?.track?.kind === 'video' &&
        typeof transceiver.setCodecPreferences === 'function'
    )
    .forEach((transceiver) => {
      try {
        transceiver.setCodecPreferences(reorderedCodecs);
      } catch (error) {
        console.warn('⚠️ Failed to apply codec preferences:', error);
      }
    });
};

const applyScreenShareContentHints = (stream: MediaStream) => {
  stream.getVideoTracks().forEach((track) => {
    if ('contentHint' in track && !track.contentHint) {
      track.contentHint = 'detail';
    }
  });
};

interface UseWebRTCPeerConnectionOptions {
  iceServers?: RTCIceServer[];
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
}

export const useWebRTCPeerConnection = ({
  iceServers = ICE_SERVERS,
  onRemoteStream,
  onConnectionStateChange,
  onIceCandidate,
}: UseWebRTCPeerConnectionOptions = {}) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>('new');
  const [isConnected, setIsConnected] = useState(false);

  // ICE Candidate 큐잉을 위한 상태
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  // PeerConnection 초기화
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: getIceTransportPolicy(),
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('🎥 ontrack event triggered:', {
        streams: event.streams.length,
        track: {
          kind: event.track.kind,
          enabled: event.track.enabled,
          readyState: event.track.readyState,
          id: event.track.id,
        },
      });

      if (event.streams[0]) {
        const stream = event.streams[0];
        console.log('🎥 Remote stream details:', {
          id: stream.id,
          tracks: stream.getTracks().map((track) => ({
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            id: track.id,
          })),
        });

        if (onRemoteStream) {
          onRemoteStream(stream);
        }
      } else {
        console.warn('⚠️ ontrack event without streams');
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionState(state);
      setIsConnected(state === 'connected');

      if (onConnectionStateChange) {
        onConnectionStateChange(state);
      }

      console.log('Connection state:', state);
    };

    peerConnectionRef.current = pc;
    console.log(
      '🔗 PeerConnection created, signaling state:',
      pc.signalingState
    );
    return pc;
  }, [iceServers, onRemoteStream, onConnectionStateChange, onIceCandidate]);

  // Offer 생성 (Host용)
  const createOffer = useCallback(async () => {
    console.log('📝 Starting createOffer process...');
    if (!peerConnectionRef.current) {
      console.error('❌ PeerConnection이 초기화되지 않았습니다.');
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }

    try {
      console.log('📝 Creating RTC offer...');
      const offer = await peerConnectionRef.current.createOffer();
      console.log('📝 Setting local description...', offer.type);
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('📝 Local description set successfully');

      return offer;
    } catch (error) {
      console.error('❌ CreateOffer failed:', error);
      throw error;
    }
  }, []);

  // Answer 생성 (Visitor용) - 테스트 페이지와 동일한 방식
  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      try {
        // SessionDescription 유효성 검사
        if (!offer || !offer.type || !offer.sdp) {
          throw new Error('Invalid offer: missing type or sdp');
        }

        if (offer.type !== 'offer') {
          throw new Error(`Expected offer type, got: ${offer.type}`);
        }

        console.log('📝 Creating new PeerConnection for answer...');
        // 매번 새로운 PeerConnection 생성 (테스트 페이지 방식)
        const pc = initializePeerConnection();

        console.log(
          '📝 Offer validation passed, setting remote description...'
        );
        await pc.setRemoteDescription(offer);
        // 이미 수신한 ICE 후보가 있다면 즉시 처리
        processPendingIceCandidates();
        console.log('📝 Remote description set, creating answer...');

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // ICE gathering 완료 대기
        await new Promise<void>((resolve) => {
          const checkIceGatheringState = () => {
            if (pc?.iceGatheringState === 'complete') {
              resolve();
            } else {
              setTimeout(checkIceGatheringState, 100);
            }
          };
          checkIceGatheringState();
        });

        console.log('✅ Answer created successfully');
        return pc.localDescription!;
      } catch (error) {
        console.error('❌ Failed to create answer:', error);
        throw error;
      }
    },
    [initializePeerConnection]
  );

  // Answer 처리 (Host용)
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        throw new Error('PeerConnection이 초기화되지 않았습니다.');
      }

      const pc = peerConnectionRef.current;
      const currentState = pc.signalingState;

      console.log(
        '📝 HandleAnswer called, current signaling state:',
        currentState
      );

      // stable 상태이면 이미 연결이 완료된 상태이므로 무시
      if (currentState === 'stable') {
        console.log('⚠️ Answer ignored - connection already in stable state');
        return;
      }

      // have-local-offer 상태가 아니면 에러
      if (currentState !== 'have-local-offer') {
        console.error(
          '❌ Invalid state for setRemoteDescription:',
          currentState
        );
        throw new Error(`Cannot set remote answer in state: ${currentState}`);
      }

      try {
        // SessionDescription 유효성 검사
        if (!answer || !answer.type || !answer.sdp) {
          throw new Error('Invalid answer: missing type or sdp');
        }

        if (answer.type !== 'answer') {
          throw new Error(`Expected answer type, got: ${answer.type}`);
        }

        console.log(
          '📝 Answer validation passed, setting remote description...'
        );
        await pc.setRemoteDescription(answer);
        console.log('✅ Remote answer set successfully');

        // 대기 중인 ICE Candidate 처리
        processPendingIceCandidates();
      } catch (error) {
        console.error('❌ Failed to set remote description:', error);
        throw error;
      }
    },
    []
  );

  // 스트림 추가
  const addStream = useCallback((stream: MediaStream) => {
    if (!peerConnectionRef.current) {
      throw new Error('PeerConnection이 초기화되지 않았습니다.');
    }

    const pc = peerConnectionRef.current;

    applyScreenShareContentHints(stream);

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    applyPreferredVideoCodecs(pc);
  }, []);

  // 대기 중인 ICE Candidate 처리
  const processPendingIceCandidates = () => {
    const pc = peerConnectionRef.current;
    if (
      !pc ||
      !pc.remoteDescription ||
      pendingIceCandidatesRef.current.length === 0
    ) {
      return;
    }

    console.log(
      `🔄 Processing ${pendingIceCandidatesRef.current.length} pending ICE candidates`
    );

    const candidatesToProcess = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    candidatesToProcess.forEach(async (candidate) => {
      try {
        await pc.addIceCandidate(candidate);
        console.log('✅ Pending ICE Candidate processed');
      } catch (error) {
        console.error('❌ Failed to process pending ICE candidate:', error);
      }
    });
  };

  // ICE Candidate 추가 (큐잉 로직 포함)
  const addIceCandidate = async (candidate: RTCIceCandidate) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (pc.remoteDescription) {
        // Remote Description이 설정되어 있으면 즉시 추가
        await pc.addIceCandidate(candidate);
        console.log('✅ ICE Candidate added immediately');
      } else {
        // Remote Description이 없으면 큐에 저장
        pendingIceCandidatesRef.current.push(candidate);
        console.log('📝 ICE Candidate queued (waiting for remote description)');
      }
    } catch (error) {
      console.error('❌ Failed to handle ICE candidate:', error);
    }
  };

  // 연결 종료
  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setConnectionState('closed');
      setIsConnected(false);
      pendingIceCandidatesRef.current = []; // 큐 초기화
    }
  }, []);

  // PeerConnection 재초기화 (기존 연결 정리 후)
  const reinitializePeerConnection = useCallback(() => {
    console.log('🔄 Reinitializing PeerConnection...');
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingIceCandidatesRef.current = [];
    setConnectionState('new');
    setIsConnected(false);

    // 새로운 PeerConnection 생성
    const newPc = initializePeerConnection();
    console.log(
      '✅ PeerConnection reinitialized, state:',
      newPc?.signalingState
    );
    return newPc;
  }, [initializePeerConnection]);

  return {
    peerConnectionRef,
    connectionState,
    isConnected,
    initializePeerConnection,
    reinitializePeerConnection,
    createOffer,
    createAnswer,
    handleAnswer,
    addStream,
    addIceCandidate,
    closePeerConnection,
  };
};
