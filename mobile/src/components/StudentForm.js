import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Field from "./Field";
import DateField from "./DateField";
import Btn from "./Btn";
import { PROGRAMS } from "../data/programs";
import {
  EMPTY_STUDENT,
  PROGRAM_CODES,
  YEAR_LEVELS,
  cleanStudent,
  formatPhone,
  formatStudentNo,
  validateStudent,
} from "../utils/studentForm";
import { C, common } from "../theme";

// The fields of a Registrar student record. Used to add a student and to edit one.
// initial: an existing student (edit) or nothing (add). onSubmit receives the cleaned data
// (and the student number when adding).
export default function StudentForm({
  initial,
  isNew,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
  photoSlot,
}) {
  const [f, setF] = useState({ ...EMPTY_STUDENT, ...(initial || {}) });
  const [localErr, setLocalErr] = useState("");
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const problem = validateStudent(f, isNew);
    setLocalErr(problem);
    if (problem) return;
    onSubmit(cleanStudent(f), f.studentNo);
  };

  const today = new Date();
  const earliest = new Date(1950, 0, 1);
  const shown = localErr || error;

  return (
    <View>
      {photoSlot || null}
      {isNew ? (
        <Field
          label="Student number"
          placeholder="e.g. 24-66298"
          value={f.studentNo}
          onChangeText={(t) => set("studentNo")(formatStudentNo(t))}
          keyboardType="number-pad"
          maxLength={8}
        />
      ) : null}
      <Field
        label="Full name"
        placeholder="First name, Last name"
        value={f.name}
        onChangeText={set("name")}
        autoCapitalize="words"
        maxLength={100}
      />

      <Text style={styles.lbl}>Program</Text>
      <View style={styles.chips}>
        {PROGRAM_CODES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, f.program === p && styles.chipOn]}
            onPress={() => set("program")(p)}
          >
            <Text style={[styles.chipTx, f.program === p && { color: "#fff" }]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {f.program ? (
        <Text style={common.mu}>{PROGRAMS[f.program].name}</Text>
      ) : null}

      <Text style={styles.lbl}>Year level</Text>
      <View style={styles.chips}>
        {YEAR_LEVELS.map((y) => (
          <TouchableOpacity
            key={y}
            style={[styles.chip, f.yearLevel === y && styles.chipOn]}
            onPress={() => set("yearLevel")(y)}
          >
            <Text
              style={[styles.chipTx, f.yearLevel === y && { color: "#fff" }]}
            >
              {y}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DateField
        label="Birthdate"
        placeholder="Choose a date"
        value={f.birthdate}
        onChange={set("birthdate")}
        minimumDate={earliest}
        maximumDate={today}
        initialDate={new Date(2004, 0, 1)}
      />
      <Field
        label="Contact number"
        placeholder="09XXXXXXXXX"
        value={f.contact}
        onChangeText={(t) => set("contact")(formatPhone(t))}
        keyboardType="phone-pad"
        maxLength={11}
      />
      <Field
        label="Address"
        placeholder="Street, barangay, city"
        value={f.address}
        onChangeText={set("address")}
        autoCapitalize="sentences"
        maxLength={150}
      />
      <Field
        label="Guardian's name"
        value={f.guardian}
        onChangeText={set("guardian")}
        autoCapitalize="words"
        maxLength={80}
      />
      <Field
        label="Guardian's contact number"
        placeholder="09XXXXXXXXX"
        value={f.guardianContact}
        onChangeText={(t) => set("guardianContact")(formatPhone(t))}
        keyboardType="phone-pad"
        maxLength={11}
      />

      {shown ? (
        <Text style={[common.err, { marginTop: 12 }]}>{shown}</Text>
      ) : null}
      <Btn
        title={busy ? "Saving…" : submitLabel}
        onPress={submit}
        disabled={busy}
        style={busy && { opacity: 0.45 }}
      />
      <TouchableOpacity onPress={busy ? undefined : onCancel}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  lbl: {
    fontSize: 12,
    fontWeight: "700",
    color: C.g7,
    marginTop: 13,
    marginBottom: 7,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  chip: {
    borderWidth: 1,
    borderColor: C.ln,
    backgroundColor: C.sf,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  chipOn: { backgroundColor: C.g9, borderColor: C.g9 },
  chipTx: { fontSize: 12, fontWeight: "700", color: C.g7 },
  cancel: {
    color: C.mu,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 4,
  },
});
