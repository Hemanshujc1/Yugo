import { useState } from 'react';
import { StyleSheet, View, Switch } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePartnerAuth } from '@/state/partner-auth-context';
import { useAppThemeContext, type ThemePreference } from '@/state/theme-context';

export default function AccountScreen() {
  const theme = useTheme();
  const { fullName, phone, partnerType, documents, requiredDocuments, workingHours, setWorkingHours, reset } =
    usePartnerAuth();
  const { themePreference, setThemePreference } = useAppThemeContext();

  const [start, setStart] = useState(workingHours?.start ?? '');
  const [end, setEnd] = useState(workingHours?.end ?? '');

  function handleSaveHours() {
    if (start && end) {
      setWorkingHours({ start, end });
    } else {
      setWorkingHours(null);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="h1">Account</ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <ThemedText type="bodyBold">Profile</ThemedText>
        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">Name</ThemedText>
          <ThemedText type="body">{fullName || 'N/A'}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">Phone</ThemedText>
          <ThemedText type="body">{phone}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText type="small" themeColor="textSecondary">Type</ThemedText>
          <ThemedText type="body" style={{ textTransform: 'capitalize' }}>
            {partnerType ? `${partnerType} Partner` : 'N/A'}
          </ThemedText>
        </View>
      </View>

      {partnerType === 'general' ? (
        <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText type="bodyBold">Documents</ThemedText>
          {requiredDocuments.map((key) => (
            <View key={key} style={styles.infoRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {key}
              </ThemedText>
              <ThemedText type="smallBold" themeColor={documents[key] === 'uploaded' ? 'success' : 'warning'}>
                {documents[key] === 'uploaded' ? 'Verified' : 'Pending'}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <ThemedText type="bodyBold">Appearance</ThemedText>
        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as ThemePreference[]).map((pref) => (
            <Button
              key={pref}
              label={pref.charAt(0).toUpperCase() + pref.slice(1)}
              variant={themePreference === pref ? 'primary' : 'outline'}
              onPress={() => setThemePreference(pref)}
              style={styles.themeButton}
            />
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <ThemedText type="bodyBold">Working Hours (Auto-Online)</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Set your daily schedule. The app will automatically put you online during these hours when it is open.
        </ThemedText>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <TextField
              label="Start (HH:MM)"
              placeholder="09:00"
              value={start}
              onChangeText={setStart}
              maxLength={5}
            />
          </View>
          <View style={styles.timeInput}>
            <TextField
              label="End (HH:MM)"
              placeholder="17:00"
              value={end}
              onChangeText={setEnd}
              maxLength={5}
            />
          </View>
        </View>
        <Button label="Save Hours" onPress={handleSaveHours} variant="secondary" />
      </View>

      <View style={styles.footer}>
        <Button variant="outline" label="Log out" onPress={reset} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  section: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeButton: {
    flex: 1,
    paddingVertical: Spacing.one,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timeInput: {
    flex: 1,
  },
  footer: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
});
