import { ref } from 'vue'

export type Lang = 'it' | 'en'
const KEY = 'lang'

function initial(): Lang {
    try {
        const s = localStorage.getItem(KEY)
        if (s === 'it' || s === 'en') return s
    } catch { /* ignora */ }
    return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'it'
}

// ssr: false, quindi un ref a livello di modulo è condiviso da tutta l'app
export const lang = ref<Lang>(initial())

export function setLang(l: Lang) {
    lang.value = l
    try { localStorage.setItem(KEY, l) } catch { /* ignora */ }
}

const it = {
    'nav.home': '‹ Home',
    'nav.back': '‹ Indietro',
    'nav.sessions': 'Sessioni',
    'nav.coach': 'Coach AI',
    'nav.sections': 'Sezioni',
    'common.arrows': 'frecce',
    'common.avg': 'media',

    'home.title': 'Allenamento',
    'home.resume': 'Riprendi la sessione a {d} m',
    'home.distance': 'Distanza (m)',
    'home.minus': 'Meno 5 metri',
    'home.plus': 'Più 5 metri',
    'home.perEnd': 'Frecce per volée',
    'home.start': 'Inizia',
    'lang.label': 'Lingua',

    'sessions.title': 'Sessioni',
    'sessions.empty': 'Nessuna sessione ancora. Torna alla home e premi Inizia.',

    's.finish': 'Fine',
    's.summary': '{n} frecce, media {a}',
    's.fast': 'Rapida',
    's.precise': 'Precisa',
    's.faceAria': 'Faccia del bersaglio',
    's.howWent': 'Com’è andata?',
    's.noArrows': 'Nessuna freccia registrata',
    's.notePh': 'Nota veloce (facoltativa)',
    's.save': 'Salva sessione',
    's.discard': 'Elimina sessione',
    's.continue': 'Continua a tirare',
    's.undo': 'Annulla ultima freccia',

    'h.meta': '{d} m, {n} frecce per volée',
    'h.feeling': 'sensazione {n}/5',
    'h.open': 'Sessione ancora aperta: riprendi',
    'h.total': 'totale',
    'h.ends': 'Volée',
    'h.none': 'Nessuna freccia registrata.',
    'h.plot': 'Rosata',
    'h.quick': 'Sessione in modalità rapida: nessun dato di rosata.',
    'h.partial': 'Rosata su {a} frecce su {b}: le altre sono state inserite in modalità rapida.',
    'h.byEnd': 'Colore per volée',
    'h.right': 'a destra',
    'h.left': 'a sinistra',
    'h.up': 'in alto',
    'h.down': 'in basso',
    'h.spread': 'dispersione',
    'h.coach': 'Commento del Coach AI',
    'h.delete': 'Elimina sessione',
    'h.delTitle': 'Eliminare questa sessione?',
    'h.delBody': 'Verranno cancellate {n} frecce. L’operazione non si può annullare.',
    'h.delBodyOpen': 'Verranno cancellate {n} frecce e la sessione è ancora in corso. L’operazione non si può annullare.',
    'h.delYes': 'Sì, elimina',
    'h.cancel': 'Annulla',

    'rosa.aria': 'Rosata della sessione',

    'c.title': 'Coach AI',
    'c.pick': 'Scegli la sessione da analizzare.',
    'c.empty': 'Nessuna sessione conclusa da analizzare.',
    'c.loading': 'Il coach sta leggendo la sessione…',
    'c.stillUsable': 'L’app resta utilizzabile: il coach serve solo per il commento.',
    'c.retry': 'Riprova',
    'c.settingsShort': 'Impostazioni',
    'c.exercises': 'Esercizi consigliati',
    'c.other': 'Scegli un’altra sessione',
    'c.settingsOpen': 'Impostazioni coach',
    'c.settingsClose': 'Chiudi impostazioni',
    'c.urlLabel': 'Indirizzo del backend',
    'c.save': 'Salva',
    'c.test': 'Prova connessione',
    'c.testing': 'Provo…',
    'c.urlBad': 'L’indirizzo deve iniziare con http:// o https://',
    'c.urlReset': 'Ripristinato l’indirizzo predefinito.',
    'c.urlSaved': 'Indirizzo salvato.',
    'c.connected': 'Connesso.',
    'c.connectedModel': 'Connesso (modello {m}).',
    'c.unreachable': 'Non raggiungibile. Controlla l’indirizzo e che il backend sia acceso.',
    'c.noUrl': 'Indirizzo del backend non configurato. Impostalo nel file .env o nelle impostazioni del coach.',
    'c.timeout': 'Il coach ci sta mettendo troppo (oltre {s} secondi). Al primo avvio il modello può essere lento: riprova.',
    'c.e503': 'Il backend è attivo ma Ollama non risponde. Avvia Ollama sul computer.',
    'c.e502': 'Il modello ha dato una risposta non valida. Riprova.',
    'c.e422': 'Il backend non ha accettato i dati della sessione.',
    'c.eOther': 'Il backend ha risposto con un errore ({c}).',
    'c.eNet': 'Backend non raggiungibile. Serve il computer acceso e l’indirizzo corretto.',

    'pwa.new': 'Nuova versione disponibile',
    'pwa.update': 'Aggiorna',
    'pwa.later': 'Dopo',
    'pwa.offline': 'Pronta per l’uso offline',
    'pwa.ok': 'OK',
    'face.122': '122 cm',
    'face.80': '80 cm',
    'face.80-6': '80 cm, anelli 5-10',
    'face.40': '40 cm',
    'face.40-6': '40 cm triplo, 6-10',
    'tf.aria': 'Bersaglio',
}

