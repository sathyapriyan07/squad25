import type {
  Player,
  PlayerRatings,
  PlayerSeasonEligibility,
  PlayerStatistics,
  Season,
  SeasonRule,
  SeasonTeam,
  Team,
} from '../../types/ipl';

export const SEED_SEASONS: Season[] = [
  { id: 'ipl-2027', year: 2027, name: 'IPL 2027', startDate: '2027-03-20', endDate: '2027-05-25', impactPlayerEnabled: true, isActive: true },
  { id: 'ipl-2026', year: 2026, name: 'IPL 2026', startDate: '2026-03-21', endDate: '2026-05-24', impactPlayerEnabled: true, isActive: true },
  { id: 'ipl-2025', year: 2025, name: 'IPL 2025', startDate: '2025-03-22', endDate: '2025-05-25', impactPlayerEnabled: true, isActive: true },
  { id: 'ipl-2024', year: 2024, name: 'IPL 2024', startDate: '2024-03-22', endDate: '2024-05-26', impactPlayerEnabled: true, isActive: true },
  { id: 'ipl-2020', year: 2020, name: 'IPL 2020', startDate: '2020-09-19', endDate: '2020-11-10', impactPlayerEnabled: false, isActive: true },
  { id: 'ipl-2016', year: 2016, name: 'IPL 2016', startDate: '2016-04-09', endDate: '2016-05-29', impactPlayerEnabled: false, isActive: true },
  { id: 'ipl-2011', year: 2011, name: 'IPL 2011', startDate: '2011-04-08', endDate: '2011-05-28', impactPlayerEnabled: false, isActive: true },
  { id: 'ipl-2008', year: 2008, name: 'IPL 2008', startDate: '2008-04-18', endDate: '2008-06-01', impactPlayerEnabled: false, isActive: true },
];

export const SEED_SEASON_RULES: SeasonRule[] = SEED_SEASONS.map((s) => ({
  seasonId: s.id,
  minSquadSize: s.year >= 2022 ? 18 : 16,
  maxSquadSize: 25,
  maxOverseas: 8,
  playingXiSize: 11,
  maxOverseasInXi: 4,
  minIndianPlayers: s.year >= 2022 ? 10 : 8,
  impactPlayerEnabled: s.impactPlayerEnabled,
  maxSubstitutes: s.impactPlayerEnabled ? 5 : 4,
  notes:
    s.year >= 2025
      ? '2025–2027 IPL Cycle: 18–25 players, max 8 overseas, max 4 overseas in Playing XI, Impact Player permitted.'
      : s.impactPlayerEnabled
      ? 'Impact Player Era: 18–25 players, max 8 overseas, max 4 overseas in Playing XI, Impact Player active.'
      : 'Classic IPL Rules: Max 25 players, max 8 overseas, max 4 overseas in Playing XI, no Impact Player.',
}));

export const SEED_TEAMS: Team[] = [
  { id: 'csk', name: 'Chennai Super Kings', shortCode: 'CSK', primaryColor: '#F9CD05', secondaryColor: '#004BA0', city: 'Chennai', titles: 5, isActive: true },
  { id: 'mi', name: 'Mumbai Indians', shortCode: 'MI', primaryColor: '#004BA0', secondaryColor: '#D1AB3E', city: 'Mumbai', titles: 5, isActive: true },
  { id: 'rcb', name: 'Royal Challengers Bengaluru', shortCode: 'RCB', primaryColor: '#D71920', secondaryColor: '#111317', city: 'Bengaluru', titles: 0, isActive: true },
  { id: 'kkr', name: 'Kolkata Knight Riders', shortCode: 'KKR', primaryColor: '#6B3FA0', secondaryColor: '#B3A123', city: 'Kolkata', titles: 3, isActive: true },
  { id: 'srh', name: 'Sunrisers Hyderabad', shortCode: 'SRH', primaryColor: '#F26522', secondaryColor: '#1B1B1B', city: 'Hyderabad', titles: 1, isActive: true },
  { id: 'rr', name: 'Rajasthan Royals', shortCode: 'RR', primaryColor: '#EA1A85', secondaryColor: '#254AA5', city: 'Jaipur', titles: 1, isActive: true },
  { id: 'dc', name: 'Delhi Capitals', shortCode: 'DC', primaryColor: '#0078BC', secondaryColor: '#EF1B23', city: 'New Delhi', titles: 0, isActive: true },
  { id: 'pbks', name: 'Punjab Kings', shortCode: 'PBKS', primaryColor: '#ED1B24', secondaryColor: '#A7A9AC', city: 'Mullanpur', titles: 0, isActive: true },
  { id: 'gt', name: 'Gujarat Titans', shortCode: 'GT', primaryColor: '#2B4C7E', secondaryColor: '#B69B56', city: 'Ahmedabad', titles: 1, isActive: true },
  { id: 'lsg', name: 'Lucknow Super Giants', shortCode: 'LSG', primaryColor: '#0057E7', secondaryColor: '#F26522', city: 'Lucknow', titles: 0, isActive: true },
  // Historical franchises
  { id: 'dch', name: 'Deccan Chargers', shortCode: 'DCH', primaryColor: '#4A6FA5', secondaryColor: '#C5C9CE', city: 'Hyderabad', titles: 1, isActive: false },
  { id: 'pwi', name: 'Pune Warriors India', shortCode: 'PWI', primaryColor: '#00A9B7', secondaryColor: '#2B2B2B', city: 'Pune', titles: 0, isActive: false },
  { id: 'ktk', name: 'Kochi Tuskers Kerala', shortCode: 'KTK', primaryColor: '#FF6B2B', secondaryColor: '#6D3B8E', city: 'Kochi', titles: 0, isActive: false },
  { id: 'rps', name: 'Rising Pune Supergiant', shortCode: 'RPS', primaryColor: '#A81C67', secondaryColor: '#1F2A44', city: 'Pune', titles: 0, isActive: false },
  { id: 'gl', name: 'Gujarat Lions', shortCode: 'GL', primaryColor: '#E55A1B', secondaryColor: '#1D428A', city: 'Rajkot', titles: 0, isActive: false },
];

const SEASON_PARTICIPANTS: Record<string, string[]> = {
  'ipl-2027': ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'gt', 'lsg'],
  'ipl-2026': ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'gt', 'lsg'],
  'ipl-2025': ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'gt', 'lsg'],
  'ipl-2024': ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'pbks', 'gt', 'lsg'],
  'ipl-2020': ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'pbks'],
  'ipl-2016': ['rcb', 'srh', 'kkr', 'mi', 'dc', 'pbks', 'gl', 'rps'],
  'ipl-2011': ['csk', 'mi', 'rcb', 'kkr', 'rr', 'dc', 'pbks', 'dch', 'pwi', 'ktk'],
  'ipl-2008': ['csk', 'mi', 'rcb', 'kkr', 'rr', 'dc', 'pbks', 'dch'],
};

export const SEED_SEASON_TEAMS: SeasonTeam[] = Object.entries(SEASON_PARTICIPANTS).flatMap(
  ([seasonId, teamIds]) =>
    teamIds.map((teamId) => ({
      id: `${seasonId}_${teamId}`,
      seasonId,
      teamId,
      historicalSquadSize: seasonId === 'ipl-2008' ? 20 : 25,
    }))
);

