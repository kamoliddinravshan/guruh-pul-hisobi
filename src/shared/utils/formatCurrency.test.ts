import { describe, expect, it } from 'vitest';
import { formatCurrency } from '@/shared/utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats UZS values with Uzbek locale and suffix', () => {
    expect(formatCurrency(320_000)).toBe("320 000 so'm");
  });

  it('rounds decimal values before formatting', () => {
    expect(formatCurrency(1200.7)).toBe("1 201 so'm");
  });
});
