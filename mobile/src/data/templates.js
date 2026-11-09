// Ready-made notes for the Registrar. Tapping one fills the note box; it can be edited before saving.
// Every text must stay under 200 characters (the note limit).

export const TEMPLATES = {
  Submitted: [
    { label: 'Received', text: 'We received your request. The Registrar will review it soon.' },
  ],
  'Under Review': [
    { label: 'Checking details', text: 'The Registrar is checking your details and photo.' },
    { label: 'Visit the office', text: "Please visit the Registrar's Office. We need to check something on your record." },
  ],
  Approved: [
    { label: 'Approved', text: 'Your request is approved. Your ID will be sent for printing soon.' },
    { label: 'Affidavit received', text: 'We received your Affidavit of Loss. Your request is approved.' },
  ],
  'For Printing': [
    { label: 'Printing', text: 'Your ID is being printed. We will message you when it is ready.' },
  ],
  'Ready for Pickup': [
    { label: 'Ready', text: "Your ID is ready. Please claim it at the Registrar's Office." },
    { label: 'Bring a valid ID', text: 'Please bring a valid ID so we can confirm it is you.' },
  ],
  Claimed: [
    { label: 'Claimed', text: 'You have claimed your ID. Thank you!' },
  ],
};

// Quick reasons when rejecting a request.
export const REJECT_REASONS = [
  { label: 'Photo or signature', text: 'Your photo or signature is missing or unclear. Please see the Registrar.' },
  { label: "Details don't match", text: 'Your details do not match the Registrar record. Please see the Registrar.' },
  { label: 'No Affidavit of Loss', text: 'The Affidavit of Loss was not submitted. Please bring it to the Registrar.' },
  { label: 'Duplicate request', text: 'This looks like a duplicate request. You already have an ID being processed.' },
];
