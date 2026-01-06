import * as XLSX from 'xlsx';

export class ExcelDownloadResponseDto {
  fileName: string;
  workbook: XLSX.WorkBook;

  constructor(dto: ExcelDownloadResponseDto) {
    this.fileName = dto.fileName;
    this.workbook = dto.workbook;
  }
}
