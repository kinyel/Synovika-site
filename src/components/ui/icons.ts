/**
 * Line icons on a 24 x 24 grid, drawn with a 1.6 stroke and round ends so they
 * match each other (raleston-web's set, extended for Synovika). Used through Icon.astro.
 */
export const ICONS = {
  // Services
  build: '<rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="8.5" y="3.5" width="7" height="7" rx="1.4"/>',
  bug: '<path d="M8.5 8.5a3.5 3.5 0 0 1 7 0"/><rect x="7" y="8.5" width="10" height="11" rx="5"/><path d="M12 12v7.5M3.5 13h3.5M17 13h3.5M4.5 8l3 2M19.5 8l-3 2M4.5 19l3-2M19.5 19l-3-2"/>',
  test: '<path d="M9 3.5h6M10 3.5v6L4.8 18.2A1.6 1.6 0 0 0 6.2 20.5h11.6a1.6 1.6 0 0 0 1.4-2.3L14 9.5v-6"/><path d="M7.5 14.5h9" opacity=".6"/>',
  spec: '<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8 8h1M11 8h5M8 12h1M11 12h5M8 16h1M11 16h3.5"/>',
  architecture: '<path d="M12 3 21 8l-9 5-9-5z"/><path d="m3 12.2 9 5 9-5"/><path d="m3 16.2 9 5 9-5" opacity=".55"/>',
  support: '<path d="M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="m8.8 12.2 2.2 2.2 4.4-4.6"/>',
  heartbeat: '<path d="M2.5 12.5h4l2.2-5.5 4.6 11 2.4-5.5h5.8"/>',
  // Products
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
  gate: '<path d="M3.5 20.5V6.5M20.5 20.5V6.5"/><path d="M3.5 9.5h17M3.5 13.5h17" /><path d="M7.5 9.5v4M11.5 9.5v4M15.5 9.5v4" opacity=".6"/><circle cx="3.5" cy="5" r="1.5"/><circle cx="20.5" cy="5" r="1.5"/>',
  browser: '<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M2.5 8.5h19"/><circle cx="5.5" cy="6.3" r=".6"/><circle cx="7.6" cy="6.3" r=".6"/><path d="M6.5 12.5h7M6.5 15.5h4.5" opacity=".7"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  // Industries
  estate: '<path d="M3.5 20.5V10l8.5-6 8.5 6v10.5"/><path d="M9.5 20.5v-6h5v6"/>',
  store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11.5v9h14v-9M10 20.5v-5h4v5"/>',
  school: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6 10.8v4.7c1.7 1.6 3.7 2.4 6 2.4s4.3-.8 6-2.4v-4.7M21.5 9v5"/>',
  hotel: '<path d="M3.5 20.5V5.5h17v15"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2"/><path d="M10 20.5v-3.5h4v3.5"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M9 7.5V5.8A1.3 1.3 0 0 1 10.3 4.5h3.4A1.3 1.3 0 0 1 15 5.8v1.7M3 12.5h18"/>',
  // Interface
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M9 7h8v8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cross: '<path d="M7 7l10 10M17 7 7 17"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 6.5 8.2 6.2 8.2-6.2"/>',
  phone: '<path d="M6.6 3.5h2.7l1.5 4.3-2 1.4a12 12 0 0 0 6 6l1.4-2 4.3 1.5v2.7A2.1 2.1 0 0 1 18.3 20 15.6 15.6 0 0 1 4 5.7a2.1 2.1 0 0 1 2.6-2.2z"/>',
  chat: '<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8 13.5h2M12.5 13.5h2M8 17h2" opacity=".7"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  book: '<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5h13v14h-13a2 2 0 0 0-2 2z"/><path d="M4.5 19.5a2 2 0 0 0 2 2h13v-4"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.2c2.3.2 3.7 1.7 4.1 4.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  integrations: '<circle cx="5.5" cy="12" r="2.6"/><circle cx="18.5" cy="5.5" r="2.6"/><circle cx="18.5" cy="18.5" r="2.6"/><path d="M8 11 16 6.5M8 13l8 4.5"/>',
  network: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/><path d="M4.5 11.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16v-5M11.5 16V7M16 16v-3"/><path d="m6 8 4-3 4 3 5-4" opacity=".6"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.3"/>',
  device: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  code: '<path d="m8.5 7.5-5 4.5 5 4.5M15.5 7.5l5 4.5-5 4.5M13.5 5l-3 14"/>',
  sparkle: '<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18.5 15.5c.3 1.6 1.1 2.4 2.7 2.7-1.6.3-2.4 1.1-2.7 2.7-.3-1.6-1.1-2.4-2.7-2.7 1.6-.3 2.4-1.1 2.7-2.7z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9s1.1-6.5 3.5-9z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2"/>',
} as const;

export type IconName = keyof typeof ICONS;
