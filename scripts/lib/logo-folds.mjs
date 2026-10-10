/**
 * The darker "fold" step of the flat mark (brief 4.1), drawn by hand.
 *
 * The render's shading is a smooth gradient, so thresholding it gives
 * lumpy shapes. Instead each fold line is placed from the original at 3x
 * zoom and drawn as a smooth curve. The rule: faces turned away from the
 * light in the render take the darker step.
 *   teal:   the broad front face of the top curl (its rim and inner band
 *           stay light) and the top band of the tail, under the bowl
 *   silver: the outer face of the bowl's D (its inner band stays light)
 * Each region only needs its fold line to be exact: the rest of its outline
 * runs outside the face and is clipped away by the face's own path.
 * Coordinates are pixels of brand/synovika-logo.png.
 */

/** A smooth curve through points (Catmull-Rom, as cubic Bezier segments). */
function smooth(points) {
  let d = '';
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.map(r)} ${c2.map(r)} ${p2.map(r)}`;
  }
  return d.replace(/,/g, ' ');
}
const r = (n) => +n.toFixed(2);
const line = (points) => points.map((p) => `L${p.map(r).join(' ')}`).join('');

/** Rim of the top curl: its bright outer band, from the silver junction down to the ring. */
const RIM = [[468, 250], [406, 268], [351, 297], [304, 339], [274, 377], [264, 421], [271, 465], [298, 497], [318, 512]];
/** Inner band of the top curl, along the S's counter, from the bottom back up to the silver face. */
const INNER = [[453, 450], [421, 459], [395, 461], [368, 456], [348, 444], [343, 421], [356, 391], [383, 369]];
/** Top edge of the tail's light front face. */
const TAIL = [[288, 618], [532, 519]];
/** The bowl's crease between its light inner band and its outer face. */
const BOWL = [[497, 449], [532, 462], [550, 490], [555, 530], [544, 580], [518, 620], [480, 646], [420, 668], [350, 693], [286, 716]];

export const FOLDS = {
  // Front face of the top curl (clipped to the top face only).
  tealTop: `M${RIM[0].join(' ')}${smooth(RIM)}${line([[330, 540], [490, 540], [490, 452]])}L${INNER[0].join(' ')}${smooth(INNER)}${line([[430, 345], [525, 245], [500, 232]])}Z`,
  // Top band of the tail (clipped to the tail only).
  tealTail: `M${TAIL[0].join(' ')}L${TAIL[1].join(' ')}${line([[570, 500], [570, 420], [260, 420]])}Z`,
  // Outer face of the bowl's D, including its top band and end cap.
  silver: `M${BOWL[0].join(' ')}${smooth(BOWL)}${line([[262, 726], [262, 770], [720, 770], [720, 360], [400, 360], [418, 447]])}Z`,
};

/** Fold lines only, for checking against the original. */
export const LINES = { RIM, INNER, TAIL, BOWL, smooth };
