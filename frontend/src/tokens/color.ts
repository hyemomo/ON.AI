/**
 * ON.AI Design Tokens — Color
 * Theme: Pink Coral
 * ----------------------------------------
 * JS/TS 프로젝트, Tailwind config, Mantine theme 등에서 사용
 *
 * 사용법 (Mantine):
 *   import { colors } from './tokens/colors'
 *   createTheme({ colors: { coral: colors.coral.scale } })
 *
 * 사용법 (Tailwind):
 *   import { colors } from './tokens/colors'
 *   module.exports = { theme: { extend: { colors } } }
 */

// ── Coral Scale ────────────────────────────────────────────────
export const coral = {
  50:  '#FFF0F2',  // 가장 밝은 코랄 — 배경·호버
  100: '#FFE4E7',  // petal — 카드 테두리·Divider
  200: '#FFD6DA',  // blush — 배지·인풋 배경
  300: '#FFAAB3',  // rose — 타이핑 점·강조 테두리
  400: '#FF8E9B',  // coral-lt — 그라디언트 시작·호버
  500: '#FF6B7A',  // coral 메인 — 핵심 액센트
  600: '#E84D5C',  // coral-dk — 그라디언트 끝·액션 버튼
  700: '#C73546',  // 딥 코랄 — 포커스·강조 텍스트
  800: '#9E1F30',  // 가장 어두운 코랄
} as const

// Mantine용 tuple (10단계 배열 필요)
export const coralScale: [string,string,string,string,string,string,string,string,string,string] = [
  coral[50],   // 0
  coral[100],  // 1
  coral[200],  // 2
  coral[300],  // 3
  coral[400],  // 4
  coral[500],  // 5 ← primary index
  coral[600],  // 6
  coral[700],  // 7
  coral[800],  // 8
  '#7B1224',   // 9  (extra deep)
]

// ── Surface ────────────────────────────────────────────────────
export const surface = {
  bg:           '#FFF8F8',  // 전체 앱 배경 (cream)
  white:        '#FFFFFF',  // 카드·말풍선·헤더
  subtle:       '#FFF0F2',  // 인풋·subtle 버튼 배경
  phoneBg:      '#F5DDE0',  // 폰 목업 외부 배경
} as const

// ── Text ───────────────────────────────────────────────────────
export const text = {
  primary:   '#2D1A1E',  // 메인 텍스트
  secondary: '#7A4A52',  // 서브 텍스트
  muted:     '#C4909A',  // 보조·placeholder
} as const

// ── Border ─────────────────────────────────────────────────────
export const border = {
  default: '#FFE4E7',  // 카드·헤더 테두리 (petal)
  strong:  '#FFAAB3',  // 강조 테두리 (rose)
} as const

// ── Status ─────────────────────────────────────────────────────
export const status = {
  online:  '#4CD96A',
  warning: '#FFC947',
  error:   coral[600],
} as const

// ── Gradient ───────────────────────────────────────────────────
export const gradient = {
  primary: `linear-gradient(135deg, ${coral[400]} 0%, ${coral[600]} 100%)`,
  bg:      `linear-gradient(160deg, ${coral[50]} 0%, ${surface.bg} 55%)`,
} as const

// ── Shadow ─────────────────────────────────────────────────────
export const shadow = {
  card:       '0 1px 6px rgba(255, 107, 122, 0.07)',
  cardHover:  '0 4px 16px rgba(255, 107, 122, 0.14)',
  bubbleUser: '0 4px 14px rgba(255, 107, 122, 0.36)',
  btn:        '0 4px 14px rgba(255, 107, 122, 0.42)',
  btnHover:   '0 6px 20px rgba(255, 107, 122, 0.52)',
  avatar:     '0 3px 10px rgba(255, 107, 122, 0.30)',
} as const

// ── Semantic Token Map ─────────────────────────────────────────
export const semanticColors = {
  primary:         coral[500],
  primaryHover:    coral[600],
  primarySubtle:   coral[50],
  primaryBorder:   coral[300],

  bgApp:           surface.bg,
  bgSurface:       surface.white,
  bgSubtle:        surface.subtle,

  borderDefault:   border.default,
  borderStrong:    border.strong,

  textPrimary:     text.primary,
  textSecondary:   text.secondary,
  textMuted:       text.muted,
} as const

// ── Mantine createTheme 헬퍼 ───────────────────────────────────
/**
 * Mantine v7+ createTheme에 바로 spread해서 쓰세요.
 *
 * import { createTheme } from '@mantine/core'
 * import { mantineTheme } from './tokens/colors'
 * const theme = createTheme({ ...mantineTheme })
 */
export const mantineTheme = {
  colors: {
    coral: coralScale,
  },
  primaryColor: 'coral',
  primaryShade: 5,
} as const

// ── 전체 export ────────────────────────────────────────────────
export const colors = {
  coral,
  coralScale,
  surface,
  text,
  border,
  status,
  gradient,
  shadow,
  semantic: semanticColors,
  mantine:  mantineTheme,
} as const

export default colors
