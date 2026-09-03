import { createContext, useCallback, useContext, useMemo, useReducer, useEffect, useRef, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as partnerApi from '@/services/mock-partner-api';
import {
  REQUIRED_DOCUMENTS,
  type DocumentKey,
  type DocumentStatus,
  type PartnerProfile,
  type PartnerType,
} from '@/types/partner';

interface OnboardingState extends PartnerProfile {
  /** True once the splash/hydration check has completed. */
  isReady: boolean;
  /** True once verification is approved — gates navigation into the main tabs. */
  isOnboarded: boolean;
  otpRequestedFor: string | null;
  /**
   * Whether the partner is currently accepting delivery requests. Lives here
   * (not local state in `(tabs)/index.tsx`) because the incoming-request
   * subscription in `(tabs)/_layout.tsx` needs to read it too — see
   * PROJECT_CONTEXT.md §6. No `POST /partner/status` backend call exists
   * yet, so this is local-only and resets to `false` on app restart, same
   * as the rest of this context.
   */
  isOnline: boolean;
}

type Action =
  | { type: 'SET_PHONE'; phone: string }
  | { type: 'OTP_REQUESTED'; phone: string }
  | { type: 'OTP_VERIFIED' }
  | { type: 'SET_PARTNER_TYPE'; partnerType: PartnerType }
  | { type: 'SET_WORKING_HOURS'; hours: { start: string; end: string } | null }
  | { type: 'SET_FULL_NAME'; fullName: string }
  | { type: 'SET_DOCUMENT_STATUS'; key: DocumentKey; status: DocumentStatus }
  | { type: 'SUBMIT_FOR_REVIEW' }
  | { type: 'SET_VERIFICATION_STATUS'; status: PartnerProfile['verificationStatus']; reason?: string }
  | { type: 'SET_ONLINE'; online: boolean }
  | { type: 'HYDRATE'; state: Partial<OnboardingState> }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  isReady: false,
  isOnboarded: false,
  phone: null,
  fullName: null,
  partnerType: null,
  workingHours: null,
  documents: {},
  verificationStatus: 'not_started',
  rejectionReason: null,
  otpRequestedFor: null,
  isOnline: false,
};

const STORAGE_KEY = '@yugo:partner-auth';

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.state, isReady: true };
    case 'SET_PHONE':
      return { ...state, phone: action.phone };
    case 'OTP_REQUESTED':
      return { ...state, otpRequestedFor: action.phone };
    case 'OTP_VERIFIED':
      return state;
    case 'SET_PARTNER_TYPE':
      return { ...state, partnerType: action.partnerType };
    case 'SET_WORKING_HOURS':
      return { ...state, workingHours: action.hours };
    case 'SET_FULL_NAME':
      return { ...state, fullName: action.fullName };
    case 'SET_DOCUMENT_STATUS':
      return { ...state, documents: { ...state.documents, [action.key]: action.status } };
    case 'SUBMIT_FOR_REVIEW':
      return { ...state, verificationStatus: 'under_review' };
    case 'SET_VERIFICATION_STATUS':
      return {
        ...state,
        verificationStatus: action.status,
        rejectionReason: action.reason ?? null,
        isOnboarded: action.status === 'approved',
      };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.online };
    case 'RESET':
      return { ...initialState, isReady: true };
    default:
      return state;
  }
}

interface PartnerAuthContextValue extends OnboardingState {
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  setPartnerType: (type: PartnerType) => void;
  setWorkingHours: (hours: { start: string; end: string } | null) => void;
  setFullName: (name: string) => void;
  requiredDocuments: DocumentKey[];
  uploadDocument: (key: DocumentKey) => Promise<void>;
  allDocumentsUploaded: boolean;
  submitForReview: () => void;
  pollVerification: (attempt: number) => Promise<VerificationStatusResult>;
  setOnline: (online: boolean) => void;
  reset: () => void;
}

type VerificationStatusResult = Awaited<ReturnType<typeof partnerApi.checkVerificationStatus>>;

const PartnerAuthContext = createContext<PartnerAuthContextValue | null>(null);

