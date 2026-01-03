/**
 * Canvas Rendering Utilities
 *
 * Uses raw Canvas API to minimize bundle size (critical for ship bandwidth).
 * All rendering is done via these utility functions.
 */

// =============================================================================
// Types
// =============================================================================

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface TimelineLayout {
  // Overall dimensions
  width: number
  height: number

  // Header area (title, date, SLAP info)
  header: Rect

  // Time axis area
  timeAxis: Rect

  // Squadron rows area
  squadronArea: Rect

  // Individual squadron row height
  squadronRowHeight: number

  // Footer area (cycle counts)
  footer: Rect

  // Timeline bounds (time range)
  timeStart: Date
  timeEnd: Date

  // Pixels per hour
  pixelsPerHour: number
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  layout: TimelineLayout
  dpr: number  // Device pixel ratio for sharp rendering
}

// =============================================================================
// Colors
// =============================================================================

export const colors = {
  background: '#1a1a2e',
  headerBg: '#16213e',
  gridLine: '#0f3460',
  gridLineLight: 'rgba(15, 52, 96, 0.5)',
  text: '#eeeeee',
  textMuted: '#888888',
  accent: '#e94560',
  accentLight: '#ff6b6b',
  eventBar: '#4a90d9',
  eventBarAlert: '#e94560',
  dayShade: 'rgba(255, 255, 200, 0.05)',
  nightShade: 'rgba(0, 0, 50, 0.15)',
  cycleStart: '#4ade80',
  cycleEnd: '#f87171'
}

// =============================================================================
// Layout Calculation
// =============================================================================

/**
 * Calculate the layout for a timeline given dimensions and data.
 */
export function calculateLayout(
  width: number,
  height: number,
  squadronCount: number,
  timeStart: Date,
  timeEnd: Date
): TimelineLayout {
  const headerHeight = 60
  const timeAxisHeight = 30
  const footerHeight = 40
  const squadronLabelWidth = 100
  const countColumnWidth = 50

  const squadronAreaHeight = height - headerHeight - timeAxisHeight - footerHeight
  const squadronRowHeight = squadronCount > 0
    ? squadronAreaHeight / squadronCount
    : squadronAreaHeight

  const timelineWidth = width - squadronLabelWidth - countColumnWidth
  const timeSpanHours = (timeEnd.getTime() - timeStart.getTime()) / (1000 * 60 * 60)
  const pixelsPerHour = timelineWidth / Math.max(timeSpanHours, 1)

  return {
    width,
    height,
    header: {
      x: 0,
      y: 0,
      width,
      height: headerHeight
    },
    timeAxis: {
      x: squadronLabelWidth,
      y: headerHeight,
      width: timelineWidth,
      height: timeAxisHeight
    },
    squadronArea: {
      x: 0,
      y: headerHeight + timeAxisHeight,
      width,
      height: squadronAreaHeight
    },
    squadronRowHeight,
    footer: {
      x: 0,
      y: height - footerHeight,
      width,
      height: footerHeight
    },
    timeStart,
    timeEnd,
    pixelsPerHour
  }
}

// =============================================================================
// Time Utilities
// =============================================================================

/**
 * Convert a time to X position on the timeline.
 */
export function timeToX(time: Date, layout: TimelineLayout): number {
  const hoursSinceStart = (time.getTime() - layout.timeStart.getTime()) / (1000 * 60 * 60)
  return layout.timeAxis.x + hoursSinceStart * layout.pixelsPerHour
}

/**
 * Convert X position to time.
 */
export function xToTime(x: number, layout: TimelineLayout): Date {
  const hoursSinceStart = (x - layout.timeAxis.x) / layout.pixelsPerHour
  return new Date(layout.timeStart.getTime() + hoursSinceStart * 60 * 60 * 1000)
}

/**
 * Format time as "HH:MM" or "HHmm" (military).
 */
export function formatTime(date: Date, military: boolean = true): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return military ? `${hours}${minutes}` : `${hours}:${minutes}`
}

// =============================================================================
// Drawing Primitives
// =============================================================================

/**
 * Clear and fill background.
 */
export function clearCanvas(rc: RenderContext): void {
  const { ctx, layout, dpr } = rc
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, layout.width * dpr, layout.height * dpr)
}

/**
 * Draw text with proper scaling.
 */
export function drawText(
  rc: RenderContext,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string
    color?: string
    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline
  } = {}
): void {
  const { ctx, dpr } = rc
  const {
    font = '12px system-ui',
    color = colors.text,
    align = 'left',
    baseline = 'middle'
  } = options

  ctx.font = font.replace(/(\d+)px/, (_, size) => `${parseInt(size) * dpr}px`)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, x * dpr, y * dpr)
}

/**
 * Draw a line.
 */
