import { useMemo } from 'react';

/**
 * DateTimePicker — custom 12-hour date/time picker
 * Uses a date input + hour/minute/AM-PM selects
 */
export default function DateTimePicker({ id, value, onChange, label, icon }) {
  // Parse the current value (ISO-like string from datetime-local)
  const parsed = useMemo(() => {
    if (!value) return { date: '', hour: '11', minute: '00', period: 'PM' };

    const d = new Date(value);
    if (isNaN(d)) return { date: '', hour: '11', minute: '00', period: 'PM' };

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    let hours = d.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return {
      date,
      hour: String(hours),
      minute: String(d.getMinutes()).padStart(2, '0'),
      period,
    };
  }, [value]);

  // Build a datetime-local compatible string from parts
  const emitChange = (date, hour, minute, period) => {
    if (!date) return;

    let h = parseInt(hour);
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;

    const val = `${date}T${String(h).padStart(2, '0')}:${minute}`;
    onChange(val);
  };

  return (
    <div>
      <label
        htmlFor={`${id}-date`}
        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] mb-2"
      >
        {icon}
        {label}
      </label>

      <div className="flex gap-2">
        {/* Date picker */}
        <input
          id={`${id}-date`}
          type="date"
          value={parsed.date}
          onChange={(e) => emitChange(e.target.value, parsed.hour, parsed.minute, parsed.period)}
          required
          className="input-field flex-1 min-w-0"
        />

        {/* Hour select */}
        <select
          id={`${id}-hour`}
          value={parsed.hour}
          onChange={(e) => emitChange(parsed.date, e.target.value, parsed.minute, parsed.period)}
          className="input-field !w-[4.5rem] !px-2 text-center appearance-none"
          aria-label="Hour"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={String(h)}>
              {h}
            </option>
          ))}
        </select>

        <span className="flex items-center text-[var(--color-text-muted)] font-bold text-lg">:</span>

        {/* Minute select */}
        <select
          id={`${id}-minute`}
          value={parsed.minute}
          onChange={(e) => emitChange(parsed.date, parsed.hour, e.target.value, parsed.period)}
          className="input-field !w-[4.5rem] !px-2 text-center appearance-none"
          aria-label="Minute"
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={String(i).padStart(2, '0')}>
              {String(i).padStart(2, '0')}
            </option>
          ))}
        </select>

        {/* AM/PM toggle */}
        <select
          id={`${id}-period`}
          value={parsed.period}
          onChange={(e) => emitChange(parsed.date, parsed.hour, parsed.minute, e.target.value)}
          className="input-field !w-[4.5rem] !px-2 text-center appearance-none font-semibold"
          aria-label="AM or PM"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
