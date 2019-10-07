import { validatePhone, validatePhoneIssues, PHONE_VALIDATION_ISSUES, validateLOCAddress, validateName, validatePassword, validateEmail} from '../src/utils/validation'


describe('validation functions', () => {
  it('validatePhone - should validate a phone number', () => {
    let p1 = '+87989'
        p2 = '09890'
        p3 = '+389723497234'
        p4 = '389723497234'
        
        p5 = 'fg09890'
        p6 = '+3897234 97 234'
        p7 = '+3897234-97-234'
        p8 = '389 7234 97 234'
        p9 = '389k7234 97 234'
        p10 = -1;
        p11 = '-1';
    ;
    
    expect(validatePhone(p1))     .toBeTruthy();
    expect(validatePhone(p2))     .toBeTruthy();
    expect(validatePhone(p3))     .toBeTruthy();
    expect(validatePhone(p4))     .toBeTruthy();

    expect(validatePhone(p5))     .toBeFalsy();
    expect(validatePhone(p6))     .toBeFalsy();
    expect(validatePhone(p7))     .toBeFalsy();
    expect(validatePhone(p8))     .toBeFalsy();
    expect(validatePhone(p9))     .toBeFalsy();
    expect(validatePhone(p10))    .toBeFalsy();
    expect(validatePhone(p11))    .toBeFalsy();
  });
  it('validatePhone - phone validation issues list', () => {
    let p1 = '+87989'
        p2 = '09890'
        p3 = '+389723497234'
        p4 = '389723497234';
        
    let p5 = 'fg09890'
        p6 = '+3897234 97 234'
        p7 = '+3897234-97-234'
        p8 = '389 7234 97 234'
        p9 = '389k7234 97 234'
        p10 = -1;
        p11 = '-1';
    
    expect(validatePhoneIssues(p1))     .toEqual(null);
    expect(validatePhoneIssues(p2))     .toEqual(null);
    expect(validatePhoneIssues(p3))     .toEqual(null);
    expect(validatePhoneIssues(p4))     .toEqual(null);

    expect(validatePhoneIssues(p5))     .toEqual(PHONE_VALIDATION_ISSUES.DIGITS_ONLY);
    expect(validatePhoneIssues(p6))     .toEqual(PHONE_VALIDATION_ISSUES.DIGITS_ONLY);
    expect(validatePhoneIssues(p7))     .toEqual(PHONE_VALIDATION_ISSUES.DIGITS_ONLY);
    expect(validatePhoneIssues(p8))     .toEqual(PHONE_VALIDATION_ISSUES.DIGITS_ONLY);
    expect(validatePhoneIssues(p9))     .toEqual(PHONE_VALIDATION_ISSUES.DIGITS_ONLY);
    expect(validatePhoneIssues(p10))    .toEqual(PHONE_VALIDATION_ISSUES.INTERNAL);
    expect(validatePhoneIssues(p11))    .toEqual(PHONE_VALIDATION_ISSUES.LENGTH);
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
    expect( validateLOCAddress(-1) )                          .toEqual(0);
    expect( validateLOCAddress('-1') )                        .toEqual(0);
  })

  it('validateName', () => {
    expect( validateName('nm') )                        .toBeTruthy();
    expect( validateName('Nh') )                        .toBeTruthy();
    expect( validateName('Name') )                      .toBeTruthy();
    expect( validateName('NAme') )                      .toBeTruthy();
    expect( validateName('NAME') )                      .toBeTruthy();

    expect( validateName('N') )                         .toBeFalsy();
    expect( validateName('t') )                         .toBeFalsy();
    expect( validateName('t.') )                        .toBeFalsy();
    expect( validateName('t,') )                        .toBeFalsy();
    expect( validateName('') )                          .toBeFalsy();
  })

  it('validatePassword', () => {
    expect(validatePassword('atgia41702'))               .toBeTruthy();
    expect(validatePassword('manz&290'))                 .toBeTruthy();
    expect(validatePassword('aArta&1X^'))                .toBeTruthy();

    expect(validatePassword('aArtb&X'))                  .toBeFalsy();
    expect(validatePassword('aArtb&XL'))                 .toBeFalsy();
    expect(validatePassword('thoeurle'))                 .toBeFalsy();
    expect(validatePassword('982374934'))                .toBeFalsy();
  })

  it('validateEmail', () => {
    expect(validateEmail('ne@mn.tb'))                    .toBeTruthy();
    expect(validateEmail('n@mn.tb'))                     .toBeTruthy();
    expect(validateEmail('n&@mn.tb'))                    .toBeTruthy();
    expect(validateEmail('n_&@mn.tb'))                   .toBeTruthy();
    expect(validateEmail('nc.&@mn.tb'))                  .toBeTruthy();
    expect(validateEmail('ne@m.tn'))                     .toBeTruthy();
    expect(validateEmail('ns^@mn.tn'))                   .toBeTruthy();
    expect(validateEmail('ns&@mn.tn'))                   .toBeTruthy();

    expect(validateEmail('ns@mn.t'))                     .toBeFalsy();
    expect(validateEmail('ns<@mn.tn'))                   .toBeFalsy();
    expect(validateEmail('ns>@mn.tn'))                   .toBeFalsy();
    expect(validateEmail('ns*@mn.tn'))                   .toBeFalsy();
    expect(validateEmail('ns.t*n@mn.tn'))                .toBeFalsy();
    expect(validateEmail(`ns&@mn.tn\"`))                 .toBeFalsy();
    expect(validateEmail(`\"ns\"@mn.tn`))                .toBeFalsy();
  })

});