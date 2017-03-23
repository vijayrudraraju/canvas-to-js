<template>
<div class="tile is-ancestor" @mouseup="onBodyMouseUp" @click="onBodyClick">
  <div class="tile is-vertical is-3">

    <div class="tile">
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

      <div class="tile is-parent is-vertical">
        <div class="tile is-child">
          <label class="label">Drawing Canvas</label>
          <canvas id="editorCanvas" width="600" height="300" @mousedown="onCanvasMouseDown" @mousemove="onCanvasMouseMove" @click="onCanvasClick" class="level-item"></canvas>
        </div>
        <div class="tile is-child">
          <label class="label">Drawing Code</label>
          <div class="level">
            <textarea id="editorTextArea" class="textarea level-item"></textarea>
          </div>
        </div>
      </div>

    </div>

  </div>
</div>
</template>

<script>
import {
  lineStageOne,
  lineStageTwo,
  quadraticStageOne,
  quadraticStageTwo,
  quadraticStageThree,
  quadraticMoveStage,
  execute,
  drawPointer,
  setGradientFromPoints,
  extractXFromEvent,
  extractYFromEvent,
  resetCode,
} from './utils'

import { Slider } from 'vue-color'

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  setCoords(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default {

  name: 'main',
  components: {
    Slider
  },
  data () {
    return {
      lineColor: {
        hex: '#194d33', a: 1
      },
      fillColor: {
        hex: '#599d33', a: 1
      },
      gradientColor: {
        hex: '#294d93', a: 1
      },
      canvas: null,
      context: null,
      image_buffer: null,
      fill_chain_buffer: null,
      stroke_mode: "1",
      fill_mode: "1",
      drawing: false,
      lineThickness: 2,
      gradientCanvas: null,
      gradientContext: null,
      gradient_stops: [],
      gradient: null,
      picker: null,
      fill_picker: null,
      gradient_picker: null,
      oldX: 0,
      oldY: 0,
      textArea: null,
      started: false,
      connectLines: true,
      useFill: true,
      quadratic_stage: 0,
      points: [],
      fill_flag: 0,
      adj_x: 0,
      adj_y: 0,
      quadraticActivated: false,
      gradient_point_1: new Point(0, 0),
      gradient_point_2: new Point(0, 0),
      gradient_stage: 0,
      pickingGradient: false,
      straightCount: 0,
    }
  },
  created () {
  },
  mounted () {
    console.log('MainView', 'mounted')
    this.init()
  },
  computed: {
    canvasLeft() {
      let left = 0
      let ptr = this.canvas

      do {
        left += ptr.offsetLeft || 0
        ptr = ptr.offsetParent
      } while(ptr)

      return left
    },
    canvasTop() {
      let top = 0
      let ptr = this.canvas

      do {
        top += ptr.offsetTop || 0
        ptr = ptr.offsetParent
      } while(ptr)

      return top
    }
  },
  methods: {
    init() {
      console.log('init')

      this.picker = document.getElementById('picker');
      this.fill_picker = document.getElementById('fill_picker');
      this.gradient_picker = document.getElementById('gradient_picker')

      this.gradientCanvas = document.getElementById('gradientCanvas')

      this.gradientContext = this.gradientCanvas.getContext('2d')
      this.gradientContext.fillStyle = '#ffffff';
      this.gradientContext.fillRect(0, 0, this.gradientCanvas.width, this.gradientCanvas.height);

      this.canvas = document.getElementById('editorCanvas')
      if (!this.canvas) {
        alert('Error: I cannot find the canvas element!')
        return
      }
      console.log('init', 'canvas.width', this.canvas.width, 'canvas.height', this.canvas.height)

      if (!this.canvas.getContext) {
        alert('Error: no canvas.getContext!');
        return;
      }

      this.context = this.canvas.getContext('2d');
      if (!this.context) {
        alert('Error: failed to getContext!')
        return
      }

      this.textArea = document.getElementById('editorTextArea')
      resetCode({ obj:this })

      this.context.lineWidth = this.lineThickness
      this.image_buffer = this.context.createImageData(this.canvas.width, this.canvas.height)
    },
    onStrokeChange(val) {
      console.log('onStrokeChange', val.hex, this.lineColor)

      this.lineColor = val
      this.textArea.value = this.textArea.value+`\ncontext.strokeStyle = '${this.lineColor.hex}';\n`
    },
    onFillChange(val) {
      console.log('onFillChange', val.hex)

      this.fillColor = val
      this.textArea.value = this.textArea.value+`\ncontext.fillStyle = '${this.fillColor.hex}';\n`
    },
    onGradientChange(val) {
      console.log('onGradientChange', val)

      this.gradientColor = val
    },
    onCanvasMouseDown(ev) {
      if (this.stroke_mode != 1 || this.drawing) {
        return
      }

      let x = ev.pageX - this.canvasLeft
      let y = ev.pageY - this.canvasTop

      console.log('onCanvasMouseDown', 'x', x, 'y', y)

      this.drawing = true

      this.context.strokeStyle = this.lineColor.hex;
      this.context.lineWidth = this.lineThickness

      this.oldX = x
      this.oldY = y

      this.context.beginPath()
      this.context.moveTo(this.oldX, this.oldY)

      this.textArea.value = this.textArea.value+`\n// Scribble\n`
      this.textArea.value = this.textArea.value+`context.beginPath();\n`
      this.textArea.value = this.textArea.value+`context.moveTo(${this.oldX}, ${this.oldY});\n`
    },
    onCanvasMouseMove(ev) {
      if (this.stroke_mode != 1 || !this.drawing) {
        if (this.quadraticActivated) {
          quadraticMoveStage({ obj:this, ev })
        }
        return
      }

      console.log('onCanvasMouseMove')

      let x = ev.pageX - this.canvasLeft
      let y = ev.pageY - this.canvasTop

      this.context.strokeStyle = this.lineColor.hex
      this.context.fillStyle = this.fillColor.hex

      if (this.drawing) {
        this.context.moveTo(this.oldX, this.oldY)
        this.context.lineTo(x, y)
        this.context.stroke()

        this.textArea.value = this.textArea.value+`context.moveTo(${this.oldX}, ${this.oldY});\n`
        this.textArea.value = this.textArea.value+`context.lineTo(${x}, ${y});\n`
      }

      this.oldX = x
      this.oldY = y
    },
    onBodyMouseUp(ev) {
      if (this.stroke_mode != 1 || !this.drawing) {
        return
      }

      console.log('onBodyMouseUp')

      this.context.stroke()

      this.drawing = false
      this.textArea.value = this.textArea.value+`context.stroke();\n`
      this.textArea.value = this.textArea.value+`\n`
    },
    onClearClick() {
      console.log('onClearClick')

      this.clearCanvas()
      resetCode({ obj:this })
    },
    onClearGradientClick() {
      console.log('onClearGradientClick')

      this.gradient_stops.length = 0;

      this.gradientContext.fillStyle = '#ffffff';
      this.gradientContext.fillRect(0, 0, this.gradientCanvas.width, this.gradientCanvas.height);
    },
    clearVars() {
      this.quadraticActivated = false
      this.quadratic_stage = 0
      this.started = false;
      this.points = [];
    },
    clearCanvas() {
      console.log('clearCanvas')

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.image_buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)		

      this.canvas.width = this.canvas.width

      this.context.fillStyle = '#dddddd'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.fillStyle = this.fillColor.hex

      this.context.lineWidth = this.lineThickness

      this.clearVars()
    },
    onCanvasClick(ev) {
      if (this.pickingGradient || this.stroke_mode == 1) {
        return
      }

      console.log('')
      console.log('')
      console.log('onCanvasClick', 'stroke_mode', this.stroke_mode, 'started', this.started)
      console.log('onCanvasClick', 'quadratic_stage', this.quadratic_stage)
      console.log('onCanvasClick', 'fill_mode', this.fill_mode, 'fill_flag', this.fill_flag)

      let x = extractXFromEvent({ ev })
      let y = extractYFromEvent({ ev })

      this.context.strokeStyle = this.lineColor.hex;
      this.context.fillStyle = this.fillColor.hex;

      switch (parseInt(this.stroke_mode)) {
        case 0:
          if (!this.started) {
            lineStageOne({ obj: this, x, y })
          } else {
            lineStageTwo({ obj: this, x, y })
          }
          break
        case 2:
          switch (this.quadratic_stage) {
            case 0:
              quadraticStageOne({ obj: this, x, y })
              break
            case 1:
              quadraticStageTwo({ obj: this, x, y })
              break
            case 2:
              quadraticStageThree({ obj: this, x, y })
              break
          }
          break
      }
    },
    onFillCheckboxClick() {
      //console.log('onFillCheckboxClick', this.fill_picker)
    },
    onLinkCheckboxClick() {
      //console.log('onLinkCheckboxClick', this.connectLines)

      if (!this.connectLines) {
        this.useFill = false
      }
    },
    resetToLastFrame() {
      //console.log('resetToLastFrame')

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.putImageData(this.image_buffer, 0, 0);
    },
    onBodyClick(ev) {
      //console.log('onBodyClick', 'useFill', this.useFill, 'connectLines', this.connectLines)

      let id = ev.target.id
      if (id !== 'editorCanvas' && id !== 'clear' && id !== 'execute') {
        console.log('onBodyClick', 'id', id, 'quadratic_stage', this.quadratic_stage, 'fill_mode', this.fill_mode)
        this.resetToLastFrame() 
        this.clearVars()
      }
    },
    onAddStopClick(ev) {
      console.log('onAddStopClick', 'gradientColor', this.gradientColor.hex)

      this.gradient_stops.push(this.gradientColor.hex)

      this.gradient = this.gradientContext.createLinearGradient(0, 0, 200, 0)
      for (let i=0; i<this.gradient_stops.length; i++) {
        if (i == 0) {
          this.gradient.addColorStop(0.0, this.gradient_stops[0])
        } else {
          this.gradient.addColorStop(i*(1.0/(this.gradient_stops.length-1)), this.gradient_stops[i])
        }
      }

      this.gradientContext.fillStyle = this.gradient
      this.gradientContext.fillRect(0, 0, this.gradientCanvas.width, this.gradientCanvas.height)
    },
    highlightOrigin(ev) {
      console.log('highlightOrigin')

      if (this.points[0] === undefined) {
        this.points = []
        this.canvas.removeEventListener('mousemove', this.highlightOrigin, false)
        return
      }

      let x = extractXFromEvent({ ev })
      let y = extractYFromEvent({ ev })

      let length = this.points.length

      //console.log('highlightOrigin', 'x', x, 'y', y)

      if (Math.abs(x - this.points[0].x) < 7 && Math.abs(y - this.points[0].y) < 7) {
        drawPointer({ obj:this, x:this.points[0].x, y:this.points[0].y })

        this.fill_flag = 1

        this.adj_x = this.points[0].x
        this.adj_y = this.points[0].y
      } else {
        this.resetToLastFrame()
        this.fill_flag = 0
      }
    },
    handleLastStageClick() {

      console.log('handleLastStageClick', 'stroke_mode', this.stroke_mode, 'fill_mode', this.fill_mode)

      for (let i=0; i<this.points.length; i++) {
        console.log('handleLastStageClick', i, 'points', this.points[i].x, this.points[i].y)
      }

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.putImageData(this.fill_chain_buffer, 0, 0)

      this.context.beginPath()
      this.context.moveTo(this.points[0].x, this.points[0].y)

      //console.log('handleLastStageClick', 'this.points[0]', this.points[0].x, this.points[0].y)

      if (this.stroke_mode == 2) {
        for (let i=0; i<(this.points.length-1)/2; i++) {
          this.context.quadraticCurveTo( 
            this.points[(i*2)+2].x,
            this.points[(i*2)+2].y,
            this.points[(i*2)+1].x,
            this.points[(i*2)+1].y 
          )
        }
      } else if (this.stroke_mode == 0 && this.points.length > 1) {
        for (let i=0; i<this.points.length; i++) {
          console.log('handleLastStageClick', 'this.points[i]', this.points[i].x, this.points[i].y)
          this.context.lineTo(this.points[i].x, this.points[i].y) 
        }
      }

      if (this.useFill && this.fill_mode == 2) {
        this.context.fillStyle = this.fill_gradient

        this.textArea.value = this.textArea.value+`\n// Gradient\ngradient = context.createLinearGradient(${this.gradient_point_1.x}, ${this.gradient_point_1.y}, ${this.gradient_point_2.x}, ${this.gradient_point_2.y});\n`;
        for (let i=0; i<this.gradient_stops.length; i++) {
          if (i == 0) {
            this.textArea.value = this.textArea.value+`gradient.addColorStop(0.0, '${this.gradient_stops[0]}');\n`;
          } else {
            this.gradient.addColorStop(i*(1.0/(this.gradient_stops.length-1)), this.gradient_stops[i])
            this.textArea.value = this.textArea.value+`gradient.addColorStop(${i*(1.0/(this.gradient_stops.length-1))}, '${this.gradient_stops[1]}');\n`;
          }
        }
        this.textArea.value = this.textArea.value+`context.fillStyle = gradient;\n\n`;
      }

      if (this.useFill) {
        this.context.fill()
      }
      this.context.stroke()

      if (this.stroke_mode == 2) {
        this.textArea.value = this.textArea.value+`\n// Quadratic line\ncontext.beginPath();\n`;
        this.textArea.value = this.textArea.value+`context.moveTo(${this.points[0].x}, ${this.points[0].y});\n`;

        for (let i=0; i<(this.points.length-1)/2; i++) {
          this.textArea.value = this.textArea.value+`context.quadraticCurveTo(${this.points[(i*2)+2].x}, ${this.points[(i*2)+2].y}, ${this.points[(i*2)+1].x}, ${this.points[(i*2)+1].y});\n`;
        }

      }

      if (this.useFill) {
        this.textArea.value = this.textArea.value+`context.fill();\n`;
      }
      this.textArea.value = this.textArea.value+`context.stroke();\n`;

      this.quadratic_stage = 0
      this.fill_flag = 0
      this.pickingGradient = false
      this.started = false

      this.image_buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)		

    },
    pickGradientDirection(ev) {

      console.log('pickGradientDirection', 'fill_mode', this.fill_mode)

      if (!this.useFill || !this.connectLines || this.fill_mode == 1) {
        return
      }

      let x = extractXFromEvent({ ev })
      let y = extractYFromEvent({ ev })

      this.context.strokeStyle = this.lineColor.hex
      this.context.fillStyle = this.gradientColor.hex

      if (this.gradient_stage == 0) {
        drawPointer({ obj:this, x, y })

        this.context.beginPath()
        this.context.moveTo(x, y)

        this.gradient_point_1.setCoords(x, y)

        this.gradient_stage = 1
      } else if (this.gradient_stage == 1) {
        this.context.lineTo(x, y)
        this.context.stroke()

        this.gradient_point_2.setCoords(x, y)

        setGradientFromPoints({ obj:this, p1:this.gradient_point_1, p2:this.gradient_point_2 })

        for (let i=0; i<this.gradient_stops.length; i++) {
          if (i == 0) {
            this.fill_gradient.addColorStop(0.0, this.gradient_stops[0])
          } else {
            this.fill_gradient.addColorStop(i*(1.0/(this.gradient_stops.length-1)), this.gradient_stops[i])
          }
        }

        this.gradient_stage = 0

        this.handleLastStageClick()

        //this.canvas.addEventListener('click', canvas_click_handler, false)
        this.canvas.removeEventListener('click', this.pickGradientDirection, false)
      } 

    },
    onClickExecute() {
      console.log('onClickExecute')
      execute({ obj: this })
    }
  }

}
</script>

<style>
</style>
