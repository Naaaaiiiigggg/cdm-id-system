import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Field from '../../components/Field';
import Btn from '../../components/Btn';
import { sendReset } from '../../services/auth';
import { friendly } from '../../services/errors';
import { EMAIL_RE } from '../../utils/format';
import { C, common } from '../../theme';

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!EMAIL_RE.test(email.trim())) return setErr('Enter a valid email address.');
    setBusy(true);
    setErr('');
    try {
      await sendReset(email);
      setSent(true);
    } catch (e) {
      setErr(friendly(e));
    }
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={common.pad} keyboardShouldPersistTaps="handled">
      <View style={common.hd}>
        <TouchableOpacity style={common.bk} onPress={onBack}><Text style={common.bkTx}>‹</Text></TouchableOpacity>
        <Text style={common.h2}>Forgot password</Text>
      </View>
      <Text style={common.mu}>Enter the personal email you registered with. We will send you a link to set a new password.</Text>
      <Field label="Personal email" placeholder="you@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Text style={common.err}>{err}</Text>
      {sent ? (
        <View style={common.note}>
          <Text style={[common.noteTx, { color: C.g7 }]}>If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.</Text>
        </View>
      ) : null}
      <Btn title={busy ? 'Sending…' : 'Send reset link'} onPress={busy ? () => {} : send} />
    </ScrollView>
  );
}
