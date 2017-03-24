function Point( x, y ) {
	this.x = x;
	this.y = y;
}

export const lineStageOne = function ({ obj, x, y }) {

  console.log('lineStageONE', 'straightCount', obj.straightCount, 'useFill', obj.controlData.useFill, 'x', x, 'y', y)

  obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)

  obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)
  obj.fill_chain_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)

  obj.context.beginPath()
  obj.context.arc(x, y, 3, 0, 2*Math.PI, true)
  obj.context.fill()
  obj.context.stroke()

  obj.context.beginPath();
  obj.context.moveTo(x, y);

  obj.started = true;

  if (obj.controlData.connectLines) {
    obj.textArea.value = obj.textArea.value+`\n// Straight line\ncontext.beginPath();\n`
    obj.textArea.value = obj.textArea.value+`context.moveTo(${x}, ${y});\n`
  }

  obj.straightCount = 0

  obj.points = []
  obj.points.push(new Point(x, y))

  obj.feedbackText = 'Choose a 2nd point to draw a line to'

}

export const lineStageTwo = function ({ obj, x, y }) {

  console.log('lineStageTWO', 'straightCount', obj.straightCount, 'useFill', obj.controlData.useFill)
  console.log('lineStageTWO', 'fill_mode', obj.controlData.fill_mode, 'highlight_flag', obj.highlight_flag)

  if (obj.straightCount == 0) {
    obj.context.putImageData(obj.image_buffer, 0, 0)
  }

  if (!obj.highlight_flag) {
    obj.points.push(new Point(x, y))

    console.log('lineStageTWO', 'lineTo', x, y, 'stroke')

    obj.context.lineTo(x, y)
    obj.context.stroke()
  } else {
    obj.points.push(new Point(obj.points[0].x, obj.points[0].y))

    console.log('lineStageTWO', 'lineTo', obj.points[0].x, obj.points[0].y, 'finalStroke')

    if (obj.controlData.stroke_mode == 0) {
      obj.context.beginPath()
      obj.context.moveTo(obj.points[0].x, obj.points[0].y)

      for (let i=0; i<obj.points.length; i++) {
        console.log('lineStageTWO', 'obj.points[i]', obj.points[i].x, obj.points[i].y)
        obj.context.lineTo(obj.points[i].x, obj.points[i].y) 
        if (i == obj.points.length-1) {
          obj.context.stroke()
        }
      }
    }
  }

  if (obj.controlData.useFill && obj.controlData.fill_mode == 1) {
    obj.context.fill();
  }

  obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		
 
  if (!obj.controlData.connectLines) {
    obj.feedbackText = 'Completed the LINE, draw something else'

    console.log('feedbackText', obj.feedbackText)

    obj.started = false;

    obj.textArea.value = obj.textArea.value+`\n// Straight line\ncontext.beginPath();\n`
    obj.textArea.value = obj.textArea.value+`context.moveTo(${obj.points[0].x}, ${obj.points[0].y});\n`
    obj.textArea.value = obj.textArea.value+`context.lineTo(${x}, ${y});\n`
    obj.textArea.value = obj.textArea.value+`context.stroke();\n`
  } else {
    obj.feedbackText = 'Choose another point to connect OR click the starting point to close LINE'

    if (!obj.highlight_flag) {
      obj.textArea.value = obj.textArea.value+`context.lineTo(${x}, ${y});\n`

      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else {
      obj.textArea.value = obj.textArea.value+`context.lineTo(${obj.points[0].x}, ${obj.points[0].y});\n`

      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      if (obj.controlData.useFill) {
        if (obj.controlData.fill_mode == 1) {
          obj.handleLastStageClick()
        } else if (obj.controlData.fill_mode == 2) {
          obj.feedbackText = 'Choose a 1st point to start the GRADIENT'
          obj.gradient_stage = 0
          obj.pickingGradient = true
          obj.canvas.addEventListener('click', obj.pickGradientDirection, false)
        }
      } else {
        obj.handleLastStageClick()
      }
    }
  }

  obj.straightCount++

  /*
  for (let i=0; i<obj.points.length; i++) {
    console.log('lineStageTwo', 'points', obj.points[i].x, obj.points[i].y)
  }
  */

}

export const quadraticStageOne = function ({ obj, x, y }) {

  console.log('quadraticStageONE', 'x', x, 'y', y, 'fill_mode', obj.controlData.fill_mode)

  obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)
  obj.fill_chain_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)

  obj.points = []
  
  obj.context.beginPath()
  obj.context.arc(x, y, 3, 0, 2*Math.PI, true)
  obj.context.fill()
  obj.context.stroke()

  obj.context.beginPath()
  obj.context.moveTo(x, y)

  obj.quadratic_stage = 1

  obj.points.push(new Point(x, y))

  obj.feedbackText = 'Choose a 2nd point to end the CURVE at'

}

