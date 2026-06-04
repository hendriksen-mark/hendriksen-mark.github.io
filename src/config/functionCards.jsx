import { FaCalendarAlt, FaCog, FaBolt, FaCloud, FaMicrochip, FaThermometerHalf } from 'react-icons/fa';
import { BiSolidDollarCircle } from 'react-icons/bi';
import { SiCreality } from 'react-icons/si';
import { GiHexagonalNut, GiOctopus } from 'react-icons/gi';
import { PiMonitorDuotone, PiSpeedometerFill } from 'react-icons/pi';
import { IoIosSpeedometer } from 'react-icons/io';

/**
 * Single source of truth for all home-page function cards.
 *
 * To add a new tool:
 *   1. Add an entry here (title/descriptionKey must exist in Translations.jsx).
 *   2. Add a route + component import in App.jsx.
 *   That's it — Home.jsx and colours update automatically.
 *
 * Fields:
 *   id           – unique identifier, used as the navigation view key
 *   icon         – React icon element shown on the card
 *   titleKey     – key in the translations object for the card title
 *   descriptionKey – key for the card description
 *   url          – (optional) external URL; opens in a new tab instead of routing
 *   color        – (optional) explicit hex/css colour override
 *   disabled     – (optional) greys out the card and disables click
 */
export const FUNCTION_CARDS = [
  {
    id: 'game-schedule',
    icon: <FaCalendarAlt />,
    titleKey: 'gameScheduleGenerator',
    descriptionKey: 'gameScheduleDescription',
  },
  {
    id: 'thread-calculator',
    icon: <GiHexagonalNut />,
    titleKey: 'threadCalculatorTitle',
    descriptionKey: 'threadCalculatorDescription',
  },
  {
    id: 'resistor-calculator',
    icon: <FaMicrochip />,
    titleKey: 'resistorCalculatorTitle',
    descriptionKey: 'resistorCalculatorDescription',
  },
  {
    id: 'steinhart-hart-calculator',
    icon: <FaThermometerHalf />,
    titleKey: 'ntcCalculatorTitle',
    descriptionKey: 'ntcCalculatorDescription',
  },
  {
    id: 'sure',
    icon: <BiSolidDollarCircle />,
    titleKey: 'sureTitle',
    descriptionKey: 'sureDescription',
    url: 'https://hendriksen-mark.webredirect.org:81',
  },
  {
    id: 'pihole',
    icon: <FaCog />,
    titleKey: 'piholeTitle',
    descriptionKey: 'piholeDescription',
    url: 'https://hendriksen-mark.webredirect.org:82',
  },
  {
    id: 'octoprint-crx',
    icon: <SiCreality />,
    titleKey: 'octoprintCrxTitle',
    descriptionKey: 'octoprintCrxDescription',
    url: 'https://hendriksen-mark.webredirect.org:83',
  },
  {
    id: 'octoprint-aliexpress',
    icon: <GiOctopus />,
    titleKey: 'octoprintAliexpressTitle',
    descriptionKey: 'octoprintAliexpressDescription',
    url: 'https://hendriksen-mark.webredirect.org:84',
  },
  {
    id: 'p1monitor',
    icon: <PiMonitorDuotone />,
    titleKey: 'p1monitorTitle',
    descriptionKey: 'p1monitorDescription',
    url: 'https://hendriksen-mark.webredirect.org:85',
  },
  {
    id: 'uptimekuma',
    icon: <FaBolt />,
    titleKey: 'uptimekumaTitle',
    descriptionKey: 'uptimekumaDescription',
    url: 'https://hendriksen-mark.webredirect.org:86',
  },
  {
    id: 'nextcloud',
    icon: <FaCloud />,
    titleKey: 'nextcloudTitle',
    descriptionKey: 'nextcloudDescription',
    url: 'https://hendriksen-mark.webredirect.org:443',
  },
  {
    id: 'speedtest-local',
    icon: <IoIosSpeedometer />,
    titleKey: 'speedtestlocalTitle',
    descriptionKey: 'speedtestlocalDescription',
    url: 'https://hendriksen-mark.webredirect.org:88',
  },
  {
    id: 'speedtest',
    icon: <PiSpeedometerFill />,
    titleKey: 'speedtestTitle',
    descriptionKey: 'speedtestDescription',
    url: 'https://hendriksen-mark.webredirect.org:89',
  },
  // ── Placeholder ──────────────────────────────────────────────────────────────
  {
    id: 'coming-soon',
    icon: <FaCog />,
    titleKey: 'moreFunctionsTitle',
    descriptionKey: 'moreFunctionsDescription',
    color: '#9E9E9E',
    disabled: true,
  },
];

/** Ordered list of real (non-disabled) card IDs — drives colour hue spacing. */
export const FUNCTION_IDS = FUNCTION_CARDS.filter((c) => !c.disabled).map((c) => c.id);

/** Total number of real cards — used as the HSL hue divisor. */
export const TOTAL_FUNCTIONS = FUNCTION_IDS.length;

/** Lookup: card id → its index in FUNCTION_IDS (for colour generation). */
export const VIEW_TO_INDEX = Object.fromEntries(FUNCTION_IDS.map((id, i) => [id, i]));
