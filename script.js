const wrapper = document.createElement('div')
const pauseButton = document.createElement('button')
const puzzleWrapper = document.createElement('div')
const size = 4
const menu = document.createElement('div')
const continueBtn = document.createElement('div')
const newGameBtn = document.createElement('div')
const time = document.createElement('div')
const moves = document.createElement('div')
const gameInfoWrapper = document.createElement('div')
const audio = document.createElement('audio')
const bestScores = document.createElement('div')
const simpleMartix = document.createElement('div')
let gameStarted = false
let gameStartTime
let timeElapsed
let result
let paused = false
let movesCounter = 0
const doneMatrix = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

const generateCombination = () => {
  let res = doneMatrix.slice()
  let idx
  let temp

  for (let i = res.length - 1; i > 0; i--) {
    idx = Math.floor(Math.random() * i)
    temp = res[i]
    res[i] = res[idx]
    res[idx] = temp
  }
  return res
}

const isSolvable = (checkingMatrix) => {
  let sum = 0

  for (i = 0, len = checkingMatrix.length; i < len; i++) {
    let l = 1

    while (checkingMatrix[i] - l > 0) {
      if (checkingMatrix.indexOf(checkingMatrix[i] - l) > i) {
        sum++
      }
      l++
    }
  }

  sum += (checkingMatrix.indexOf(0) / 4 | 0) + 1

  return !!(sum % 2)
}

let matrix = []

const findRightMatrix = () => {
  const someMatrix = generateCombination()
  const is = isSolvable(someMatrix)

  if (someMatrix) {
    return someMatrix
  }
  if (!is) {
    findRightMatrix()
  }
}

matrix = findRightMatrix()

const newMatrix = (type) => {
  if ( type === 'simple') {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 12, 13, 14, 11, 15]
  } 
  return findRightMatrix()
}

const loadSimpleMatrix = () => {
  startNewGame('simple')
}

const integrateScore = (o) => o.time * 0.016 + o.moves

const sortScores = ({ bestScores }) => (
  bestScores.sort((o1, o2) => integrateScore(o1) - integrateScore(o2))
)


const gameOver = () => {

  if (matrix.join(',') === doneMatrix.join(',')) {
    console.log('game over')
    alert( `YEAH! You are done!\n moves: ${movesCounter}   time: ${result}` )

    const currentData = {
      time: timeElapsed | 0,
      moves: movesCounter,
    }

    let obj = {
      bestScores: [],
    }
    let stored = JSON.parse(localStorage.getItem('bestScores'))
    if (stored?.bestScores?.length) {
      obj = stored
    }

    obj.bestScores.push(currentData)
    let jsonStr = JSON.stringify(obj)
    localStorage.setItem('bestScores', jsonStr)

    gameStarted = false
    movesCounter = 0
    gameStartTime = null
  }
}

const getBestScores = () => {
  if (!JSON.parse(localStorage.getItem('bestScores'))) {
    console.log("You haven't win any time yet")
    return
  }
  alert('check console')
  const storedData = JSON.parse(localStorage.getItem('bestScores'))
  const sortedData = sortScores(storedData)
  sortedData.forEach((s, index) => {
    if (index > 9) return;
    console.log(`time: ${s.time}`)
    console.log(`moves: ${s.moves}`)
    console.log('--------------')
    
  })
}

const formatTimerPart = (n) => `${n < 10 ? '0' : ''}${n}`

const startTimerOnce = () => {
  
  if (!gameStarted) {
    gameStarted = true

    gameStartTime = Date.now() / 1000

    const renderTimer = () => {
      
      if (!gameStarted) {
        return
      }
      if (paused) {
        requestAnimationFrame(renderTimer)
        return
      }
      const now = Date.now() / 1000
      const gameTime = now - gameStartTime
      timeElapsed = gameTime

      const seconds = gameTime % 60 | 0
      const minutes = ((gameTime / 60) % 60) | 0
      const hours = (gameTime / 60 / 60) % 60 | 0

      const secondsText = formatTimerPart(seconds)
      const minutesText = formatTimerPart(minutes)
      const hoursText = formatTimerPart(hours)

      const timerText = `${hoursText}:${minutesText}:${secondsText}`
      result = `${timerText}`
      time.innerText = timerText

      requestAnimationFrame(renderTimer)

    }

    requestAnimationFrame(renderTimer)

  }
}

