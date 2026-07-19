import { ValidationError } from '../errors/DomainError';

/**
 * Immutable amount of money stored as integer cents to avoid float drift.
 * The wire format is decimal (e.g. "1234.50") to stay friendly to clients.
 */
export class Money {
  private constructor(public readonly cents: number) {}

  public static fromDecimalString(raw: string): Money {
    if (typeof raw !== 'string') {
      throw new ValidationError('totalBudget must be a string');
    }
    const normalized = raw.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      throw new ValidationError(
        'totalBudget must be a positive decimal with up to 2 digits',
      );
    }
    // El default de `whole` es inalcanzable (el regex de arriba ya exige \d+),
    // pero mantiene el tipo como string bajo noUncheckedIndexedAccess.
    const [whole = '0', frac = ''] = normalized.split('.');
    const cents = Number.parseInt(whole, 10) * 100 + Number.parseInt(frac.padEnd(2, '0'), 10);
    if (!Number.isSafeInteger(cents)) {
      throw new ValidationError('totalBudget is out of range');
    }
    return new Money(cents);
  }

  public static fromCents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new ValidationError('Money cents must be a non-negative integer');
    }
    return new Money(cents);
  }

  public toDecimalString(): string {
    const whole = Math.trunc(this.cents / 100);
    const frac = (this.cents % 100).toString().padStart(2, '0');
    return `${whole}.${frac}`;
  }
}
