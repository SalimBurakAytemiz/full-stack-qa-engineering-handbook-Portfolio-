'use strict';

// Real locale-aware formatting using Node's own built-in Intl API (full
// ICU data, no added dependency). Every function here delegates entirely
// to Intl — there is no hand-rolled formatting logic to get subtly wrong,
// which is itself the point: locale-correct formatting (decimal/grouping
// separators, currency symbol placement, calendar month names) is exactly
// the kind of thing that should never be hand-rolled.
// TR: Node'un kendi yerleşik Intl API'sini (tam ICU verisi, ek bağımlılık
// yok) kullanan gerçek, yerel-duyarlı bicimlendirme. Hicbir el yazımı
// bicimlendirme mantığı yoktur — bu kasıtlıdır.

/**
 * @param {string} locale - a BCP 47 locale tag, e.g. "tr-TR"
 * @param {string} currency - an ISO 4217 currency code, e.g. "TRY"
 * @param {number} amount
 * @returns {string} the real, locale-correct formatted currency string
 */
function formatCurrency(locale, currency, amount) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/**
 * @param {string} locale
 * @param {Date} date
 * @returns {string} the real, locale-correct long-form date string
 */
function formatLongDate(locale, date) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
}

/**
 * @param {string} locale
 * @param {number} number
 * @returns {string} the real, locale-correct grouped number string
 */
function formatNumber(locale, number) {
  return new Intl.NumberFormat(locale).format(number);
}

module.exports = { formatCurrency, formatLongDate, formatNumber };