const move = (e) => {

  startTimerOnce()
  audio.play()
  e.preventDefault()
  
  let input = matrix
  const from = input.indexOf(+e.target.innerText)
  const to = input.indexOf(0)

  if ((from % 4 !== 0 && from - 1 === to) || (from % size !== size - 1 && from + 1 === to)) {
    const elm1 = input.splice(from, 1)[0]
    input.splice(to, 0, elm1)

  } if (from + size === to) {
    const elm1 = input.splice(from, 1)[0]
    input.splice(to, 0, elm1)

    const elm = input.splice(to - 1, 1)[0]
    input.splice(from, 0, elm)

  } if (from - size === to) {
    const elm1 = input.splice(from, 1)[0]
    input.splice(to, 0, elm1)

    const elm = input.splice(to + 1, 1)[0]
    input.splice(from, 0, elm)
  }

  renderMatrix()
  movesCounter += 1
  moves.innerText = `moves: ${movesCounter}`
 
  gameOver()
  matrix = input
  e.target.onmouseup = null
  
  localStorage.setItem('comd', input.join(','))
}

const renderMatrix = () => {
  matrix.forEach((elem, idx) => {
    document.getElementById(elem).style.order = idx
  })
}

const appendAndAddClass = (htmlElem, htmlParent, elemClass) => {
  htmlElem.classList.add(elemClass)
  htmlParent.appendChild(htmlElem)
}

const createMenuElem = (htmlElem, elemText, eventFunc) => {
  htmlElem.innerText = elemText
  appendAndAddClass(htmlElem, menu, 'menu__elem')
  htmlElem.addEventListener('click', eventFunc)
  
}

const init = () => {

  if (!localStorage.getItem('size')) {
    localStorage.setItem('size', size)
  }
  if (!localStorage.getItem('comb')) {
    localStorage.setItem('comb', matrix.join(","))
  }

  appendAndAddClass(wrapper, document.body, 'wrapper')
  appendAndAddClass(gameInfoWrapper, wrapper, 'game-info-wrapper')
  
  time.innerText = '00:00:00'
  appendAndAddClass(time, gameInfoWrapper, 'time')

  pauseButton.innerText = 'pause'
  appendAndAddClass(pauseButton, gameInfoWrapper, 'pause-button')
  pauseButton.addEventListener('click', setPause)

  moves.innerText = `moves: ${movesCounter}`
  appendAndAddClass(moves, gameInfoWrapper, 'moves')

  appendAndAddClass(puzzleWrapper, wrapper, 'puzzle__wrapper')
  appendAndAddClass(menu, wrapper, 'menu')
  
  audio.setAttribute('src', 'rustle.mp3')
  appendAndAddClass(audio, wrapper, 'audio')

  createMenuElem(newGameBtn, 'New Game', startNewGame)
  createMenuElem(continueBtn, 'Continue', continueGame)
  createMenuElem(bestScores, 'Best Scores', getBestScores)
  createMenuElem(simpleMartix, 'Load Simple Combination', loadSimpleMatrix)

  initPuzzle()
}

const continueGame = () => {
  menu.style.display = 'none'
  gameStartTime = Date.now() / 1000 - timeElapsed
  paused = false
}

const setPause = () => {
  menu.style.display = 'flex'
  paused = true
}

const startNewGame = (type) => {
  paused = false
  gameStarted = false
  movesCounter = 0
  gameStartTime = null
  moves.innerText = `moves: ${movesCounter}`
  time.innerText = '00:00:00'
  
  if (type === 'simple') {
    matrix = newMatrix('simple')
  } else {
    matrix = newMatrix()
  }
  
  renderMatrix()
  menu.style.display = 'none'
}

const initPuzzle = () => {

  const comb = matrix

  comb.map((elem, idx) => {
    const puzzleElem = document.createElement('div')
    
    if (+elem === 0) {
      puzzleElem.classList.add('puzzle__space')

    } else {
      puzzleElem.innerText = elem
      puzzleElem.classList.add('puzzle__element')
    }
    puzzleElem.classList.add('elem')
    puzzleElem.style.order = `${idx}`

    puzzleElem.setAttribute('id', elem)
    puzzleWrapper.appendChild(puzzleElem)

  })

  const allElems = document.querySelectorAll('.puzzle__element')

  allElems.forEach((elem) => {
    elem.addEventListener('mouseup', move, false)
  })

}

window.addEventListener("DOMContentLoaded", init())