const en: typeof it = {
    'nav.home': '‹ Home',
    'nav.back': '‹ Back',
    'nav.sessions': 'Sessions',
    'nav.coach': 'AI Coach',
    'nav.sections': 'Sections',
    'common.arrows': 'arrows',
    'common.avg': 'avg',

    'home.title': 'Training',
    'home.resume': 'Resume the {d} m session',
    'home.distance': 'Distance (m)',
    'home.minus': 'Minus 5 metres',
    'home.plus': 'Plus 5 metres',
    'home.perEnd': 'Arrows per end',
    'home.start': 'Start',
    'lang.label': 'Language',

    'sessions.title': 'Sessions',
    'sessions.empty': 'No sessions yet. Go back home and press Start.',

    's.finish': 'Finish',
    's.summary': '{n} arrows, avg {a}',
    's.fast': 'Quick',
    's.precise': 'Precise',
    's.faceAria': 'Target face',
    's.howWent': 'How did it go?',
    's.noArrows': 'No arrows recorded',
    's.notePh': 'Quick note (optional)',
    's.save': 'Save session',
    's.discard': 'Delete session',
    's.continue': 'Keep shooting',
    's.undo': 'Undo last arrow',

    'h.meta': '{d} m, {n} arrows per end',
    'h.feeling': 'feeling {n}/5',
    'h.open': 'Session still open: resume',
    'h.total': 'total',
    'h.ends': 'Ends',
    'h.none': 'No arrows recorded.',
    'h.plot': 'Shot plot',
    'h.quick': 'Quick-mode session: no shot plot data.',
    'h.partial': 'Shot plot of {a} out of {b} arrows: the others were entered in quick mode.',
    'h.byEnd': 'Colour by end',
    'h.right': 'right',
    'h.left': 'left',
    'h.up': 'high',
    'h.down': 'low',
    'h.spread': 'spread',
    'h.coach': 'AI Coach feedback',
    'h.delete': 'Delete session',
    'h.delTitle': 'Delete this session?',
    'h.delBody': '{n} arrows will be deleted. This cannot be undone.',
    'h.delBodyOpen': '{n} arrows will be deleted and the session is still in progress. This cannot be undone.',
    'h.delYes': 'Yes, delete',
    'h.cancel': 'Cancel',

    'rosa.aria': 'Shot plot of the session',

    'c.title': 'AI Coach',
    'c.pick': 'Choose the session to analyse.',
    'c.empty': 'No finished sessions to analyse.',
    'c.loading': 'The coach is reading your session…',
    'c.stillUsable': 'The app stays usable: the coach is only needed for the feedback.',
    'c.retry': 'Retry',
    'c.settingsShort': 'Settings',
    'c.exercises': 'Suggested exercises',
    'c.other': 'Choose another session',
    'c.settingsOpen': 'Coach settings',
    'c.settingsClose': 'Close settings',
    'c.urlLabel': 'Backend address',
    'c.save': 'Save',
    'c.test': 'Test connection',
    'c.testing': 'Testing…',
    'c.urlBad': 'The address must start with http:// or https://',
    'c.urlReset': 'Default address restored.',
    'c.urlSaved': 'Address saved.',
    'c.connected': 'Connected.',
    'c.connectedModel': 'Connected (model {m}).',
    'c.unreachable': 'Unreachable. Check the address and that the backend is running.',
    'c.noUrl': 'Backend address not configured. Set it in the .env file or in the coach settings.',
    'c.timeout': 'The coach is taking too long (over {s} seconds). The model can be slow on first start: try again.',
    'c.e503': 'The backend is up but Ollama is not responding. Start Ollama on the computer.',
    'c.e502': 'The model gave an invalid answer. Try again.',
    'c.e422': 'The backend did not accept the session data.',
    'c.eOther': 'The backend returned an error ({c}).',
    'c.eNet': 'Backend unreachable. The computer must be on and the address correct.',

    'pwa.new': 'New version available',
    'pwa.update': 'Update',
    'pwa.later': 'Later',
    'pwa.offline': 'Ready to use offline',
    'pwa.ok': 'OK',
    'face.122': '122 cm',
    'face.80': '80 cm',
    'face.80-6': '80 cm, rings 5-10',
    'face.40': '40 cm',
    'face.40-6': 'Triple 40 cm, 6-10',
    'tf.aria': 'Target',
}

const dict = { it, en }
export type Key = keyof typeof it

export function t(key: Key, params?: Record<string, string | number>): string {
    let s: string = dict[lang.value][key] ?? dict.it[key] ?? key
    if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
    return s
}
export const faceLabel = (id: string) => t(`face.${id}` as Key)

const locale = () => (lang.value === 'en' ? 'en-GB' : 'it-IT')

export const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' })

export const fmtDateLong = (ts: number) =>
    new Date(ts).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const fmtN = (n: number, d = 1) =>
    n.toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d })

export const useT = () => ({ t, lang, setLang, fmtDate, fmtDateLong, fmtN, faceLabel })