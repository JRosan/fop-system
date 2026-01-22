import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApplicationWizard } from '@fop/core';
import { applicationsApi, operatorsApi, feesApi } from '@fop/api';
import { useNotificationStore } from '@fop/core';
import type { ApplicationType, FlightPurpose, CreateApplicationRequest } from '@fop/types';
import {
  Check,
  Info,
  FileText,
  Clock,
  AlertCircle,
  Plane,
  Building2,
  Calendar,
  Upload,
  X,
  Search,
} from 'lucide-react';
import { formatMoney } from '../utils/date';

const steps = [
  { id: 1, name: 'Permit Type', icon: FileText },
  { id: 2, name: 'Operator', icon: Building2 },
  { id: 3, name: 'Aircraft', icon: Plane },
  { id: 4, name: 'Flight Details', icon: Info },
  { id: 5, name: 'Permit Period', icon: Calendar },
  { id: 6, name: 'Documents', icon: FileText },
  { id: 7, name: 'Review', icon: Check },
];

const stepInfo: Record<number, { title: string; tips: string[]; requirements?: string[] }> = {
  1: {
    title: 'Choosing a Permit Type',
    tips: [
      'One-Time permits are for single flight operations',
      'Blanket permits allow multiple flights over a period',
      'Emergency permits have expedited processing',
    ],
  },
  2: {
    title: 'Operator Requirements',
    tips: [
      'Operator must have a valid AOC from their home country',
      'Contact information must be current and accurate',
    ],
  },
  3: {
    title: 'Aircraft Information',
    tips: [
      'Aircraft must be registered and airworthy',
      'MTOW affects fee calculation',
    ],
  },
  4: {
    title: 'Flight Operation Details',
    tips: [
      'Specify all BVI airports you plan to use',
      'Include accurate passenger/cargo estimates',
    ],
  },
  5: {
    title: 'Permit Validity',
    tips: [
      'One-Time permits are valid for the specific flight dates',
      'Blanket permits can be valid up to 12 months',
    ],
  },
  6: {
    title: 'Document Requirements',
    tips: [
      'All documents must be in English or translated',
      'PDF format is preferred for all uploads',
    ],
    requirements: [
      'Air Operator Certificate (AOC)',
      'Certificate of Airworthiness',
      'Certificate of Registration',
      'Insurance Certificate',
    ],
  },
  7: {
    title: 'Final Review',
    tips: [
      'Double-check all information before submitting',
      'Application cannot be edited after submission',
    ],
  },
};

