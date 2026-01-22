import { create } from 'zustand';
import type {
  ApplicationType,
  FlightPurpose,
  Operator,
  Aircraft,
  DocumentType,
  FeeCalculationResult,
} from '@fop/types';

export interface WizardDocument {
  type: DocumentType;
  file: File;
  expiryDate?: string;
}

export interface WizardState {
  // Step tracking
  currentStep: number;
  totalSteps: number;

  // Step 1: Application Type
  applicationType: ApplicationType | null;

  // Step 2: Operator Selection/Creation
  operatorId: string | null;
  operator: Partial<Operator> | null;
  isNewOperator: boolean;

  // Step 3: Aircraft Selection/Creation
  aircraftId: string | null;
  aircraft: Partial<Aircraft> | null;
  isNewAircraft: boolean;

  // Step 4: Flight Details
  flightPurpose: FlightPurpose | null;
  flightPurposeDescription: string;
  arrivalAirport: string;
  departureAirport: string;
  estimatedFlightDate: string;
  numberOfPassengers: number | null;
  cargoDescription: string;

  // Step 5: Permit Period
  requestedStartDate: string;
  requestedEndDate: string;

  // Step 6: Documents
  documents: WizardDocument[];

  // Step 7: Review & Fee
  feeCalculation: FeeCalculationResult | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setApplicationType: (type: ApplicationType) => void;
  setOperator: (operatorId: string | null, operator?: Partial<Operator>, isNew?: boolean) => void;
  setAircraft: (aircraftId: string | null, aircraft?: Partial<Aircraft>, isNew?: boolean) => void;
  setFlightDetails: (details: Partial<WizardState>) => void;
  setPermitPeriod: (startDate: string, endDate: string) => void;
  addDocument: (doc: WizardDocument) => void;
  removeDocument: (type: DocumentType) => void;
  setFeeCalculation: (fee: FeeCalculationResult | null) => void;
  reset: () => void;
  canProceed: () => boolean;
}

const TOTAL_STEPS = 7;

const initialState = {
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  applicationType: null,
  operatorId: null,
  operator: null,
  isNewOperator: false,
  aircraftId: null,
  aircraft: null,
  isNewAircraft: false,
  flightPurpose: null,
  flightPurposeDescription: '',
  arrivalAirport: '',
  departureAirport: '',
  estimatedFlightDate: '',
  numberOfPassengers: null,
  cargoDescription: '',
  requestedStartDate: '',
  requestedEndDate: '',
  documents: [],
  feeCalculation: null,
};

export const useApplicationWizard = create<WizardState>((set, get) => ({
  ...initialState,

  setStep: (step) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS && get().canProceed()) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  setApplicationType: (type) => {
    set({ applicationType: type });
  },

  setOperator: (operatorId, operator, isNew = false) => {
    set({
      operatorId,
      operator: operator ?? null,
      isNewOperator: isNew,
      // Reset aircraft when operator changes
      aircraftId: null,
      aircraft: null,
      isNewAircraft: false,
    });
  },

  setAircraft: (aircraftId, aircraft, isNew = false) => {
    set({
      aircraftId,
      aircraft: aircraft ?? null,
      isNewAircraft: isNew,
    });
  },

  setFlightDetails: (details) => {
    set(details);
  },

  setPermitPeriod: (startDate, endDate) => {
    set({
      requestedStartDate: startDate,
      requestedEndDate: endDate,
    });
  },

  addDocument: (doc) => {
    set((state) => ({
      documents: [
        ...state.documents.filter((d) => d.type !== doc.type),
        doc,
      ],
    }));
  },

  removeDocument: (type) => {
    set((state) => ({
      documents: state.documents.filter((d) => d.type !== type),
    }));
  },

  setFeeCalculation: (fee) => {
    set({ feeCalculation: fee });
  },

  reset: () => set(initialState),

  canProceed: () => {
    const state = get();

    switch (state.currentStep) {
      case 1:
        return state.applicationType !== null;

      case 2:
        return state.operatorId !== null || (state.isNewOperator && state.operator !== null);

      case 3:
        return state.aircraftId !== null || (state.isNewAircraft && state.aircraft !== null);

      case 4:
        return (
          state.flightPurpose !== null &&
          state.arrivalAirport.length >= 3 &&
          state.departureAirport.length >= 3 &&
          state.estimatedFlightDate !== ''
        );

      case 5:
        return state.requestedStartDate !== '' && state.requestedEndDate !== '';

      case 6:
        // Require at least the mandatory documents
        const requiredTypes: DocumentType[] = [
          'CERTIFICATE_OF_AIRWORTHINESS',
          'CERTIFICATE_OF_REGISTRATION',
          'AIR_OPERATOR_CERTIFICATE',
          'INSURANCE_CERTIFICATE',
        ];
        return requiredTypes.every((type) =>
          state.documents.some((doc) => doc.type === type)
        );

      case 7:
        return true; // Review step - can always proceed to submit

      default:
        return false;
    }
  },
}));
