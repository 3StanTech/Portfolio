// One source for every contact surface (header, footer, CTA, Services, JSON-LD).
export const contact = {
  email: 'tristandolfo@gmail.com',
  phoneDisplay: '+63 999 882 7004',
  phoneHref: 'tel:+639998827004',
  phoneE164: '+639998827004',
  defaultSubject: 'Portfolio inquiry',
  github: 'https://github.com/3StanTech',
  facebook: 'https://www.facebook.com/tristan.dolfo.7',
  resumeHref: '/Tristan_Dolfo_Resume.pdf',
} as const;

export const mailto = (subject: string = contact.defaultSubject) =>
  `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
