// Standard PVC / CR80 ID card: 53.98 mm x 85.60 mm, shown upright (portrait).
// Both sides use these exact numbers, so the front and back always have the same proportions.
export const CARD_W = 280;
export const CARD_H = Math.round((CARD_W * 85.6) / 53.98); // 444
