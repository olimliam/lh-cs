import { AnswerStateEnum } from '@/constants/constant';

export interface MissionDataType {
  id: number;
  desc: string;
  iconComponent: string;
  missionTitle: string;
  missionDesc: string;
  missionFinishText: string;
}

export interface VisitQuizDataType {
  id: number;
  question: string;
  answer: number; //0 : o, 1: x
}

export interface ChatDataType {
  id: number;
  questionId?: number;
  question?: string;
  moQuestion?: string;
  answer?: string;
  moAnswer?: string;
}
export interface ChatQuestionType {
  id: number;
  question: string;
  moQuestion: string;
}
export interface ChatAnswerType {
  id: number;
  questionId: number;
  answer: string;
  moAnswer: string;
}

export type AnswerStateType = `${AnswerStateEnum}`;
