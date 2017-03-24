<template>
<div class="columns" @mouseup="onBodyMouseUp">

  <controls v-on:control="onControl"></controls>

  <div class="column">
    <div class="tile is-parent is-vertical notification">
      <div class="tile is-child">
        <label class="label">Commands</label>
        <div class="field is-grouped">
          <p class="control">
            <a id="execute" class="button is-success" @click="onClickExecute">RUN CODE</a>
          </p>
          <p class="control">
            <a id="clear" @click="onClearClick" class="button is-danger">ERASE ALL</a>
          </p>
        </div>
      </div>
      <div class="tile is-child">
        <label class="label">{{ feedbackText }}</label>
        <canvas id="editorCanvas" width="600" height="300" @mousedown="onCanvasMouseDown" @mousemove="onCanvasMouseMove" @click="onCanvasClick" class="level-item"></canvas>
      </div>
      <div class="tile is-child">
        <label class="label">Drawing Code</label>
        <div class="control">
          <textarea id="editorTextArea" class="textarea"></textarea>
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
  resetFeedback,
} from './utils'

import Controls from 'src/Controls'

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
    Controls
  },
  data () {
    return {
      controlData: {},
      canvas: null,
      context: null,
      image_buffer: null,
      fill_chain_buffer: null,
      drawing: false,
      lineThickness: 2,
      gradientCanvas: null,
      gradientContext: null,
      gradient: null,
      oldX: 0,
      oldY: 0,
      textArea: null,
      started: false,
      connectLines: true,
      useFill: true,
      quadratic_stage: 0,
      points: [],
      highlight_flag: false,
      adj_x: 0,
      adj_y: 0,
      gradient_point_1: new Point(0, 0),
      gradient_point_2: new Point(0, 0),
      gradient_stage: 0,
      pickingGradient: false,
      straightCount: 0,
      feedbackText: 'Drawing Canvas',
    }
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

      this.gradientCanvas = document.getElementById('gradientCanvas')

      this.gradientContext = this.gradientCanvas.getContext('2d')
      this.gradient = this.gradientContext.createLinearGradient(0, 0, 200, 0)
      for (let i=0; i<this.controlData.gradient_stops.length; i++) {
        if (i == 0) {
          this.gradient.addColorStop(0.0, this.controlData.gradient_stops[0])
        } else {
          this.gradient.addColorStop(i*(1.0/(this.controlData.gradient_stops.length-1)), this.controlData.gradient_stops[i])
        }
      }
      this.gradientContext.fillStyle = this.gradient
      this.gradientContext.fillRect(0, 0, this.gradientCanvas.width, this.gradientCanvas.height)

      this.canvas = document.getElementById('editorCanvas')
      if (!this.canvas) {
        alert('Error: I cannot find the canvas element!')
        return
      }
      console.log('init', 'canvas.width', this.canvas.width, 'canvas.height', this.canvas.height)

      this.context = this.canvas.getContext('2d');

      this.textArea = document.getElementById('editorTextArea')
      resetCode({ obj:this })

      this.context.strokeStyle = this.controlData.lineColor.hex
      this.context.fillStyle = this.controlData.fillColor.hex;
      this.context.lineWidth = this.lineThickness

      this.image_buffer = this.context.createImageData(this.canvas.width, this.canvas.height)
    },
    onCanvasMouseDown(ev) {
      if (this.controlData.stroke_mode != 1 || this.drawing) {
        return
      }

      let x = ev.pageX - this.canvasLeft
      let y = ev.pageY - this.canvasTop

      console.log('onCanvasMouseDown', 'x', x, 'y', y)

      this.drawing = true

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
      if (this.controlData.stroke_mode != 1 || !this.drawing) {
        if (this.quadratic_stage == 2) {
          this.feedbackText = 'Move mouse to choose the shape of the CURVE'
          quadraticMoveStage({ obj:this, ev })
        }
        return
      }

      console.log('onCanvasMouseMove')

      let x = ev.pageX - this.canvasLeft
      let y = ev.pageY - this.canvasTop

      if (this.drawing) {
        this.context.moveTo(this.oldX, this.oldY)
        this.context.lineTo(x, y)
        this.context.stroke()

        this.textArea.value = this.textArea.value+`context.moveTo(${this.oldX}, ${this.oldY});\n`
        this.textArea.value = this.textArea.value+`context.lineTo(${x}, ${y});\n`
      }

      this.oldX = x
      this.oldY = y

      this.feedbackText = 'Keep scribbling!'
    },
    onBodyMouseUp(ev) {
      if (this.controlData.stroke_mode != 1 || !this.drawing) {
        let id = ev.target.id
        if (id !== 'editorCanvas' && id !== 'clear' && id !== 'execute') {
          console.log('onBodyClick', 'id', id, 'quadratic_stage', this.quadratic_stage, 'fill_mode', this.controlData.fill_mode)
          this.resetToLastFrame() 
          this.clearVars()
          resetFeedback({ obj:this })

          if (this.controlData.stroke_mode == 0) {
            if (this.controlData.useFill) {
              this.textArea.value = this.textArea.value+`context.fill();\n`
            }
            this.textArea.value = this.textArea.value+`context.stroke();\n`
            this.textArea.value = this.textArea.value+`\n`
          }
        }
        return
      }

      console.log('onBodyMouseUp')

      this.context.stroke()

      this.drawing = false
      this.textArea.value = this.textArea.value+`context.stroke();\n`
      this.textArea.value = this.textArea.value+`\n`

      resetFeedback({ obj:this })
    },
    onClearClick() {
      console.log('onClearClick')

      this.clearCanvas()
      resetCode({ obj:this })
    },
    clearVars() {
      this.quadratic_stage = 0
      this.started = false
      this.points = []
      this.highlight_flag = false
      this.pickingGradient = false
    },
    clearCanvas() {
      console.log('clearCanvas')

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.image_buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)		

      this.canvas.width = this.canvas.width

      this.context.fillStyle = '#dddddd'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

      this.context.lineWidth = this.lineThickness

      this.clearVars()
    },
    onCanvasClick(ev) {
      if (this.pickingGradient || this.controlData.stroke_mode == 1) {
        return
      }

      console.log('')
      console.log('')
      console.log('onCanvasClick', 'stroke_mode', this.controlData.stroke_mode, 'started', this.started)
      console.log('onCanvasClick', 'quadratic_stage', this.quadratic_stage)
      console.log('onCanvasClick', 'fill_mode', this.controlData.fill_mode, 'highlight_flag', this.highlight_flag)

      let x = extractXFromEvent({ ev })
      let y = extractYFromEvent({ ev })

      switch (parseInt(this.controlData.stroke_mode)) {
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
    resetToLastFrame() {
      //console.log('resetToLastFrame')

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.putImageData(this.image_buffer, 0, 0);
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

        this.highlight_flag = true

        this.adj_x = this.points[0].x
        this.adj_y = this.points[0].y
      } else {
        this.resetToLastFrame()
        this.highlight_flag = false
      }
    },
    handleLastStageClick() {

      console.log('handleLastStageClick', 'stroke_mode', this.controlData.stroke_mode, 'fill_mode', this.controlData.fill_mode)

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.putImageData(this.fill_chain_buffer, 0, 0)

      this.context.beginPath()
      this.context.moveTo(this.points[0].x, this.points[0].y)

      //console.log('handleLastStageClick', 'this.points[0]', this.points[0].x, this.points[0].y)

      if (this.controlData.stroke_mode == 2) {
        this.feedbackText = 'Completed the CURVE, draw something else'
        for (let i=0; i<(this.points.length-1)/2; i++) {
          this.context.quadraticCurveTo( 
            this.points[(i*2)+2].x,
            this.points[(i*2)+2].y,
            this.points[(i*2)+1].x,
            this.points[(i*2)+1].y 
          )
        }
      } else if (this.controlData.stroke_mode == 0 && this.points.length > 1) {
        this.feedbackText = 'Completed the LINE, draw something else'
        for (let i=0; i<this.points.length; i++) {
          console.log('handleLastStageClick', 'this.points[i]', this.points[i].x, this.points[i].y)
          this.context.lineTo(this.points[i].x, this.points[i].y) 
        }
      }

      if (this.controlData.useFill && this.controlData.fill_mode == 2) {
        this.context.fillStyle = this.fill_gradient

        this.textArea.value = this.textArea.value+`\n// Gradient\ngradient = context.createLinearGradient(${this.gradient_point_1.x}, ${this.gradient_point_1.y}, ${this.gradient_point_2.x}, ${this.gradient_point_2.y});\n`;
        for (let i=0; i<this.controlData.gradient_stops.length; i++) {
          if (i == 0) {
            this.textArea.value = this.textArea.value+`gradient.addColorStop(0.0, '${this.controlData.gradient_stops[0]}');\n`;
          } else {
            this.gradient.addColorStop(i*(1.0/(this.controlData.gradient_stops.length-1)), this.controlData.gradient_stops[i])
            this.textArea.value = this.textArea.value+`gradient.addColorStop(${i*(1.0/(this.controlData.gradient_stops.length-1))}, '${this.controlData.gradient_stops[1]}');\n`;
          }
        }
        this.textArea.value = this.textArea.value+`context.fillStyle = gradient;\n\n`;
      }

      if (this.controlData.useFill) {
        this.context.fill()
      }
      this.context.stroke()

      if (this.controlData.stroke_mode == 2) {
        this.textArea.value = this.textArea.value+`\n// Quadratic line\ncontext.beginPath();\n`;
        this.textArea.value = this.textArea.value+`context.moveTo(${this.points[0].x}, ${this.points[0].y});\n`;

        for (let i=0; i<(this.points.length-1)/2; i++) {
          this.textArea.value = this.textArea.value+`context.quadraticCurveTo(${this.points[(i*2)+2].x}, ${this.points[(i*2)+2].y}, ${this.points[(i*2)+1].x}, ${this.points[(i*2)+1].y});\n`;
        }

      }

      if (this.controlData.useFill) {
        this.textArea.value = this.textArea.value+`context.fill();\n`;
      }
      this.textArea.value = this.textArea.value+`context.stroke();\n`;

      this.clearVars()

      this.image_buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)		

    },
    pickGradientDirection(ev) {

      console.log('pickGradientDirection', 'fill_mode', this.controlData.fill_mode)

      if (!this.controlData.useFill || !this.controlData.connectLines || this.controlData.fill_mode == 1) {
        return
      }

      let x = extractXFromEvent({ ev })
      let y = extractYFromEvent({ ev })

      this.context.fillStyle = this.controlData.gradientColor.hex

      if (this.gradient_stage == 0) {
        drawPointer({ obj:this, x, y })

        this.context.beginPath()
        this.context.moveTo(x, y)

        this.gradient_point_1.setCoords(x, y)

        this.gradient_stage = 1

        this.feedbackText = 'Choose a 2nd point to end the GRADIENT'
      } else if (this.gradient_stage == 1) {
        this.context.lineTo(x, y)
        this.context.stroke()

        this.gradient_point_2.setCoords(x, y)

        setGradientFromPoints({ obj:this, p1:this.gradient_point_1, p2:this.gradient_point_2 })

        for (let i=0; i<this.controlData.gradient_stops.length; i++) {
          if (i == 0) {
            this.fill_gradient.addColorStop(0.0, this.controlData.gradient_stops[0])
          } else {
            this.fill_gradient.addColorStop(i*(1.0/(this.controlData.gradient_stops.length-1)), this.controlData.gradient_stops[i])
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
    },
    onControl(obj) {
      console.log('onControl', obj)
      this.controlData = obj

      if (this.context === null) {
        return
      }

      this.context.strokeStyle = this.controlData.lineColor.hex
      this.context.fillStyle = this.controlData.fillColor.hex;

      this.textArea.value = this.textArea.value+`\ncontext.strokeStyle = '${this.controlData.lineColor.hex}';\n`
      this.textArea.value = this.textArea.value+`context.fillStyle = '${this.controlData.fillColor.hex}';\n`

      this.gradient = this.gradientContext.createLinearGradient(0, 0, 200, 0)
      for (let i=0; i<this.controlData.gradient_stops.length; i++) {
        if (i == 0) {
          this.gradient.addColorStop(0.0, this.controlData.gradient_stops[0])
        } else {
          this.gradient.addColorStop(i*(1.0/(this.controlData.gradient_stops.length-1)), this.controlData.gradient_stops[i])
        }
      }
      this.gradientContext.fillStyle = this.gradient
      this.gradientContext.fillRect(0, 0, this.gradientCanvas.width, this.gradientCanvas.height)

      resetFeedback({ obj:this })
    }
  }

}
</script>

<style>
</style>
