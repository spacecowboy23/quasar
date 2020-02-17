import Vue from 'vue'

import {
  getRatio,
  getModel,
  SliderMixin
} from './slider-utils.js'

import { between } from '../../utils/format.js'
import { cache } from '../../utils/vm.js'
import { updateFromKeydown } from '../../shared/shared'

export default Vue.extend({
  name: 'QSlider',

  mixins: [ SliderMixin ],

  props: {
    value: {
      required: true,
      default: null,
      validator: v => typeof v === 'number' || v === null
    },

    labelValue: [String, Number]
  },

  data () {
    return {
      model: this.value === null ? this.min : this.value,
      curRatio: 0
    }
  },

  watch: {
    value (v) {
      this.model = v === null
        ? 0
        : between(v, this.min, this.max)
    },

    min (v) {
      this.model = between(this.model, v, this.max)
    },

    max (v) {
      this.model = between(this.model, this.min, v)
    }
  },

  computed: {
    ratio () {
      return this.active === true ? this.curRatio : this.modelRatio
    },

    modelRatio () {
      return (this.model - this.min) / (this.max - this.min)
    },

    trackStyle () {
      return {
        [this.horizProp]: 0,
        width: 100 * this.ratio + '%'
      }
    },

    thumbStyle () {
      return {
        [this.horizProp]: (100 * this.ratio) + '%'
      }
    },

    thumbClass () {
      if (this.preventFocus === false && this.focus === true) {
        return 'q-slider--focus'
      }
    },

    pinClass () {
      if (this.labelColor !== void 0) {
        return `text-${this.labelColor}`
      }
    },

    pinTextClass () {
      return 'q-slider__pin-value-marker-text' +
        (this.labelTextColor !== void 0 ? ` text-${this.labelTextColor}` : '')
    },

    events () {
      if (this.editable === true) {
        return this.$q.platform.is.mobile === true
          ? { click: this.__mobileClick }
          : {
            mousedown: this.__activate,
            focus: this.__focus,
            blur: this.__blur,
            keydown: this.__keydown,
            keyup: this.__keyup
          }
      }
    },

    computedLabel () {
      return this.labelValue !== void 0
        ? this.labelValue
        : this.model
    },

    pinStyle () {
      const percent = (this.reverse === true ? -this.ratio : this.ratio - 1)
      return this.__getPinStyle(percent, this.ratio)
    }
  },

  methods: {
    __updateValue (change) {
      if (this.model !== this.value) {
        this.$emit('input', this.model)
      }
      change === true && this.$emit('change', this.model)
    },

    __getDragging () {
      return this.$el.getBoundingClientRect()
    },

    __updatePosition (event, dragging = this.dragging) {
      const ratio = getRatio(
        event,
        dragging,
        this.isReversed
      )

      this.model = getModel(ratio, this.min, this.max, this.step, this.decimals)
      this.curRatio = this.snap !== true || this.step === 0
        ? ratio
        : (this.model - this.min) / (this.max - this.min)
    },

    __focus () {
      this.focus = true
    },

    __keydown (evt) {
      const { computedStep, min, max, model } = this
      const newModel = updateFromKeydown({ evt, computedStep, min, max, model })
      if (!newModel) return
      this.model = newModel
      this.__updateValue()
    }
  },

  render (h) {
    const child = [
      this.__getThumbSvg(h),
      h('div', { staticClass: 'q-slider__focus-ring' })
    ]

    if (this.label === true || this.labelAlways === true) {
      child.push(
        h('div', {
          staticClass: 'q-slider__pin absolute',
          style: this.pinStyle.pin,
          class: this.pinClass
        }, [
          h('div', { staticClass: 'q-slider__pin-text-container', style: this.pinStyle.pinTextContainer }, [
            h('span', {
              staticClass: 'q-slider__pin-text',
              class: this.pinTextClass
            }, [
              this.computedLabel
            ])
          ])
        ]),

        h('div', {
          staticClass: 'q-slider__arrow',
          class: this.pinClass
        })
      )
    }

    if (this.name !== void 0 && this.disable !== true) {
      this.__injectFormInput(child, 'push')
    }

    const track = [
      h('div', {
        staticClass: 'q-slider__track absolute',
        style: this.trackStyle
      })
    ]

    this.markers === true && track.push(
      h('div', {
        staticClass: 'q-slider__track-markers absolute-full fit',
        style: this.markerStyle
      })
    )

    return h('div', {
      staticClass: this.value === null ? ' q-slider--no-value' : '',
      attrs: {
        role: 'slider',
        'aria-valuemin': this.min,
        'aria-valuemax': this.max,
        'aria-valuenow': this.value,
        'data-step': this.step,
        'aria-disabled': this.disable,
        tabindex: this.computedTabindex
      },
      class: this.classes,
      on: this.events,
      directives: this.editable === true ? cache(this, 'dir', [{
        name: 'touch-pan',
        value: this.__pan,
        modifiers: {
          horizontal: true,
          prevent: true,
          stop: true,
          mouse: true,
          mouseAllDir: true
        }
      }]) : null
    }, [
      h('div', {
        staticClass: 'q-slider__track-container absolute'
      }, track),

      h('div', {
        staticClass: 'q-slider__thumb-container absolute non-selectable',
        class: this.thumbClass,
        style: this.thumbStyle
      }, child)
    ])
  }
})