export function drawLine(
  rc: RenderContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: {
    color?: string
    width?: number
    dashed?: boolean
  } = {}
): void {
  const { ctx, dpr } = rc
  const { color = colors.gridLine, width = 1, dashed = false } = options

  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width * dpr

  if (dashed) {
    ctx.setLineDash([4 * dpr, 4 * dpr])
  } else {
    ctx.setLineDash([])
  }

  ctx.moveTo(x1 * dpr, y1 * dpr)
  ctx.lineTo(x2 * dpr, y2 * dpr)
  ctx.stroke()
  ctx.setLineDash([])
}

/**
 * Draw a filled rectangle.
 */
export function drawRect(
  rc: RenderContext,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: string
    stroke?: string
    strokeWidth?: number
    radius?: number
  } = {}
): void {
  const { ctx, dpr } = rc
  const { fill, stroke, strokeWidth = 1, radius = 0 } = options

  ctx.beginPath()

  if (radius > 0) {
    const r = radius * dpr
    ctx.roundRect(x * dpr, y * dpr, width * dpr, height * dpr, r)
  } else {
    ctx.rect(x * dpr, y * dpr, width * dpr, height * dpr)
  }

  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth * dpr
    ctx.stroke()
  }
}

// =============================================================================
// Timeline Components
// =============================================================================

/**
 * Draw the header with title and date.
 */
export function drawHeader(
  rc: RenderContext,
  title: string,
  subtitle: string,
  date: Date
): void {
  const { layout } = rc

  // Background
  drawRect(rc, layout.header.x, layout.header.y, layout.header.width, layout.header.height, {
    fill: colors.headerBg
  })

  // Title (center)
  drawText(rc, title, layout.width / 2, 20, {
    font: '18px system-ui',
    align: 'center',
    color: colors.accent
  })

  // Subtitle
  drawText(rc, subtitle, layout.width / 2, 42, {
    font: '12px system-ui',
    align: 'center',
    color: colors.textMuted
  })

  // Date (right side)
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  drawText(rc, dateStr, layout.width - 20, 30, {
    font: '14px system-ui',
    align: 'right'
  })

  // Bottom border
  drawLine(rc, 0, layout.header.height, layout.width, layout.header.height)
}

/**
 * Draw the time axis with hour markers.
 */
export function drawTimeAxis(rc: RenderContext): void {
  const { layout } = rc

  // Background
  drawRect(rc, layout.timeAxis.x, layout.timeAxis.y, layout.timeAxis.width, layout.timeAxis.height, {
    fill: colors.headerBg
  })

  // Hour markers
  const startHour = layout.timeStart.getHours()
  const endHour = layout.timeEnd.getHours() + (layout.timeEnd.getMinutes() > 0 ? 1 : 0)

  for (let hour = startHour; hour <= endHour + 24; hour++) {
    const time = new Date(layout.timeStart)
    time.setHours(hour, 0, 0, 0)

    if (time > layout.timeEnd) break

    const x = timeToX(time, layout)
    if (x < layout.timeAxis.x || x > layout.timeAxis.x + layout.timeAxis.width) continue

    // Tick mark
    drawLine(rc, x, layout.timeAxis.y + layout.timeAxis.height - 8, x, layout.timeAxis.y + layout.timeAxis.height)

    // Hour label
    drawText(rc, formatTime(time), x, layout.timeAxis.y + 12, {
      font: '10px system-ui',
      align: 'center',
      color: colors.textMuted
    })
  }

  // Bottom border
  drawLine(rc, layout.timeAxis.x, layout.timeAxis.y + layout.timeAxis.height,
    layout.timeAxis.x + layout.timeAxis.width, layout.timeAxis.y + layout.timeAxis.height)
}

/**
 * Draw squadron rows with labels.
 */
export function drawSquadronRows(
  rc: RenderContext,
  squadrons: Array<{ id: string; name: string; tms: string; modex: string }>
): void {
  const { layout } = rc
  const labelWidth = 100

  squadrons.forEach((sq, idx) => {
    const y = layout.squadronArea.y + idx * layout.squadronRowHeight

    // Alternating background
    if (idx % 2 === 1) {
      drawRect(rc, 0, y, layout.width, layout.squadronRowHeight, {
        fill: 'rgba(255, 255, 255, 0.02)'
      })
    }

    // Squadron label background
    drawRect(rc, 0, y, labelWidth, layout.squadronRowHeight, {
      fill: colors.headerBg
    })

    // Squadron name
    drawText(rc, sq.name, 10, y + layout.squadronRowHeight / 2 - 8, {
      font: '12px system-ui',
      color: colors.accent
    })

    // TMS and modex
    drawText(rc, `${sq.tms} ${sq.modex}`, 10, y + layout.squadronRowHeight / 2 + 8, {
      font: '10px system-ui',
      color: colors.textMuted
    })

    // Right border on label
    drawLine(rc, labelWidth, y, labelWidth, y + layout.squadronRowHeight)

    // Bottom border
    drawLine(rc, 0, y + layout.squadronRowHeight, layout.width, y + layout.squadronRowHeight, {
      color: colors.gridLineLight
    })
  })
}

