import { HttpStatus, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Express } from 'express';
import { QuestionAnswerRepository } from '@/infrastructure/repository/question-answer.repository';
import { ContentAttachmentRepository } from '@/infrastructure/repository/content-attachment.repository';
import { S3ClientService } from '@/common/s3/s3-client.service';
import { QuestionAnswerService } from './question-answer.service';
import { ContentImageService } from './content-image.service';
import { CreateQuestionAnswerCommand } from '../dto/command/create-question-answer.command';
import {
  buildAttachmentMessages,
} from '@/common/utils/attachment.util';
import { CustomException } from '@/common/exception/custom.exception';
import { QuestionAnswerErrorCode } from '@/common/exception/error';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

describe('QuestionAnswerService', () => {
  let service: QuestionAnswerService;
  let s3ClientService: jest.Mocked<S3ClientService>;
  let transactionMock: jest.Mock;
  let attachmentMaxSizeBytes: number;
  let attachmentMessages: ReturnType<typeof buildAttachmentMessages>;

  beforeEach(async () => {
    transactionMock = jest.fn();
    attachmentMaxSizeBytes = 10 * 1024 * 1024;
    attachmentMessages = buildAttachmentMessages(attachmentMaxSizeBytes);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionAnswerService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: transactionMock,
          },
        },
        {
          provide: QuestionAnswerRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ContentAttachmentRepository,
          useValue: {
            createAttachments: jest.fn(),
            findAllByOwner: jest.fn(),
            findByIds: jest.fn(),
            deleteByIds: jest.fn(),
            deleteByOwner: jest.fn(),
            reassignIndexes: jest.fn(),
          },
        },
        {
          provide: S3ClientService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            extractKeyFromUrl: jest.fn(),
          },
        },
        {
          provide: ContentImageService,
          useValue: {
            syncContentImageUsage: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              maxSizeBytes: attachmentMaxSizeBytes,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(QuestionAnswerService);
    s3ClientService = module.get(S3ClientService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createQuestionAnswer', () => {
    it('첨부 파일 용량이 10MB를 초과하면 CustomException을 던진다', async () => {
      expect.assertions(5);

      const command = {
        title: '제목',
        content: '내용',
        isPublic: true,
      } as CreateQuestionAnswerCommand;

      const oversizedFile = {
        size: attachmentMessages.maxSizeBytes + 1,
        originalname: 'oversize.png',
        buffer: Buffer.from('data'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      try {
        await service.createQuestionAnswer(command, [oversizedFile], 'admin-1');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomException);
        const exception = error as CustomException;
        expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(exception.getResponse()).toMatchObject({
          message: attachmentMessages.attachmentSizeMessage,
          code: QuestionAnswerErrorCode.QUESTION_ANSWER_INVALID_ATTACHMENT,
        });
        expect(s3ClientService.uploadFile).not.toHaveBeenCalled();
        expect(transactionMock).not.toHaveBeenCalled();
        return;
      }

      throw new Error('CustomException이 발생해야 합니다.');
    });
  });
});
