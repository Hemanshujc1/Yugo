import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DocumentRow } from '@/components/ui/document-row';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { usePartnerAuth } from '@/state/partner-auth-context';
import type { DocumentKey } from '@/types/partner';

const DOCUMENT_META: Record<DocumentKey, { label: string; hint: string }> = {
  aadhaarFront: { label: 'Aadhaar Card (Front)', hint: 'Clear photo, all corners visible' },
  aadhaarBack: { label: 'Aadhaar Card (Back)', hint: 'Clear photo, all corners visible' },
  drivingLicence: { label: 'Driving Licence', hint: 'Must be valid and unexpired' },
  vehicleRc: { label: 'Vehicle RC', hint: 'Registration certificate for your vehicle' },
  selfie: { label: 'Selfie', hint: 'Take a clear photo of your face' },
};

export default function DocumentsScreen() {
  const {
    partnerType,
    fullName,
    setFullName,
    requiredDocuments,
    documents,
    uploadDocument,
    allDocumentsUploaded,
    submitForReview,
  } = usePartnerAuth();

  const needsFullName = partnerType === 'merchant';
  const [name, setName] = useState(fullName ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = allDocumentsUploaded && (!needsFullName || name.trim().length > 1);

  async function handleUpload(key: DocumentKey) {
    try {
      await uploadDocument(key);
    } catch {
      // The mock upload never rejects today, but a real backend/OCR pipeline
      // could — DocumentRow already falls back to its "pending" state if the
      // status in context never flips to "uploaded", so no extra handling
      // needed here beyond not crashing the screen.
    }
  }

  function handleSubmit() {
    if (needsFullName && name.trim().length <= 1) {
      setNameError('Enter your full name as it appears on your documents.');
      return;
    }
    if (!allDocumentsUploaded) return;

    if (needsFullName) {
      setFullName(name.trim());
    }
    setSubmitting(true);
    submitForReview();
    router.push('/verification-pending');
  }

  return (
    <Screen scroll>
      <View style={styles.dots}>
        <ProgressDots total={4} current={3} />
      </View>

      <View style={styles.header}>
        <ThemedText type="h1">
          {requiredDocuments.length > 0 ? 'Verify your documents' : 'Enter your details'}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          {requiredDocuments.length > 0
            ? 'We need these to keep YuGo safe for shops and customers.'
            : 'Please provide your full name as it appears on your official ID.'}
        </ThemedText>
      </View>

      <View style={styles.form}>
        {needsFullName ? (
          <TextField
            label="Full name"
            placeholder="As it appears on your Aadhaar"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError(null);
            }}
            error={nameError ?? undefined}
            autoCapitalize="words"
            returnKeyType="done"
          />
        ) : null}

        <View style={styles.documents}>
          {requiredDocuments.map((key) => (
            <DocumentRow
              key={key}
              label={DOCUMENT_META[key].label}
              hint={DOCUMENT_META[key].hint}
              status={documents[key] ?? 'pending'}
              onPress={() => handleUpload(key)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Submit for review"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: { marginBottom: Spacing.four },
  header: { gap: Spacing.one, marginBottom: Spacing.five },
  form: { flex: 1, gap: Spacing.four },
  documents: { gap: Spacing.three },
  footer: { paddingBottom: Spacing.two, paddingTop: Spacing.four },
});