export const quadraticStageTwo = function ({ obj, x, y }) {

  console.log('quadraticStageTWO', 'obj', obj, 'x', x, 'y', y, 'fill_mode', obj.controlData.fill_mode, 'points', obj.points)
  obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)

  if (obj.points.length == 1) {
    obj.resetToLastFrame()

    obj.context.quadraticCurveTo(obj.points[0].x, obj.points[0].y, x, y)
    obj.context.stroke()

    obj.points.push(new Point(x, y));
    obj.points.push(new Point(0, 0));
  } else {
    if (obj.highlight_flag) {
      x = obj.adj_x
      y = obj.adj_y
    }

    obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		
    obj.resetToLastFrame()

    obj.context.beginPath()
    obj.context.moveTo(obj.points[obj.points.length-2].x, obj.points[obj.points.length-2].y)
    obj.context.quadraticCurveTo(obj.points[obj.points.length-2].x, obj.points[obj.points.length-2].y, x, y)
    obj.context.stroke()

    obj.points.push(new Point(x, y))
    obj.points.push(new Point(x, y))
  }

  obj.quadratic_stage = 2

  /*
  for (let i=0; i<obj.points.length; i++) {
    console.log('quadraticStageTwo', i, 'points', obj.points[i].x, obj.points[i].y)
  }
  */

}

export const quadraticStageThree = function ({ obj, x, y }) {

  console.log('quadraticStageTHREE', 'x', x, 'y', y, 'fill_mode', obj.controlData.fill_mode)

  obj.quadratic_stage = 1

  if (obj.controlData.connectLines && obj.controlData.fill_mode == 1) {
    obj.feedbackText = 'Choose another point to connect OR click the starting point to close path'
    if (!obj.highlight_flag) {
      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else {
      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      obj.handleLastStageClick()
    }
  } else if (obj.controlData.fill_mode == 2) {
    obj.feedbackText = 'Choose another point to connect OR click the starting point to close CURVE'
    if (!obj.highlight_flag) {
      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else {
      obj.feedbackText = 'Choose a 1st point to start the GRADIENT'
      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      obj.gradient_stage = 0
      obj.pickingGradient = true
      obj.canvas.addEventListener('click', obj.pickGradientDirection, false)
    }
  } else {
    obj.quadratic_stage = 0
    obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
    obj.handleLastStageClick()
  }

  obj.image_buffer = obj.context.getImageData( 0, 0, obj.canvas.width, obj.canvas.height );		

}

export const quadraticMoveStage = function ({ obj, ev }) {

  //console.log('quadraticMoveStage') 

  let x = extractXFromEvent({ ev })
  let y = extractYFromEvent({ ev })
  let length = obj.points.length
  
  obj.resetToLastFrame()

  if (length == 3) {
    obj.context.beginPath()
    obj.context.moveTo(obj.points[0].x, obj.points[0].y)
    obj.context.quadraticCurveTo(x, y, obj.points[1].x, obj.points[1].y)
    obj.context.stroke()

    obj.points[2].x = x
    obj.points[2].y = y
  } else if (length > 3) {
    obj.context.beginPath()
    obj.context.moveTo(obj.points[length-4].x, obj.points[length-4].y)
    obj.context.quadraticCurveTo(x, y, obj.points[length-2].x, obj.points[length-2].y)
    obj.context.stroke()

    obj.points[length-1].x = x
    obj.points[length-1].y = y
  }

}

export const execute = function({ obj }) {
  console.log('utils', 'execute', obj.textArea.value.length)

	obj.clearCanvas()

  window.eval(obj.textArea.value)
  
  obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		
}

export const drawPointer = ({ obj, x, y }) => {
  obj.context.beginPath()
  obj.context.arc(x, y, 4, 0, 2*Math.PI, true)
  obj.context.fill()
  obj.context.stroke()
}

export const setGradientFromPoints = ({ obj, p1, p2 }) => {
  obj.fill_gradient = obj.context.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
}

export const extractXFromEvent = ({ ev }) => {
  if (ev.layerX || ev.layerX == 0) {
    return ev.layerX
  } else if (ev.offsetX || ev.offsetX == 0) {
    return ev.offsetX
  }
}

export const extractYFromEvent = ({ ev }) => {
  if (ev.layerY || ev.layerY == 0) {
    return ev.layerY
  } else if (ev.offsetY || ev.offsetY == 0) {
    return ev.offsetY
  }
}

export const resetCode = ({ obj }) => {
  obj.textArea.value = `// Initialize\nlet canvas = document.getElementById('editorCanvas');\nlet context = canvas.getContext('2d');\n\ncontext.lineWidth = ${obj.lineThickness};\n\ncontext.strokeStyle = '${obj.controlData.lineColor.hex}';\ncontext.fillStyle = '${obj.controlData.fillColor.hex}';\n`
}

export const resetFeedback = ({ obj }) => {
  console.log('resetFeedback', obj.controlData.stroke_mode)
  switch (parseInt(obj.controlData.stroke_mode)) {
    case 0:
      obj.feedbackText = 'Draw the 1st point of the LINE'
      break
    case 1:
      obj.feedbackText = 'Start scribbling!'
      break
    case 2:
      obj.feedbackText = 'Draw the 1st point of the CURVE'
      break
  }
}

export const updateGradient = ({ obj }) => {
  obj.gradient = obj.gradientContext.createLinearGradient(0, 0, 200, 0)
  for (let i=0; i<obj.controlData.gradient_stops.length; i++) {
    if (i == 0) {
      obj.gradient.addColorStop(0.0, obj.controlData.gradient_stops[0])
    } else {
      obj.gradient.addColorStop(i*(1.0/(obj.controlData.gradient_stops.length-1)), obj.controlData.gradient_stops[i])
    }
  }
  obj.gradientContext.fillStyle = obj.gradient
  obj.gradientContext.fillRect(0, 0, obj.gradientCanvas.width, obj.gradientCanvas.height)
}