interface RawSeedPlayer {
  id: string;
  name: string;
  shortName: string;
  dob: string;
  nationality: string;
  flag: string;
  role: 'WK' | 'BAT' | 'AR' | 'BOWL';
  bat: string;
  bowl: string;
  capped: boolean;
  wk: boolean;
  overseas: boolean;
  jersey: number;
  bio: string;
  seasons: Record<string, string>; // seasonId -> actualTeamId
  ratings: [number, number, number, number, number, number, number, number, number]; // bat, pow, tech, fin, pace, spin, wk, fld, ovr
  stats: [number, number, string, number, number, number, number, number, number, string]; // m, runs, hs, avg, sr, 50s, 100s, wkts, econ, bb
}

const RAW_PLAYERS: RawSeedPlayer[] = [
  // CSK & Legends
  {
    id: 'ms-dhoni', name: 'MS Dhoni', shortName: 'M. Dhoni', dob: '1981-07-07', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: true, overseas: false, jersey: 7,
    bio: 'Five-time IPL winning captain and iconic finisher behind and in front of the stumps.',
    seasons: { 'ipl-2008': 'csk', 'ipl-2011': 'csk', 'ipl-2016': 'rps', 'ipl-2020': 'csk', 'ipl-2024': 'csk', 'ipl-2025': 'csk', 'ipl-2026': 'csk' },
    ratings: [84, 92, 82, 97, 0, 0, 96, 86, 89],
    stats: [264, 5243, '84*', 39.13, 137.54, 24, 0, 0, 0, '0/0'],
  },
  {
    id: 'ruturaj-gaikwad', name: 'Ruturaj Gaikwad', shortName: 'R. Gaikwad', dob: '1997-01-31', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 31,
    bio: 'Classical top-order anchor and Orange Cap winner leading Chennai Super Kings.',
    seasons: { 'ipl-2020': 'csk', 'ipl-2024': 'csk', 'ipl-2025': 'csk', 'ipl-2026': 'csk', 'ipl-2027': 'csk' },
    ratings: [90, 82, 92, 80, 0, 15, 0, 84, 88],
    stats: [66, 2380, '108*', 41.75, 136.86, 18, 2, 0, 0, '0/0'],
  },
  {
    id: 'ravindra-jadeja', name: 'Ravindra Jadeja', shortName: 'R. Jadeja', dob: '1988-12-06', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Slow left-arm orthodox', capped: true, wk: false, overseas: false, jersey: 8,
    bio: 'Premier all-rounder offering economical left-arm spin, explosive finishing, and elite fielding.',
    seasons: { 'ipl-2008': 'rr', 'ipl-2011': 'ktk', 'ipl-2016': 'gl', 'ipl-2020': 'csk', 'ipl-2024': 'csk', 'ipl-2025': 'csk', 'ipl-2026': 'csk', 'ipl-2027': 'csk' },
    ratings: [82, 85, 79, 90, 0, 87, 0, 97, 90],
    stats: [240, 2959, '62*', 27.4, 129.72, 3, 0, 160, 7.62, '5/16'],
  },
  {
    id: 'shivam-dube', name: 'Shivam Dube', shortName: 'S. Dube', dob: '1993-06-26', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 25,
    bio: 'Fearsome middle-order six-hitter against spin with handy medium-pace overs.',
    seasons: { 'ipl-2020': 'rcb', 'ipl-2024': 'csk', 'ipl-2025': 'csk', 'ipl-2026': 'csk', 'ipl-2027': 'csk' },
    ratings: [84, 94, 76, 86, 62, 0, 0, 75, 84],
    stats: [65, 1502, '95*', 30.04, 146.68, 9, 0, 5, 9.72, '2/15'],
  },
  {
    id: 'matheesha-pathirana', name: 'Matheesha Pathirana', shortName: 'M. Pathirana', dob: '2002-12-18', nationality: 'Sri Lanka', flag: 'LK',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 99,
    bio: 'Sling-action death-overs specialist delivering 150kph yorkers under pressure.',
    seasons: { 'ipl-2024': 'csk', 'ipl-2025': 'csk', 'ipl-2026': 'csk', 'ipl-2027': 'csk' },
    ratings: [18, 20, 20, 15, 90, 0, 0, 72, 86],
    stats: [20, 0, '0', 0, 0, 0, 0, 34, 7.88, '4/28'],
  },
  {
    id: 'noor-ahmad', name: 'Noor Ahmad', shortName: 'N. Ahmad', dob: '2005-01-03', nationality: 'Afghanistan', flag: 'AF',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Left-arm wrist spin', capped: true, wk: false, overseas: true, jersey: 15,
    bio: 'Sharp left-arm wrist spinner extracting rapid turn and deception through the middle overs.',
    seasons: { 'ipl-2024': 'gt', 'ipl-2025': 'csk', 'ipl-2026': 'csk', 'ipl-2027': 'csk' },
    ratings: [24, 25, 22, 20, 0, 87, 0, 78, 84],
    stats: [23, 14, '5*', 7.0, 77.77, 0, 0, 24, 8.04, '3/37'],
  },

  // MI
  {
    id: 'rohit-sharma', name: 'Rohit Sharma', shortName: 'R. Sharma', dob: '1987-04-30', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 45,
    bio: 'Five-time IPL championship captain and effortless pull-shot powerplay aggressor.',
    seasons: { 'ipl-2008': 'dch', 'ipl-2011': 'mi', 'ipl-2016': 'mi', 'ipl-2020': 'mi', 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [90, 91, 90, 82, 0, 25, 0, 82, 89],
    stats: [257, 6628, '109*', 29.72, 131.14, 43, 2, 15, 8.02, '4/6'],
  },
  {
    id: 'jasprit-bumrah', name: 'Jasprit Bumrah', shortName: 'J. Bumrah', dob: '1993-12-06', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: false, jersey: 93,
    bio: 'Generational all-phase fast bowler with lethal yorkers, bouncers, and pinpoint economy.',
    seasons: { 'ipl-2016': 'mi', 'ipl-2020': 'mi', 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [22, 25, 22, 20, 98, 0, 0, 80, 96],
    stats: [133, 69, '16*', 8.62, 106.15, 0, 0, 165, 7.3, '5/10'],
  },
  {
    id: 'suryakumar-yadav', name: 'Suryakumar Yadav', shortName: 'S. Yadav', dob: '1990-09-14', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 63,
    bio: '360-degree T20 batter dominating pace and spin with extraordinary strike rate.',
    seasons: { 'ipl-2016': 'kkr', 'ipl-2020': 'mi', 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [94, 93, 91, 88, 0, 0, 0, 86, 93],
    stats: [150, 3594, '103*', 32.38, 145.32, 24, 2, 0, 0, '0/0'],
  },
  {
    id: 'hardik-pandya', name: 'Hardik Pandya', shortName: 'H. Pandya', dob: '1993-10-11', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm fast-medium', capped: true, wk: false, overseas: false, jersey: 33,
    bio: 'Explosive pace-bowling all-rounder and championship-winning franchise captain.',
    seasons: { 'ipl-2016': 'mi', 'ipl-2020': 'mi', 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [85, 92, 80, 91, 82, 0, 0, 88, 90],
    stats: [137, 2525, '91', 28.69, 145.62, 10, 0, 64, 9.06, '3/17'],
  },
  {
    id: 'tilak-varma', name: 'Tilak Varma', shortName: 'T. Varma', dob: '2002-11-08', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 9,
    bio: 'Composed left-handed middle-order batter capable of accelerating effortlessly.',
    seasons: { 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [86, 84, 87, 84, 0, 30, 0, 84, 85],
    stats: [38, 1156, '84*', 39.86, 146.32, 6, 0, 0, 7.0, '0/7'],
  },
  {
    id: 'trent-boult', name: 'Trent Boult', shortName: 'T. Boult', dob: '1989-07-22', nationality: 'New Zealand', flag: 'NZ',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Left-arm fast-medium', capped: true, wk: false, overseas: true, jersey: 18,
    bio: 'Powerplay swing specialist famed for first-over breakthroughs.',
    seasons: { 'ipl-2016': 'srh', 'ipl-2020': 'mi', 'ipl-2024': 'rr', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [25, 28, 22, 24, 91, 0, 0, 84, 89],
    stats: [104, 85, '17*', 12.14, 109.0, 0, 0, 121, 8.29, '4/18'],
  },

  // RCB
  {
    id: 'virat-kohli', name: 'Virat Kohli', shortName: 'V. Kohli', dob: '1988-11-05', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 18,
    bio: 'All-time leading run-scorer in IPL history and master chaser for Royal Challengers Bengaluru.',
    seasons: { 'ipl-2008': 'rcb', 'ipl-2011': 'rcb', 'ipl-2016': 'rcb', 'ipl-2020': 'rcb', 'ipl-2024': 'rcb', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb', 'ipl-2027': 'rcb' },
    ratings: [97, 87, 98, 90, 0, 0, 0, 92, 95],
    stats: [252, 8004, '113*', 38.67, 131.97, 55, 8, 4, 8.8, '2/25'],
  },
  {
    id: 'rajat-patidar', name: 'Rajat Patidar', shortName: 'R. Patidar', dob: '1993-06-01', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 97,
    bio: 'Clean middle-order striker who dismantles spin bowling through the middle overs.',
    seasons: { 'ipl-2024': 'rcb', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb', 'ipl-2027': 'rcb' },
    ratings: [85, 88, 84, 82, 0, 0, 0, 82, 84],
    stats: [27, 799, '112*', 34.74, 158.84, 7, 1, 0, 0, '0/0'],
  },
  {
    id: 'phil-salt', name: 'Phil Salt', shortName: 'P. Salt', dob: '1996-08-28', nationality: 'England', flag: 'GB',
    role: 'WK', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: true, overseas: true, jersey: 61,
    bio: 'Explosive powerplay wicketkeeper-batter setting rapid scoring platforms.',
    seasons: { 'ipl-2024': 'kkr', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb', 'ipl-2027': 'rcb' },
    ratings: [87, 92, 80, 78, 0, 0, 84, 82, 87],
    stats: [21, 653, '89*', 34.37, 175.54, 6, 0, 0, 0, '0/0'],
  },
  {
    id: 'josh-hazlewood', name: 'Josh Hazlewood', shortName: 'J. Hazlewood', dob: '1991-01-08', nationality: 'Australia', flag: 'AU',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Right-arm fast-medium', capped: true, wk: false, overseas: true, jersey: 38,
    bio: 'Relentless hard-length seam bowler thriving in powerplay and death phases.',
    seasons: { 'ipl-2020': 'csk', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb', 'ipl-2027': 'rcb' },
    ratings: [20, 18, 22, 18, 91, 0, 0, 78, 88],
    stats: [27, 19, '7*', 9.5, 82.6, 0, 0, 35, 8.06, '4/25'],
  },
  {
    id: 'bhuvneshwar-kumar', name: 'Bhuvneshwar Kumar', shortName: 'B. Kumar', dob: '1990-02-05', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 15,
    bio: 'Two-time Purple Cap winner and master of new-ball swing and knuckle-ball death bowling.',
    seasons: { 'ipl-2011': 'pwi', 'ipl-2016': 'srh', 'ipl-2020': 'srh', 'ipl-2024': 'srh', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb' },
    ratings: [35, 30, 38, 34, 88, 0, 0, 80, 86],
    stats: [176, 306, '27', 8.74, 96.53, 0, 0, 181, 7.56, '5/19'],
  },
  {
    id: 'yash-dayal', name: 'Yash Dayal', shortName: 'Y. Dayal', dob: '1997-12-13', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm fast-medium', capped: false, wk: false, overseas: false, jersey: 10,
    bio: 'Uncapped left-arm pacer delivering clutch final-over composure.',
    seasons: { 'ipl-2024': 'rcb', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb', 'ipl-2027': 'rcb' },
    ratings: [18, 15, 20, 16, 81, 0, 0, 74, 79],
    stats: [28, 0, '0*', 0, 0, 0, 0, 28, 9.48, '3/20'],
  },

  // KKR
  {
    id: 'sunil-narine', name: 'Sunil Narine', shortName: 'S. Narine', dob: '1988-05-26', nationality: 'West Indies', flag: 'WI',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: true, jersey: 74,
    bio: 'Three-time IPL MVP combining mystery spin economy with blistering opening strokeplay.',
    seasons: { 'ipl-2016': 'kkr', 'ipl-2020': 'kkr', 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr', 'ipl-2027': 'kkr' },
    ratings: [82, 92, 74, 76, 0, 94, 0, 80, 92],
    stats: [177, 1534, '109', 17.04, 165.84, 7, 1, 180, 6.73, '5/19'],
  },
  {
    id: 'andre-russell', name: 'Andre Russell', shortName: 'A. Russell', dob: '1988-04-29', nationality: 'West Indies', flag: 'WI',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 12,
    bio: 'Destructive power-hitting finisher and wicket-taking death bowler.',
    seasons: { 'ipl-2016': 'kkr', 'ipl-2020': 'kkr', 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr' },
    ratings: [87, 98, 74, 96, 82, 0, 0, 85, 91],
    stats: [126, 2484, '88*', 29.22, 174.93, 11, 0, 115, 9.31, '5/15'],
  },
  {
    id: 'rinku-singh', name: 'Rinku Singh', shortName: 'R. Singh', dob: '1997-10-12', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 35,
    bio: 'Ice-cool middle-order finisher renowned for last-over chases.',
    seasons: { 'ipl-2020': 'kkr', 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr', 'ipl-2027': 'kkr' },
    ratings: [86, 91, 82, 95, 0, 0, 0, 89, 87],
    stats: [46, 893, '67*', 30.79, 143.34, 4, 0, 0, 0, '0/0'],
  },
  {
    id: 'varun-chakravarthy', name: 'Varun Chakaravarthy', shortName: 'V. Chakaravarthy', dob: '1991-08-29', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 29,
    bio: 'Mystery spinner attacking stumps across powerplay and middle overs.',
    seasons: { 'ipl-2020': 'kkr', 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr', 'ipl-2027': 'kkr' },
    ratings: [16, 15, 16, 14, 0, 92, 0, 74, 88],
    stats: [71, 25, '10*', 6.25, 67.56, 0, 0, 83, 7.56, '5/20'],
  },
  {
    id: 'harshit-rana', name: 'Harshit Rana', shortName: 'H. Rana', dob: '2001-12-22', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: false, jersey: 22,
    bio: 'Hit-the-deck Indian quick with sharp slower deliveries and bounce.',
    seasons: { 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr', 'ipl-2027': 'kkr' },
    ratings: [32, 36, 28, 30, 85, 0, 0, 77, 83],
    stats: [21, 2, '2*', 2.0, 66.66, 0, 0, 25, 9.05, '3/24'],
  },

  // SRH
  {
    id: 'pat-cummins', name: 'Pat Cummins', shortName: 'P. Cummins', dob: '1993-05-08', nationality: 'Australia', flag: 'AU',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 30,
    bio: 'Tactical Australian leader and relentless high-pace strike bowler with lower-order punch.',
    seasons: { 'ipl-2016': 'dc', 'ipl-2020': 'kkr', 'ipl-2024': 'srh', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [58, 70, 50, 64, 91, 0, 0, 84, 90],
    stats: [58, 515, '66*', 18.39, 149.7, 3, 0, 63, 8.75, '4/34'],
  },
  {
    id: 'travis-head', name: 'Travis Head', shortName: 'T. Head', dob: '1993-12-29', nationality: 'Australia', flag: 'AU',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: true, jersey: 62,
    bio: 'Audacious left-handed opener setting record powerplay scoring rates.',
    seasons: { 'ipl-2016': 'rcb', 'ipl-2024': 'srh', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [91, 95, 86, 82, 0, 38, 0, 83, 90],
    stats: [25, 772, '102', 36.76, 173.48, 5, 1, 2, 10.62, '1/16'],
  },
  {
    id: 'abhishek-sharma', name: 'Abhishek Sharma', shortName: 'A. Sharma', dob: '2000-09-04', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Slow left-arm orthodox', capped: true, wk: false, overseas: false, jersey: 4,
    bio: 'Fearless left-handed powerplay striker and useful left-arm spin option.',
    seasons: { 'ipl-2020': 'srh', 'ipl-2024': 'srh', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [88, 95, 82, 80, 0, 58, 0, 82, 88],
    stats: [63, 1376, '75*', 25.48, 155.13, 7, 0, 11, 8.73, '2/4'],
  },
  {
    id: 'heinrich-klaasen', name: 'Heinrich Klaasen', shortName: 'H. Klaasen', dob: '1991-07-30', nationality: 'South Africa', flag: 'ZA',
    role: 'WK', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: true, overseas: true, jersey: 45,
    bio: 'World-class spin-destroyer and middle-order wicketkeeper-batter.',
    seasons: { 'ipl-2024': 'srh', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [92, 97, 86, 93, 0, 0, 85, 80, 92],
    stats: [35, 993, '104', 38.19, 168.3, 6, 1, 0, 0, '0/0'],
  },
  {
    id: 'nitish-kumar-reddy', name: 'Nitish Kumar Reddy', shortName: 'N. Reddy', dob: '2003-05-26', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm medium-fast', capped: true, wk: false, overseas: false, jersey: 47,
    bio: 'Emerging Indian seam-bowling all-rounder with clean middle-order ball-striking.',
    seasons: { 'ipl-2024': 'srh', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [80, 84, 78, 82, 72, 0, 0, 83, 82],
    stats: [15, 303, '76*', 33.67, 142.92, 2, 0, 3, 11.62, '2/33'],
  },

  // RR
  {
    id: 'sanju-samson', name: 'Sanju Samson', shortName: 'S. Samson', dob: '1994-11-11', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Right-hand bat', bowl: 'None', capped: true, wk: true, overseas: false, jersey: 11,
    bio: 'Elegant top-order stroke-maker and Rajasthan Royals wicketkeeper-captain.',
    seasons: { 'ipl-2016': 'dc', 'ipl-2020': 'rr', 'ipl-2024': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr', 'ipl-2027': 'rr' },
    ratings: [89, 90, 88, 82, 0, 0, 87, 84, 89],
    stats: [167, 4419, '119', 30.69, 138.96, 25, 3, 0, 0, '0/0'],
  },
  {
    id: 'yashasvi-jaiswal', name: 'Yashasvi Jaiswal', shortName: 'Y. Jaiswal', dob: '2001-12-28', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 64,
    bio: 'Dynamic left-handed opener who attacks new-ball bowlers from ball one.',
    seasons: { 'ipl-2020': 'rr', 'ipl-2024': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr', 'ipl-2027': 'rr' },
    ratings: [90, 91, 88, 80, 0, 20, 0, 86, 89],
    stats: [53, 1607, '124', 32.14, 150.61, 9, 2, 0, 12.0, '0/6'],
  },
  {
    id: 'riyan-parag', name: 'Riyan Parag', shortName: 'R. Parag', dob: '2001-11-10', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 5,
    bio: 'No.4 power hitter and handy spin option with sharp outfield catching.',
    seasons: { 'ipl-2020': 'rr', 'ipl-2024': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr', 'ipl-2027': 'rr' },
    ratings: [84, 87, 81, 84, 0, 62, 0, 88, 84],
    stats: [70, 1173, '84*', 24.44, 135.14, 6, 0, 4, 10.31, '1/7'],
  },
  {
    id: 'jofra-archer', name: 'Jofra Archer', shortName: 'J. Archer', dob: '1995-04-01', nationality: 'England', flag: 'GB',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 22,
    bio: 'Express 150kph pace bowler capable of hostile bounce and late-order sixes.',
    seasons: { 'ipl-2020': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr', 'ipl-2027': 'rr' },
    ratings: [40, 52, 32, 44, 90, 0, 0, 82, 87],
    stats: [40, 199, '27*', 14.21, 154.26, 0, 0, 48, 7.43, '3/15'],
  },

  // DC
  {
    id: 'axar-patel', name: 'Axar Patel', shortName: 'A. Patel', dob: '1994-01-20', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Slow left-arm orthodox', capped: true, wk: false, overseas: false, jersey: 20,
    bio: 'Clutch left-arm finger spinner and reliable middle-order batter.',
    seasons: { 'ipl-2016': 'pbks', 'ipl-2020': 'dc', 'ipl-2024': 'dc', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [81, 83, 80, 85, 0, 89, 0, 87, 89],
    stats: [150, 1653, '66', 21.47, 130.88, 3, 0, 123, 7.28, '4/21'],
  },
  {
    id: 'kuldeep-yadav', name: 'Kuldeep Yadav', shortName: 'K. Yadav', dob: '1994-12-14', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm wrist spin', capped: true, wk: false, overseas: false, jersey: 23,
    bio: 'Premier attacking left-arm wrist spinner breaking middle-overs partnerships.',
    seasons: { 'ipl-2016': 'kkr', 'ipl-2020': 'kkr', 'ipl-2024': 'dc', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [26, 22, 28, 22, 0, 93, 0, 78, 90],
    stats: [84, 183, '35*', 15.25, 92.42, 0, 0, 87, 8.21, '4/14'],
  },
  {
    id: 'kl-rahul', name: 'KL Rahul', shortName: 'KL Rahul', dob: '1992-04-18', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Right-hand bat', bowl: 'None', capped: true, wk: true, overseas: false, jersey: 1,
    bio: 'Prolific run-machine across IPL seasons with crisp strokeplay and wicketkeeping.',
    seasons: { 'ipl-2016': 'rcb', 'ipl-2020': 'pbks', 'ipl-2024': 'lsg', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [91, 85, 93, 83, 0, 0, 84, 83, 90],
    stats: [132, 4683, '132*', 45.47, 134.61, 37, 4, 0, 0, '0/0'],
  },
  {
    id: 'mitchell-starc', name: 'Mitchell Starc', shortName: 'M. Starc', dob: '1990-01-30', nationality: 'Australia', flag: 'AU',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm fast', capped: true, wk: false, overseas: true, jersey: 56,
    bio: 'High-speed left-arm strike bowler delivering swing and knockout-stage impact.',
    seasons: { 'ipl-2024': 'kkr', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [35, 40, 32, 34, 91, 0, 0, 80, 88],
    stats: [41, 105, '29', 13.12, 102.94, 0, 0, 51, 8.21, '4/15'],
  },
  {
    id: 'tristan-stubbs', name: 'Tristan Stubbs', shortName: 'T. Stubbs', dob: '2000-08-14', nationality: 'South Africa', flag: 'ZA',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: true, overseas: true, jersey: 30,
    bio: 'Hard-hitting Proteas finisher capable of dismantling death bowling.',
    seasons: { 'ipl-2024': 'dc', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [85, 93, 80, 91, 0, 42, 74, 88, 86],
    stats: [18, 405, '71*', 36.82, 169.46, 3, 0, 3, 7.6, '2/11'],
  },

  // PBKS
  {
    id: 'shreyas-iyer', name: 'Shreyas Iyer', shortName: 'S. Iyer', dob: '1994-12-06', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 96,
    bio: 'IPL title-winning captain and authoritative middle-order batter against spin.',
    seasons: { 'ipl-2016': 'dc', 'ipl-2020': 'dc', 'ipl-2024': 'kkr', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks', 'ipl-2027': 'pbks' },
    ratings: [88, 86, 89, 84, 0, 0, 0, 85, 88],
    stats: [115, 3127, '96', 32.24, 127.48, 21, 0, 0, 0, '0/0'],
  },
  {
    id: 'arshdeep-singh', name: 'Arshdeep Singh', shortName: 'A. Singh', dob: '1999-02-05', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm fast-medium', capped: true, wk: false, overseas: false, jersey: 2,
    bio: 'India premier left-arm T20 pacer swinging the new ball and executing wide death yorkers.',
    seasons: { 'ipl-2020': 'pbks', 'ipl-2024': 'pbks', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks', 'ipl-2027': 'pbks' },
    ratings: [18, 18, 20, 15, 90, 0, 0, 77, 88],
    stats: [65, 29, '10*', 7.25, 72.5, 0, 0, 76, 9.03, '5/32'],
  },
  {
    id: 'yuzvendra-chahal', name: 'Yuzvendra Chahal', shortName: 'Y. Chahal', dob: '1990-07-23', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 3,
    bio: 'All-time highest wicket-taker in IPL history with fearless flight and guile.',
    seasons: { 'ipl-2016': 'rcb', 'ipl-2020': 'rcb', 'ipl-2024': 'rr', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks', 'ipl-2027': 'pbks' },
    ratings: [15, 14, 16, 14, 0, 93, 0, 76, 90],
    stats: [160, 37, '8*', 5.28, 43.02, 0, 0, 205, 7.84, '5/40'],
  },
  {
    id: 'shashank-singh', name: 'Shashank Singh', shortName: 'S. Singh', dob: '1991-11-21', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: false, wk: false, overseas: false, jersey: 19,
    bio: 'Uncapped finisher delivering fearless middle-order acceleration under pressure.',
    seasons: { 'ipl-2024': 'pbks', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks', 'ipl-2027': 'pbks' },
    ratings: [82, 87, 79, 89, 0, 25, 0, 82, 82],
    stats: [24, 423, '68*', 35.25, 160.83, 2, 0, 1, 9.8, '1/10'],
  },
  {
    id: 'glenn-maxwell', name: 'Glenn Maxwell', shortName: 'G. Maxwell', dob: '1988-10-14', nationality: 'Australia', flag: 'AU',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: true, jersey: 32,
    bio: 'Unorthodox power-hitter and savvy match-up off-spinner.',
    seasons: { 'ipl-2016': 'pbks', 'ipl-2020': 'pbks', 'ipl-2024': 'rcb', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks' },
    ratings: [84, 94, 78, 86, 0, 74, 0, 90, 86],
    stats: [134, 2771, '95', 24.74, 156.73, 18, 0, 37, 8.28, '2/15'],
  },

  // GT
  {
    id: 'shubman-gill', name: 'Shubman Gill', shortName: 'S. Gill', dob: '1999-09-08', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 77,
    bio: 'Orange Cap winner and Gujarat Titans captain anchored by classical timing.',
    seasons: { 'ipl-2020': 'kkr', 'ipl-2024': 'gt', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [92, 87, 94, 83, 0, 0, 0, 87, 91],
    stats: [103, 3216, '129', 37.84, 135.7, 20, 4, 0, 0, '0/0'],
  },
  {
    id: 'rashid-khan', name: 'Rashid Khan', shortName: 'R. Khan', dob: '1998-09-20', nationality: 'Afghanistan', flag: 'AF',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: true, jersey: 19,
    bio: 'World premier T20 leg-spinner with rapid arm-speed and lower-order six-hitting.',
    seasons: { 'ipl-2020': 'srh', 'ipl-2024': 'gt', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [56, 74, 46, 68, 0, 97, 0, 88, 94],
    stats: [121, 545, '79*', 15.14, 137.28, 1, 0, 149, 6.82, '4/24'],
  },
  {
    id: 'jos-buttler', name: 'Jos Buttler', shortName: 'J. Buttler', dob: '1990-09-08', nationality: 'England', flag: 'GB',
    role: 'WK', bat: 'Right-hand bat', bowl: 'None', capped: true, wk: true, overseas: true, jersey: 63,
    bio: 'Destructive English white-ball captain and seven-time IPL centurion.',
    seasons: { 'ipl-2016': 'mi', 'ipl-2020': 'rr', 'ipl-2024': 'rr', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [93, 94, 90, 88, 0, 0, 86, 84, 92],
    stats: [107, 3582, '124', 38.11, 147.53, 19, 7, 0, 0, '0/0'],
  },
  {
    id: 'sai-sudharsan', name: 'Sai Sudharsan', shortName: 'S. Sudharsan', dob: '2001-10-15', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 23,
    bio: 'Ultra-consistent left-handed top-order accumulator with high average.',
    seasons: { 'ipl-2024': 'gt', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [87, 80, 91, 79, 0, 0, 0, 83, 86],
    stats: [25, 1034, '103', 47.0, 139.16, 6, 1, 0, 0, '0/0'],
  },
  {
    id: 'mohammed-siraj', name: 'Mohammed Siraj', shortName: 'M. Siraj', dob: '1994-03-13', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: false, jersey: 73,
    bio: 'Aggressive new-ball quick capable of searing seam movement.',
    seasons: { 'ipl-2020': 'rcb', 'ipl-2024': 'rcb', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [20, 18, 22, 16, 87, 0, 0, 80, 85],
    stats: [93, 109, '14*', 10.9, 89.34, 0, 0, 93, 8.65, '4/21'],
  },
  {
    id: 'kagiso-rabada', name: 'Kagiso Rabada', shortName: 'K. Rabada', dob: '1995-05-25', nationality: 'South Africa', flag: 'ZA',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 25,
    bio: 'Purple Cap winning strike bowler with rapid pace and steep bounce.',
    seasons: { 'ipl-2020': 'dc', 'ipl-2024': 'pbks', 'ipl-2025': 'gt', 'ipl-2026': 'gt', 'ipl-2027': 'gt' },
    ratings: [30, 34, 28, 30, 91, 0, 0, 82, 89],
    stats: [80, 206, '44', 11.44, 101.47, 0, 0, 117, 8.48, '4/21'],
  },

  // LSG
  {
    id: 'rishabh-pant', name: 'Rishabh Pant', shortName: 'R. Pant', dob: '1997-10-04', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Left-hand bat', bowl: 'None', capped: true, wk: true, overseas: false, jersey: 17,
    bio: 'Fearless left-handed wicketkeeper-captain capable of turning games in three overs.',
    seasons: { 'ipl-2016': 'dc', 'ipl-2020': 'dc', 'ipl-2024': 'dc', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg', 'ipl-2027': 'lsg' },
    ratings: [90, 93, 85, 89, 0, 0, 89, 82, 91],
    stats: [111, 3284, '128*', 35.31, 148.93, 18, 1, 0, 0, '0/0'],
  },
  {
    id: 'nicholas-pooran', name: 'Nicholas Pooran', shortName: 'N. Pooran', dob: '1995-10-02', nationality: 'West Indies', flag: 'WI',
    role: 'WK', bat: 'Left-hand bat', bowl: 'None', capped: true, wk: true, overseas: true, jersey: 29,
    bio: 'Lethal left-handed six-hitting powerhouse and agile wicketkeeper.',
    seasons: { 'ipl-2020': 'pbks', 'ipl-2024': 'lsg', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg', 'ipl-2027': 'lsg' },
    ratings: [89, 96, 83, 92, 0, 0, 84, 86, 90],
    stats: [76, 1769, '77', 32.16, 162.29, 9, 0, 0, 0, '0/0'],
  },
  {
    id: 'mayank-yadav', name: 'Mayank Yadav', shortName: 'M. Yadav', dob: '2002-06-17', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: false, jersey: 14,
    bio: '155kph express Indian fast bowler extracting uncomfortable pace.',
    seasons: { 'ipl-2024': 'lsg', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg', 'ipl-2027': 'lsg' },
    ratings: [16, 15, 16, 14, 88, 0, 0, 74, 84],
    stats: [4, 0, '0', 0, 0, 0, 0, 7, 6.98, '3/14'],
  },
  {
    id: 'ravi-bishnoi', name: 'Ravi Bishnoi', shortName: 'R. Bishnoi', dob: '2000-09-05', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 56,
    bio: 'Rapid-fire leg-spinner specializing in skid-on googlies and athleticism.',
    seasons: { 'ipl-2020': 'pbks', 'ipl-2024': 'lsg', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg', 'ipl-2027': 'lsg' },
    ratings: [20, 18, 22, 18, 0, 88, 0, 88, 86],
    stats: [66, 37, '8*', 7.4, 78.72, 0, 0, 63, 7.81, '3/24'],
  },
  {
    id: 'mitchell-marsh', name: 'Mitchell Marsh', shortName: 'M. Marsh', dob: '1991-10-20', nationality: 'Australia', flag: 'AU',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm fast-medium', capped: true, wk: false, overseas: true, jersey: 8,
    bio: 'Tall Australian seam all-rounder clearing boundaries down the ground.',
    seasons: { 'ipl-2011': 'pwi', 'ipl-2016': 'rps', 'ipl-2020': 'srh', 'ipl-2024': 'dc', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg' },
    ratings: [83, 89, 78, 82, 76, 0, 0, 81, 84],
    stats: [42, 665, '89', 19.55, 134.88, 3, 0, 37, 8.5, '4/25'],
  },

  // Additional depth across India capped/uncapped & overseas
  {
    id: 'sanju-harshit-p', name: 'Mohsin Khan', shortName: 'M. Khan', dob: '1998-07-15', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm fast-medium', capped: false, wk: false, overseas: false, jersey: 9,
    bio: 'Uncapped left-arm pacer capable of swinging the new ball and defending tight totals.',
    seasons: { 'ipl-2024': 'lsg', 'ipl-2025': 'lsg', 'ipl-2026': 'lsg', 'ipl-2027': 'lsg' },
    ratings: [20, 18, 20, 18, 82, 0, 0, 75, 80],
    stats: [24, 25, '13*', 8.33, 89.28, 0, 0, 27, 8.51, '4/16'],
  },
  {
    id: 'abhishek-porel', name: 'Abishek Porel', shortName: 'A. Porel', dob: '2002-10-17', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Left-hand bat', bowl: 'None', capped: false, wk: true, overseas: false, jersey: 17,
    bio: 'Aggressive uncapped Indian left-handed wicketkeeper-opener.',
    seasons: { 'ipl-2024': 'dc', 'ipl-2025': 'dc', 'ipl-2026': 'dc', 'ipl-2027': 'dc' },
    ratings: [79, 82, 78, 76, 0, 0, 81, 79, 80],
    stats: [18, 360, '65', 27.69, 151.26, 2, 0, 0, 0, '0/0'],
  },
  {
    id: 'prabhsimran-singh', name: 'Prabhsimran Singh', shortName: 'P. Singh', dob: '2000-08-10', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Right-hand bat', bowl: 'None', capped: false, wk: true, overseas: false, jersey: 84,
    bio: 'Explosive uncapped Indian opener and wicketkeeper.',
    seasons: { 'ipl-2020': 'pbks', 'ipl-2024': 'pbks', 'ipl-2025': 'pbks', 'ipl-2026': 'pbks', 'ipl-2027': 'pbks' },
    ratings: [80, 86, 76, 74, 0, 0, 78, 78, 80],
    stats: [34, 756, '103', 22.9, 146.22, 3, 1, 0, 0, '0/0'],
  },
  {
    id: 'dhruv-jurel', name: 'Dhruv Jurel', shortName: 'D. Jurel', dob: '2001-01-21', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Right-hand bat', bowl: 'None', capped: true, wk: true, overseas: false, jersey: 21,
    bio: 'Calm middle-order finisher and crisp Indian wicketkeeper.',
    seasons: { 'ipl-2024': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr', 'ipl-2027': 'rr' },
    ratings: [80, 82, 81, 86, 0, 0, 86, 84, 83],
    stats: [27, 347, '56*', 24.78, 151.52, 2, 0, 0, 0, '0/0'],
  },
  {
    id: 'sandeep-sharma', name: 'Sandeep Sharma', shortName: 'S. Sharma', dob: '1993-05-18', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 27,
    bio: 'Crafty swing and death-overs bowler with pinpoint yorker control.',
    seasons: { 'ipl-2016': 'pbks', 'ipl-2020': 'srh', 'ipl-2024': 'rr', 'ipl-2025': 'rr', 'ipl-2026': 'rr' },
    ratings: [16, 14, 18, 15, 84, 0, 0, 76, 82],
    stats: [127, 54, '9', 9.0, 80.59, 0, 0, 137, 7.89, '5/18'],
  },
  {
    id: 'rahul-tewatia', name: 'Rahul Tewatia', shortName: 'R. Tewatia', dob: '1993-05-20', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Right-arm legbreak', capped: false, wk: false, overseas: false, jersey: 9,
    bio: 'Specialist uncapped chase finisher with handy leg-spin overs.',
    seasons: { 'ipl-2020': 'rr', 'ipl-2024': 'gt', 'ipl-2025': 'gt', 'ipl-2026': 'gt' },
    ratings: [78, 86, 72, 92, 0, 62, 0, 80, 82],
    stats: [93, 1013, '53', 28.13, 134.88, 1, 0, 32, 7.91, '3/18'],
  },
  {
    id: 'mohammed-shami', name: 'Mohammed Shami', shortName: 'M. Shami', dob: '1990-09-03', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: false, jersey: 11,
    bio: 'Seam-presentation master leading powerplay strike rates.',
    seasons: { 'ipl-2016': 'dc', 'ipl-2020': 'pbks', 'ipl-2025': 'srh', 'ipl-2026': 'srh' },
    ratings: [22, 24, 22, 20, 92, 0, 0, 76, 89],
    stats: [110, 74, '21', 6.16, 88.09, 0, 0, 127, 8.44, '4/11'],
  },
  {
    id: 'ishan-kishan', name: 'Ishan Kishan', shortName: 'I. Kishan', dob: '1998-07-18', nationality: 'India', flag: 'IN',
    role: 'WK', bat: 'Left-hand bat', bowl: 'None', capped: true, wk: true, overseas: false, jersey: 32,
    bio: 'Attacking left-handed opener and dynamic wicketkeeper.',
    seasons: { 'ipl-2016': 'gl', 'ipl-2020': 'mi', 'ipl-2024': 'mi', 'ipl-2025': 'srh', 'ipl-2026': 'srh', 'ipl-2027': 'srh' },
    ratings: [85, 89, 82, 79, 0, 0, 84, 83, 85],
    stats: [105, 2644, '99', 28.43, 135.87, 16, 0, 0, 0, '0/0'],
  },
  {
    id: 'venkatesh-iyer', name: 'Venkatesh Iyer', shortName: 'V. Iyer', dob: '1994-12-25', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 25,
    bio: 'Big-match left-handed batter offering medium-pace utility.',
    seasons: { 'ipl-2024': 'kkr', 'ipl-2025': 'kkr', 'ipl-2026': 'kkr', 'ipl-2027': 'kkr' },
    ratings: [84, 87, 82, 82, 58, 0, 0, 82, 84],
    stats: [50, 1326, '104', 31.57, 137.13, 11, 1, 3, 10.71, '2/29'],
  },
  {
    id: 'ravichandran-ashwin', name: 'Ravichandran Ashwin', shortName: 'R. Ashwin', dob: '1986-09-17', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 99,
    bio: 'Tactical off-spin mastermind with match-up intelligence and lower-order adaptability.',
    seasons: { 'ipl-2011': 'csk', 'ipl-2016': 'rps', 'ipl-2020': 'dc', 'ipl-2024': 'rr', 'ipl-2025': 'csk' },
    ratings: [60, 62, 62, 60, 0, 90, 0, 78, 86],
    stats: [212, 800, '50', 13.79, 118.69, 1, 0, 180, 7.12, '4/34'],
  },
  {
    id: 'liam-livingstone', name: 'Liam Livingstone', shortName: 'L. Livingstone', dob: '1993-08-04', nationality: 'England', flag: 'GB',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: true, jersey: 23,
    bio: 'Destructive six-hitter who bowls both leg-spin and off-spin.',
    seasons: { 'ipl-2024': 'pbks', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb' },
    ratings: [83, 93, 76, 88, 0, 70, 0, 85, 85],
    stats: [39, 939, '94', 28.45, 162.45, 6, 0, 11, 9.02, '3/27'],
  },
  {
    id: 'krunal-pandya', name: 'Krunal Pandya', shortName: 'K. Pandya', dob: '1991-03-24', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Left-hand bat', bowl: 'Slow left-arm orthodox', capped: true, wk: false, overseas: false, jersey: 24,
    bio: 'Economical left-arm spinner and sharp middle-overs striker.',
    seasons: { 'ipl-2016': 'mi', 'ipl-2020': 'mi', 'ipl-2024': 'lsg', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb' },
    ratings: [76, 78, 75, 80, 0, 81, 0, 84, 83],
    stats: [127, 1647, '86', 22.56, 132.82, 1, 0, 76, 7.37, '3/14'],
  },
  {
    id: 'deepak-chahar', name: 'Deepak Chahar', shortName: 'D. Chahar', dob: '1992-08-07', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 90,
    bio: 'Powerplay swing bowler who strikes early with new-ball movement.',
    seasons: { 'ipl-2016': 'rps', 'ipl-2020': 'csk', 'ipl-2024': 'csk', 'ipl-2025': 'mi', 'ipl-2026': 'mi' },
    ratings: [46, 54, 42, 48, 84, 0, 0, 78, 83],
    stats: [81, 80, '39', 11.42, 137.93, 0, 0, 77, 7.98, '4/13'],
  },
  {
    id: 'harshal-patel', name: 'Harshal Patel', shortName: 'H. Patel', dob: '1990-11-23', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: false, overseas: false, jersey: 9,
    bio: 'Two-time Purple Cap winner armed with deceptive dipping slower balls.',
    seasons: { 'ipl-2016': 'rcb', 'ipl-2020': 'dc', 'ipl-2024': 'pbks', 'ipl-2025': 'srh', 'ipl-2026': 'srh' },
    ratings: [40, 46, 36, 44, 87, 0, 0, 78, 85],
    stats: [106, 250, '36*', 12.5, 128.86, 0, 0, 135, 8.74, '5/27'],
  },
  {
    id: 't-natarajan', name: 'T Natarajan', shortName: 'T. Natarajan', dob: '1991-04-04', nationality: 'India', flag: 'IN',
    role: 'BOWL', bat: 'Left-hand bat', bowl: 'Left-arm medium', capped: true, wk: false, overseas: false, jersey: 44,
    bio: 'Specialist left-arm yorker exponent in death overs.',
    seasons: { 'ipl-2020': 'srh', 'ipl-2024': 'srh', 'ipl-2025': 'dc', 'ipl-2026': 'dc' },
    ratings: [12, 12, 12, 12, 86, 0, 0, 74, 83],
    stats: [61, 3, '3*', 3.0, 60.0, 0, 0, 67, 8.83, '4/19'],
  },
  {
    id: 'devdutt-padikkal', name: 'Devdutt Padikkal', shortName: 'D. Padikkal', dob: '2000-07-07', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 37,
    bio: 'Tall left-handed top-order batter with clean lofted drives.',
    seasons: { 'ipl-2020': 'rcb', 'ipl-2024': 'lsg', 'ipl-2025': 'rcb', 'ipl-2026': 'rcb' },
    ratings: [80, 78, 84, 72, 0, 0, 0, 82, 80],
    stats: [64, 1559, '101*', 25.15, 123.14, 9, 1, 0, 0, '0/0'],
  },
  {
    id: 'naman-dhir', name: 'Naman Dhir', shortName: 'N. Dhir', dob: '1999-12-31', nationality: 'India', flag: 'IN',
    role: 'AR', bat: 'Right-hand bat', bowl: 'Right-arm offbreak', capped: false, wk: false, overseas: false, jersey: 19,
    bio: 'Hard-hitting uncapped Indian middle-order batter with useful off-spin.',
    seasons: { 'ipl-2024': 'mi', 'ipl-2025': 'mi', 'ipl-2026': 'mi', 'ipl-2027': 'mi' },
    ratings: [78, 85, 76, 82, 0, 52, 0, 81, 79],
    stats: [7, 140, '62*', 23.33, 177.21, 1, 0, 0, 12.0, '0/12'],
  },

  // Historical Legends (Eligible ONLY in historical seasons — NOT 2025-2027!)
  {
    id: 'sachin-tendulkar', name: 'Sachin Tendulkar', shortName: 'S. Tendulkar', dob: '1973-04-24', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Right-hand bat', bowl: 'Right-arm legbreak', capped: true, wk: false, overseas: false, jersey: 10,
    bio: 'Iconic Mumbai Indians captain and 2010 Orange Cap winner.',
    seasons: { 'ipl-2008': 'mi', 'ipl-2011': 'mi' },
    ratings: [94, 82, 99, 84, 0, 35, 0, 84, 93],
    stats: [78, 2334, '100*', 34.84, 119.82, 13, 1, 0, 8.75, '0/7'],
  },
  {
    id: 'ab-de-villiers', name: 'AB de Villiers', shortName: 'AB de Villiers', dob: '1984-02-17', nationality: 'South Africa', flag: 'ZA',
    role: 'WK', bat: 'Right-hand bat', bowl: 'Right-arm medium', capped: true, wk: true, overseas: true, jersey: 17,
    bio: 'Mr. 360 — legendary match-winner and Hall of Fame IPL batter.',
    seasons: { 'ipl-2008': 'dc', 'ipl-2011': 'rcb', 'ipl-2016': 'rcb', 'ipl-2020': 'rcb' },
    ratings: [97, 96, 97, 96, 0, 0, 86, 96, 96],
    stats: [184, 5162, '133*', 39.71, 151.69, 40, 3, 0, 0, '0/0'],
  },
  {
    id: 'chris-gayle', name: 'Chris Gayle', shortName: 'C. Gayle', dob: '1979-09-21', nationality: 'West Indies', flag: 'WI',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: true, jersey: 333,
    bio: 'Universe Boss — record holder for highest IPL individual score (175*) and most sixes.',
    seasons: { 'ipl-2008': 'kkr', 'ipl-2011': 'rcb', 'ipl-2016': 'rcb', 'ipl-2020': 'pbks' },
    ratings: [93, 99, 86, 86, 0, 48, 0, 74, 92],
    stats: [142, 4965, '175*', 39.72, 148.96, 31, 6, 18, 7.9, '2/5'],
  },
  {
    id: 'suresh-raina', name: 'Suresh Raina', shortName: 'S. Raina', dob: '1986-11-27', nationality: 'India', flag: 'IN',
    role: 'BAT', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: false, overseas: false, jersey: 3,
    bio: 'Mr. IPL — relentless No.3 match-winner and electric infielder.',
    seasons: { 'ipl-2008': 'csk', 'ipl-2011': 'csk', 'ipl-2016': 'gl', 'ipl-2020': 'csk' },
    ratings: [91, 89, 90, 86, 0, 52, 0, 95, 91],
    stats: [205, 5528, '100*', 32.52, 136.73, 39, 1, 25, 7.38, '2/0'],
  },
  {
    id: 'lasith-malinga', name: 'Lasith Malinga', shortName: 'L. Malinga', dob: '1983-08-28', nationality: 'Sri Lanka', flag: 'LK',
    role: 'BOWL', bat: 'Right-hand bat', bowl: 'Right-arm fast', capped: true, wk: false, overseas: true, jersey: 99,
    bio: 'Deadliest yorker bowler of the classic IPL era for Mumbai Indians.',
    seasons: { 'ipl-2008': 'mi', 'ipl-2011': 'mi', 'ipl-2016': 'mi' },
    ratings: [16, 16, 16, 15, 97, 0, 0, 72, 94],
    stats: [122, 88, '17*', 6.76, 88.88, 0, 0, 170, 7.14, '5/13'],
  },
  {
    id: 'adam-gilchrist', name: 'Adam Gilchrist', shortName: 'A. Gilchrist', dob: '1971-11-14', nationality: 'Australia', flag: 'AU',
    role: 'WK', bat: 'Left-hand bat', bowl: 'Right-arm offbreak', capped: true, wk: true, overseas: true, jersey: 18,
    bio: 'Deccan Chargers 2009 title-winning captain and explosive left-handed keeper.',
    seasons: { 'ipl-2008': 'dch', 'ipl-2011': 'pbks' },
    ratings: [90, 93, 87, 82, 0, 0, 92, 84, 90],
    stats: [80, 2069, '109*', 27.22, 138.39, 11, 2, 1, 0, '1/0'],
  },
];

export const SEED_PLAYERS: Player[] = RAW_PLAYERS.map((p) => ({
  id: p.id,
  name: p.name,
  shortName: p.shortName,
  dob: p.dob,
  nationality: p.nationality,
  countryFlag: p.flag,
  biography: p.bio,
  primaryRole: p.role,
  battingStyle: p.bat,
  bowlingStyle: p.bowl,
  isCapped: p.capped,
  isWicketkeeper: p.wk,
  isOverseas: p.overseas,
  jerseyNumber: p.jersey,
}));

export const SEED_PLAYER_RATINGS: PlayerRatings[] = RAW_PLAYERS.map((p) => ({
  playerId: p.id,
  batting: p.ratings[0],
  powerHitting: p.ratings[1],
  technique: p.ratings[2],
  finishing: p.ratings[3],
  paceBowling: p.ratings[4],
  spinBowling: p.ratings[5],
  wicketkeeping: p.ratings[6],
  fielding: p.ratings[7],
  overall: p.ratings[8],
}));

export const SEED_PLAYER_STATISTICS: PlayerStatistics[] = RAW_PLAYERS.map((p) => {
  const [matches, runs, highestScore, battingAverage, strikeRate, halfCenturies, centuries, wickets, economy, bestBowling] =
    p.stats;
  return {
    id: `${p.id}_career`,
    playerId: p.id,
    seasonId: 'career',
    scope: 'career',
    matches,
    inningsBat: matches,
    runs,
    highestScore,
    battingAverage,
    strikeRate,
    centuries,
    halfCenturies,
    fours: Math.round(runs * 0.085),
    sixes: Math.round(runs * 0.045),
    inningsBowl: wickets > 0 ? matches : 0,
    overs: wickets > 0 ? matches * 3.4 : 0,
    runsConceded: wickets > 0 ? Math.round(matches * 3.4 * economy) : 0,
    wickets,
    economy,
    bowlingAverage: wickets > 0 ? Number(((matches * 3.4 * economy) / wickets).toFixed(2)) : 0,
    bowlingStrikeRate: wickets > 0 ? Number(((matches * 20.4) / wickets).toFixed(2)) : 0,
    bestBowling,
    fiveWicketHauls: bestBowling.startsWith('5/') ? 1 : 0,
    catches: Math.round(matches * 0.45),
    runOuts: Math.round(matches * 0.06),
    stumpings: p.wk ? Math.round(matches * 0.14) : 0,
  };
});

export const SEED_PLAYER_SEASONS: PlayerSeasonEligibility[] = RAW_PLAYERS.flatMap((p) =>
  Object.entries(p.seasons).map(([seasonId, actualTeamId]) => ({
    id: `${p.id}_${seasonId}`,
    playerId: p.id,
    seasonId,
    actualTeamId,
    isAvailable: true,
    actualSquadStatus: 'Active',
    isOverseasSnapshot: p.overseas,
  }))
);
