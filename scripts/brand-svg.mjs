// SVG del logo de AMPERIA (mismos trazos que src/components/brand/AmperiaLogo.tsx).
export const markPaths = `
  <clipPath id="__G__c"><rect x="0" y="0" width="200" height="164"/></clipPath>
  <g fill="none" stroke="url(#__G__)" stroke-linejoin="bevel" clip-path="url(#__G__c)">
    <path d="M8 184 L100 14 L138 84" stroke-width="30"/>
    <path d="M147 101 L192 184" stroke-width="30"/>
    <path d="M56 130 L99 104 L93 128 L156 92" stroke-width="15" stroke-linejoin="miter" stroke-miterlimit="8"/>
  </g>`;

export const gradientDef = (id) => `
  <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="10" y1="166" x2="190" y2="10">
    <stop offset="0" stop-color="#5B3FD6"/><stop offset="0.55" stop-color="#E83E9C"/><stop offset="1" stop-color="#FF8AC4"/>
  </linearGradient>`;

export const wordPaths = `
  <path d="M0 46 L18 4 L36 46"/><path d="M50 46 L50 4 L68 30 L86 4 L86 46"/>
  <path d="M101 46 L101 4 L118 4 Q132 4 132 17 Q132 30 118 30 L101 30"/>
  <path d="M172 4 L147 4 L147 46 L172 46 M147 25 L168 25"/>
  <path d="M186 46 L186 4 L203 4 Q217 4 217 17 Q217 30 203 30 L186 30 M202 30 L218 46"/>
  <path d="M234 4 L234 46"/><path d="M246 46 L264 4 L282 46"/>`;

export function fullLogo({ text = '#161B45' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260">
    <defs>${gradientDef('g')}</defs>
    <g transform="translate(50,10)" >${markPaths.replaceAll('__G__', 'g')}</g>
    <g transform="translate(9,200)" stroke="${text}" stroke-width="5.5" fill="none">${wordPaths}</g>
  </svg>`;
}

export function markOnly() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 170"><defs>${gradientDef('g')}</defs><g >${markPaths.replaceAll('__G__', 'g')}</g></svg>`;
}
