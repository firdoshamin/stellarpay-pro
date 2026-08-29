import { describe, it, expect } from 'vitest';
import { truncateAddress, formatAmount, formatDate } from './formatters';

describe('formatters utility', () => {
  describe('truncateAddress', () => {
    it('returns empty string for null or empty input', () => {
      expect(truncateAddress(null)).toBe('');
      expect(truncateAddress(undefined)).toBe('');
      expect(truncateAddress('')).toBe('');
    });

    it('returns original string if length is short', () => {
      expect(truncateAddress('GABC1234', 4)).toBe('GABC1234');
    });

    it('truncates long public key correctly', () => {
      const key = 'GBF2B2UADUIG7C2R44KOWU5KTH2W64P4Z6DQXKFXKFXKFXKFXKFXKFXK';
      const truncated = truncateAddress(key, 4);
      expect(truncated).toContain('...');
      expect(truncated.startsWith('GBF2')).toBe(true);
    });
  });

  describe('formatAmount', () => {
    it('handles numeric and string values', () => {
      expect(formatAmount('100.5')).toBe('100.50');
      expect(formatAmount(50)).toBe('50.00');
    });

    it('returns 0.00 for invalid inputs', () => {
      expect(formatAmount('invalid')).toBe('0.00');
    });
  });

  describe('formatDate', () => {
    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });

    it('formats ISO date string', () => {
      const formatted = formatDate('2026-08-29T12:00:00Z');
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('2026');
    });
  });
});
