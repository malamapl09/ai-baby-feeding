import { differenceInMonths, differenceInWeeks, format } from 'date-fns';

export function calculateAgeInMonths(birthdate: string | Date): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  return differenceInMonths(new Date(), birth);
}

export function calculateAgeInWeeks(birthdate: string | Date): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  return differenceInWeeks(new Date(), birth);
}

export function formatAge(birthdate: string | Date): string {
  const months = calculateAgeInMonths(birthdate);

  if (months < 1) {
    const weeks = calculateAgeInWeeks(birthdate);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  if (months < 24) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }

  return `${years} year${years === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}

export function getAgeRange(months: number): string {
  if (months < 6) return 'under-6';
  if (months < 8) return '6-7';
  if (months < 10) return '8-9';
  if (months < 12) return '10-12';
  if (months < 18) return '12-18';
  return '18-24';
}

export function formatBirthdate(birthdate: string | Date): string {
  const date = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  return format(date, 'MMMM d, yyyy');
}
