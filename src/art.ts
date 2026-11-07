export interface Art {
  name: string
  svg: string
}

const svg = (name: string, body: string) =>
  `<svg viewBox="0 0 200 200" role="img" aria-label="${name}" fill="none" stroke="#1E1B2E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="100" cy="190" rx="66" ry="7" fill="#1E1B2E" stroke="none" opacity=".14"/>${body}</svg>`

const art = (name: string, body: string): Art => ({ name, svg: svg(name, body) })

export const SHORTS: Art[] = [
  art(
    'Cargo shorts',
    `<path d="M144 102c2-20 14-34 30-36-10 10-12 22-12 36z" fill="#FFC93C"/><path d="M44 40H156L164 150H108L100 92L92 150H36Z" fill="#A3AB6E"/><path d="M44 40H156V58H44Z" fill="#8A925A"/><path d="M64 40v18M100 40v18M136 40v18" stroke-width="4"/><path d="M100 58v30M100 58c-10 6-14 18-12 30" stroke-width="3.5"/><rect x="44" y="98" width="34" height="34" rx="5" fill="#8A925A"/><path d="M42 98h38v11H42z" fill="#A3AB6E"/><circle cx="61" cy="104" r="2.5" fill="#1E1B2E" stroke="none"/><rect x="124" y="100" width="34" height="34" rx="5" fill="#8A925A"/><path d="M122 100h38v11h-38z" fill="#A3AB6E" transform="rotate(-8 122 100)"/><path d="M44 40H156L164 150H108L100 92L92 150H36Z"/>`,
  ),
  art(
    'Board shorts',
    `<path d="M46 40H154L162 164H108L100 96L92 164H38Z" fill="#FF7A59"/><path d="M52 56L44 164" stroke="#3FB8AF" stroke-width="12" stroke-linecap="butt"/><path d="M148 56L156 164" stroke="#3FB8AF" stroke-width="12" stroke-linecap="butt"/><g stroke="none" fill="#FFF3C4"><circle cx="72" cy="104" r="6"/><circle cx="82" cy="111" r="6"/><circle cx="78" cy="123" r="6"/><circle cx="66" cy="123" r="6"/><circle cx="62" cy="111" r="6"/></g><circle cx="72" cy="115" r="4" fill="#FFC93C" stroke="none"/><g stroke="none" fill="#FFF3C4"><circle cx="128" cy="124" r="5"/><circle cx="136" cy="130" r="5"/><circle cx="133" cy="140" r="5"/><circle cx="123" cy="140" r="5"/><circle cx="120" cy="130" r="5"/></g><circle cx="128" cy="134" r="3.5" fill="#FFC93C" stroke="none"/><g stroke="none" fill="#FFF3C4"><circle cx="124" cy="70" r="4"/><circle cx="130" cy="75" r="4"/><circle cx="127" cy="82" r="4"/><circle cx="120" cy="82" r="4"/><circle cx="118" cy="75" r="4"/></g><circle cx="124" cy="77" r="3" fill="#FFC93C" stroke="none"/><path d="M46 40H154V56H46Z" fill="#E85E3D"/><path d="M100 56c-6 14-14 22-22 26M100 56c6 14 16 20 24 22" stroke-width="4"/><circle cx="100" cy="56" r="5" fill="#FFF3C4"/><path d="M46 40H154L162 164H108L100 96L92 164H38Z"/>`,
  ),
  art(
    'Short shorts',
    `<path d="M48 44H152L162 120Q136 110 108 120L100 92L92 120Q64 110 38 120Z" fill="#3FB8AF"/><path d="M54 60L46 114" stroke="#FFF3C4" stroke-width="6"/><path d="M146 60L154 114" stroke="#FFF3C4" stroke-width="6"/><path d="M48 44H152V60H48Z" fill="#2E9A92"/><path d="M70 82c-6-8-18-2-12 8l12 10 12-10c6-10-6-16-12-8z" fill="#FF7A59" stroke-width="3.5"/><path d="M126 74l4 8M134 72l2 9" stroke-width="3"/><path d="M48 44H152L162 120Q136 110 108 120L100 92L92 120Q64 110 38 120Z"/>`,
  ),
  art(
    'Jorts',
    `<path d="M44 40H156L162 140H108L100 90L92 140H38Z" fill="#4A7BC8"/><path d="M44 40H156V56H44Z" fill="#3A66AC"/><path d="M52 58c18 2 26 12 28 24M148 58c-18 2-26 12-28 24" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M104 58v26c0 4-4 6-8 6" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M62 40v16M138 40v16" stroke-width="4"/><path d="M130 102l7 12 13 1-9 9 3 13-12-7-11 7 3-13-10-9 13-1z" fill="#FFC93C" stroke-width="3.5"/><path d="M58 108c6-4 14-4 20 0M58 116c6 4 14 4 20 0" stroke="#EAF2FC" stroke-width="3"/><path d="M44 40H156L162 140H108L100 90L92 140H38Z"/><path d="M40 140l-2 10M48 140l1 12M56 140l-2 9M64 140l1 12M72 140l-1 10M80 140l2 11M88 140l-1 9M112 140l-2 11M120 140l1 9M128 140l-1 12M136 140l2 9M144 140l-1 12M152 140l1 10M160 140l-2 11" stroke="#4A7BC8" stroke-width="3.5"/>`,
  ),
]

