import type { AtlasLanguage, AtlasTextDisplayMode } from '../store/atlasStore'
import type { JourneyStage } from '../schema/journeyScenarioSchema'

export const atlasUiText = {
  en: {
    'language.toggle': 'Switch language',
    'language.current': 'Language',
    'play.mode': 'Play Mode',
    'play.exit': 'Exit Play',
    'play.step': 'Step',
    'play.progress': 'Play progress',
    'play.currentStageStory': 'Current stage story',
    'play.mentalModel': 'Mental model',
    'play.evidenceQuestion': 'Evidence question',
    'play.doNotJumpTo': 'Do not jump to',
    'play.handoff': 'Handoff',
    'play.readStage': 'Read this stage. Say it simply. Then press Next.',
    'play.before': 'Before',
    'play.now': 'Now',
    'play.next': 'Next',
    'play.saySimply': 'Say it simply',
    'play.whatToDoNow': 'What to do now',
    'play.proofQuestion': 'Proof question',
    'play.notebookLine': 'Notebook line',
    'play.vocabulary': 'Vocabulary',
    'play.optionalFork': 'Optional diagnostic fork',
    'play.onlyInspect': 'Only inspect this if the current stage is clear.',
    'play.clear': 'Clear',
    'play.userSees': 'User sees',
    'play.networkEvidence': 'Network evidence',
    'play.nextDiagnosticStep': 'Next diagnostic step',
    'play.finalRecap': 'Final recap',
    'play.controls': 'Play controls',
    'play.quickCheckpoint': 'Quick checkpoint',
    'play.quickCheckpointHint': 'Say this out loud before moving on.',
    'play.quickUserView': 'User-visible clue',
    'play.quickNetworkReality': 'Network reality',
    'play.quickLayerLens': 'Layer lens',
    'play.quickTrap': 'Trap to avoid',
    'play.quickWhyItMatters': 'Why it matters',
    'play.quickAnalogy': 'Analogy',
    'play.restart': 'Restart',
    'play.previous': 'Previous',
    'play.pauseAuto': 'Pause auto',
    'play.autoPlay': 'Auto-play',
    'play.speed': 'Animated journey speed',
    'play.slow': 'slow',
    'play.normal': 'normal',
    'play.fast': 'fast',
    'play.complete': 'Journey complete',
    'play.stageRail': 'Play stage rail',
    'play.goToStage': 'Go to stage',
    'play.studySnapshot': 'Study snapshot',
    'play.userView': 'User view',
    'play.realProcess': 'What really happens',
    'play.layerLens': 'Layer lens',
    'play.samePayload': 'Same payload here looks like',
    'play.commonTrap': 'Common trap',
    'play.whyItMatters': 'Why it matters',
    'play.analogy': 'Analogy',
    'play.learningEvidence': 'Learning evidence',
    'motion.ariaLabel': 'Animated packet handoff',
    'motion.animatedHandoff': 'Animated handoff',
    'motion.beforeStart': 'Start here',
    'motion.journeyEnd': 'Journey end',
    'motion.whatWatching': 'What you are watching',
    'motion.layerFocus': 'Layer focus for this animation',
      'play.memoryDrill': 'Memory drill',
      'play.memoryDrillPrompt': 'Close your eyes and rebuild the stage from memory.',
      'play.memoryQuestion': 'Memory question',
      'play.memoryAnswer': 'Expected answer',
      'play.memoryMnemonic': 'Memory hook',
      'play.memoryOperatorMove': 'Operator move',
      'play.memorySayIt': 'Say it in one sentence',
      'play.memoryCheck': 'Check yourself',
  },
  pl: {
    'language.toggle': 'Przełącz język',
    'language.current': 'Język',
    'play.mode': 'Tryb Play',
    'play.exit': 'Wyjdź z Play',
    'play.step': 'Krok',
    'play.progress': 'Postęp Play',
    'play.currentStageStory': 'Historia obecnego etapu',
    'play.mentalModel': 'Model mentalny',
    'play.evidenceQuestion': 'Pytanie o dowód',
    'play.doNotJumpTo': 'Nie przeskakuj od razu do',
    'play.handoff': 'Przekazanie dalej',
    'play.readStage': 'Przeczytaj ten etap. Powiedz go prosto. Potem naciśnij Dalej.',
    'play.before': 'Przed',
    'play.now': 'Teraz',
    'play.next': 'Dalej',
    'play.saySimply': 'Powiedz to prosto',
    'play.whatToDoNow': 'Co zrobić teraz',
    'play.proofQuestion': 'Pytanie sprawdzające',
    'play.notebookLine': 'Linijka do zeszytu',
    'play.vocabulary': 'Słowniczek',
    'play.optionalFork': 'Opcjonalna gałąź diagnostyczna',
    'play.onlyInspect': 'Sprawdzaj to dopiero, gdy obecny etap jest jasny.',
    'play.clear': 'Wyczyść',
    'play.userSees': 'Co widzi użytkownik',
    'play.networkEvidence': 'Dowód sieciowy',
    'play.nextDiagnosticStep': 'Następny krok diagnostyczny',
    'play.finalRecap': 'Podsumowanie końcowe',
    'play.controls': 'Sterowanie Play',
    'play.quickCheckpoint': 'Szybki checkpoint',
    'play.quickCheckpointHint': 'Powiedz to na głos przed przejściem dalej.',
    'play.quickUserView': 'Co widzi użytkownik',
    'play.quickNetworkReality': 'Rzeczywistość sieciowa',
    'play.quickLayerLens': 'Soczewka warstwy',
    'play.quickTrap': 'Pułapka do uniknięcia',
    'play.quickWhyItMatters': 'Dlaczego to ważne',
    'play.quickAnalogy': 'Analogia',
    'play.restart': 'Od początku',
    'play.previous': 'Poprzedni',
    'play.pauseAuto': 'Pauza auto',
    'play.autoPlay': 'Auto-play',
    'play.speed': 'Szybkość animowanej podróży',
    'play.slow': 'wolno',
    'play.normal': 'normalnie',
    'play.fast': 'szybko',
    'play.complete': 'Podróż zakończona',
    'play.stageRail': 'Pasek etapów Play',
    'play.goToStage': 'Przejdź do etapu',
    'play.studySnapshot': 'Migawka nauki',
    'play.userView': 'Widok użytkownika',
    'play.realProcess': 'Co naprawdę się dzieje',
    'play.layerLens': 'Soczewka warstwy',
    'play.samePayload': 'Ten sam ładunek tutaj wygląda jak',
    'play.commonTrap': 'Typowa pułapka',
    'play.whyItMatters': 'Dlaczego to ma znaczenie',
    'play.analogy': 'Analogia',
    'play.learningEvidence': 'Dowód zrozumienia',
    'motion.ariaLabel': 'Animowane przekazanie pakietu',
    'motion.animatedHandoff': 'Animowane przekazanie',
    'motion.beforeStart': 'Start tutaj',
    'motion.journeyEnd': 'Koniec podróży',
    'motion.whatWatching': 'Co właśnie widzisz',
    'motion.layerFocus': 'Warstwy widoczne w tej animacji',
      'play.memoryDrill': 'Drill pamięci',
      'play.memoryDrillPrompt': 'Zamknij oczy i odbuduj etap z pamięci.',
      'play.memoryQuestion': 'Pytanie z pamięci',
      'play.memoryAnswer': 'Oczekiwana odpowiedź',
      'play.memoryMnemonic': 'Hak pamięciowy',
      'play.memoryOperatorMove': 'Ruch operatora',
      'play.memorySayIt': 'Powiedz jednym zdaniem',
      'play.memoryCheck': 'Sprawdź siebie',
  },
} as const

