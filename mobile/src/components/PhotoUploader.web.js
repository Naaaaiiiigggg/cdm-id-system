import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Btn from './Btn';
import { removeStudentPhoto, saveStudentPhoto } from '../services/students';
import { friendly } from '../services/errors';
import { WEB_FONT } from '../utils/webInput';
import { C, common } from '../theme';

// Browser only. Choose a photo, adjust the crop, save it on the student's Registrar record.
// Same result as the backend: a 320 x 400 (4:5 portrait) JPEG stored as a data URI in `photo`.

const OUT_W = 320;
const OUT_H = 400;
const PREV_W = 200;
const PREV_H = 250;
const MAX_FILE = 5 * 1024 * 1024; // 5 MB, like the backend
const MAX_CHARS = 700000;         // a Firestore document must stay under 1 MB
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const slider = { width: '100%', accentColor: C.g9 };
const lbl = { fontFamily: WEB_FONT, fontSize: 12, fontWeight: 700, color: C.g7, marginTop: 12, marginBottom: 2, display: 'block' };

// With onPick (used by Add student) nothing is saved here: the cropped photo is handed back to the form, which saves it
// together with the new student. Without onPick it saves on the student's Registrar record as before.
export default function PhotoUploader({ studentNo, currentPhoto, onSaved, onCancel, onPick }) {
  const canvasRef = useRef(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(100); // percent
  const [px, setPx] = useState(50);      // left-right position, percent
  const [py, setPy] = useState(35);      // up-down position (the backend also centres a little above the middle)
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [askRemove, setAskRemove] = useState(false);

  const draw = (canvas, w, h) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    if (!img) return;
    const scale = Math.max(w / img.width, h / img.height) * (zoom / 100);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, -(dw - w) * (px / 100), -(dh - h) * (py / 100), dw, dh);
  };

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, PREV_W, PREV_H);
  }, [img, zoom, px, py]);

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    setErr('');
    if (!file) return;
    if (!TYPES.includes(file.type)) return setErr('Choose a JPG, PNG or WEBP image.');
    if (file.size > MAX_FILE) return setErr('That image is larger than 5 MB.');
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); setImg(im); setZoom(100); setPx(50); setPy(35); };
    im.onerror = () => { URL.revokeObjectURL(url); setErr('That file is not a valid image.'); };
    im.src = url;
  };

  const save = async () => {
    if (!img) return setErr('Choose a photo first.');
    setBusy(true);
    setErr('');
    try {
      const c = document.createElement('canvas');
      c.width = OUT_W;
      c.height = OUT_H;
      draw(c, OUT_W, OUT_H);
      let uri = '';
      for (const q of [0.82, 0.7, 0.6, 0.5]) {
        uri = c.toDataURL('image/jpeg', q);
        if (uri.length <= MAX_CHARS) break;
      }
      if (uri.length > MAX_CHARS) throw new Error('The photo is still too large after resizing. Try a smaller image.');
      if (onPick) { onPick(uri); return; }
      await saveStudentPhoto(studentNo, uri);
      onSaved();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const remove = async () => {
    if (onPick) { onPick(''); return; }
    setBusy(true);
    setErr('');
    try {
      await removeStudentPhoto(studentNo);
      onSaved();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const frame = { width: PREV_W, height: PREV_H, borderRadius: 10, border: `1px solid ${C.ln}`, background: '#E8ECF0', display: 'block' };

  return (
    <View>
      <Text style={styles.sec}>{currentPhoto ? 'Change photo' : onPick ? 'Add photo' : 'Upload photo'}</Text>
      <Text style={common.mu}>Use a clear, front-facing photo with a plain background. It is cropped to the ID card's portrait shape.</Text>

      <View style={{ alignItems: 'center', marginTop: 14 }}>
        {img ? (
          <canvas ref={canvasRef} width={PREV_W} height={PREV_H} style={frame} />
        ) : currentPhoto ? (
          <img src={currentPhoto} alt="Current photo" style={{ ...frame, objectFit: 'cover' }} />
        ) : (
          <div style={{ ...frame, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9690', fontFamily: WEB_FONT, fontSize: 13 }}>No photo yet</div>
        )}

        <label style={{ marginTop: 14, cursor: 'pointer' }}>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} style={{ display: 'none' }} />
          <span style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 12, border: `1px solid ${C.ln}`, background: C.sf, color: C.g7, fontFamily: WEB_FONT, fontSize: 13, fontWeight: 700 }}>
            {img ? 'Choose a different file' : 'Choose a photo'}
          </span>
        </label>
      </View>

      {img ? (
        <View>
          <label style={lbl}>Zoom</label>
          <input type="range" min="100" max="300" step="5" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={slider} />
          <label style={lbl}>Left / right</label>
          <input type="range" min="0" max="100" value={px} onChange={(e) => setPx(Number(e.target.value))} style={slider} />
          <label style={lbl}>Up / down</label>
          <input type="range" min="0" max="100" value={py} onChange={(e) => setPy(Number(e.target.value))} style={slider} />
        </View>
      ) : null}

      {err ? <Text style={[common.err, { marginTop: 12 }]}>{err}</Text> : null}

      {img ? <Btn title={onPick ? 'Use this photo' : busy ? 'Saving…' : 'Save photo'} onPress={save} disabled={busy} style={busy && { opacity: 0.45 }} /> : null}

      {currentPhoto && !img ? (
        askRemove ? (
          <View style={{ marginTop: 14 }}>
            <Text style={common.mu}>Remove the current photo? The ID cannot be printed without one.</Text>
            <Btn title={busy ? 'Removing…' : 'Yes, remove it'} onPress={remove} disabled={busy} style={[{ backgroundColor: C.bad }, busy && { opacity: 0.45 }]} />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setAskRemove(true)}><Text style={styles.danger}>Remove current photo…</Text></TouchableOpacity>
        )
      ) : null}

      <TouchableOpacity onPress={busy ? undefined : onCancel}><Text style={styles.cancel}>Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = {
  sec: { fontSize: 14, fontWeight: '800', color: C.ink, marginTop: 18, marginBottom: 8 },
  danger: { color: C.bad, fontWeight: '700', textAlign: 'center', marginTop: 16, fontSize: 13 },
  cancel: { color: C.mu, fontWeight: '700', textAlign: 'center', marginTop: 14, marginBottom: 4 },
};
