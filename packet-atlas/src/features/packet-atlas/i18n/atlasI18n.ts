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
  'Encrypted session': 'Szyfrowana sesja',
  'Terminal response': 'Odpowiedź terminala',
  'User auth': 'Uwierzytelnienie użytkownika',
  'Commands and output now move inside the encrypted SSH channel.':
    'Polecenia i wynik przechodzą teraz wewnątrz szyfrowanego kanału SSH.',
  'Opening an SSH session to example.com': 'Otwieranie sesji SSH do example.com',
  'Request moves forward': 'Żądanie idzie do przodu',
  'Response travels back': 'Odpowiedź wraca',
  'Boundary transition': 'Przejście przez granicę',
  'URL intent': 'Zamiar wpisania adresu URL',
  'Browser request': 'Żądanie przeglądarki',
  'DNS lookup': 'Zapytanie DNS',
  'TCP connection': 'Połączenie TCP',
  'TLS handshake': 'Negocjacja TLS',
  'HTTP request': 'Żądanie HTTP',
  'HTTP response': 'Odpowiedź HTTP',
  'Page render': 'Renderowanie strony',
  'User types a destination and expects a page to appear.': 'Użytkownik wpisuje cel i oczekuje, że pojawi się strona.',
  'The browser turns the human intention into a concrete network task.': 'Przeglądarka zamienia ludzką intencję w konkretne zadanie sieciowe.',
  'The name must be resolved before packets can be sent to the server.': 'Nazwa musi zostać rozwiązana, zanim pakiety trafią do serwera.',
  'A connection is established before application data is exchanged.': 'Połączenie jest ustanawiane przed wymianą danych aplikacyjnych.',
  'Encryption is negotiated before sensitive content is sent.': 'Szyfrowanie jest negocjowane przed wysłaniem wrażliwej treści.',
  'The browser sends an application-layer request inside the established channel.': 'Przeglądarka wysyła żądanie warstwy aplikacji wewnątrz ustanowionego kanału.',
  'The server sends data back through the same journey in reverse.': 'Serwer odsyła dane tą samą drogą w odwrotnym kierunku.',
  'The browser interprets the response and presents a page to the user.': 'Przeglądarka interpretuje odpowiedź i prezentuje stronę użytkownikowi.',
  'Do not confuse the visible page with the network journey underneath.': 'Nie myl widocznej strony z podróżą sieciową pod spodem.',
  'The user sees one click, but the network sees a sequence of transformations.': 'Użytkownik widzi jedno kliknięcie, ale sieć widzi sekwencję transformacji.',
  'The same payload changes form as different layers inspect it.': 'Ten sam ładunek zmienia formę, gdy patrzą na niego różne warstwy.',
  'A packet is not magic; it is a structured envelope moving through systems.': 'Pakiet to nie magia; to uporządkowana koperta przechodząca przez systemy.',
  'Each boundary adds or removes context.': 'Każda granica dodaje albo usuwa kontekst.',
  'Evidence beats guessing.': 'Dowód jest lepszy niż zgadywanie.',
  'Ask what changed at this boundary.': 'Zapytaj, co zmieniło się na tej granicy.',
  'Look for the layer that can actually observe this fact.': 'Szukaj warstwy, która faktycznie może zaobserwować ten fakt.',
  'Name, address, port, payload and signal are different views of one journey.': 'Nazwa, adres, port, ładunek i sygnał to różne widoki jednej podróży.',
  'If you can name the boundary, you can debug the failure.': 'Jeśli umiesz nazwać granicę, umiesz zacząć diagnozować awarię.',
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



