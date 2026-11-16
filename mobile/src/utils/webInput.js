// Shared by DateField.web.js and TimeField.web.js (browser only).

// The same font the other text fields use (React Native for web's default stack).
export const WEB_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Date and time inputs need a little CSS that inline styles cannot express.
// Without it, iPhone Safari centres the text and lets the field run past the screen edge.
let added = false;
export function ensureInputStyle() {
  if (added || typeof document === 'undefined') return;
  added = true;
  const el = document.createElement('style');
  el.textContent = `
    input.cdm-input { -webkit-appearance: none; appearance: none; display: block; min-width: 0; max-width: 100%; text-align: left; }
    input.cdm-input::-webkit-date-and-time-value { text-align: left; }
    input.cdm-input::-webkit-datetime-edit { padding: 0; }
    /* iPhone only: an empty field would be blank, so show a hint */
    @supports (-webkit-touch-callout: none) {
      input.cdm-input:not(.cdm-has)::before { content: attr(data-ph); color: #9AA89F; }
    }
  `;
  document.head.appendChild(el);
}
