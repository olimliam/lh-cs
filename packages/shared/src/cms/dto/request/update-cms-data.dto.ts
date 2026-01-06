export class UpdateCmsDataDto {
  contents: unknown;

  constructor(dto: UpdateCmsDataDto) {
    this.contents = dto.contents;
  }
}