export function PartnerAuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    async function loadState() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Don't hydrate isOnline since it should reset per session
          const { isOnline, ...rest } = parsed;
          dispatch({ type: 'HYDRATE', state: rest });
        } else {
          dispatch({ type: 'HYDRATE', state: {} });
        }
      } catch (e) {
        dispatch({ type: 'HYDRATE', state: {} });
      }
    }
    loadState();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!state.isReady) return;
    const { isReady, isOnline, ...savableState } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savableState)).catch(() => {
      // Ignore write errors
    });
  }, [state]);

  const workingHoursRef = useRef(state.workingHours);
  const isOnlineRef = useRef(state.isOnline);
  workingHoursRef.current = state.workingHours;
  isOnlineRef.current = state.isOnline;

  useEffect(() => {
    if (!state.workingHours) return;

    const checkOnline = () => {
      const hours = workingHoursRef.current;
      if (!hours) return;

      const now = new Date();
      const currentStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = hours;

      let shouldBeOnline = false;
      if (start <= end) {
        shouldBeOnline = currentStr >= start && currentStr <= end;
      } else {
        shouldBeOnline = currentStr >= start || currentStr <= end;
      }

      if (isOnlineRef.current !== shouldBeOnline) {
        dispatch({ type: 'SET_ONLINE', online: shouldBeOnline });
      }
    };

    // Initial check on mount/workingHours change
    checkOnline();

    const interval = setInterval(checkOnline, 60000);
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkOnline();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [state.workingHours]);

  const requestOtp = useCallback(async (phone: string) => {
    dispatch({ type: 'SET_PHONE', phone });
    await partnerApi.requestOtp(phone);
    dispatch({ type: 'OTP_REQUESTED', phone });
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!state.phone) throw new Error('Enter your phone number first.');
      await partnerApi.verifyOtp(state.phone, code);
      dispatch({ type: 'OTP_VERIFIED' });
    },
    [state.phone]
  );

  const setPartnerType = useCallback((type: PartnerType) => {
    dispatch({ type: 'SET_PARTNER_TYPE', partnerType: type });
  }, []);

  const setWorkingHours = useCallback((hours: { start: string; end: string } | null) => {
    dispatch({ type: 'SET_WORKING_HOURS', hours });
  }, []);

  const setFullName = useCallback((name: string) => {
    dispatch({ type: 'SET_FULL_NAME', fullName: name });
  }, []);

  const requiredDocuments = useMemo(
    () => (state.partnerType ? REQUIRED_DOCUMENTS[state.partnerType] : []),
    [state.partnerType]
  );

  const uploadDocument = useCallback(async (key: DocumentKey) => {
    dispatch({ type: 'SET_DOCUMENT_STATUS', key, status: 'uploading' });
    await partnerApi.uploadDocument();
    dispatch({ type: 'SET_DOCUMENT_STATUS', key, status: 'uploaded' });
  }, []);

  const allDocumentsUploaded = useMemo(
    () => requiredDocuments.length === 0 || requiredDocuments.every((key) => state.documents[key] === 'uploaded'),
    [requiredDocuments, state.documents]
  );

  const submitForReview = useCallback(() => {
    dispatch({ type: 'SUBMIT_FOR_REVIEW' });
  }, []);

  const pollVerification = useCallback(async (attempt: number) => {
    const result = await partnerApi.checkVerificationStatus(attempt);
    dispatch({ type: 'SET_VERIFICATION_STATUS', status: result.status, reason: result.reason });
    return result;
  }, []);

  const reset = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    dispatch({ type: 'RESET' });
  }, []);

  const setOnline = useCallback((online: boolean) => {
    dispatch({ type: 'SET_ONLINE', online });
  }, []);

  const value: PartnerAuthContextValue = {
    ...state,
    requestOtp,
    verifyOtp,
    setPartnerType,
    setWorkingHours,
    setFullName,
    requiredDocuments,
    uploadDocument,
    allDocumentsUploaded,
    submitForReview,
    pollVerification,
    setOnline,
    reset,
  };

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  return ctx;
}
