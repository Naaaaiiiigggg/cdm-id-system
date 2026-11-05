import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Field from '../../components/Field';
import DateField from '../../components/DateField';
import Btn from '../../components/Btn';
import Card from '../../components/Card';
import KV from '../../components/KV';
import { createLogin, verifyStudent } from '../../services/auth';
import { friendly } from '../../services/errors';
import { programName, instituteName } from '../../data/programs';
import { EMAIL_RE, PASSWORD_RULES, STUDENT_NO_RE, formatStudentNo, isStrongPassword, longDate, maskPhone } from '../../utils/format';
import { C, common } from '../../theme';

// Steps: 1 student number + birthdate, 2 "Is this you?", 3 personal email + password
export default function Register({ onDone, onBack }) {
  const [step, setStep] = useState(1);
  const [num, setNum] = useState('');
  const [bd, setBd] = useState('');
  const [rec, setRec] = useState(null);
  const [em, setEm] = useState('');
  const [em2, setEm2] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    if (!STUDENT_NO_RE.test(num)) return setErr('Student number must look like 24-66298.');
    if (!bd) return setErr('Select your birthdate.');
    setBusy(true);
    setErr('');
    try {
      setRec(await verifyStudent({ studentNo: num, birthdate: bd }));
      setStep(2);
    } catch (e) {
      setErr(friendly(e));
    }
    setBusy(false);
  };

  const create = async () => {
    const email = em.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return setErr('Enter a valid personal email address.');
    if (email !== em2.trim().toLowerCase()) return setErr('The two emails do not match.');
    if (!isStrongPassword(p1)) return setErr('Your password does not meet all the requirements below.');
    if (p1 !== p2) return setErr('Passwords do not match.');
    setBusy(true);
    setErr('');
    try {
      await createLogin({ studentNo: num, email, password: p1 });
      onDone();
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  const Back = ({ onPress, title }) => (
    <View style={common.hd}>
      <TouchableOpacity style={common.bk} onPress={onPress}><Text style={common.bkTx}>‹</Text></TouchableOpacity>
      <Text style={common.h2}>{title}</Text>
    </View>
  );

  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={common.pad} keyboardShouldPersistTaps="handled">
        <Back onPress={onBack} title="Create account" />
        <Text style={common.mu}>Enter your student number and birthdate. We check them against the Registrar list.</Text>
        <Field label="Student number" placeholder="e.g. 24-66298" value={num} onChangeText={(t) => setNum(formatStudentNo(t))} />
        <DateField label="Birthdate" placeholder="Select your birthdate" value={bd} onChange={setBd} />
        <Text style={common.err}>{err}</Text>
        <Btn title={busy ? 'Checking…' : 'Verify with Registrar'} onPress={busy ? () => {} : verify} />
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <ScrollView contentContainerStyle={common.pad}>
        <Back onPress={() => setStep(1)} title="Is this you?" />
        <Card>
          <KV k="Name" v={rec.name} />
          <KV k="Student no." v={num} />
          <KV k="Program" v={programName(rec.program)} />
          <KV k="Institute" v={instituteName(rec.program)} />
          <KV k="Year level" v={rec.yearLevel} />
          <KV k="Birthdate" v={longDate(rec.birthdate)} />
          <KV k="Contact" v={maskPhone(rec.contact)} />
          <KV k="Address" v={rec.address || '—'} />
          <KV k="Guardian" v={rec.guardian || '—'} />
          <KV k="Guardian no." v={maskPhone(rec.guardianContact)} />
        </Card>
        <Text style={[common.mu, { marginTop: 10 }]}>These details come from the Registrar and cannot be edited here.</Text>
        <Btn title="Yes, this is me" onPress={() => { setErr(''); setStep(3); }} />
        <Btn title="No, go back" kind="ghost" onPress={() => setStep(1)} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={common.pad} keyboardShouldPersistTaps="handled">
      <Back onPress={() => { setErr(''); setStep(2); }} title="Your login" />
      <Text style={common.mu}>You will sign in with this email, and we will send password reset links to it.</Text>
      <Field label="Personal email" placeholder="e.g. yourname@gmail.com" keyboardType="email-address" value={em} onChangeText={setEm} />
      <Field label="Confirm email" placeholder="Type it again" keyboardType="email-address" value={em2} onChangeText={setEm2} />
      <Field label="Create password" secureTextEntry value={p1} onChangeText={setP1} />
      <View style={{ marginTop: 10, gap: 4 }}>
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(p1);
          return (
            <View key={r.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name={ok ? 'check-circle' : 'circle'} size={14} color={ok ? '#1F7A4D' : '#9AA89F'} />
              <Text style={{ fontSize: 12, color: ok ? '#1F7A4D' : C.mu }}>{r.label}</Text>
            </View>
          );
        })}
      </View>
      <Field label="Confirm password" secureTextEntry value={p2} onChangeText={setP2} />
      {p2.length > 0 && p1 !== p2 ? <Text style={{ fontSize: 12, color: C.bad, marginTop: 6 }}>Passwords do not match yet.</Text> : null}
      <Text style={common.err}>{err}</Text>
      <Btn title={busy ? 'Creating account…' : 'Create account'} onPress={busy ? () => {} : create} />
    </ScrollView>
  );
}
