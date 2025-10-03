/**
 * @file Unit tests for the utility functions in `bookUtils.ts`.
 */

import { calculateAge } from '../bookUtils';

describe('bookUtils', () => {
  describe('calculateAge', () => {
    it('should correctly calculate the age of a book', () => {
      // Arrange: Set a fixed system time using fake timers.
      // This makes the test deterministic and independent of when it's run.
      vi.useFakeTimers().setSystemTime(new Date('2025-10-03'));
      
      const pubDate = '2023-05-10';
      const expectedAge = '2 years, 4 months'; // Corrected expected age

      // Act: Call the function with the test data.
      const actualAge = calculateAge(pubDate);

      // Assert: Check if the result matches the expected output.
      expect(actualAge).toBe(expectedAge);
      
      // Cleanup: Restore the real timers.
      vi.useRealTimers();
    });
  });
});