export function NewApplication() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotificationStore();
  const wizard = useApplicationWizard();
  const { currentStep, totalSteps, nextStep, prevStep, canProceed, reset } = wizard;
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Reset wizard on mount
  useEffect(() => {
    reset();
  }, []);

  // Fee calculation
  const { data: feeData } = useQuery({
    queryKey: ['feeEstimate', wizard.applicationType, wizard.aircraft?.seatCapacity, wizard.aircraft?.mtow?.value],
    queryFn: () =>
      feesApi.calculate(
        wizard.applicationType!,
        wizard.aircraft?.seatCapacity || 0,
        wizard.aircraft?.mtow?.value || 0
      ),
    enabled: !!wizard.applicationType && !!wizard.aircraft?.seatCapacity && !!wizard.aircraft?.mtow?.value,
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const request: CreateApplicationRequest = {
        type: wizard.applicationType!,
        operator: wizard.isNewOperator ? {
          name: wizard.operator?.name || '',
          registrationNumber: wizard.operator?.registrationNumber || '',
          country: wizard.operator?.country || '',
          address: wizard.operator?.address || { street: '', city: '', country: '' },
          contactInfo: wizard.operator?.contactInfo || { email: '', phone: '' },
          authorizedRepresentative: wizard.operator?.authorizedRepresentative || { name: '', title: '', email: '', phone: '' },
          aocNumber: wizard.operator?.aocNumber || '',
          aocIssuingAuthority: wizard.operator?.aocIssuingAuthority || '',
          aocExpiryDate: wizard.operator?.aocExpiryDate || '',
        } : undefined,
        operatorId: wizard.isNewOperator ? undefined : wizard.operatorId || undefined,
        aircraft: wizard.isNewAircraft ? {
          registrationNumber: wizard.aircraft?.registrationNumber || '',
          manufacturer: wizard.aircraft?.manufacturer || '',
          model: wizard.aircraft?.model || '',
          serialNumber: wizard.aircraft?.serialNumber || '',
          yearOfManufacture: wizard.aircraft?.yearOfManufacture || new Date().getFullYear(),
          mtow: wizard.aircraft?.mtow || { value: 0, unit: 'KG' },
          seatCapacity: wizard.aircraft?.seatCapacity || 0,
          category: wizard.aircraft?.category || 'FIXED_WING',
          countryOfRegistration: wizard.aircraft?.countryOfRegistration || '',
        } : undefined,
        aircraftId: wizard.isNewAircraft ? undefined : wizard.aircraftId || undefined,
        flightDetails: {
          purpose: wizard.flightPurpose!,
          purposeDescription: wizard.flightPurposeDescription || undefined,
          arrivalAirport: wizard.arrivalAirport,
          departureAirport: wizard.departureAirport,
          estimatedFlightDate: wizard.estimatedFlightDate,
          numberOfPassengers: wizard.numberOfPassengers || undefined,
          cargoDescription: wizard.cargoDescription || undefined,
        },
        requestedPeriod: {
          startDate: wizard.requestedStartDate,
          endDate: wizard.requestedEndDate,
        },
      };
      return applicationsApi.create(request);
    },
    onSuccess: (application) => {
      success('Application Created', `Application ${application.applicationNumber} has been created successfully.`);
      reset();
      navigate(`/applications/${application.id}`);
    },
    onError: (err: Error) => {
      showError('Failed to Create Application', err.message);
    },
  });

  const handleSubmit = () => {
    if (!termsAccepted) {
      showError('Terms Required', 'Please accept the terms and conditions to submit.');
      return;
    }
    submitMutation.mutate();
  };

  const currentStepInfo = stepInfo[currentStep];

  return (
    <div className="w-full">
      {/* Progress Stepper */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 shadow-sm -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">New FOP Application</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Step {currentStep} of {totalSteps}: {steps[currentStep - 1].name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>Est. 10-15 minutes</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-start">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {index !== 0 && (
                  <div
                    className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                      step.id <= currentStep ? 'bg-green-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                      isCompleted ? 'bg-green-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                    isCompleted ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-neutral-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <StepContent step={currentStep} wizard={wizard} termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} feeData={feeData} />
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || !termsAccepted || submitMutation.isPending}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">{currentStepInfo.title}</h3>
            </div>
            <ul className="space-y-2">
              {currentStepInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-400 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {currentStepInfo.requirements && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Requirements</h3>
              </div>
              <ul className="space-y-2">
                {currentStepInfo.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                    <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fee Estimate */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Fee Estimate</h3>
            {feeData ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Base Fee</span>
                  <span>{formatMoney(feeData.baseFee.amount, feeData.baseFee.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Seat Fee</span>
                  <span>{formatMoney(feeData.seatFee.amount, feeData.seatFee.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Weight Fee</span>
                  <span>{formatMoney(feeData.weightFee.amount, feeData.weightFee.currency)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-neutral-900">
                    <span>Estimated Total</span>
                    <span>{formatMoney(feeData.totalFee.amount, feeData.totalFee.currency)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-neutral-500">
                <p>Enter aircraft details to calculate fees</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepContentProps {
  step: number;
  wizard: ReturnType<typeof useApplicationWizard>;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  feeData: any;
}

function StepContent({ step, wizard, termsAccepted, setTermsAccepted, feeData }: StepContentProps) {
  switch (step) {
    case 1:
      return <PermitTypeStep wizard={wizard} />;
    case 2:
      return <OperatorStep wizard={wizard} />;
    case 3:
      return <AircraftStep wizard={wizard} />;
    case 4:
      return <FlightDetailsStep wizard={wizard} />;
    case 5:
      return <PermitPeriodStep wizard={wizard} />;
    case 6:
      return <DocumentsStep wizard={wizard} />;
    case 7:
      return <ReviewStep wizard={wizard} termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} feeData={feeData} />;
    default:
      return null;
  }
}

function PermitTypeStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { applicationType, setApplicationType } = wizard;

  const types: { id: ApplicationType; name: string; description: string; multiplier: string; processing: string }[] = [
    {
      id: 'ONE_TIME',
      name: 'One-Time Permit',
      description: 'For a single flight operation to or from the British Virgin Islands',
      multiplier: '1.0x',
      processing: '3-5 business days',
    },
    {
      id: 'BLANKET',
      name: 'Blanket Permit',
      description: 'For multiple flights over an extended period (up to 12 months)',
      multiplier: '2.5x',
      processing: '5-7 business days',
    },
    {
      id: 'EMERGENCY',
      name: 'Emergency Permit',
      description: 'For urgent humanitarian, medical, or emergency flights',
      multiplier: '0.5x',
      processing: '24-48 hours',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Select Permit Type</h2>
      <p className="text-neutral-500 mb-6">Choose the type of permit that best suits your operation.</p>

      <div className="grid gap-4">
        {types.map((type) => (
          <label
            key={type.id}
            className={`relative flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
              applicationType === type.id
                ? 'border-primary-600 bg-primary-50 shadow-md'
                : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
            }`}
          >
            <input
              type="radio"
              name="permitType"
              value={type.id}
              checked={applicationType === type.id}
              onChange={() => setApplicationType(type.id)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-neutral-900">{type.name}</p>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-600">
                  {type.multiplier} fee
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">{type.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                {type.processing}
              </div>
            </div>
            {applicationType === type.id && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function OperatorStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { operatorId, operator, isNewOperator, setOperator } = wizard;
  const [searchTerm, setSearchTerm] = useState('');

  const { data: operatorsData } = useQuery({
    queryKey: ['operators', 'search', searchTerm],
    queryFn: () => operatorsApi.getAll({ search: searchTerm, pageSize: 5 }),
    enabled: searchTerm.length >= 2,
  });

  const handleSelectExisting = (op: { id: string; name: string; country: string; aocNumber: string }) => {
    setOperator(op.id, { name: op.name, country: op.country, aocNumber: op.aocNumber }, false);
  };

  const handleNewOperator = () => {
    setOperator(null, operator || {}, true);
  };

  const updateOperator = (field: string, value: string) => {
    setOperator(null, { ...operator, [field]: value }, true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Operator Information</h2>
      <p className="text-neutral-500 mb-6">Select an existing operator or register a new one.</p>

      <div className="space-y-6">
        {/* Search existing */}
        <div>
          <label className="label">Search Existing Operators</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or AOC number..."
              className="input pl-10"
            />
          </div>
          {operatorsData && operatorsData.items.length > 0 && (
            <div className="mt-2 border border-neutral-200 rounded-lg divide-y">
              {operatorsData.items.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => handleSelectExisting(op)}
                  className={`w-full text-left px-4 py-3 hover:bg-neutral-50 ${
                    operatorId === op.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <p className="font-medium">{op.name}</p>
                  <p className="text-sm text-neutral-500">{op.country} - AOC: {op.aocNumber}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {operatorId && !isNewOperator && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-900">Selected: {operator?.name}</p>
            <button
              type="button"
              onClick={() => setOperator(null, {}, true)}
              className="text-sm text-green-700 underline mt-1"
            >
              Clear selection
            </button>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-neutral-500">or register new operator</span>
          </div>
        </div>

        {/* New operator form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Operator Name *</label>
            <input
              type="text"
              value={operator?.name || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('name', e.target.value); }}
              placeholder="e.g., Caribbean Air Services"
              className="input"
            />
          </div>
          <div>
            <label className="label">Country *</label>
            <input
              type="text"
              value={operator?.country || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('country', e.target.value); }}
              placeholder="e.g., United States"
              className="input"
            />
          </div>
          <div>
            <label className="label">AOC Number *</label>
            <input
              type="text"
              value={operator?.aocNumber || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('aocNumber', e.target.value); }}
              placeholder="Air Operator Certificate number"
              className="input"
            />
          </div>
          <div>
            <label className="label">AOC Issuing Authority *</label>
            <input
              type="text"
              value={operator?.aocIssuingAuthority || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('aocIssuingAuthority', e.target.value); }}
              placeholder="e.g., FAA"
              className="input"
            />
          </div>
          <div>
            <label className="label">AOC Expiry Date *</label>
            <input
              type="date"
              value={operator?.aocExpiryDate || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('aocExpiryDate', e.target.value); }}
              className="input"
            />
          </div>
          <div>
            <label className="label">Registration Number</label>
            <input
              type="text"
              value={operator?.registrationNumber || ''}
              onChange={(e) => { handleNewOperator(); updateOperator('registrationNumber', e.target.value); }}
              placeholder="Company registration"
              className="input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AircraftStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { aircraft, isNewAircraft, setAircraft } = wizard;

  const updateAircraft = (field: string, value: any) => {
    setAircraft(null, { ...aircraft, [field]: value }, true);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Aircraft Information</h2>
      <p className="text-neutral-500 mb-6">Enter the aircraft details for this operation.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Registration Number *</label>
          <input
            type="text"
            value={aircraft?.registrationNumber || ''}
            onChange={(e) => updateAircraft('registrationNumber', e.target.value)}
            placeholder="e.g., N12345"
            className="input"
          />
        </div>
        <div>
          <label className="label">Manufacturer *</label>
          <input
            type="text"
            value={aircraft?.manufacturer || ''}
            onChange={(e) => updateAircraft('manufacturer', e.target.value)}
            placeholder="e.g., Boeing"
            className="input"
          />
        </div>
        <div>
          <label className="label">Model *</label>
          <input
            type="text"
            value={aircraft?.model || ''}
            onChange={(e) => updateAircraft('model', e.target.value)}
            placeholder="e.g., 737-800"
            className="input"
          />
        </div>
        <div>
          <label className="label">Serial Number *</label>
          <input
            type="text"
            value={aircraft?.serialNumber || ''}
            onChange={(e) => updateAircraft('serialNumber', e.target.value)}
            placeholder="Aircraft serial number"
            className="input"
          />
        </div>
        <div>
          <label className="label">MTOW (kg) *</label>
          <input
            type="number"
            value={aircraft?.mtow?.value || ''}
            onChange={(e) => updateAircraft('mtow', { value: parseInt(e.target.value) || 0, unit: 'KG' })}
            placeholder="Maximum takeoff weight"
            className="input"
          />
        </div>
        <div>
          <label className="label">Seat Capacity *</label>
          <input
            type="number"
            value={aircraft?.seatCapacity || ''}
            onChange={(e) => updateAircraft('seatCapacity', parseInt(e.target.value) || 0)}
            placeholder="Number of seats"
            className="input"
          />
        </div>
        <div>
          <label className="label">Country of Registration *</label>
          <input
            type="text"
            value={aircraft?.countryOfRegistration || ''}
            onChange={(e) => updateAircraft('countryOfRegistration', e.target.value)}
            placeholder="e.g., United States"
            className="input"
          />
        </div>
        <div>
          <label className="label">Year of Manufacture</label>
          <input
            type="number"
            value={aircraft?.yearOfManufacture || ''}
            onChange={(e) => updateAircraft('yearOfManufacture', parseInt(e.target.value) || 0)}
            placeholder="e.g., 2015"
            className="input"
          />
        </div>
      </div>
    </div>
  );
}

function FlightDetailsStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { flightPurpose, setFlightDetails, arrivalAirport, departureAirport, estimatedFlightDate, numberOfPassengers, cargoDescription, flightPurposeDescription } = wizard;

  const purposes: { value: FlightPurpose; label: string }[] = [
    { value: 'CHARTER', label: 'Charter Flight' },
    { value: 'CARGO', label: 'Cargo Operations' },
    { value: 'TECHNICAL_LANDING', label: 'Technical Landing' },
    { value: 'MEDEVAC', label: 'Medical Evacuation' },
    { value: 'PRIVATE', label: 'Private Flight' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Flight Details</h2>
      <p className="text-neutral-500 mb-6">Provide details about the planned flight operation.</p>

      <div className="space-y-4">
        <div>
          <label className="label">Flight Purpose *</label>
          <select
            value={flightPurpose || ''}
            onChange={(e) => setFlightDetails({ flightPurpose: e.target.value as FlightPurpose })}
            className="input"
          >
            <option value="">Select purpose...</option>
            {purposes.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {flightPurpose === 'OTHER' && (
          <div>
            <label className="label">Purpose Description</label>
            <input
              type="text"
              value={flightPurposeDescription}
              onChange={(e) => setFlightDetails({ flightPurposeDescription: e.target.value })}
              placeholder="Describe the flight purpose"
              className="input"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Departure Airport *</label>
            <input
              type="text"
              value={departureAirport}
              onChange={(e) => setFlightDetails({ departureAirport: e.target.value })}
              placeholder="ICAO code (e.g., KJFK)"
              className="input"
            />
          </div>
          <div>
            <label className="label">Arrival Airport *</label>
            <input
              type="text"
              value={arrivalAirport}
              onChange={(e) => setFlightDetails({ arrivalAirport: e.target.value })}
              placeholder="ICAO code (e.g., TUPJ)"
              className="input"
            />
          </div>
          <div>
            <label className="label">Estimated Flight Date *</label>
            <input
              type="date"
              value={estimatedFlightDate}
              onChange={(e) => setFlightDetails({ estimatedFlightDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Number of Passengers</label>
            <input
              type="number"
              value={numberOfPassengers || ''}
              onChange={(e) => setFlightDetails({ numberOfPassengers: parseInt(e.target.value) || null })}
              placeholder="Expected passengers"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Cargo Description</label>
          <textarea
            value={cargoDescription}
            onChange={(e) => setFlightDetails({ cargoDescription: e.target.value })}
            placeholder="Describe cargo if applicable"
            className="input min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
}

function PermitPeriodStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { requestedStartDate, requestedEndDate, setPermitPeriod, applicationType } = wizard;

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Permit Period</h2>
      <p className="text-neutral-500 mb-6">Select the validity period for your permit.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date *</label>
          <input
            type="date"
            value={requestedStartDate}
            onChange={(e) => setPermitPeriod(e.target.value, requestedEndDate)}
            min={new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>
        <div>
          <label className="label">End Date *</label>
          <input
            type="date"
            value={requestedEndDate}
            onChange={(e) => setPermitPeriod(requestedStartDate, e.target.value)}
            min={requestedStartDate || new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong>{' '}
          {applicationType === 'ONE_TIME'
            ? 'One-Time permits are valid for the specific flight dates only.'
            : applicationType === 'BLANKET'
            ? 'Blanket permits can be valid for up to 12 months from the start date.'
            : 'Emergency permits are processed within 24-48 hours.'}
        </p>
      </div>
    </div>
  );
}

function DocumentsStep({ wizard }: { wizard: ReturnType<typeof useApplicationWizard> }) {
  const { documents, addDocument, removeDocument } = wizard;

  const requiredDocs = [
    { type: 'CERTIFICATE_OF_AIRWORTHINESS' as const, name: 'Certificate of Airworthiness', required: true },
    { type: 'CERTIFICATE_OF_REGISTRATION' as const, name: 'Certificate of Registration', required: true },
    { type: 'AIR_OPERATOR_CERTIFICATE' as const, name: 'Air Operator Certificate', required: true },
    { type: 'INSURANCE_CERTIFICATE' as const, name: 'Insurance Certificate', required: true },
    { type: 'NOISE_CERTIFICATE' as const, name: 'Noise Certificate', required: false },
  ];

  const handleFileSelect = (type: typeof requiredDocs[0]['type'], file: File) => {
    addDocument({ type, file });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Required Documents</h2>
      <p className="text-neutral-500 mb-6">Upload the required documents. All documents must be valid and in PDF format.</p>

      <div className="space-y-4">
        {requiredDocs.map((doc) => {
          const uploaded = documents.find((d) => d.type === doc.type);
          return (
            <div
              key={doc.type}
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploaded ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
                }`}>
                  {uploaded ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {doc.name}
                    {doc.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {uploaded ? uploaded.file.name : 'Not uploaded'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploaded && (
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.type)}
                    className="p-2 text-neutral-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <label className="px-4 py-2 rounded-lg border border-primary-600 text-primary-600 text-sm font-medium hover:bg-primary-50 cursor-pointer">
                  {uploaded ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(doc.type, file);
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReviewStepProps {
  wizard: ReturnType<typeof useApplicationWizard>;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  feeData: any;
}

function ReviewStep({ wizard, termsAccepted, setTermsAccepted, feeData }: ReviewStepProps) {
  const { applicationType, operator, aircraft, flightPurpose, departureAirport, arrivalAirport, requestedStartDate, requestedEndDate, documents } = wizard;

  const typeLabels: Record<ApplicationType, string> = {
    ONE_TIME: 'One-Time Permit',
    BLANKET: 'Blanket Permit',
    EMERGENCY: 'Emergency Permit',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Review Application</h2>
      <p className="text-neutral-500 mb-6">Please review all information before submitting.</p>

      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Permit Type</h3>
          <p className="text-neutral-600">{applicationType ? typeLabels[applicationType] : '--'}</p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Operator</h3>
          <p className="text-neutral-600">{operator?.name || '--'}</p>
          <p className="text-sm text-neutral-500">{operator?.country} - AOC: {operator?.aocNumber}</p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Aircraft</h3>
          <p className="text-neutral-600">{aircraft?.registrationNumber || '--'}</p>
          <p className="text-sm text-neutral-500">
            {aircraft?.manufacturer} {aircraft?.model} - {aircraft?.seatCapacity} seats, {aircraft?.mtow?.value?.toLocaleString()} kg MTOW
          </p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Flight Details</h3>
          <p className="text-neutral-600">{flightPurpose?.replace(/_/g, ' ') || '--'}</p>
          <p className="text-sm text-neutral-500">{departureAirport} → {arrivalAirport}</p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Permit Period</h3>
          <p className="text-neutral-600">{requestedStartDate} to {requestedEndDate}</p>
        </div>

        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Documents</h3>
          <p className="text-neutral-600">{documents.length} document(s) uploaded</p>
        </div>

        {feeData && (
          <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
            <h3 className="font-semibold text-primary-900 mb-2">Fee Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-primary-700">
                <span>Base Fee</span>
                <span>{formatMoney(feeData.baseFee.amount, feeData.baseFee.currency)}</span>
              </div>
              <div className="flex justify-between text-primary-700">
                <span>Seat Fee</span>
                <span>{formatMoney(feeData.seatFee.amount, feeData.seatFee.currency)}</span>
              </div>
              <div className="flex justify-between text-primary-700">
                <span>Weight Fee</span>
                <span>{formatMoney(feeData.weightFee.amount, feeData.weightFee.currency)}</span>
              </div>
              <div className="border-t border-primary-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-primary-900">
                  <span>Total Fee</span>
                  <span>{formatMoney(feeData.totalFee.amount, feeData.totalFee.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <label className="flex items-start gap-3 p-4 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-600">
            I confirm that all information provided is accurate and complete. I understand that providing false information may result in the rejection of this application.
          </span>
        </label>
      </div>
    </div>
  );
}
