// Institutes and programs offered by Colegio de Montalban.
// The key is the program code that is stored in each student record.

export const INSTITUTES = {
  ICS: 'Institute of Computer Studies',
  IE: 'Institute of Education',
  IB: 'Institute of Business',
};

export const PROGRAMS = {
  BSIT: { name: 'Bachelor of Science in Information Technology', inst: 'ICS' },
  BSCPE: { name: 'Bachelor of Science in Computer Engineering', inst: 'ICS' },
  'BSEd-SCI': { name: 'Bachelor of Secondary Education major in Science', inst: 'IE' },
  'BEEd-GEN': { name: 'Bachelor of Elementary Education - Generalist', inst: 'IE' },
  'BEEd-ECED': { name: 'Bachelor of Early Childhood Education', inst: 'IE' },
  'BTLEd-ICT': { name: 'Bachelor of Technology and Livelihood Education major in Information and Communication Technology', inst: 'IE' },
  TCP: { name: 'Teacher Certificate Program (18 Units)', inst: 'IE' },
  'BSBA-HRM': { name: 'Bachelor of Science in Business Administration major in Human Resource Management', inst: 'IB' },
  BSE: { name: 'Bachelor of Science in Entrepreneurship', inst: 'IB' },
};

// "Bachelor of Science in Information Technology (BSIT)"
export const programName = (code) => (PROGRAMS[code] ? `${PROGRAMS[code].name} (${code})` : code);

// "Institute of Computer Studies"
export const instituteName = (code) => INSTITUTES[PROGRAMS[code]?.inst] || '';
