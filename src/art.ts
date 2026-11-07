export interface Art {
  name: string
  svg: string
}

const svg = (body: string) =>
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke="#1d1d1f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" role="img">${body}</svg>`

export const SHORTS: Art[] = [
  {
    name: 'Cargo shorts',
    svg: svg(
      `<path d="M50 44 H150 L162 135 H108 L100 80 L92 135 H38 Z" fill="#c8a165"/><rect x="50" y="30" width="100" height="16" rx="3" fill="#a9844c"/><rect x="44" y="88" width="26" height="24" rx="3" fill="#b38e55"/><rect x="130" y="88" width="26" height="24" rx="3" fill="#b38e55"/>`,
    ),
  },
  {
    name: 'Board shorts',
    svg: svg(
      `<path d="M50 44 H150 L160 140 H108 L100 80 L92 140 H40 Z" fill="#2fb5c9"/><rect x="50" y="30" width="100" height="16" rx="3" fill="#ff7a59"/><path d="M47 70 L80 70 M48 95 L86 95 M120 70 L153 70 M114 95 L156 95" stroke="#ffd166" stroke-width="6"/><path d="M95 30 L90 52 M105 30 L110 52" />`,
    ),
  },
  {
    name: 'Short shorts',
    svg: svg(
      `<path d="M52 50 H148 L156 108 H108 L100 82 L92 108 H44 Z" fill="#ff5d8f"/><rect x="52" y="36" width="96" height="16" rx="3" fill="#fff"/><path d="M46 100 L92 100 M108 100 L154 100" stroke="#fff" stroke-width="5"/>`,
    ),
  },
  {
    name: 'Jorts',
    svg: svg(
      `<path d="M50 44 H150 L160 132 H108 L100 80 L92 132 H40 Z" fill="#5b8bd0"/><rect x="50" y="30" width="100" height="16" rx="3" fill="#4a76b5"/><path d="M40 132 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 M108 132 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8 l4 8 l4 -8" fill="none" stroke-width="2"/><circle cx="100" cy="38" r="3" fill="#e0b050"/>`,
    ),
  },
]

export const PANTS: Art[] = [
  {
    name: 'Chinos',
    svg: svg(
      `<path d="M62 40 H138 L148 186 H108 L100 84 L92 186 H52 Z" fill="#d9c49a"/><rect x="62" y="26" width="76" height="16" rx="3" fill="#bfa878"/><path d="M78 60 L74 180 M122 60 L126 180" stroke-width="2" opacity=".4"/>`,
    ),
  },
  {
    name: 'Joggers',
    svg: svg(
      `<path d="M60 40 H140 L146 166 H110 L100 84 L90 166 H54 Z" fill="#6b7280"/><rect x="60" y="26" width="80" height="16" rx="6" fill="#4b5563"/><rect x="54" y="164" width="36" height="18" rx="6" fill="#4b5563"/><rect x="110" y="164" width="36" height="18" rx="6" fill="#4b5563"/><path d="M94 42 L90 62 M106 42 L110 62" stroke="#f3f4f6"/>`,
    ),
  },
  {
    name: 'Flares',
    svg: svg(
      `<path d="M64 40 H136 L138 130 L160 186 H106 L100 84 L94 186 H40 L62 130 Z" fill="#7c5cbf"/><rect x="64" y="26" width="72" height="16" rx="3" fill="#ff9f1c"/>`,
    ),
  },
  {
    name: 'Corduroys',
    svg: svg(
      `<path d="M62 40 H138 L148 186 H108 L100 84 L92 186 H52 Z" fill="#a0522d"/><rect x="62" y="26" width="76" height="16" rx="3" fill="#7f3f22"/><path d="M60 60 L56 180 M70 60 L66 180 M80 60 L78 180 M120 60 L122 180 M130 60 L134 180 M140 60 L144 180" stroke-width="2" opacity=".35"/>`,
    ),
  },
]
