import { ScrollView, Text } from 'react-native';
import Card from '../../components/Card';
import { common } from '../../theme';

// PLACEHOLDER. The New ID / Replacement form will be built here next.
export default function StudentRequest() {
  return (
    <ScrollView contentContainerStyle={common.pad}>
      <Text style={common.h2}>Request an ID</Text>
      <Card><Text style={common.mu}>The New ID / Replacement form comes in the next step.</Text></Card>
    </ScrollView>
  );
}
