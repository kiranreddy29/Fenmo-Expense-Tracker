import { describe, it, expect } from 'vitest';
import { toMinorUnits, toDisplayString, isValidAmount } from '../src/utils/money.js';

describe('Money Utilities', () => {
  it('should convert decimal strings to minor units (paise)', () => {
    expect(toMinorUnits('250.00')).toBe(25000);
    expect(toMinorUnits('123.45')).toBe(12345);
    expect(toMinorUnits('100')).toBe(10000);
    expect(toMinorUnits('0.50')).toBe(50);
    expect(toMinorUnits('0.05')).toBe(5);
  });

  it('should throw on non-string input', () => {
    expect(() => toMinorUnits(null)).toThrow(TypeError);
    expect(() => toMinorUnits(undefined)).toThrow(TypeError);
    expect(() => toMinorUnits(123)).toThrow(TypeError);
    expect(() => toMinorUnits('')).toThrow(TypeError);
  });

  it('should convert minor units to display strings', () => {
    expect(toDisplayString(25000)).toBe('250.00');
    expect(toDisplayString(12345)).toBe('123.45');
    expect(toDisplayString(50)).toBe('0.50');
    expect(toDisplayString(5)).toBe('0.05');
    expect(toDisplayString(0)).toBe('0.00');
  });

  it('should validate amount strings correctly', () => {
    expect(isValidAmount('250.00')).toBe(true);
    expect(isValidAmount('100')).toBe(true);
    expect(isValidAmount('0.01')).toBe(true);
    expect(isValidAmount('-10.00')).toBe(false);
    expect(isValidAmount('0.00')).toBe(false);
    expect(isValidAmount('10.123')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
  });
});
