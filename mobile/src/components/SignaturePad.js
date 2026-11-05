import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../theme';

export const PAD_H = 190;
const r = (n) => Math.round(n * 10) / 10;

// strokes = [[[x, y], ...], ...]  ->  SVG path text (smoothed with quadratic curves)
function toPath(strokes) {
  return strokes.map((pts) => {
    if (pts.length === 1) return `M${r(pts[0][0])} ${r(pts[0][1])}l0.1 0.1`; // a dot
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i];
      const [nx, ny] = pts[i + 1];
      d += `Q${r(x)} ${r(y)} ${r((x + nx) / 2)} ${r((y + ny) / 2)}`;
    }
    const last = pts[pts.length - 1];
    return d + `L${r(last[0])} ${r(last[1])}`;
  }).join('');
}

// Rectangle around all the ink, with a little margin.
function boxOf(strokes) {
  const xs = strokes.flat().map((p) => p[0]);
  const ys = strokes.flat().map((p) => p[1]);
  const pad = 6;
  const x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
  return [r(x), r(y), r(Math.max(Math.max(...xs) - Math.min(...xs) + pad * 2, 24)), r(Math.max(Math.max(...ys) - Math.min(...ys) + pad * 2, 24))];
}

// A box the student signs in with a finger. Calls onChange({ path, box }) or onChange(null) when empty.
// onDrawing(true/false) lets the screen stop scrolling while the finger is down.
export default function SignaturePad({ onChange, onDrawing }) {
  const [strokes, setStrokes] = useState([]);
  const [w, setW] = useState(300);
  const sRef = useRef([]);
  const widthRef = useRef(300);
  const start = useRef([0, 0]);
  const cb = useRef({});
  cb.current = { onChange, onDrawing };

  const commit = (next) => {
    sRef.current = next;
    setStrokes(next);
  };
  const notify = () => {
    const s = sRef.current;
    cb.current.onChange?.(s.length ? { path: toPath(s), box: boxOf(s) } : null);
  };
  const finish = () => { cb.current.onDrawing?.(false); notify(); };

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      cb.current.onDrawing?.(true);
      const { locationX: x, locationY: y } = e.nativeEvent;
      start.current = [x, y];
      commit([...sRef.current, [[x, y]]]);
    },
    onPanResponderMove: (e, g) => {
      const x = Math.max(0, Math.min(widthRef.current, start.current[0] + g.dx));
      const y = Math.max(0, Math.min(PAD_H, start.current[1] + g.dy));
      const cur = sRef.current[sRef.current.length - 1];
      const [px, py] = cur[cur.length - 1];
      if (Math.hypot(x - px, y - py) < 2) return; // skip tiny moves to keep the signature small
      commit([...sRef.current.slice(0, -1), [...cur, [x, y]]]);
    },
    onPanResponderRelease: finish,
    onPanResponderTerminate: finish,
  })).current;

  const clear = () => { commit([]); notify(); };
  const undo = () => { commit(sRef.current.slice(0, -1)); notify(); };

  return (
    <View>
      <View
        style={styles.pad}
        onLayout={(e) => { widthRef.current = e.nativeEvent.layout.width; setW(e.nativeEvent.layout.width); }}
        {...pan.panHandlers}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={styles.line} />
          {strokes.length === 0 ? <Text style={styles.hint}>Sign here</Text> : null}
          <Svg width={w} height={PAD_H}>
            <Path d={toPath(strokes)} stroke="#111" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={undo}><Text style={styles.act}>Undo</Text></TouchableOpacity>
        <TouchableOpacity onPress={clear}><Text style={styles.act}>Clear</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { height: PAD_H, backgroundColor: '#fff', borderWidth: 1, borderColor: C.ln, borderRadius: 14, overflow: 'hidden' },
  line: { position: 'absolute', left: 16, right: 16, bottom: 44, height: 1, backgroundColor: '#C9D3CD' },
  hint: { position: 'absolute', alignSelf: 'center', top: PAD_H / 2 - 10, color: '#B5C0BA', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 8 },
  act: { color: C.g7, fontWeight: '700', fontSize: 13 },
});
