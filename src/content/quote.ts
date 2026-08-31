/**
 * Quote form copy and options — PROJECT_BRIEF.md §8.
 *
 * Option values are stable slugs; only the labels are copy. Nothing here
 * promises a price, a turnaround or a service radius — those are open items.
 */

export const JOB_TYPES = [
  { value: 'windshield-repair', label: 'Windshield chip or crack repair', glass: true },
  { value: 'windshield-replacement', label: 'Windshield replacement', glass: true },
  { value: 'side-rear-window', label: 'Side or rear window', glass: true },
  { value: 'marine-glass', label: 'Boat, RV or motorhome glass', glass: true },
  { value: 'heavy-equipment-glass', label: 'Heavy equipment or farm glass', glass: true },
  { value: 'tint', label: 'Window or headlight tint', glass: false },
  { value: 'remote-starter', label: 'Remote starter', glass: false },
  { value: 'accessories', label: 'Wheels, tires or accessories', glass: false },
  { value: 'snow-plow', label: 'Snow plow', glass: false },
  { value: 'other', label: 'Something else', glass: false },
] as const

export const DAMAGE_EXTENTS = [
  { value: 'stone-chip', label: 'Small stone chip' },
  { value: 'crack-under-6', label: 'Crack under 6 inches' },
  { value: 'crack-over-6', label: 'Crack over 6 inches' },
  { value: 'shattered', label: 'Shattered or missing' },
] as const

export const ADAS_ANSWERS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-sure', label: 'Not sure' },
] as const

export const SERVICE_LOCATIONS = [
  { value: 'in-shop', label: 'At the shop in Midland' },
  { value: 'mobile', label: 'You come to me' },
  { value: 'either', label: 'Either is fine' },
] as const

export const URGENCIES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'this-week', label: 'Within a week' },
  { value: 'flexible', label: 'No particular rush' },
] as const

export const quote = {
  title: 'Request a Quote',
  metaDescription:
    'Tell us the vehicle and what has happened to the glass, and Huronia Auto Glass will come back to you with a price.',
  heading: 'Request a quote',
  intro:
    'Four short steps. Glass pricing depends on the vehicle and the damage, so we quote each job rather than publishing a list.',

  steps: [
    { id: 1, title: 'What do you need' },
    { id: 2, title: 'Your vehicle' },
    { id: 3, title: 'Where and when' },
    { id: 4, title: 'Your details' },
  ],

  step1: {
    legend: 'What do you need?',
  },
  step2: {
    legend: 'Your vehicle',
    year: 'Year',
    make: 'Make',
    model: 'Model',
    trim: 'Trim',
    trimHelp: 'Optional, but it helps us get the right glass first time.',
    damageLegend: 'How bad is the damage?',
    adasLegend:
      'Does the vehicle have lane-keep assist, adaptive cruise control or automatic emergency braking?',
    adasHelp:
      'These systems use a camera mounted to the windshield. If your vehicle has them, a replacement usually needs the camera recalibrated afterwards, which changes what the job involves.',
  },
  step3: {
    legend: 'Where and when',
    locationLegend: 'Where would you like the work done?',
    urgencyLegend: 'How soon do you need it?',
    town: 'Town',
    insuranceToggle: 'I want to put this through insurance',
    insurer: 'Insurer',
    claimNumber: 'Claim number',
    claimNumberHelp: 'If you have one yet. Leave it blank if not.',
  },
  step4: {
    legend: 'Your details',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    notes: 'Anything else we should know',
    reviewHeading: 'Check your answers',
    submit: 'Send request',
    submitting: 'Sending…',
  },

  nav: { back: 'Back', next: 'Continue' },

  errorSummaryHeading: 'There is a problem with this form',
  successHeading: 'Request sent',
  successBody:
    'We have your request and a copy is on its way to your inbox. We will come back to you with a price during opening hours.',
  failureHeading: 'That did not send',
  failureBody:
    'Something went wrong at our end. Please call the shop and we will take the details over the phone.',
} as const
