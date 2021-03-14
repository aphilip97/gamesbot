import { isStringArray } from '../utils/validators';

describe('isStringArray', () => {

  it('should throw an error if pure string array', () => {
    const arr = ['foo', 1, 'bar'];
    try {
      // @ts-expect-error
      isStringArray(arr);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty(
        'message',
        `Expected 'string[]'. Got ["foo",1,"bar"].`,
      );
    }
  });

});
