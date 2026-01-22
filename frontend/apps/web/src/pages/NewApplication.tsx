import { useApplicationWizard } from '@fop/core';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Permit Type' },
  { id: 2, name: 'Operator' },
  { id: 3, name: 'Aircraft' },
  { id: 4, name: 'Flight Details' },
  { id: 5, name: 'Permit Period' },
  { id: 6, name: 'Documents' },
  { id: 7, name: 'Review' },
];

export function NewApplication() {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed } =
    useApplicationWizard();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">New FOP Application</h1>
        <p className="text-neutral-500 mt-1">
          Complete the following steps to submit your application
        </p>
      </div>

      {/* Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`flex-1 ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
            >
              <div className="relative">
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-4 -ml-px w-full h-0.5 ${
                      step.id < currentStep ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
                <div className="relative flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id < currentStep
                        ? 'bg-primary-600 text-white'
                        : step.id === currentStep
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                          : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium hidden sm:block ${
                      step.id <= currentStep
                        ? 'text-primary-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="card p-6">
        <StepContent step={currentStep} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        {currentStep === totalSteps ? (
          <button
            disabled={!canProceed()}
            className="btn-primary disabled:opacity-50"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn-primary disabled:opacity-50"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1:
      return <PermitTypeStep />;
    case 2:
      return <OperatorStep />;
    case 3:
      return <AircraftStep />;
    case 4:
      return <FlightDetailsStep />;
    case 5:
      return <PermitPeriodStep />;
    case 6:
      return <DocumentsStep />;
    case 7:
      return <ReviewStep />;
    default:
      return null;
  }
}

function PermitTypeStep() {
  const { applicationType, setApplicationType } = useApplicationWizard();

  const types = [
    {
      id: 'ONE_TIME',
      name: 'One-Time Permit',
      description: 'For a single flight operation',
      multiplier: '1.0x base fee',
    },
    {
      id: 'BLANKET',
      name: 'Blanket Permit',
      description: 'For multiple flights over a period',
      multiplier: '2.5x base fee',
    },
    {
      id: 'EMERGENCY',
      name: 'Emergency Permit',
      description: 'For urgent humanitarian or medical flights',
      multiplier: '0.5x base fee',
    },
  ] as const;

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Select Permit Type
      </h2>
      <div className="grid gap-4">
        {types.map((type) => (
          <label
            key={type.id}
            className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              applicationType === type.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
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
              <p className="font-medium text-neutral-900">{type.name}</p>
              <p className="text-sm text-neutral-500 mt-1">{type.description}</p>
            </div>
            <span className="text-sm font-medium text-primary-600">
              {type.multiplier}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function OperatorStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Operator Information
      </h2>
      <p className="text-neutral-500">
        Select an existing operator or create a new one.
      </p>
      {/* Operator selection/creation form would go here */}
    </div>
  );
}

function AircraftStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Aircraft Information
      </h2>
      <p className="text-neutral-500">
        Select an aircraft registered to the operator.
      </p>
      {/* Aircraft selection/creation form would go here */}
    </div>
  );
}

function FlightDetailsStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Flight Details
      </h2>
      <p className="text-neutral-500">
        Provide details about the planned flight operation.
      </p>
      {/* Flight details form would go here */}
    </div>
  );
}

function PermitPeriodStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Permit Period
      </h2>
      <p className="text-neutral-500">
        Select the validity period for the permit.
      </p>
      {/* Date range picker would go here */}
    </div>
  );
}

function DocumentsStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Required Documents
      </h2>
      <p className="text-neutral-500">
        Upload the required documents for your application.
      </p>
      {/* Document upload form would go here */}
    </div>
  );
}

function ReviewStep() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Review Application
      </h2>
      <p className="text-neutral-500">
        Review your application details before submitting.
      </p>
      {/* Application summary would go here */}
    </div>
  );
}
