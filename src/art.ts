export interface Art {
  name: string
  note: string
  svg: string
}

const svg = (name: string, body: string) =>
  `<svg viewBox="0 0 200 200" role="img" aria-label="${name}" fill="none" stroke="#1E1B2E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="100" cy="190" rx="66" ry="7" fill="#1E1B2E" stroke="none" opacity=".14"/>${body}</svg>`

const art = (name: string, note: string, body: string): Art => ({ name, note, svg: svg(name, body) })

export const SHORTS: Art[] = [
  art(
    'Cargo shorts',
    'Pocket snack: one emergency banana',
    `<path d="M144 102c2-20 14-34 30-36-10 10-12 22-12 36z" fill="#FFC93C"/><path d="M44 40H156L164 150H108L100 92L92 150H36Z" fill="#A3AB6E"/><path d="M44 40H156V58H44Z" fill="#8A925A"/><path d="M64 40v18M100 40v18M136 40v18" stroke-width="4"/><path d="M100 58v30M100 58c-10 6-14 18-12 30" stroke-width="3.5"/><rect x="44" y="98" width="34" height="34" rx="5" fill="#8A925A"/><path d="M42 98h38v11H42z" fill="#A3AB6E"/><circle cx="61" cy="104" r="2.5" fill="#1E1B2E" stroke="none"/><rect x="124" y="100" width="34" height="34" rx="5" fill="#8A925A"/><path d="M122 100h38v11h-38z" fill="#A3AB6E" transform="rotate(-8 122 100)"/><path d="M44 40H156L164 150H108L100 92L92 150H36Z"/>`,
  ),
  art(
    'Board shorts',
    'Hibiscus print, drawstring bow',
    `<path d="M46 40H154L162 164H108L100 96L92 164H38Z" fill="#FF7A59"/><path d="M52 56L44 164" stroke="#3FB8AF" stroke-width="12" stroke-linecap="butt"/><path d="M148 56L156 164" stroke="#3FB8AF" stroke-width="12" stroke-linecap="butt"/><g stroke="none" fill="#FFF3C4"><circle cx="72" cy="104" r="6"/><circle cx="82" cy="111" r="6"/><circle cx="78" cy="123" r="6"/><circle cx="66" cy="123" r="6"/><circle cx="62" cy="111" r="6"/></g><circle cx="72" cy="115" r="4" fill="#FFC93C" stroke="none"/><g stroke="none" fill="#FFF3C4"><circle cx="128" cy="124" r="5"/><circle cx="136" cy="130" r="5"/><circle cx="133" cy="140" r="5"/><circle cx="123" cy="140" r="5"/><circle cx="120" cy="130" r="5"/></g><circle cx="128" cy="134" r="3.5" fill="#FFC93C" stroke="none"/><g stroke="none" fill="#FFF3C4"><circle cx="124" cy="70" r="4"/><circle cx="130" cy="75" r="4"/><circle cx="127" cy="82" r="4"/><circle cx="120" cy="82" r="4"/><circle cx="118" cy="75" r="4"/></g><circle cx="124" cy="77" r="3" fill="#FFC93C" stroke="none"/><path d="M46 40H154V56H46Z" fill="#E85E3D"/><path d="M100 56c-6 14-14 22-22 26M100 56c6 14 16 20 24 22" stroke-width="4"/><circle cx="100" cy="56" r="5" fill="#FFF3C4"/><path d="M46 40H154L162 164H108L100 96L92 164H38Z"/>`,
  ),
  art(
    'Short shorts',
    'Retro piping and a little heart',
    `<path d="M48 44H152L162 120Q136 110 108 120L100 92L92 120Q64 110 38 120Z" fill="#3FB8AF"/><path d="M54 60L46 114" stroke="#FFF3C4" stroke-width="6"/><path d="M146 60L154 114" stroke="#FFF3C4" stroke-width="6"/><path d="M48 44H152V60H48Z" fill="#2E9A92"/><path d="M70 82c-6-8-18-2-12 8l12 10 12-10c6-10-6-16-12-8z" fill="#FF7A59" stroke-width="3.5"/><path d="M126 74l4 8M134 72l2 9" stroke-width="3"/><path d="M48 44H152L162 120Q136 110 108 120L100 92L92 120Q64 110 38 120Z"/>`,
  ),
  art(
    'Jorts',
    'Frayed hem, gold stitching, star patch',
    `<path d="M44 40H156L162 140H108L100 90L92 140H38Z" fill="#4A7BC8"/><path d="M44 40H156V56H44Z" fill="#3A66AC"/><path d="M52 58c18 2 26 12 28 24M148 58c-18 2-26 12-28 24" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M104 58v26c0 4-4 6-8 6" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M62 40v16M138 40v16" stroke-width="4"/><path d="M130 102l7 12 13 1-9 9 3 13-12-7-11 7 3-13-10-9 13-1z" fill="#FFC93C" stroke-width="3.5"/><path d="M58 108c6-4 14-4 20 0M58 116c6 4 14 4 20 0" stroke="#EAF2FC" stroke-width="3"/><path d="M44 40H156L162 140H108L100 90L92 140H38Z"/><path d="M40 140l-2 10M48 140l1 12M56 140l-2 9M64 140l1 12M72 140l-1 10M80 140l2 11M88 140l-1 9M112 140l-2 11M120 140l1 9M128 140l-1 12M136 140l2 9M144 140l-1 12M152 140l1 10M160 140l-2 11" stroke="#4A7BC8" stroke-width="3.5"/>`,
  ),
  art(
    'Bike shorts',
    'Lycra with a hi-vis stripe',
    `<path d="M54 40H146L152 140H108L100 92L92 140H48Z" fill="#3A3550"/><path d="M59 56L53 128M141 56L147 128" stroke="#FFC93C" stroke-width="7"/><path d="M54 40H146V56H54Z" fill="#2A263A"/><path d="M49 128H92V140H49Z" fill="#2A263A"/><path d="M108 128H151V140H108Z" fill="#2A263A"/><circle cx="134" cy="48" r="4" fill="#FF7A59" stroke="none"/><path d="M76 70c4 4 10 4 14 0" stroke="#FFF3C4" stroke-width="3" opacity=".6"/><path d="M54 40H146L152 140H108L100 92L92 140H48Z"/>`,
  ),
  art(
    'Swim trunks',
    'Sailor stripes and one small fish',
    `<clipPath id="sop-swim-clip"><path d="M46 40H154L160 128H108L100 90L92 128H40Z"/></clipPath><path d="M46 40H154L160 128H108L100 90L92 128H40Z" fill="#FFF3C4"/><g clip-path="url(#sop-swim-clip)" fill="#4A7BC8" stroke="none"><rect x="30" y="62" width="140" height="10"/><rect x="30" y="82" width="140" height="10"/><rect x="30" y="102" width="140" height="10"/><rect x="30" y="122" width="140" height="10"/></g><path d="M46 40H154V56H46Z" fill="#3FB8AF"/><path d="M96 56c-2 10-8 16-14 18M104 56c2 10 8 16 14 18" stroke-width="3.5"/><path d="M58 100c4-7 14-7 18 0-4 7-14 7-18 0zM76 100l8-6v12z" fill="#FF7A59" stroke-width="3"/><circle cx="63" cy="99" r="1.6" fill="#1E1B2E" stroke="none"/><path d="M46 40H154L160 128H108L100 90L92 128H40Z"/>`,
  ),
  art(
    'Tennis shorts',
    'Crisp pleats, ball in the pocket',
    `<circle cx="140" cy="92" r="15" fill="#FFC93C"/><path d="M128 84c6 4 6 12 0 16M152 84c-6 4-6 12 0 16" stroke="#FFF3C4" stroke-width="3"/><path d="M46 40H154L162 136H108L100 90L92 136H38Z" fill="#FAF7EE"/><path d="M66 58L62 132M80 58L78 132M134 58L138 132M120 58L122 132" stroke="#D6D0BF" stroke-width="3"/><path d="M46 40H154V56H46Z" fill="#FAF7EE"/><path d="M46 48H154" stroke="#3FB8AF" stroke-width="5"/><path d="M126 96c8-2 20-2 28 0" stroke-width="4"/><path d="M46 40H154L162 136H108L100 90L92 136H38Z"/>`,
  ),
  art(
    'Basketball shorts',
    'Knee-length, number 23',
    `<path d="M42 40H158L168 170H106L100 100L94 170H32Z" fill="#8A6FD0"/><path d="M42 40L32 170H50L58 56Z" fill="#FFC93C"/><path d="M158 40L168 170H150L142 56Z" fill="#FFC93C"/><path d="M42 40H158V58H42Z" fill="#6F55B8"/><path d="M32 158H94M106 158H168" stroke-width="3.5"/><text x="74" y="124" text-anchor="middle" font-family="'Bagel Fat One', system-ui" font-size="30" fill="#FFF3C4" stroke="#1E1B2E" stroke-width="2.5" paint-order="stroke">23</text><path d="M42 40H158L168 170H106L100 100L94 170H32Z"/>`,
  ),
  art(
    'Bermuda shorts',
    'Teal plaid, turned-up cuffs',
    `<clipPath id="sop-bermuda-clip"><path d="M46 40H154L158 162H108L100 94L92 162H42Z"/></clipPath><path d="M46 40H154L158 162H108L100 94L92 162H42Z" fill="#3FB8AF"/><g clip-path="url(#sop-bermuda-clip)" stroke="none"><g fill="#FF7A59" opacity=".75"><rect x="58" y="40" width="7" height="130"/><rect x="80" y="40" width="7" height="130"/><rect x="114" y="40" width="7" height="130"/><rect x="136" y="40" width="7" height="130"/></g><g fill="#FFF3C4" opacity=".8"><rect x="30" y="76" width="140" height="5"/><rect x="30" y="104" width="140" height="5"/><rect x="30" y="132" width="140" height="5"/></g></g><path d="M46 40H154V56H46Z" fill="#2E9A92"/><path d="M64 40v16M100 40v16M136 40v16" stroke-width="4"/><path d="M42 150H92V162H42Z" fill="#2E9A92"/><path d="M108 150H158V162H108Z" fill="#2E9A92"/><path d="M46 40H154L158 162H108L100 94L92 162H42Z"/>`,
  ),
  art(
    'Rugby shorts',
    'Very short. Still muddy from Saturday.',
    `<path d="M50 44H150L160 114H108L100 88L92 114H40Z" fill="#2D4A7A"/><path d="M55 58L46 112M145 58L154 112" stroke="#FFF3C4" stroke-width="6"/><path d="M50 44H150V58H50Z" fill="#223A62"/><path d="M66 82c6-6 16-4 18 2 2 8-8 12-14 8-4 6-12 0-8-6z" fill="#8A5A3C" stroke="none"/><path d="M128 96c4-3 10-2 10 2s-6 5-10 2z" fill="#8A5A3C" stroke="none"/><circle cx="120" cy="80" r="3" fill="#8A5A3C" stroke="none"/><path d="M50 44H150L160 114H108L100 88L92 114H40Z"/>`,
  ),
]

