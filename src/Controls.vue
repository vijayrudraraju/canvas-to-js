<template>
<div class="tile is-vertical">

  <div class="tile is-parent notification is-primary">
    <div class="tile is-child">
      <label class="label">Line color</label>
      <slider id="picker" v-model="lineColor" @change-color="onStrokeChange"></slider>
    </div>
  </div>

  <div class="tile is-parent notification is-primary" v-show="stroke_mode != 1 && fill_mode == 1 && useFill && connectLines">
    <div class="tile is-child">
      <label class="label">Fill color</label>
      <slider id="fill_picker" v-model="fillColor" @change-color="onFillChange"></slider>
    </div>
  </div>

  <div class="tile is-parent notification is-primary" v-show="fill_mode == 2 && useFill">
    <div class="tile is-child">
      <label class="label">Gradient Color</label>
      <div class="level">
        <slider id="gradient_picker" v-model="gradientColor" @change-color="onGradientChange"></slider>
      </div>
      <div class="level">
        <canvas id="gradientCanvas" height="50" class="level-item"></canvas>
      </div>
      <div class="level">
        <!--<a id="gradient" class="button level-item" @click="onGradientModeClick">gradient</a>-->
        <p class="control">
          <a id="addStop" class="button level-item" @click="onAddStopClick">Add Color Stop</a>
        </p>
        <p class="control">
          <a id="clearGradient" class="button level-item" @click="onClearGradientClick">Clear Gradient</a>
        </p>
      </div>
    </div>
  </div>

  <div class="tile is-parent notification is-primary" style="height:200px">
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
            <input type="radio" name="strokeType" value="1" v-model="stroke_mode">
            Scribble
          </label>
        </p>
        <p class="control">
          <label class="radio">
            <input type="radio" name="strokeType" value="2" v-model="stroke_mode">
            Quadratic
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

  <div class="tile is-parent notification is-primary">
    <div class="tile is-child">
      <label class="label">Commands</label>
      <div class="level">
        <p class="control">
          <a id="execute" class="button" @click="onClickExecute">RUN CODE</a>
        </p>
        <p class="control">
          <a id="clear" @click="onClearClick" class="button">ERASE ALL</a>
        </p>
      </div>
    </div>
  </div>
</div>
</template>

<script>

export default {

  name: 'controls',
  methods: {
    onStrokeChange(val) {
      console.log('onStrokeChange', val.hex, this.lineColor)

    },
    onFillChange(val) {
      console.log('onFillChange', val.hex)

    },
    onGradientChange(val) {
      console.log('onGradientChange', val)

    },
  }

}
</script>