export type AtlasUiKey = keyof typeof atlasUiText.en

export function translateAtlasUi(language: AtlasLanguage, key: AtlasUiKey) {
  return atlasUiText[language][key] ?? atlasUiText.en[key]
}

export function translateMotionLabel(
  language: AtlasLanguage,
  direction: JourneyStage['direction'],
) {
  if (language === 'pl') {
    if (direction === 'request') return 'Żądanie idzie do przodu'
    if (direction === 'response') return 'Odpowiedź wraca'
    return 'Przejście przez granicę'
  }

  if (direction === 'request') return 'Request moves forward'
  if (direction === 'response') return 'Response travels back'
  return 'Boundary transition'
}

export function translateMotionExplanation(
  language: AtlasLanguage,
  direction: JourneyStage['direction'],
) {
  if (language === 'pl') {
    if (direction === 'request') {
      return 'Obecny etap nie jest tylko tekstem. Ten sam proces idzie do następnego systemu: ma poprzednią granicę, aktualną zmianę formy i kolejne przekazanie.'
    }

    if (direction === 'response') {
      return 'Obecny etap nie jest tylko tekstem. Ten sam proces wraca w stronę przeglądarki: ma poprzednią granicę, aktualną zmianę formy i kolejne przekazanie.'
    }

    return 'Obecny etap nie jest tylko tekstem. Ten sam proces zmienia formę na tej granicy: ma poprzedni etap, aktualną transformację i następne przekazanie.'
  }

  if (direction === 'request') {
    return 'The current stage is not just text. The same journey leaves this boundary toward the next system: it has a previous boundary, a current transformation and a next handoff.'
  }

  if (direction === 'response') {
    return 'The current stage is not just text. The same journey returns through this boundary toward the browser: it has a previous boundary, a current transformation and a next handoff.'
  }

  return 'The current stage is not just text. The same journey changes form at this boundary: it has a previous boundary, a current transformation and a next handoff.'
}