export const PANTS: Art[] = [
  art(
    'Chinos',
    'Pressed crease, rolled cuffs, loose tag',
    `<path d="M50 30H150L158 184H110L100 80L90 184H42Z" fill="#D9B57E"/><path d="M50 30H150V46H50Z" fill="#C29C62"/><path d="M66 30v16M100 30v16M134 30v16" stroke-width="4"/><path d="M70 50L66 168M130 50L134 168" stroke="#B48C52" stroke-width="3"/><path d="M56 48c8 4 12 12 12 22M144 48c-8 4-12 12-12 22" stroke-width="3.5"/><path d="M100 46v28" stroke-width="3.5"/><path d="M42 168H90V184H42Z" fill="#C29C62"/><path d="M110 168H158V184H110Z" fill="#C29C62"/><path d="M138 22h14v16h-14z" fill="#FF7A59" stroke-width="3.5" transform="rotate(12 145 30)"/><path d="M50 30H150L158 184H110L100 80L90 184H42Z"/>`,
  ),
  art(
    'Joggers',
    'Racing stripe, aglets, elastic cuffs',
    `<path d="M48 30H152L150 116L144 170H110L100 80L90 170H56L50 116Z" fill="#A3A9BC"/><path d="M54 54L56 116L60 160" stroke="#FFC93C" stroke-width="8"/><path d="M146 54L144 116L140 160" stroke="#FFC93C" stroke-width="8"/><path d="M48 30H152V54H48Z" fill="#7D8499"/><path d="M60 34v16M72 34v16M84 34v16M116 34v16M128 34v16M140 34v16" stroke-width="2.5" opacity=".55"/><path d="M95 54c-2 12-6 22-12 30M105 54c2 12 6 22 12 30" stroke-width="3.5"/><rect x="78" y="82" width="8" height="10" rx="3" fill="#FF7A59" stroke-width="3" transform="rotate(30 82 87)"/><rect x="114" y="82" width="8" height="10" rx="3" fill="#FF7A59" stroke-width="3" transform="rotate(-30 118 87)"/><path d="M58 164H90V184H58Z" fill="#7D8499"/><path d="M110 164H142V184H110Z" fill="#7D8499"/><path d="M48 30H152L150 116L144 170H110L100 80L90 170H56L50 116Z"/>`,
  ),
  art(
    'Corduroys',
    'Ribbed rust with a knee patch',
    `<clipPath id="sop-cords-clip"><path d="M50 30H150L156 184H110L100 80L90 184H44Z"/></clipPath><path d="M50 30H150L156 184H110L100 80L90 184H44Z" fill="#C26A3E"/><g clip-path="url(#sop-cords-clip)" stroke="#A5552C" stroke-width="3"><path d="M54 46V190M62 46V190M70 46V190M78 46V190M86 46V190M94 46V190M106 46V190M114 46V190M122 46V190M130 46V190M138 46V190M146 46V190M154 46V190"/></g><path d="M50 30H150V46H50Z" fill="#A5552C"/><path d="M66 30v16M100 30v16M134 30v16" stroke-width="4"/><rect x="116" y="112" width="30" height="28" rx="9" fill="#FFC93C" stroke-width="4"/><rect x="121" y="117" width="20" height="18" rx="5" stroke-width="2.5" stroke-dasharray="4 4"/><path d="M100 46v28" stroke-width="3.5"/><path d="M50 30H150L156 184H110L100 80L90 184H44Z"/>`,
  ),
  art(
    'Flares',
    'Purple velvet, flower embroidery',
    `<path d="M54 30H146L150 128L174 184H108L100 80L92 184H26L50 128Z" fill="#8A6FD0"/><path d="M54 30H146V46H54Z" fill="#6F55B8"/><path d="M72 30v16M128 30v16" stroke-width="4"/><path d="M60 48c8 4 12 12 12 22M140 48c-8 4-12 12-12 22" stroke-width="3.5"/><g stroke="none" fill="#FFC93C"><circle cx="58" cy="160" r="7"/><circle cx="68" cy="166" r="7"/><circle cx="64" cy="177" r="7"/><circle cx="52" cy="177" r="7"/><circle cx="48" cy="166" r="7"/></g><circle cx="58" cy="170" r="5" fill="#FF7A59" stroke-width="3"/><path d="M76 150c4-6 10-8 16-6" stroke="#3FB8AF" stroke-width="4"/><path d="M130 92l5 9 10 1-7 7 2 10-10-5-9 5 2-10-7-7 10-1z" fill="#FFF3C4" stroke-width="3.5"/><path d="M54 30H146L150 128L174 184H108L100 80L92 184H26L50 128Z"/>`,
  ),
  art(
    'Cargo pants',
    'Knee pockets and a carabiner',
    `<path d="M50 30H150L156 180H110L100 80L90 180H44Z" fill="#A3AB6E"/><path d="M50 30H150V46H50Z" fill="#8A925A"/><path d="M66 30v16M134 30v16" stroke-width="4"/><circle cx="66" cy="54" r="7" stroke-width="4"/><rect x="48" y="100" width="32" height="38" rx="5" fill="#8A925A"/><path d="M46 100h36v11H46z" fill="#A3AB6E"/><rect x="120" y="100" width="32" height="38" rx="5" fill="#8A925A"/><path d="M118 100h36v11h-36z" fill="#A3AB6E"/><path d="M100 46v28" stroke-width="3.5"/><path d="M44 172H90M110 172H156" stroke-width="3.5"/><path d="M60 180c-4 6-10 8-14 6M140 180c4 6 10 8 14 6" stroke="#FF7A59" stroke-width="4"/><path d="M50 30H150L156 180H110L100 80L90 180H44Z"/>`,
  ),
  art(
    'Skinny jeans',
    'Dark denim, ripped knees',
    `<path d="M50 30H150L140 184H110L100 80L90 184H60Z" fill="#2F4E86"/><path d="M50 30H150V46H50Z" fill="#243F70"/><path d="M56 48c14 2 20 10 22 22M144 48c-14 2-20 10-22 22M104 46v26" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M64 30v16M136 30v16" stroke-width="4"/><path d="M64 122h20M65 128h18M66 134h16" stroke="#EAF2FC" stroke-width="3"/><path d="M118 112h18M118 118h17" stroke="#EAF2FC" stroke-width="3"/><path d="M50 30H150L140 184H110L100 80L90 184H60Z"/>`,
  ),
  art(
    'Dungarees',
    'Brass buttons, pencil in the bib',
    `<path d="M72 20L60 4M128 20L140 4" stroke="#4A7BC8" stroke-width="12"/><path d="M72 20L60 4M128 20L140 4" stroke-width="5" opacity="0"/><path d="M68 16H132V54H68Z" fill="#4A7BC8"/><path d="M50 54H150L156 186H110L100 100L90 186H44Z" fill="#4A7BC8"/><rect x="86" y="26" width="28" height="20" rx="3" fill="#3A66AC"/><path d="M108 26V12" stroke="#FF7A59" stroke-width="5"/><circle cx="76" cy="22" r="5" fill="#FFC93C"/><circle cx="124" cy="22" r="5" fill="#FFC93C"/><path d="M60 70c8 2 12 8 12 18M140 70c-8 2-12 8-12 18" stroke="#FFC93C" stroke-width="3" stroke-dasharray="5 5"/><path d="M44 172H90M110 172H156" stroke-width="3.5"/><path d="M68 16H132V54H68Z"/><path d="M50 54H150L156 186H110L100 100L90 186H44Z"/>`,
  ),
  art(
    'Track pants',
    'Popper sides, ready to rip off',
    `<path d="M48 30H152L154 184H110L100 80L90 184H46Z" fill="#3FB8AF"/><path d="M56 50L54 182M144 50L146 182" stroke="#FFF3C4" stroke-width="10" stroke-linecap="butt"/><g fill="#FFC93C" stroke-width="2.5"><circle cx="54" cy="146" r="3.5"/><circle cx="54" cy="160" r="3.5"/><circle cx="54" cy="174" r="3.5"/><circle cx="146" cy="146" r="3.5"/><circle cx="146" cy="160" r="3.5"/><circle cx="146" cy="174" r="3.5"/></g><path d="M48 30H152V50H48Z" fill="#2E9A92"/><path d="M62 34v12M76 34v12M90 34v12M110 34v12M124 34v12M138 34v12" stroke-width="2.5" opacity=".5"/><path d="M92 66h16" stroke-width="4"/><path d="M48 30H152L154 184H110L100 80L90 184H46Z"/>`,
  ),
  art(
    'Pyjama pants',
    'Moons and stars. WFH approved.',
    `<path d="M48 30H152L160 184H108L100 82L92 184H40Z" fill="#FFF3C4"/><g fill="#8A6FD0" stroke="none"><path d="M66 70a10 10 0 1 0 12 13 8 8 0 0 1-12-13z"/><path d="M128 118a9 9 0 1 0 11 12 7 7 0 0 1-11-12z"/><path d="M60 150a8 8 0 1 0 10 10 6 6 0 0 1-10-10z"/></g><path d="M82 112v8M78 116h8M130 74v8M126 78h8M140 160v8M136 164h8M114 60v6M111 63h6" stroke="#FF7A59" stroke-width="3"/><path d="M48 30H152V46H48Z" fill="#8A6FD0"/><path d="M96 46c-2 10-6 16-12 20M104 46c2 10 6 16 12 20" stroke-width="3.5"/><path d="M40 172H92M108 172H160" stroke-width="3.5"/><path d="M48 30H152L160 184H108L100 82L92 184H40Z"/>`,
  ),
  art(
    'Rain pants',
    'Waterproof, reflective, beaded with rain',
    `<path d="M48 30H152L158 184H110L100 80L90 184H42Z" fill="#FFC93C"/><path d="M45 146H91V158H45Z" fill="#DDE0EA"/><path d="M109 146H156V158H109Z" fill="#DDE0EA"/><path d="M48 30H152V46H48Z" fill="#E8AE1E"/><path d="M100 46v28M66 50l-2 20M134 50l2 20" stroke-width="3.5"/><g fill="#FFFFFF" stroke-width="2.5"><path d="M70 96q-5 8 0 11q5-3 0-11z"/><path d="M82 122q-4 7 0 9q4-2 0-9z"/><path d="M126 92q-5 8 0 11q5-3 0-11z"/><path d="M138 120q-4 7 0 9q4-2 0-9z"/><path d="M120 170q-4 7 0 9q4-2 0-9z"/></g><path d="M42 176H90M110 176H158" stroke-width="3.5"/><path d="M48 30H152L158 184H110L100 80L90 184H42Z"/>`,
  ),
]

const mystery = (outline: string) =>
  svg('Not found yet', `<path d="${outline}" fill="#1E1B2E"/>`)

export const LOCKED: Record<'shorts' | 'pants', string> = {
  shorts: mystery('M44 40H156L164 150H108L100 92L92 150H36Z'),
  pants: mystery('M54 22H146L158 182H112L100 78L88 182H42Z'),
}
