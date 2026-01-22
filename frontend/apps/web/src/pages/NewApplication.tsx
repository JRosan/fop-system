import { useApplicationWizard } from '@fop/core';
import { Check, Info, FileText, Clock, AlertCircle, Plane, Building2, Calendar } from 'lucide-react';

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
    requirements: [
      'Valid Air Operator Certificate (AOC)',
      'Current insurance coverage',
    ],
  },
  2: {
    title: 'Operator Requirements',
    tips: [
      'Operator must have a valid AOC from their home country',
      'Contact information must be current and accurate',
      'International operators need ICAO designator',
    ],
    requirements: [
      'Air Operator Certificate',
      'Company registration documents',
      'Designated contact person',
    ],
  },
  3: {
    title: 'Aircraft Information',
    tips: [
      'Aircraft must be registered and airworthy',
      'Noise certificate may be required for certain airports',
      'MTOW affects fee calculation',
    ],
    requirements: [
      'Certificate of Registration',
      'Certificate of Airworthiness',
      'Insurance certificate covering BVI operations',
    ],
  },
  4: {
    title: 'Flight Operation Details',
    tips: [
      'Specify all BVI airports you plan to use',
      'Include accurate passenger/cargo estimates',
      'Charter flights require additional documentation',
    ],
  },
  5: {
    title: 'Permit Validity',
    tips: [
      'One-Time permits are valid for the specific flight dates',
      'Blanket permits can be valid up to 12 months',
      'Allow sufficient processing time before operations',
    ],
  },
  6: {
    title: 'Document Requirements',
    tips: [
      'All documents must be in English or translated',
      'Ensure documents are current and not expired',
      'PDF format is preferred for all uploads',
    ],
    requirements: [
      'Air Operator Certificate (AOC)',
      'Certificate of Airworthiness',
      'Certificate of Registration',
      'Insurance Certificate',
      'Noise Certificate (if applicable)',
    ],
  },
  7: {
    title: 'Final Review',
    tips: [
      'Double-check all information before submitting',
      'Ensure all required documents are uploaded',
      'Application cannot be edited after submission',
    ],
  },
};

