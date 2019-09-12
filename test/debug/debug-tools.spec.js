import { applyConsoleFilters } from "../../src/utils/debug/debug-tools"
import { filtersConfig } from "../../src/config-debug"

describe('consoleFilters', () => {
  describe(`don't include messages that don't match any filter`,() => {
    beforeAll(() => filtersConfig['includeNonMatching'] = false);

    describe('normal usage - filtering with string and/or regex', () => {
      it('should include in log', () => {
        const consoleFilters = ['!Require cycle', '!Object', 'hello', /^Hello/, '!Ello', '!helloo'];

        expect(applyConsoleFilters(['hello there'           ], consoleFilters))         .toBeTruthy();
        debugger;
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
        const filters = ['<object>', '<string>'];
        expect(applyConsoleFilters([{}     ], filters))         .toBeTruthy();
        expect(applyConsoleFilters([''     ], filters))         .toBeTruthy();
        expect(applyConsoleFilters([/hh/   ], filters))         .toBeTruthy();

      })

      it('should exclude by type', () => {
        const filters = ['!<object>', '<string>'];
        debugger
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
})