const layerLabelsPl: Record<string, string> = {
  application: 'aplikacja',
  transport: 'transport',
  network: 'sieć',
  data: 'dane',
  link: 'łącze',
  physical: 'fizyczna',
  browser: 'przeglądarka',
  dns: 'DNS',
  tcp: 'TCP',
  tls: 'TLS',
  http: 'HTTP',
  ssh: 'SSH',
}

export function translateLayerLabel(language: AtlasLanguage, layer: string) {
  if (language === 'en') return layer
  return layerLabelsPl[layer.toLowerCase()] ?? layer
}

const scenarioTextPl: Record<string, string> = {
  'A URL in the address bar.': 'URL w pasku adresu.',
  'A frozen educational path: IPv4 + DNS UDP/53 + TCP + TLS 1.3 + HTTP/1.1 + no cache + no service worker + NAT enabled.': 'Zamrożona ścieżka edukacyjna: IPv4 + DNS UDP/53 + TCP + TLS 1.3 + HTTP/1.1 + brak cache + brak service workera + włączony NAT.',
  'A network observer does not see plain HTTP content in HTTPS.': 'Obserwator sieciowy nie widzi jawnej treści HTTP w HTTPS.',
  'A simple URL.': 'Prosty URL.',
  'A simplified view of bits or medium-dependent signaling.': 'Uproszczony widok bitów albo sygnalizacji zależnej od medium.',
  'A web request is one journey seen through many layers.': 'Żądanie WWW to jedna podróż widziana przez wiele warstw.',
  'ARP for gateway': 'ARP do bramy',
  'Analogy': 'Analogia',
  'App + DB': 'Aplikacja + DB',
  'Application / browser': 'Aplikacja / przeglądarka',
  'Application / browser UI': 'Aplikacja / UI przeglądarki',
  'Application meaning': 'Znaczenie aplikacyjne',
  'Boundary transition': 'Przejście przez granicę',
  'Browser checks': 'Sprawdzenia przeglądarki',
  'Browser render': 'Render przeglądarki',
  'Close your eyes and rebuild the stage from memory.': 'Zamknij oczy i odbuduj etap z pamięci.',
  'Commands and output now move inside the encrypted SSH channel.': 'Polecenia i wynik przechodzą teraz wewnątrz szyfrowanego kanału SSH.',
  'Common trap': 'Typowa pułapka',
  'DNS application data over IP': 'Dane aplikacyjne DNS przez IP',
  'DNS lookup': 'Zapytanie DNS',
  'DNS query': 'Zapytanie DNS',
  'DNS response': 'Odpowiedź DNS',
  'Deep packet fields and capture internals.': 'Głębokie pola pakietu i wnętrze przechwytywania.',
  'Do not assume the user can see DNS, TCP, TLS or MAC-level facts.': 'Nie zakładaj, że użytkownik widzi fakty z poziomu DNS, TCP, TLS albo MAC.',
  'Do not jump straight to tools; first explain the stage.': 'Nie skacz od razu do narzędzi; najpierw wyjaśnij etap.',
  'Encrypted session': 'Szyfrowana sesja',
  'Evidence beats guessing.': 'Dowód jest lepszy niż zgadywanie.',
  'Explain why this boundary matters.': 'Wyjaśnij, dlaczego ta granica ma znaczenie.',
  'Good troubleshooting starts by separating user intent from actual network traffic.': 'Dobre diagnozowanie zaczyna się od oddzielenia intencji użytkownika od rzeczywistego ruchu sieciowego.',
  'HTTP GET': 'HTTP GET',
  'HTTP over TLS over TCP': 'HTTP przez TLS przez TCP',
  'HTTP response': 'Odpowiedź HTTP',
  'Human': 'Człowiek',
  'Human / browser UI': 'Człowiek / UI przeglądarki',
  'Inside the secure path, the browser finally asks for the web resource.': 'Wewnątrz bezpiecznej ścieżki przeglądarka w końcu prosi o zasób WWW.',
  'LAN frame': 'Ramka LAN',
  'Layer lens': 'Soczewka warstwy',
  'Like placing the actual message inside a locked delivery tube.': 'Jak włożenie właściwej wiadomości do zamkniętej tuby transportowej.',
  'Link layer on local LAN': 'Warstwa łącza w lokalnej sieci LAN',
  'Local delivery wrapper': 'Opakowanie lokalnego dostarczenia',
  'MAC-to-MAC delivery on a local hop or segment.': 'Dostarczenie MAC-do-MAC w lokalnym skoku albo segmencie.',
  'Memory drill': 'Drill pamięci',
  'NAT changes addressing; it does not magically encrypt the payload.': 'NAT zmienia adresowanie; nie szyfruje magicznie ładunku.',
  'Name the actor, the layer and the transformation.': 'Nazwij aktora, warstwę i transformację.',
  'Name the layer that is most useful right now.': 'Nazwij warstwę, która jest teraz najbardziej użyteczna.',
  'Name the trap that would mislead troubleshooting.': 'Nazwij pułapkę, która zmyliłaby diagnostykę.',
  'Network / transport tuple': 'Krotka sieciowa / transportowa',
  'Network layer': 'Warstwa sieciowa',
  'Network wrapper': 'Opakowanie sieciowe',
  'One packet journey, many lenses.': 'Jedna podróż pakietu, wiele soczewek.',
  'Opening an SSH session to example.com': 'Otwieranie sesji SSH do example.com',
  'Opening https://example.com': 'Otwieranie https://example.com',
  'Ports, flow identity, connection state and stream behavior.': 'Porty, tożsamość przepływu, stan połączenia i zachowanie strumienia.',
  'Proof of understanding': 'Dowód zrozumienia',
  'Readable as GET / inside the endpoint, encrypted on the network path.': 'Czytelne jako GET / wewnątrz punktu końcowego, zaszyfrowane na ścieżce sieciowej.',
  'Remote shell connection journey over TCP/22 with SSH identity and authentication checkpoints.': 'Podróż zdalnej powłoki przez TCP/22 z punktami kontrolnymi tożsamości SSH i uwierzytelnienia.',
  'Request moves forward': 'Żądanie idzie do przodu',
  'Request, response, page, app logic or DNS question.': 'Żądanie, odpowiedź, strona, logika aplikacji albo pytanie DNS.',
  'Response travels back': 'Odpowiedź wraca',
  'Reverse proxy': 'Reverse proxy',
  'Router / NAT': 'Router / NAT',
  'Same DNS query, but with translated source IP and port outside the LAN.': 'To samo zapytanie DNS, ale z przetłumaczonym adresem IP i portem źródłowym poza siecią LAN.',
  'Same payload here looks like': 'Ten sam ładunek tutaj wygląda jak',
  'Say the user-visible clue first.': 'Najpierw powiedz wskazówkę widoczną dla użytkownika.',
  'Say what really changes in the network.': 'Powiedz, co naprawdę zmienia się w sieci.',
  'Say who owns the current boundary before naming protocols.': 'Najpierw powiedz, kto posiada obecną granicę, dopiero potem nazywaj protokoły.',
  'Scenarios are data-driven: topology, stages, payload projections, assumptions and copy live in scenario models, not hardcoded UI.': 'Scenariusze są oparte na danych: topologia, etapy, projekcje ładunku, założenia i opisy mieszkają w modelach scenariuszy, nie w UI wpisanym na sztywno.',
  'Security wrapper': 'Opakowanie bezpieczeństwa',
  'Signal view': 'Widok sygnału',
  'Source/destination IP, routing, TTL and NAT view.': 'Źródłowy/docelowy IP, routowanie, TTL i widok NAT.',
  'Start': 'Start',
  'Still just waiting.': 'Nadal po prostu czekasz.',
  'Study snapshot': 'Migawka nauki',
  'TCP handshake': 'Uzgodnienie TCP',
  'TLS handshake': 'Uzgodnienie TLS',
  'TLS negotiation or encrypted application data.': 'Negocjacja TLS albo zaszyfrowane dane aplikacyjne.',
  'TLS over TCP': 'TLS przez TCP',
  'Terminal response': 'Odpowiedź terminala',
  'Terminal work created reviewed JSON fixtures. The browser does not read raw PCAP; it shows normalized, redacted evidence.': 'Praca w terminalu stworzyła sprawdzone fixtury JSON. Przeglądarka nie czyta surowego PCAP; pokazuje znormalizowane i zredagowane dowody.',
  'The URL is not the packet. It is the intention that will later become many network objects.': 'URL nie jest pakietem. To intencja, która później stanie się wieloma obiektami sieciowymi.',
  'The active stage, route direction and what layer is highlighted.': 'Aktywny etap, kierunek trasy i podświetlona warstwa.',
  'The app is the atlas. The terminal captures were the lab work that produced verified evidence for the atlas.': 'Aplikacja jest atlasem. Przechwycenia z terminala były pracą laboratoryjną, która dała zweryfikowane dowody dla atlasu.',
  'The baseline request/response journey for https://example.com, now linked to a verified redacted real capture fixture.': 'Bazowa podróż żądanie/odpowiedź dla https://example.com, teraz powiązana ze zweryfikowaną, zredagowaną próbką realnego przechwycenia.',
  'The browser sends an HTTP GET request through the protected TLS channel.': 'Przeglądarka wysyła żądanie HTTP GET przez chroniony kanał TLS.',
  'The gateway forwards the journey outward and may rewrite addresses so the return path works.': 'Brama przekazuje ruch na zewnątrz i może przepisać adresy, żeby ścieżka powrotna działała.',
  'The journey is not just text. It has previous, current and next boundaries.': 'Ta podróż nie jest tylko tekstem. Ma poprzednią, obecną i następną granicę.',
  'The journey starts as a human intention: open this secure web page.': 'Podróż zaczyna się jako ludzka intencja: otworzyć tę bezpieczną stronę WWW.',
  'The page is loading.': 'Strona się ładuje.',
  'The router forwards the packet and translates the private source address to its public address.': 'Router przekazuje pakiet i tłumaczy prywatny adres źródłowy na adres publiczny.',
  'This is the clean map of one request/response journey.': 'To czysta mapa jednej podróży żądanie/odpowiedź.',
  'This is the core difference between endpoint visibility and network visibility.': 'To główna różnica między widocznością na punkcie końcowym a widocznością w sieci.',
  'This is where many people confuse routing with encryption.': 'W tym miejscu wiele osób myli routowanie z szyfrowaniem.',
  'Transport layer': 'Warstwa transportowa',
  'Transport wrapper': 'Opakowanie transportowe',
  'URL intent': 'Intencja URL',
  'Use the analogy to remember this stage.': 'Użyj analogii, żeby zapamiętać ten etap.',
  'User auth': 'Uwierzytelnienie użytkownika',
  'User intent becomes network evidence step by step.': 'Intencja użytkownika krok po kroku staje się dowodem sieciowym.',
  'User types https://example.com and presses Enter.': 'Użytkownik wpisuje https://example.com i naciska Enter.',
  'User view': 'Widok użytkownika',
  'What changed compared with the previous boundary?': 'Co zmieniło się względem poprzedniej granicy?',
  'What evidence would prove this stage happened?': 'Jaki dowód potwierdziłby, że ten etap się wydarzył?',
  'What really happens': 'Co naprawdę się dzieje',
  'What should you not confuse this with?': 'Z czym nie wolno tego pomylić?',
  'What the user thinks is happening.': 'Co użytkownik myśli, że się dzieje.',
  'Which system is holding the packet now?': 'Który system trzyma teraz pakiet?',
  'Why it matters': 'Dlaczego to ma znaczenie',
}

