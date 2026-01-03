<script lang="ts">
  import { onMount } from 'svelte'
  import {
    calculateLayout,
    clearCanvas,
    drawHeader,
    drawTimeAxis,
    drawSquadronRows,
    drawTimeGrid,
    drawCycles,
    drawDayNightShading,
    drawEvent,
    drawFooter,
    type RenderContext,
    type TimelineLayout
  } from '$lib/canvas/renderer'
  import type { Squadron, Event, Cycle, DayData } from '$lib/types'

  // Props
  export let squadrons: Squadron[] = []
  export let events: Event[] = []
  export let cycles: Cycle[] = []
  export let dayData: DayData | null = null
  export let width: number = 800
  export let height: number = 400

  // Internal state
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D | null = null
  let layout: TimelineLayout | null = null
  let dpr = 1

  // Compute time bounds from data or use defaults
  $: timeStart = dayData
    ? new Date(dayData.start)
    : new Date(new Date().setHours(6, 0, 0, 0))

  $: timeEnd = dayData
    ? new Date(dayData.end)
    : new Date(new Date().setHours(20, 0, 0, 0))

  $: title = dayData?.title || 'Airplan'
  $: subtitle = dayData?.subtitle || ''
  $: date = dayData ? new Date(dayData.date) : new Date()
  $: sunrise = dayData ? new Date(dayData.slap.sunrise) : new Date(new Date().setHours(6, 30, 0, 0))
  $: sunset = dayData ? new Date(dayData.slap.sunset) : new Date(new Date().setHours(18, 30, 0, 0))

  // Map events to squadron indices
  function getSquadronIndex(squadronId: string): number {
    return squadrons.findIndex(s => s.id === squadronId)
  }

  // Render the timeline
  function render() {
    if (!ctx || !canvas) return

    // Calculate layout
    layout = calculateLayout(width, height, squadrons.length, timeStart, timeEnd)

    // Create render context
    const rc: RenderContext = { ctx, layout, dpr }

    // Clear and draw
    clearCanvas(rc)
    drawDayNightShading(rc, sunrise, sunset)
    drawTimeGrid(rc)
    drawSquadronRows(rc, squadrons)
    drawCycles(rc, cycles)

    // Draw events
    events.forEach(event => {
      const idx = getSquadronIndex(event.squadronId)
      if (idx >= 0) {
        drawEvent(rc, event, idx)
      }
    })

    drawTimeAxis(rc)
    drawHeader(rc, title, subtitle, date)
    drawFooter(rc)
  }

  // Setup canvas with device pixel ratio
  function setupCanvas() {
    if (!canvas) return

    dpr = window.devicePixelRatio || 1

    // Set display size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Set actual size in memory (scaled for retina)
    canvas.width = width * dpr
    canvas.height = height * dpr

    ctx = canvas.getContext('2d')
    if (ctx) {
      // Scale context to match device pixel ratio
      // (our drawing functions handle this internally)
    }

    render()
  }

  // Reactive rendering when data changes
  $: if (ctx && squadrons && events && cycles) {
    render()
  }

  // Resize handling
  $: if (canvas && (width || height)) {
    setupCanvas()
  }

  onMount(() => {
    setupCanvas()

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      setupCanvas()
    })

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  })
</script>

<div class="timeline-container" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    class="timeline-canvas"
  ></canvas>
</div>

<style>
  .timeline-container {
    position: relative;
    background: #1a1a2e;
    border-radius: 8px;
    overflow: hidden;
  }

  .timeline-canvas {
    display: block;
  }
</style>
