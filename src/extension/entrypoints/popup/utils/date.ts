export const formatRelativeTime = (
  input: string,
  options: {
    locale?: string;
    numeric?: 'always' | 'auto';
    timeZone?: string;
  } = {},
): string => {
  const { locale = 'en', numeric = 'auto', timeZone = 'UTC' } = options;
  if (!Temporal) return new Date(input).toLocaleString().slice(0, -3);
  const past = Temporal.Instant.from(input).toZonedDateTimeISO(timeZone);
  const now = Temporal.Now.instant().toZonedDateTimeISO(timeZone);
  const duration = past.until(now, { largestUnit: 'year' });
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric });
  if (duration.years !== 0) {
    return rtf.format(-duration.years, 'year');
  }
  if (duration.months !== 0) {
    return rtf.format(-duration.months, 'month');
  }
  if (duration.weeks !== 0) {
    return rtf.format(-duration.weeks, 'week');
  }
  if (duration.days !== 0) {
    return rtf.format(-duration.days, 'day');
  }
  if (duration.hours !== 0) {
    return rtf.format(-duration.hours, 'hour');
  }
  if (duration.minutes !== 0) {
    return rtf.format(-duration.minutes, 'minute');
  }
  if (duration.seconds !== 0) {
    return rtf.format(-duration.seconds, 'second');
  }
  return rtf.format(0, 'second');
};
