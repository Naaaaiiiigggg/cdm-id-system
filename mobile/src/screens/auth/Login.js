import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../../components/Logo';
import Field from '../../components/Field';
import Btn from '../../components/Btn';
import { signIn } from '../../services/auth';
import { friendly } from '../../services/errors';
import { common } from '../../theme';

export default function Login({ onRegister, onForgot }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !pw) return setErr('Enter your email and password.');
    setBusy(true);
    setErr('');
    try {
      await signIn(email, pw); // App.js notices the sign-in and opens the right screens
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={common.pad} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center' }}><Logo size={76} /></View>
      <Text style={common.h2c}>Sign in</Text>
      <Text style={[common.mu, { textAlign: 'center' }]}>Students and Registrar staff use the same app.</Text>
      <Field label="Email" placeholder="you@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field label="Password" placeholder="Enter your password" secureTextEntry value={pw} onChangeText={setPw} />
      <Text style={common.err}>{err}</Text>
      <Btn title={busy ? 'Signing in…' : 'SIGN IN'} onPress={busy ? () => {} : submit} />
      <TouchableOpacity onPress={onForgot}><Text style={common.link}>Forgot password?</Text></TouchableOpacity>
      <TouchableOpacity onPress={onRegister}><Text style={common.link}>Create an account</Text></TouchableOpacity>
    
    </ScrollView>
  );
}
