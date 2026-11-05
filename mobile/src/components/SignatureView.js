import Svg, { Path } from 'react-native-svg';

// Draws a saved signature: sig = { path, box: [x, y, width, height] }.
// It is vector data, so it stays sharp at any size. The box crops the drawing to the ink,
// so every signature fills the same space on the ID.
export default function SignatureView({ sig, width, height, color = '#111' }) {
  if (!sig?.path || !sig?.box) return null;
  const [x, y, w, h] = sig.box;
  const scale = Math.min(width / w, height / h);
  return (
    <Svg width={width} height={height} viewBox={`${x} ${y} ${w} ${h}`}>
      <Path d={sig.path} stroke={color} strokeWidth={2.2 / scale} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
