import { validatePhone, validateLOCAddress } from '../src/utils/validation'


describe('validation functions', () => {
  it('validatePhone - should validate a phone number', () => {
    let p1 = '+87989'
        p2 = '09890'
        p3 = 'fg09890'
        p4 = '+389723497234'
        p5 = '+3897234 97 234'
        p6 = '+3897234-97-234'
        p7 = '389723497234'
        p8 = '389 7234 97 234'
        p9 = '389k7234 97 234'
    ;

    expect(validatePhone(p1))     .toBeTruthy();
    expect(validatePhone(p2))     .toBeTruthy();
    expect(validatePhone(p3))     .toBeFalsy();
    expect(validatePhone(p4))     .toBeTruthy();
    expect(validatePhone(p5))     .toBeFalsy();
    expect(validatePhone(p6))     .toBeFalsy();
    expect(validatePhone(p7))     .toBeTruthy();
    expect(validatePhone(p8))     .toBeFalsy();
    expect(validatePhone(p9))     .toBeFalsy();
  });

  it('validateLOCAddress - should validate blockchain address', () => {
    expect( validateLOCAddress(12) )                          .toEqual(1);
    expect( validateLOCAddress('12') )                        .toEqual(0);
    expect( validateLOCAddress('0x12') )                      .toEqual(1);
    expect( validateLOCAddress('0x1823497daffbbbx2') )        .toEqual(0);
    expect( validateLOCAddress('0x1823497daffbe8987f2') )     .toEqual(1);
    expect( validateLOCAddress(null) )                        .toEqual(-1);
    expect( validateLOCAddress(undefined) )                   .toEqual(-1);
    expect( validateLOCAddress({}) )                          .toEqual(-1);
  })

});