export const PANTS: Art[] = [
  art(
    'Chinos',
    `<path d="M50 30H150L158 184H110L100 80L90 184H42Z" fill="#D9B57E"/><path d="M50 30H150V46H50Z" fill="#C29C62"/><path d="M66 30v16M100 30v16M134 30v16" stroke-width="4"/><path d="M70 50L66 168M130 50L134 168" stroke="#B48C52" stroke-width="3"/><path d="M56 48c8 4 12 12 12 22M144 48c-8 4-12 12-12 22" stroke-width="3.5"/><path d="M100 46v28" stroke-width="3.5"/><path d="M42 168H90V184H42Z" fill="#C29C62"/><path d="M110 168H158V184H110Z" fill="#C29C62"/><path d="M138 22h14v16h-14z" fill="#FF7A59" stroke-width="3.5" transform="rotate(12 145 30)"/><path d="M50 30H150L158 184H110L100 80L90 184H42Z"/>`,
  ),
  art(
    'Joggers',
    `<path d="M48 30H152L150 116L144 170H110L100 80L90 170H56L50 116Z" fill="#A3A9BC"/><path d="M54 54L56 116L60 160" stroke="#FFC93C" stroke-width="8"/><path d="M146 54L144 116L140 160" stroke="#FFC93C" stroke-width="8"/><path d="M48 30H152V54H48Z" fill="#7D8499"/><path d="M60 34v16M72 34v16M84 34v16M116 34v16M128 34v16M140 34v16" stroke-width="2.5" opacity=".55"/><path d="M95 54c-2 12-6 22-12 30M105 54c2 12 6 22 12 30" stroke-width="3.5"/><rect x="78" y="82" width="8" height="10" rx="3" fill="#FF7A59" stroke-width="3" transform="rotate(30 82 87)"/><rect x="114" y="82" width="8" height="10" rx="3" fill="#FF7A59" stroke-width="3" transform="rotate(-30 118 87)"/><path d="M58 164H90V184H58Z" fill="#7D8499"/><path d="M110 164H142V184H110Z" fill="#7D8499"/><path d="M48 30H152L150 116L144 170H110L100 80L90 170H56L50 116Z"/>`,
  ),
  art(
    'Corduroys',
    `<clipPath id="sop-cords-clip"><path d="M50 30H150L156 184H110L100 80L90 184H44Z"/></clipPath><path d="M50 30H150L156 184H110L100 80L90 184H44Z" fill="#C26A3E"/><g clip-path="url(#sop-cords-clip)" stroke="#A5552C" stroke-width="3"><path d="M54 46V190M62 46V190M70 46V190M78 46V190M86 46V190M94 46V190M106 46V190M114 46V190M122 46V190M130 46V190M138 46V190M146 46V190M154 46V190"/></g><path d="M50 30H150V46H50Z" fill="#A5552C"/><path d="M66 30v16M100 30v16M134 30v16" stroke-width="4"/><rect x="116" y="112" width="30" height="28" rx="9" fill="#FFC93C" stroke-width="4"/><rect x="121" y="117" width="20" height="18" rx="5" stroke-width="2.5" stroke-dasharray="4 4"/><path d="M100 46v28" stroke-width="3.5"/><path d="M50 30H150L156 184H110L100 80L90 184H44Z"/>`,
  ),
  art(
    'Flares',
    `<path d="M54 30H146L150 128L174 184H108L100 80L92 184H26L50 128Z" fill="#8A6FD0"/><path d="M54 30H146V46H54Z" fill="#6F55B8"/><path d="M72 30v16M128 30v16" stroke-width="4"/><path d="M60 48c8 4 12 12 12 22M140 48c-8 4-12 12-12 22" stroke-width="3.5"/><g stroke="none" fill="#FFC93C"><circle cx="58" cy="160" r="7"/><circle cx="68" cy="166" r="7"/><circle cx="64" cy="177" r="7"/><circle cx="52" cy="177" r="7"/><circle cx="48" cy="166" r="7"/></g><circle cx="58" cy="170" r="5" fill="#FF7A59" stroke-width="3"/><path d="M76 150c4-6 10-8 16-6" stroke="#3FB8AF" stroke-width="4"/><path d="M130 92l5 9 10 1-7 7 2 10-10-5-9 5 2-10-7-7 10-1z" fill="#FFF3C4" stroke-width="3.5"/><path d="M54 30H146L150 128L174 184H108L100 80L92 184H26L50 128Z"/>`,
  ),
]