/**
 * Draw vertical grid lines for each hour.
 */
export function drawTimeGrid(rc: RenderContext): void {
  const { layout } = rc

  const startHour = layout.timeStart.getHours()
  const endHour = layout.timeEnd.getHours() + 24

  for (let hour = startHour; hour <= endHour; hour++) {
    const time = new Date(layout.timeStart)
    time.setHours(hour, 0, 0, 0)

    if (time > layout.timeEnd) break

    const x = timeToX(time, layout)
    if (x < layout.timeAxis.x || x > layout.timeAxis.x + layout.timeAxis.width) continue

    drawLine(rc, x, layout.squadronArea.y, x, layout.squadronArea.y + layout.squadronArea.height, {
      color: colors.gridLineLight
    })
  }
}

/**
 * Draw cycle boundaries.
 */
export function drawCycles(
  rc: RenderContext,
  cycles: Array<{ id: string; start: string; end: string }>
): void {
  const { layout } = rc

  cycles.forEach(cycle => {
    const startTime = new Date(cycle.start)
    const endTime = new Date(cycle.end)

    const startX = timeToX(startTime, layout)
    const endX = timeToX(endTime, layout)

    // Cycle start line (green)
    drawLine(rc, startX, layout.squadronArea.y, startX, layout.squadronArea.y + layout.squadronArea.height, {
      color: colors.cycleStart,
      width: 2
    })

    // Cycle end line (red)
    drawLine(rc, endX, layout.squadronArea.y, endX, layout.squadronArea.y + layout.squadronArea.height, {
      color: colors.cycleEnd,
      width: 2
    })
  })
}

/**
 * Draw day/night shading.
 */
export function drawDayNightShading(
  rc: RenderContext,
  sunrise: Date,
  sunset: Date
): void {
  const { layout } = rc

  const sunriseX = timeToX(sunrise, layout)
  const sunsetX = timeToX(sunset, layout)
  const startX = layout.timeAxis.x
  const endX = layout.timeAxis.x + layout.timeAxis.width

  // Night before sunrise
  if (sunriseX > startX) {
    drawRect(rc, startX, layout.squadronArea.y, sunriseX - startX, layout.squadronArea.height, {
      fill: colors.nightShade
    })
  }

  // Day
  if (sunriseX < endX && sunsetX > startX) {
    const dayStart = Math.max(sunriseX, startX)
    const dayEnd = Math.min(sunsetX, endX)
    drawRect(rc, dayStart, layout.squadronArea.y, dayEnd - dayStart, layout.squadronArea.height, {
      fill: colors.dayShade
    })
  }

  // Night after sunset
  if (sunsetX < endX) {
    drawRect(rc, sunsetX, layout.squadronArea.y, endX - sunsetX, layout.squadronArea.height, {
      fill: colors.nightShade
    })
  }
}

/**
 * Draw an event bar.
 */
export function drawEvent(
  rc: RenderContext,
  event: {
    start: string
    end: string
    missionNumber: string
    aircraftCount: number
    missionType: string
    isAlert: boolean
  },
  squadronIndex: number
): void {
  const { layout } = rc

  const startTime = new Date(event.start)
  const endTime = new Date(event.end)

  const x = timeToX(startTime, layout)
  const width = timeToX(endTime, layout) - x
  const y = layout.squadronArea.y + squadronIndex * layout.squadronRowHeight + 10
  const height = layout.squadronRowHeight - 20

  // Event bar
  drawRect(rc, x, y, width, height, {
    fill: event.isAlert ? colors.eventBarAlert : colors.eventBar,
    radius: 4
  })

  // Mission info text
  const label = event.missionNumber
    ? `${event.missionNumber} ${event.aircraftCount} ${event.missionType}`
    : `${event.aircraftCount} ${event.missionType || 'TBD'}`

  if (width > 40) {
    drawText(rc, label, x + width / 2, y + height / 2, {
      font: '10px system-ui',
      align: 'center',
      color: '#ffffff'
    })
  }
}

/**
 * Draw the footer with summary info.
 */
export function drawFooter(rc: RenderContext): void {
  const { layout } = rc

  drawRect(rc, layout.footer.x, layout.footer.y, layout.footer.width, layout.footer.height, {
    fill: colors.headerBg
  })

  // Top border
  drawLine(rc, 0, layout.footer.y, layout.width, layout.footer.y)
}
