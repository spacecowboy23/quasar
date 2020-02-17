import { stopAndPrevent } from '../utils/event'
import { keyCodes } from '../components/slider/slider-utils'
import { between } from '../utils/format'
import { addEvt, getTouchTarget } from '../utils/touch.js'

/**
 *
 * QHeader and QFooter
 *
 * @param view
 * @param layout
 * @param rtl
 * @returns {{}}
 */
const headerFooterStyle = ({ view, layout, rtl }) => {
  let css = {}

  if (view[0] === 'l' && layout.left.space === true) {
    css[rtl === true ? 'right' : 'left'] = `${layout.left.size}px`
  }
  if (view[2] === 'r' && layout.right.space === true) {
    css[rtl === true ? 'left' : 'right'] = `${layout.right.size}px`
  }
  return css
}

/**
 *
 * QKnob and QSlider
 *
 * @param evt
 * @param computedStep
 * @param min
 * @param max
 * @param model
 * @returns {number}
 */
const updateFromKeydown = ({ evt, computedStep, min, max, model }) => {
  if (!keyCodes.includes(evt.keyCode)) return

  stopAndPrevent(evt)

  const step = ([34, 33].includes(evt.keyCode) ? 10 : 1) * computedStep
  const offset = [34, 37, 40].includes(evt.keyCode) ? -step : step

  return between(
    parseFloat((model + offset).toFixed(this.decimals)),
    min,
    max
  )
}

/**
 *
 * TouchHold and TouchRepeat
 *
 * @param evt
 * @param ctx
 */
const sharedTouchStart = ({ evt, ctx }) => {
  if (!(evt.target !== void 0 && typeof ctx.handler === 'function')) return

  const target = getTouchTarget(evt.target)
  addEvt(ctx, 'temp', [
    [ target, 'touchmove', 'move', 'passiveCapture' ],
    [ target, 'touchcancel', 'end', 'notPassiveCapture' ],
    [ target, 'touchend', 'end', 'notPassiveCapture' ]
  ])
  ctx.start(evt)
}

export { headerFooterStyle, updateFromKeydown, sharedTouchStart }
