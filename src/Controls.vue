<template>
<div class="column is-narrow">
  <div class="tile is-parent notification is-primary">
    <div class="tile is-child">
      <div class="field">
        <label class="label">Line type</label>
        <p class="control">
          <label class="radio">
            <input type="radio" name="strokeType" value="0" v-model="stroke_mode">
            Straight
          </label>
        </p>
        <p class="control">
          <label class="radio">
            <input type="radio" name="strokeType" value="1" v-model="stroke_mode" @click="onScribbleClick">
            Scribble
          </label>
        </p>
        <p class="control">
          <label class="radio">
            <input type="radio" name="strokeType" value="2" v-model="stroke_mode">
            Curve
          </label>
        </p>
      </div>
    </div>

    <div class="tile is-child" v-show="stroke_mode != 1">
      <label class="label">Options</label>
      <div class="field">
        <p class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="connectLines" @click="onLinkCheckboxClick">
            Link lines
          </label>
        </p>
        <p class="control" v-show="connectLines">
          <label class="checkbox">
            <input type="checkbox" v-model="useFill" @click="onFillCheckboxClick">
            Use fill
          </label>
        </p>
      </div>
    </div>

  </div>

  <div class="tile is-parent notification is-primary">
    <div class="tile is-child">
      <label class="label">Line color <span class="white">{{ lineColor.hex }}</span></label>
      <compact id="picker" v-model="lineColor" @change-color="onLineColorChange"></compact>
    </div>
  </div>

  <div class="tile is-parent notification is-primary" v-show="stroke_mode != 1 && useFill && connectLines">
    <div class="tile is-child" v-show="stroke_mode != 1 && useFill && connectLines">
      <div class="field">
        <label class="label">Fill type</label>
        <p class="control">
          <label class="radio">
            <input type="radio" name="fillType" value="1" v-model="fill_mode">
            Solid
          </label>
        </p>
        <p class="control">
          <label class="radio">
            <input type="radio" name="fillType" value="2" v-model="fill_mode">
            Gradient
          </label>
        </p>
      </div>
    </div>
 </div>


  <div class="tile is-parent notification is-primary" v-show="stroke_mode != 1 && fill_mode == 1 && useFill && connectLines">
    <div class="tile is-child">
      <label class="label">Fill color <span class="white">{{ fillColor.hex }}</span></label>
      <compact id="fill_picker" v-model="fillColor" @change-color="onFillColorChange"></compact>
    </div>
  </div>

  <div class="tile is-parent notification is-primary" v-show="fill_mode == 2 && useFill">
    <div class="tile is-child">
      <label class="label">Gradient Color</label>
      <div class="level">
        <compact id="gradient_picker" v-model="gradientColor" @change-color="onGradientColorChange"></compact>
      </div>
      <div class="level">
        <canvas id="gradientCanvas" width="180" height="50" class="level-item"></canvas>
      </div>
    </div>
  </div>
</div>
</template>

<script>

import { Compact } from 'vue-color'

export default {

  name: 'controls',
  components: {
    Compact
  },
  mounted () {
    this.$emit('control', this.$data)
  },
  data () {
    return {
      stroke_mode: "1",
      fill_mode: "1",
      connectLines: true,
      useFill: true,
      lineColor: {
        hex: '#194D33', a: 1
      },
      fillColor: {
        hex: '#FDA1FF', a: 1
      },
      gradientColor: {
        hex: '#294d93', a: 1
      },
      gradient_stops: ['#ff0000', '#00ff00'],
    }
  },
  watch: {
    stroke_mode: function(newVal) {
      this.$emit('control', this.$data)
    },
    fill_mode: function(newVal) {
      this.$emit('control', this.$data)
    },
    connectLines: function(newVal) {
      this.$emit('control', this.$data)
    },
    useFill: function(newVal) {
      this.$emit('control', this.$data)
    },
  },
  methods: {
    onLinkCheckboxClick() {
      console.log('onLinkCheckboxClick', this.connectLines)

      if (!this.connectLines) {
        this.useFill = false
      }
    },
    onFillCheckboxClick() {
      console.log('onFillCheckboxClick', this.fill_picker)
    },
    onLineColorChange(val) {
      console.log('onLineColorChange', val)
      this.lineColor = val
      this.$emit('control', this.$data)
    },
    onFillColorChange(val) {
      console.log('onFillColorChange', val)
      this.fillColor = val
      this.$emit('control', this.$data)
    },
    onGradientColorChange(val) {
      console.log('onGradientColorChange', val)

      if (this.gradient_stops.length < 2) {
        this.gradient_stops.push(val.hex)
      } else {
        this.gradient_stops = [val.hex]
      }

      this.$emit('control', this.$data)
    },
    onScribbleClick() {
      console.log('onScribbleClick')
      this.connectLines = false
      this.useFill = false
    },
  }

}
</script>
