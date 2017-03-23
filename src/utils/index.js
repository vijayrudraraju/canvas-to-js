function Point( x, y ) {
	this.x = x;
	this.y = y;
}

export const lineStageOne = function ({ obj, x, y }) {

  console.log('lineStageONE', 'straightCount', obj.straightCount, 'useFill', obj.useFill, 'x', x, 'y', y)

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

  obj.textArea.value = obj.textArea.value+`\n// Straight line\ncontext.beginPath();\n`
  obj.textArea.value = obj.textArea.value+`context.moveTo(${x}, ${y});\n`

  obj.straightCount = 0

  obj.points = []
  obj.points.push(new Point(x, y))

}

export const lineStageTwo = function ({ obj, x, y }) {

  console.log('lineStageTWO', 'straightCount', obj.straightCount, 'useFill', obj.useFill)
  console.log('lineStageTWO', 'fill_mode', obj.fill_mode, 'fill_flag', obj.fill_flag)

  if (obj.straightCount == 0) {
    obj.context.putImageData(obj.image_buffer, 0, 0)
  }

  if (obj.fill_flag == 0) {
    obj.points.push(new Point(x, y))

    console.log('lineStageTWO', 'lineTo', x, y, 'stroke')

    obj.context.lineTo(x, y)
    obj.context.stroke()
  } else {
    obj.points.push(new Point(obj.points[0].x, obj.points[0].y))

    console.log('lineStageTWO', 'lineTo', obj.points[0].x, obj.points[0].y, 'finalStroke')

    if (obj.stroke_mode == 0) {
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

  if (obj.useFill && obj.fill_mode == 1) {
    obj.context.fill();
  }

  if (!obj.connectLines) {
    obj.started = false;
  } else {
    console.log('lineStageTWO', 'getImageData') 
    obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		
  }
  
  if (obj.fill_flag == 0) {
    obj.textArea.value = obj.textArea.value+`context.lineTo(${x}, ${y});\n`
  } else {
    obj.textArea.value = obj.textArea.value+`context.lineTo(${obj.points[0].x}, ${obj.points[0].y});\n`
  }
  
  if (!obj.connectLines) {
    obj.textArea.value = obj.textArea.value+`context.stroke();\n`
  }

  obj.straightCount++

  if (obj.connectLines && obj.useFill) {
    if (obj.fill_mode == 1) {
      if (obj.fill_flag == 0) {
        obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
      } else if (obj.fill_flag == 1) {
        obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
        obj.handleLastStageClick()
      }
    } else if (obj.fill_mode == 2) {
      if (obj.fill_flag == 0) {
        obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
      } else if (obj.fill_flag == 1) {
        obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)

        obj.gradient_stage = 0
        obj.pickingGradient = true
        obj.canvas.addEventListener('click', obj.pickGradientDirection, false)
      }
    }
  } else if (obj.connectLines) {
    if (obj.fill_flag == 0) {
      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else {
      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      obj.handleLastStageClick()
    }
  }

  for (let i=0; i<obj.points.length; i++) {
    console.log('lineStageTwo', 'points', obj.points[i].x, obj.points[i].y)
  }

}

export const quadraticStageOne = function ({ obj, x, y }) {

  console.log('quadraticStageONE', 'x', x, 'y', y, 'fill_mode', obj.fill_mode)

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
  //console.log('NOW', 'STAGE', obj.quadratic_stage)

  obj.points.push(new Point(x, y))

}

export const quadraticStageTwo = function ({ obj, x, y }) {

  console.log('quadraticStageTWO', 'obj', obj, 'x', x, 'y', y, 'fill_mode', obj.fill_mode, 'points', obj.points)
  obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)

  if (obj.points.length == 1) {
    obj.resetToLastFrame()

    obj.context.quadraticCurveTo(
      obj.points[0].x,
      obj.points[0].y,
      x,
      y 
    )
    obj.context.stroke()

    obj.points.push(new Point(x, y));
    obj.points.push(new Point(0, 0));
  } else {
    if (obj.fill_flag === 1) {
      x = obj.adj_x
      y = obj.adj_y
    }

    obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		
    obj.resetToLastFrame()

    obj.context.beginPath()
    obj.context.moveTo(
      obj.points[obj.points.length-2].x, 
      obj.points[obj.points.length-2].y
    )
    obj.context.quadraticCurveTo(
      obj.points[obj.points.length-2].x,
      obj.points[obj.points.length-2].y,
      x,
      y 
    )
    obj.context.stroke()

    obj.points.push(new Point(x, y))
    obj.points.push(new Point(x, y))
  }

  obj.quadraticActivated = true
  obj.quadratic_stage = 2


  for (let i=0; i<obj.points.length; i++) {
    console.log('quadraticStageTwo', i, 'points', obj.points[i].x, obj.points[i].y)
  }

}

export const quadraticStageThree = function ({ obj, x, y }) {

  console.log('quadraticStageTHREE', 'x', x, 'y', y, 'fill_mode', obj.fill_mode)

  obj.quadratic_stage = 1
  if (!obj.useFill || obj.fill_mode == 1) {
    if (obj.fill_flag == 0) {
      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else if (obj.fill_flag == 1) {
      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      obj.handleLastStageClick()
    }
  } else if (obj.fill_mode == 2) {
    if (obj.fill_flag == 0) {
      obj.canvas.addEventListener('mousemove', obj.highlightOrigin, false)
    } else if (obj.fill_flag == 1) {
      obj.canvas.removeEventListener('mousemove', obj.highlightOrigin, false)
      obj.gradient_stage = 0
      obj.pickingGradient = true
      obj.canvas.addEventListener('click', obj.pickGradientDirection, false)
    }
  }

  obj.image_buffer = obj.context.getImageData( 0, 0, obj.canvas.width, obj.canvas.height );		

  obj.quadraticActivated = false

  for (let i=0; i<obj.points.length; i++) {
    console.log('quadraticStageThree', i, 'points', obj.points[i].x, obj.points[i].y)
  }

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
    obj.context.quadraticCurveTo(
      x,
      y,
      obj.points[1].x,
      obj.points[1].y 
    )
    obj.context.stroke()

    obj.points[2].x = x;
    obj.points[2].y = y;
  } else if (length > 3) {
    obj.context.beginPath()
    obj.context.moveTo(obj.points[length-4].x, obj.points[length-4].y);
    obj.context.quadraticCurveTo(
      x,
      y,
      obj.points[length-2].x,
      obj.points[length-2].y 
    )
    obj.context.stroke()

    obj.points[length-1].x = x;
    obj.points[length-1].y = y;
  }

}

export const execute = function({ obj }) {

  console.log('utils', 'execute', obj.textArea.value.length)

	obj.clearCanvas();

  window.eval(obj.textArea.value);
  
  obj.image_buffer = obj.context.getImageData(0, 0, obj.canvas.width, obj.canvas.height)		

}

export const drawPointer = ({ obj, x, y }) => {
  obj.context.beginPath()
  obj.context.arc(x, y, 4, 0, 2*Math.PI, true)
  obj.context.fill()
  obj.context.stroke()
}

export const setGradientFromPoints = ({ obj, p1, p2 }) => {
  obj.fill_gradient = obj.context.createLinearGradient( 
    p1.x, 
    p1.y, 
    p2.x,
    p2.y
  )
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
  obj.textArea.value = `// Initialize\nlet canvas = document.getElementById('editorCanvas');\nlet context = canvas.getContext('2d');\n\ncontext.lineWidth = ${obj.lineThickness};\n\ncontext.strokeStyle = '${obj.lineColor.hex}';\ncontext.fillStyle = '${obj.fillColor.hex}';\n`
}