export function NewApplication() {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed } =
    useApplicationWizard();

  const currentStepInfo = stepInfo[currentStep];

  return (
    <div className="w-full">
      {/* Fixed Progress Stepper */}
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
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                          : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden lg:block ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                          ? 'text-primary-600'
                          : 'text-neutral-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-3 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Content - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
            <StepContent step={currentStep} />
          </div>

          {/* Navigation Buttons */}
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
                disabled={!canProceed()}
                className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Application
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

        {/* Information Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Tips Card */}
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

          {/* Requirements Card */}
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

          {/* Fee Estimate Card */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
            <h3 className="font-semibold text-neutral-900 mb-3">Fee Estimate</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Base Fee</span>
                <span>$150.00</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Seat Fee</span>
                <span>--</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Weight Fee</span>
                <span>--</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Estimated Total</span>
                  <span>$150.00+</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              Final fee calculated after aircraft selection
            </p>
          </div>

          {/* Help Card */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5">
            <h3 className="font-semibold text-neutral-900 mb-2">Need Help?</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Contact the BVI Civil Aviation Department for assistance.
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-neutral-600">
                <span className="font-medium">Email:</span> info@bvicad.gov.vg
              </p>
              <p className="text-neutral-600">
                <span className="font-medium">Phone:</span> +1 (284) 555-0123
              </p>
            </div>
          </div>
        </div>
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
      description: 'For a single flight operation to or from the British Virgin Islands',
      multiplier: '1.0x',
      fee: 'Standard fee',
      processing: '3-5 business days',
      icon: Plane,
    },
    {
      id: 'BLANKET',
      name: 'Blanket Permit',
      description: 'For multiple flights over an extended period (up to 12 months)',
      multiplier: '2.5x',
      fee: 'Premium fee',
      processing: '5-7 business days',
      icon: Calendar,
    },
    {
      id: 'EMERGENCY',
      name: 'Emergency Permit',
      description: 'For urgent humanitarian, medical, or emergency flights',
      multiplier: '0.5x',
      fee: 'Reduced fee',
      processing: '24-48 hours',
      icon: AlertCircle,
    },
  ] as const;

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Select Permit Type
      </h2>
      <p className="text-neutral-500 mb-6">
        Choose the type of Foreign Operator Permit that best suits your operation needs.
      </p>

      <div className="grid gap-4">
        {types.map((type) => {
          const TypeIcon = type.icon;
          return (
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
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                applicationType === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                <TypeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{type.name}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    applicationType === type.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {type.multiplier} base fee
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">{type.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {type.processing}
                  </span>
                </div>
              </div>
              {applicationType === type.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function OperatorStep() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Operator Information
      </h2>
      <p className="text-neutral-500 mb-6">
        Select an existing operator or register a new one for this application.
      </p>

      <div className="space-y-6">
        {/* Search existing operators */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Search Existing Operators
          </label>
          <input
            type="text"
            placeholder="Search by name or ICAO code..."
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-neutral-500">or register new operator</span>
          </div>
        </div>

        {/* New operator form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Operator Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Caribbean Air Services"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              ICAO Designator
            </label>
            <input
              type="text"
              placeholder="e.g., CAS"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Country of Registration *
            </label>
            <select className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">Select country...</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              AOC Number *
            </label>
            <input
              type="text"
              placeholder="Air Operator Certificate number"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AircraftStep() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Aircraft Information
      </h2>
      <p className="text-neutral-500 mb-6">
        Select or register the aircraft that will be used for this operation.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Registration Number *
            </label>
            <input
              type="text"
              placeholder="e.g., N12345"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Aircraft Type *
            </label>
            <input
              type="text"
              placeholder="e.g., Boeing 737-800"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              MTOW (kg) *
            </label>
            <input
              type="number"
              placeholder="Maximum takeoff weight"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Number of Seats *
            </label>
            <input
              type="number"
              placeholder="Passenger capacity"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlightDetailsStep() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Flight Details
      </h2>
      <p className="text-neutral-500 mb-6">
        Provide details about the planned flight operation.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Flight Purpose *
          </label>
          <select className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Select purpose...</option>
            <option value="CHARTER">Charter</option>
            <option value="SCHEDULED">Scheduled Service</option>
            <option value="CARGO">Cargo</option>
            <option value="PRIVATE">Private</option>
            <option value="MEDICAL">Medical/Emergency</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Departure Airport *
            </label>
            <input
              type="text"
              placeholder="ICAO code (e.g., KJFK)"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Arrival Airport *
            </label>
            <input
              type="text"
              placeholder="ICAO code (e.g., TUPJ)"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Expected Passengers
            </label>
            <input
              type="number"
              placeholder="Number of passengers"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Cargo Weight (kg)
            </label>
            <input
              type="number"
              placeholder="Cargo weight if applicable"
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PermitPeriodStep() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Permit Period
      </h2>
      <p className="text-neutral-500 mb-6">
        Select the validity period for your permit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> One-Time permits are valid for the specific flight dates only.
          Blanket permits can be valid for up to 12 months from the start date.
        </p>
      </div>
    </div>
  );
}

function DocumentsStep() {
  const documents = [
    { id: 'aoc', name: 'Air Operator Certificate (AOC)', required: true, uploaded: false },
    { id: 'coa', name: 'Certificate of Airworthiness', required: true, uploaded: false },
    { id: 'cor', name: 'Certificate of Registration', required: true, uploaded: false },
    { id: 'insurance', name: 'Insurance Certificate', required: true, uploaded: false },
    { id: 'noise', name: 'Noise Certificate', required: false, uploaded: false },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Required Documents
      </h2>
      <p className="text-neutral-500 mb-6">
        Upload the required documents for your application. All documents must be valid and in PDF format.
      </p>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                doc.uploaded ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">
                  {doc.name}
                  {doc.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                <p className="text-sm text-neutral-500">
                  {doc.uploaded ? 'Uploaded' : 'Not uploaded'}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg border border-primary-600 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors">
              {doc.uploaded ? 'Replace' : 'Upload'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">
        Review Application
      </h2>
      <p className="text-neutral-500 mb-6">
        Please review all information before submitting your application.
      </p>

      <div className="space-y-6">
        {/* Permit Type Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Permit Type</h3>
          <p className="text-neutral-600">One-Time Permit</p>
        </div>

        {/* Operator Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Operator</h3>
          <p className="text-neutral-600">--</p>
        </div>

        {/* Aircraft Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Aircraft</h3>
          <p className="text-neutral-600">--</p>
        </div>

        {/* Fee Summary */}
        <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2">Fee Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-primary-700">
              <span>Base Fee</span>
              <span>$150.00</span>
            </div>
            <div className="flex justify-between text-primary-700">
              <span>Seat Fee</span>
              <span>--</span>
            </div>
            <div className="flex justify-between text-primary-700">
              <span>Weight Fee</span>
              <span>--</span>
            </div>
            <div className="border-t border-primary-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold text-primary-900">
                <span>Total Fee</span>
                <span>$150.00+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-50">
          <input type="checkbox" className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500" />
          <span className="text-sm text-neutral-600">
            I confirm that all information provided is accurate and complete. I understand that providing false information may result in the rejection of this application and potential legal consequences.
          </span>
        </label>
      </div>
    </div>
  );
}