export function translateScenarioText(language: AtlasLanguage, text: string) {
  if (language === 'en') return text
  return scenarioTextPl[text] ?? text
}

export function getScenarioTranslation(
  language: AtlasLanguage,
  text: string,
  textDisplayMode: AtlasTextDisplayMode = 'bilingual',
) {
  if (textDisplayMode === 'source') {
    return {
      primary: text,
      secondary: null,
    }
  }

  const primary = translateScenarioText(language, text)

  if (textDisplayMode === 'translated') {
    return {
      primary,
      secondary: null,
    }
  }

  const secondary = language === 'pl' && primary !== text ? text : null

  return {
    primary,
    secondary,
  }
}

export function getTextDisplayModeLabel(language: AtlasLanguage, mode: string) {
  const normalizedMode =
    mode === 'translated' || mode === 'pl-only' || mode === 'plOnly'
      ? 'translated'
      : mode === 'bilingual' || mode === 'pl-plus-en'
        ? 'bilingual'
        : mode === 'source' || mode === 'en-only' || mode === 'enOnly'
          ? 'source'
          : mode

  const labels: Record<AtlasLanguage, Record<'translated' | 'bilingual' | 'source', string>> = {
    en: {
      translated: 'PL only',
      bilingual: 'PL + EN',
      source: 'EN only',
    },
    pl: {
      translated: 'PL only',
      bilingual: 'PL + EN',
      source: 'EN only',
    },
  }

  const dictionary = labels[language]
  return dictionary[normalizedMode as keyof typeof dictionary] ?? mode
}



