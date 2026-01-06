export class GetCmsDataDto {
  contents: unknown;

  constructor(dto: GetCmsDataDto) {
    this.contents = dto.contents;
  }
}
