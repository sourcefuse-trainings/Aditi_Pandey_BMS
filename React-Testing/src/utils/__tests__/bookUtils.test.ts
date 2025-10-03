import { calculateAge } from '../bookUtils';

describe('bookUtils', () => {
  describe('calculateAge', () => {
    it('should correctly calculate the age of a book', () => {
      vi.useFakeTimers().setSystemTime(new Date('2025-10-03'));
      const pubDate = '2023-05-10';
      const expectedAge = '2 years, 5 months';
      expect(calculateAge(pubDate)).toBe(expectedAge);
      vi.useRealTimers();
    });
  });
});