import { log } from "../common-test-utils";
import { applyConsoleFilters, evalFilterConfig } from "../../src/utils/debug/debug-tools"
const { filtersConfig } = require("../../src/config-debug").default;

describe('consoleFilters', () => {
  describe('initial tests', () => {
    beforeAll(() => filtersConfig['leaveOnFirstMatch'] = true);

    describe(`don't include messages that don't match any filter`,() => {
      beforeAll(() => filtersConfig['includeNonMatching'] = false);

      describe('normal usage - filtering with string and/or regex', () => {
        it('should include in log', () => {
          const consoleFilters = ['!Require cycle', '!Object', 'hello', /^Hello/, '!Ello', '!helloo'];

          expect(applyConsoleFilters(['hello there'           ], consoleFilters))         .toBeTruthy();
          expect(applyConsoleFilters(['Hello there'           ], consoleFilters))         .toBeTruthy();
          expect(applyConsoleFilters(['Echo, there is a hello'], consoleFilters))         .toBeTruthy();
          expect(applyConsoleFilters(['Hello and helloo'      ], consoleFilters))         .toBeTruthy();
        });

        it('should exclude from log', () => {
          const consoleFilters = ['!helloo', '!Require cycle', '!Object', 'hello', /^Hello/, '!Ello'];

          expect(applyConsoleFilters(['There is a Hello'      ], consoleFilters))         .toBeFalsy();
          expect(applyConsoleFilters(['Yes, Hello there'      ], consoleFilters))         .toBeFalsy();
          expect(applyConsoleFilters(['Require cycle'         ], consoleFilters))         .toBeFalsy();
          expect(applyConsoleFilters(['Ello'                  ], consoleFilters))         .toBeFalsy();
          expect(applyConsoleFilters(['Other Ello'            ], consoleFilters))         .toBeFalsy();
          expect(applyConsoleFilters(['Hello and helloo'      ], consoleFilters))         .toBeFalsy();
        })
      })

      describe('usage with type check (object, string etc.)', () => {
        it('should include by type', () => {
          const filters = ['(object)', '(string)'];
          expect(applyConsoleFilters([{}     ], filters))         .toBeTruthy();
          expect(applyConsoleFilters([''     ], filters))         .toBeTruthy();
          expect(applyConsoleFilters([/hh/   ], filters))         .toBeTruthy();

        })

        it('should exclude by type', () => {
          const filters = ['!(object)', '(string)'];
          expect(applyConsoleFilters([{}     ], filters))         .toBeFalsy();
          expect(applyConsoleFilters([8      ], filters))         .toBeFalsy();
        })
      })

      describe('some use cases', () => {
        it('filter out disabling console.time', () => {
          let consoleFilters                     = ['!Require cycle', '!Disabli33ng console', '!Object'];
          let args = ["[debug-tools] Disabling console.time(End) calls - see values of 'consoleTimeCalculations' or '__MYDEV__'"];
          expect(applyConsoleFilters(args, consoleFilters))         .toBeFalsy();

          consoleFilters                     = ['!Require cycle', '!Disabling console', '!Object'];
          expect(applyConsoleFilters(args, consoleFilters))         .toBeFalsy();
        })

        describe('shared cases', () => {
          it(`case 1`, () => {
            let consoleFilters                     = ['!LOGGED', 'here'];
            let args = ["A message to be logged"];
            expect(applyConsoleFilters(args, consoleFilters))         .toBeFalsy();
          })
        })
      })
    })

    describe(`include messages that don't match any filter`,() => {
      beforeAll(() => filtersConfig['includeNonMatching'] = true);
    
      describe('shared cases', () => {
        it(`case 1`, () => {
          let consoleFilters                     = ['!LOGGED', 'here'];
          let args = ["A message to be logged"];
          expect(applyConsoleFilters(args, consoleFilters))         .toBeTruthy();
        })
      })
    })

    describe('custom cases', () => {
      let filters, args;

      it('fav2', () => {
        filters = ['MessageDialog', 'includeNonMatching: false'];

        args = ['[serverUtils] [Action getCountries] Requesting getCountries'];
        expect(applyConsoleFilters(args, filters))                  .toBeFalsy();

        args = ['Offline mode (see utils/debug/offline.js)'];
        expect(applyConsoleFilters(args, filters))                  .toBeFalsy();

        args = ['[MessageDialog] current: vMT next: vMT'];
        expect(applyConsoleFilters(args, filters))                  .toBeTruthy();
      })
    })
  })

  describe.only('new tests', () => {
    let filters, args;

    it('uses redux filter', () => {
      filters = filtersConfig.redux.concat();
      log(filters)
      args = ['Require cycle'];
      expect(applyConsoleFilters(args, filters))          .toBeFalsy();

      args = ['%c next state'];
      expect(applyConsoleFilters(args, filters))          .toBeFalsy();

      args = ['%c prev state'];
      expect(applyConsoleFilters(args, filters))          .toBeFalsy();

      args = ['%c action HELLO_THERE'];
      expect(applyConsoleFilters(args, filters))          .toBeTruthy();
    });

    it('uses AND', () => {
      filters = ['mode: liM', 'msg', '!(object)', 'hello'];
      args = ['Hello there', {}];
      
      expect(args.length)                                 .toEqual(2);
      expect(applyConsoleFilters(args, filters))          .toBeTruthy();
      expect(args.length)                                 .toEqual(1);
    })

    it('uses OR', () => {
      filters = ['mode: lim', 'msg', '!(object)', 'hello'];
      args = ['Hello there', {}];
      
      expect(args.length)                                 .toEqual(2);
      expect(applyConsoleFilters(args, filters))          .toBeTruthy();
      expect(args.length)                                 .toEqual(1);
    })
  })
})



describe('evalFilterConfig', () => {
  it("'mode' values", () => {
    expect(evalFilterConfig('mode:lim'))        .toEqual({lOFM: false, iNM: false, m:'or', });
    expect(evalFilterConfig('mode:liM'))        .toEqual({lOFM: false, iNM: false, m:'and', });
    expect(evalFilterConfig('mode:lIM'))        .toEqual({lOFM: false, iNM: true , m:'and', });
    expect(evalFilterConfig('mode:LIM'))        .toEqual({lOFM: true , iNM: true , m:'and', });
    expect(evalFilterConfig('mode:Lim'))        .toEqual({lOFM: true , iNM: false, m:'or', });
    expect(evalFilterConfig('mode:LIm'))        .toEqual({lOFM: true , iNM: true , m:'or', });
    expect(evalFilterConfig('mode:lIm'))        .toEqual({lOFM: false, iNM: true , m:'or', });

    expect(evalFilterConfig('mode:or'))         .toEqual('or');
    expect(evalFilterConfig('mode:and'))        .toEqual('and');

    expect(() => evalFilterConfig('mode: ntt')) .toThrowError(/unexpected mode value/);
  })
})
