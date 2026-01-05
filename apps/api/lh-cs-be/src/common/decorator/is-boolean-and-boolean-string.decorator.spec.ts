// tests/is-boolean-and-boolean-string.spec.ts
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IsBooleanAndBooleanString } from './is-boolean-and-boolean-string.decorator';

class BasicDto {
  @IsBooleanAndBooleanString({ optional: true })
  flag?: boolean;
}

class NonOptionalBasicDto {
  @IsBooleanAndBooleanString()
  flag?: boolean;
}

describe('IsBooleanAndBooleanString - basic', () => {
  it('accepts boolean true/false', () => {
    const dto1 = plainToInstance(BasicDto, { flag: true });
    const dto2 = plainToInstance(BasicDto, { flag: false });

    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto2)).toHaveLength(0);
    expect(dto1.flag).toBe(true);
    expect(dto2.flag).toBe(false);
  });

  it('converts "true"/"false" strings to boolean', () => {
    const dto1 = plainToInstance(BasicDto, { flag: 'true' });
    const dto2 = plainToInstance(BasicDto, { flag: 'false' });

    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto2)).toHaveLength(0);
    expect(dto1.flag).toBe(true);
    expect(dto2.flag).toBe(false);
  });

  it('treats empty value as undefined (skipped)', () => {
    const dto1 = plainToInstance(BasicDto, { flag: '' });
    const dto2 = plainToInstance(BasicDto, {});
    const dto3 = plainToInstance(BasicDto, { flag: undefined });
    const dto4 = plainToInstance(BasicDto, { flag: null });

    // undefined로 치환되어 검증 대상에서 스킵됨
    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto2)).toHaveLength(0);
    expect(validateSync(dto3)).toHaveLength(0);
    expect(validateSync(dto4)).toHaveLength(0);

    expect(dto1.flag).toBeUndefined();
    expect(dto2.flag).toBeUndefined();
    expect(dto3.flag).toBeUndefined();
    expect(dto4.flag).toBeUndefined();
  });

  it('rejects non-boolean strings', () => {
    const dto = plainToInstance(BasicDto, { flag: 'yesplease' });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean'); // @IsBoolean에서 걸림
  });

  it('empty value fails without @IsOptional', () => {
    const dto = plainToInstance(NonOptionalBasicDto, { flag: '' });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
  });
});

class ExtendedDto {
  @IsBooleanAndBooleanString({ acceptExtendedLiterals: true })
  flag?: boolean;
}
describe('IsBooleanAndBooleanString - extended literals', () => {
  it('accepts "1" / "0"', () => {
    const dto1 = plainToInstance(ExtendedDto, { flag: '1' });
    const dto2 = plainToInstance(ExtendedDto, { flag: '0' });

    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto2)).toHaveLength(0);
    expect(dto1.flag).toBe(true);
    expect(dto2.flag).toBe(false);
  });

  it('accepts "on"/"off" and "yes"/"no"', () => {
    const dtoOn = plainToInstance(ExtendedDto, { flag: 'on' });
    const dtoOff = plainToInstance(ExtendedDto, { flag: 'off' });
    const dtoYes = plainToInstance(ExtendedDto, { flag: 'yes' });
    const dtoNo = plainToInstance(ExtendedDto, { flag: 'no' });

    expect(validateSync(dtoOn)).toHaveLength(0);
    expect(validateSync(dtoOff)).toHaveLength(0);
    expect(validateSync(dtoYes)).toHaveLength(0);
    expect(validateSync(dtoNo)).toHaveLength(0);

    expect(dtoOn.flag).toBe(true);
    expect(dtoYes.flag).toBe(true);
    expect(dtoOff.flag).toBe(false);
    expect(dtoNo.flag).toBe(false);
  });

  it('accepts numeric 1/0 when acceptExtendedLiterals is true', () => {
    const dto1 = plainToInstance(ExtendedDto, { flag: 1 });
    const dto0 = plainToInstance(ExtendedDto, { flag: 0 });

    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto0)).toHaveLength(0);
    expect(dto1.flag).toBe(true);
    expect(dto0.flag).toBe(false);
  });
});

class OptionalDto {
  @IsBooleanAndBooleanString({ optional: true })
  flag?: boolean;
}

describe('IsBooleanAndBooleanString - optional', () => {
  it('skips validation when value is empty/undefined/null', () => {
    const dto1 = plainToInstance(OptionalDto, {});
    const dto2 = plainToInstance(OptionalDto, { flag: '' });
    const dto3 = plainToInstance(OptionalDto, { flag: undefined });
    const dto4 = plainToInstance(OptionalDto, { flag: null });

    expect(validateSync(dto1)).toHaveLength(0);
    expect(validateSync(dto2)).toHaveLength(0);
    expect(validateSync(dto3)).toHaveLength(0);
    expect(validateSync(dto4)).toHaveLength(0);

    expect(dto1.flag).toBeUndefined();
    expect(dto2.flag).toBeUndefined();
    expect(dto3.flag).toBeUndefined();
    expect(dto4.flag).toBeUndefined();
  });

  it('still validates when value exists and is invalid', () => {
    const dto = plainToInstance(OptionalDto, { flag: 'maybe' });
    const errors = validateSync(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
  });
});
