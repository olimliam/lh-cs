import { ConsultationCodeGenerator } from './consultation-code-generator';

describe('ConsultationCodeGenerator', () => {
  let generator: ConsultationCodeGenerator;

  beforeEach(() => {
    generator = new ConsultationCodeGenerator();
  });

  describe('generateRoomNumber', () => {
    it('6자리 문자열을 반환해야 함', () => {
      const roomNumber = generator.generateRoomNumber();

      expect(roomNumber).toHaveLength(6);
    });

    it('100000 ~ 999999 범위의 숫자를 반환해야 함', () => {
      for (let i = 0; i < 100; i++) {
        const roomNumber = generator.generateRoomNumber();
        const number = parseInt(roomNumber, 10);

        expect(number).toBeGreaterThanOrEqual(100000);
        expect(number).toBeLessThan(1000000);
      }
    });

    it('숫자로만 구성되어야 함', () => {
      const roomNumber = generator.generateRoomNumber();

      expect(/^\d+$/.test(roomNumber)).toBe(true);
    });

    it('각 호출마다 다른 값을 생성할 수 있어야 함', () => {
      const roomNumbers = new Set<string>();
      for (let i = 0; i < 50; i++) {
        roomNumbers.add(generator.generateRoomNumber());
      }

      expect(roomNumbers.size).toBeGreaterThan(1);
    });
  });

  describe('generateEnterCode', () => {
    it('4자리 문자열을 반환해야 함', () => {
      const enterCode = generator.generateEnterCode();

      expect(enterCode).toHaveLength(4);
    });

    it('숫자로만 구성되어야 함', () => {
      for (let i = 0; i < 100; i++) {
        const enterCode = generator.generateEnterCode();

        expect(/^\d{4}$/.test(enterCode)).toBe(true);
      }
    });

    it('각 호출마다 다른 값을 생성할 수 있어야 함', () => {
      const enterCodes = new Set<string>();
      for (let i = 0; i < 50; i++) {
        enterCodes.add(generator.generateEnterCode());
      }

      expect(enterCodes.size).toBeGreaterThan(1);
    });

    it('0000 ~ 9999 범위의 코드를 생성해야 함', () => {
      for (let i = 0; i < 100; i++) {
        const enterCode = generator.generateEnterCode();
        const number = parseInt(enterCode, 10);

        expect(number).toBeGreaterThanOrEqual(0);
        expect(number).toBeLessThanOrEqual(9999);
      }
    });
  });

  describe('generateConsultationCode', () => {
    it('기본 접두사 CS로 시작해야 함', () => {
      const code = generator.generateConsultationCode();

      expect(code.startsWith('CS_')).toBe(true);
    });

    it('커스텀 접두사를 사용할 수 있어야 함', () => {
      const code = generator.generateConsultationCode('TEST');

      expect(code.startsWith('TEST_')).toBe(true);
    });

    it('접두사_타임스탬프_랜덤 형식이어야 함', () => {
      const code = generator.generateConsultationCode();
      const pattern = /^CS_\d{6}_\d{3}$/;

      expect(pattern.test(code)).toBe(true);
    });

    it('타임스탬프 부분이 6자리여야 함', () => {
      const code = generator.generateConsultationCode();
      const parts = code.split('_');

      expect(parts[1]).toHaveLength(6);
      expect(/^\d+$/.test(parts[1])).toBe(true);
    });

    it('랜덤 부분이 3자리 숫자여야 함', () => {
      const code = generator.generateConsultationCode();
      const parts = code.split('_');

      expect(parts[2]).toHaveLength(3);
      expect(/^\d{3}$/.test(parts[2])).toBe(true);
    });

    it('랜덤 부분이 000 ~ 999 범위여야 함', () => {
      for (let i = 0; i < 100; i++) {
        const code = generator.generateConsultationCode();
        const parts = code.split('_');
        const random = parseInt(parts[2], 10);

        expect(random).toBeGreaterThanOrEqual(0);
        expect(random).toBeLessThanOrEqual(999);
      }
    });

    it('각 호출마다 다른 값을 생성할 수 있어야 함', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 50; i++) {
        codes.add(generator.generateConsultationCode());
      }

      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe('generateVisitorId', () => {
    it('visitor_ 접두사로 시작해야 함', () => {
      const visitorId = generator.generateVisitorId();

      expect(visitorId.startsWith('visitor_')).toBe(true);
    });

    it('visitor_ 이후 12자리 16진수 문자열이어야 함', () => {
      const visitorId = generator.generateVisitorId();
      const hexPart = visitorId.replace('visitor_', '');

      expect(hexPart).toHaveLength(12);
      expect(/^[0-9a-f]+$/.test(hexPart)).toBe(true);
    });

    it('각 호출마다 다른 값을 생성해야 함', () => {
      const visitorIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        visitorIds.add(generator.generateVisitorId());
      }

      expect(visitorIds.size).toBeGreaterThan(1);
    });

    it('일관된 형식을 유지해야 함', () => {
      const pattern = /^visitor_[0-9a-f]{12}$/;

      for (let i = 0; i < 100; i++) {
        const visitorId = generator.generateVisitorId();
        expect(pattern.test(visitorId)).toBe(true);
      }
    });
  });

  describe('암호학적 안전성 테스트', () => {
    it('generateRoomNumber가 충분한 무작위성을 가져야 함', () => {
      const results = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        results.add(generator.generateRoomNumber());
      }

      expect(results.size).toBeGreaterThan(iterations * 0.9);
    });

    it('generateEnterCode가 충분한 무작위성을 가져야 함', () => {
      const results = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        results.add(generator.generateEnterCode());
      }

      expect(results.size).toBeGreaterThan(iterations * 0.5);
    });

    it('generateVisitorId가 충분한 무작위성을 가져야 함', () => {
      const results = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        results.add(generator.generateVisitorId());
      }

      expect(results.size).toBe(iterations);
    });
  });
});
