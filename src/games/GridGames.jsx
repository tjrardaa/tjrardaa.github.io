import { useEffect, useReducer, useRef, useState } from 'react'

// record du serpent, gardé dans le navigateur (peut être indisponible : navigation privée, etc.)
const BEST_KEY = 'arda-snake-best'
function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}
function writeBest(n) {
  try { localStorage.setItem(BEST_KEY, String(n)) } catch { /* rien à faire */ }
}

// All styling is scoped so either game can be mounted independently inside the PC.
const styles = `
.grid-game { box-sizing:border-box; width:100%; height:100%; overflow:auto; padding:12px; background:#ece9d8; color:#202820; font:13px Tahoma, sans-serif; }
.grid-game * { box-sizing:border-box; }
.grid-game .gg-inner { width:min(100%, 340px); margin:auto; }
.grid-game .gg-header { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px; }
.grid-game .gg-title { color:#173f85; font-size:17px; font-weight:bold; }
.grid-game .gg-sub { margin:2px 0 0; color:#555; line-height:1.4; }
.grid-game .gg-btn { min-height:32px; padding:4px 10px; border:1px solid #55739d; border-radius:3px; background:linear-gradient(#fff,#d8e3f2); color:#17365e; font:inherit; cursor:pointer; }
.grid-game .gg-btn:active { background:#c4d5eb; }
.grid-game .gg-btn:focus-visible, .grid-game .gg-cell:focus-visible, .grid-game:focus-visible { outline:2px solid #f08a24; outline-offset:2px; }
.grid-game .gg-panel { padding:8px; border:2px solid; border-color:#7c8a90 #fff #fff #7c8a90; background:#b9c7a5; }
.grid-game .gg-status { min-height:20px; margin:8px 0; font-weight:bold; color:#284c30; }
.grid-game .gg-board { display:grid; width:100%; aspect-ratio:1; gap:1px; background:#789170; border:1px solid #789170; }
.grid-game .gg-snake-cell { background:#d7e7bf; }
.grid-game .gg-snake-body { background:#4c8d55; }
.grid-game .gg-snake-head { background:#1f603b; }
.grid-game .gg-snake-food { background:#e77d41; border-radius:50%; }
.grid-game .gg-pad { display:grid; grid-template-columns:repeat(3, 44px); grid-template-rows:repeat(2, 36px); gap:3px; justify-content:center; margin:10px auto 0; }
.grid-game .gg-pad .gg-btn { padding:0; font-size:18px; touch-action:manipulation; }
.grid-game .gg-mine-board { background:#8e9b8c; border-color:#8e9b8c; }
.grid-game .gg-cell { min-width:0; min-height:0; padding:0; border:3px solid; border-color:#fff #7b8794 #7b8794 #fff; background:#c3cbd6; font:bold 15px Tahoma,sans-serif; cursor:pointer; touch-action:manipulation; }
.grid-game .gg-cell:hover { background:#d3dae4; }
.grid-game .gg-cell.revealed { border:0; background:#f2f2ec; cursor:default; }
.grid-game .gg-cell.mine { background:#e99d84; }
.grid-game .gg-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:8px 0; }
.grid-game .gg-btn[aria-pressed=true] { background:#bed3f0; box-shadow:inset 1px 1px 3px #667d9c; }
`

const SNAKE_SIZE = 14
const DIRECTIONS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

function foodFor(snake) {
  const free = []
  for (let y = 0; y < SNAKE_SIZE; y++) {
    for (let x = 0; x < SNAKE_SIZE; x++) {
      if (!snake.some(([sx, sy]) => sx === x && sy === y)) free.push([x, y])
    }
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

function newSnake() {
  const snake = [[6, 7], [5, 7], [4, 7]]
  return { snake, food: foodFor(snake), direction: [1, 0], pending: null, status: 'ready', score: 0 }
}

function snakeReducer(state, action) {
  if (action.type === 'reset') return newSnake()
  if (action.type === 'turn') {
    if (state.status === 'lost' || state.status === 'won' || state.pending) return state
    const [x, y] = action.direction
    if (x === -state.direction[0] && y === -state.direction[1]) return state
    return { ...state, pending: action.direction, status: 'playing' }
  }
  if (action.type !== 'tick' || state.status !== 'playing') return state
  const direction = state.pending || state.direction
  const head = [state.snake[0][0] + direction[0], state.snake[0][1] + direction[1]]
  const eating = state.food && head[0] === state.food[0] && head[1] === state.food[1]
  const body = eating ? state.snake : state.snake.slice(0, -1)
  if (head[0] < 0 || head[1] < 0 || head[0] >= SNAKE_SIZE || head[1] >= SNAKE_SIZE || body.some(([x, y]) => x === head[0] && y === head[1])) {
    return { ...state, status: 'lost', pending: null }
  }
  const snake = [head, ...body]
  const food = eating ? foodFor(snake) : state.food
  return { ...state, snake, food, direction, pending: null, score: state.score + (eating ? 1 : 0), status: food ? 'playing' : 'won' }
}

export function SnakeGame({ active = true }) {
  const [game, dispatch] = useReducer(snakeReducer, undefined, newSnake)
  const [best, setBest] = useState(readBest)
  const root = useRef(null)
  // le jeu prend le clavier dès qu'il s'ouvre
  useEffect(() => { root.current?.focus({ preventScroll: true }) }, [])
  // un peu plus vite à chaque pomme (150 ms, jusqu'à 80 ms)
  const speed = Math.max(80, 150 - game.score * 5)
  useEffect(() => {
    if (!active || game.status !== 'playing') return undefined
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), speed)
    return () => window.clearInterval(timer)
  }, [game.status, active, speed])
  useEffect(() => {
    if (game.score > best) { setBest(game.score); writeBest(game.score) }
  }, [game.score, best])
  const turn = (direction) => dispatch({ type: 'turn', direction })
  const reset = () => { dispatch({ type: 'reset' }); root.current?.focus({ preventScroll: true }) }
  const onKeyDown = (event) => {
    if ((event.key === ' ' || event.key === 'Enter') && (game.status === 'lost' || game.status === 'won')) {
      event.preventDefault(); event.stopPropagation(); reset(); return
    }
    const direction = DIRECTIONS[event.key]
    if (!direction) return
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat) turn(direction)
  }
  return (
    <div className="grid-game" ref={root} tabIndex={0} onKeyDown={onKeyDown} aria-label="Serpent, joue avec les flèches du clavier">
      <style>{styles}</style>
      <div className="gg-inner">
        <div className="gg-header"><div><div className="gg-title">Serpent</div><p className="gg-sub">Attrape les pommes, évite les murs et ta queue.</p></div><button type="button" className="gg-btn" onClick={reset}>Rejouer</button></div>
        <div className="gg-panel">
          <div className="gg-header"><strong>Score : {game.score}</strong><span>Record : {best}</span></div>
          <div className="gg-board" style={{ gridTemplateColumns: `repeat(${SNAKE_SIZE}, 1fr)` }} role="img" aria-label={`Grille Snake, score ${game.score}`}>
            {Array.from({ length: SNAKE_SIZE * SNAKE_SIZE }, (_, i) => {
              const x = i % SNAKE_SIZE, y = Math.floor(i / SNAKE_SIZE)
              const index = game.snake.findIndex(([sx, sy]) => sx === x && sy === y)
              const food = game.food && game.food[0] === x && game.food[1] === y
              return <span key={i} className={`gg-snake-cell${index === 0 ? ' gg-snake-head' : index > 0 ? ' gg-snake-body' : food ? ' gg-snake-food' : ''}`} />
            })}
          </div>
        </div>
        <div className="gg-status" aria-live="polite">{game.status === 'ready' ? 'Appuie sur une flèche pour commencer.' : game.status === 'lost' ? `Perdu ! ${game.score} pomme${game.score > 1 ? 's' : ''}. Espace pour rejouer.` : game.status === 'won' ? 'Bravo, le jardin est rempli !' : 'En route !'}</div>
        <p className="gg-sub">Flèches du clavier, ou les boutons ci-dessous sur téléphone.</p>
        <div className="gg-pad" aria-label="Commandes tactiles">
          <button type="button" className="gg-btn" style={{ gridColumn: 2 }} aria-label="Haut" onClick={() => turn(DIRECTIONS.ArrowUp)}>↑</button>
          <button type="button" className="gg-btn" style={{ gridColumn: 1, gridRow: 2 }} aria-label="Gauche" onClick={() => turn(DIRECTIONS.ArrowLeft)}>←</button>
          <button type="button" className="gg-btn" style={{ gridColumn: 2, gridRow: 2 }} aria-label="Bas" onClick={() => turn(DIRECTIONS.ArrowDown)}>↓</button>
          <button type="button" className="gg-btn" style={{ gridColumn: 3, gridRow: 2 }} aria-label="Droite" onClick={() => turn(DIRECTIONS.ArrowRight)}>→</button>
        </div>
      </div>
    </div>
  )
}

const MINE_SIZE = 9
const MINE_COUNT = 10
const CELL_COUNT = MINE_SIZE * MINE_SIZE

function neighbors(index) {
  const x = index % MINE_SIZE, y = Math.floor(index / MINE_SIZE), result = []
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if ((!dx && !dy) || x + dx < 0 || x + dx >= MINE_SIZE || y + dy < 0 || y + dy >= MINE_SIZE) continue
    result.push((y + dy) * MINE_SIZE + x + dx)
  }
  return result
}

function makeMines(first) {
  // The first cell and its neighbors are safe, opening a useful starting area.
  const excluded = new Set([first, ...neighbors(first)])
  const candidates = Array.from({ length: CELL_COUNT }, (_, i) => i).filter((i) => !excluded.has(i))
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  return new Set(candidates.slice(0, MINE_COUNT))
}

function newMineGame() {
  return { mines: null, revealed: new Set(), flags: new Set(), status: 'ready' }
}

function mineReducer(state, action) {
  if (action.type === 'reset') return newMineGame()
  if (state.status === 'lost' || state.status === 'won' || state.revealed.has(action.index)) return state
  if (action.type === 'flag') {
    const flags = new Set(state.flags)
    if (flags.has(action.index)) flags.delete(action.index)
    else flags.add(action.index)
    return { ...state, flags }
  }
  if (action.type !== 'reveal' || state.flags.has(action.index)) return state
  const mines = state.mines || makeMines(action.index)
  const revealed = new Set(state.revealed)
  if (mines.has(action.index)) {
    revealed.add(action.index)
    return { ...state, mines, revealed, status: 'lost' }
  }
  const queue = [action.index]
  for (let n = 0; n < queue.length; n++) {
    const cell = queue[n]
    if (revealed.has(cell) || state.flags.has(cell) || mines.has(cell)) continue
    revealed.add(cell)
    const around = neighbors(cell)
    if (!around.some((i) => mines.has(i))) queue.push(...around.filter((i) => !revealed.has(i)))
  }
  return { ...state, mines, revealed, status: revealed.size === CELL_COUNT - MINE_COUNT ? 'won' : 'playing' }
}

export function MineGame() {
  const [game, dispatch] = useReducer(mineReducer, undefined, newMineGame)
  const [flagMode, setFlagMode] = useState(false)
  const reset = () => { dispatch({ type: 'reset' }); setFlagMode(false) }
  const act = (index, flag = flagMode) => dispatch({ type: flag ? 'flag' : 'reveal', index })
  return (
    <div className="grid-game">
      <style>{styles}</style>
      <div className="gg-inner">
        <div className="gg-header"><div><div className="gg-title">Démineur</div><p className="gg-sub">Découvre les cases sans toucher les mines.</p></div><button type="button" className="gg-btn" onClick={reset}>Rejouer</button></div>
        <div className="gg-toolbar"><strong>Mines restantes : {MINE_COUNT - game.flags.size}</strong><button type="button" className="gg-btn" aria-pressed={flagMode} onClick={() => setFlagMode(!flagMode)}>Mode drapeau : {flagMode ? 'activé' : 'désactivé'}</button></div>
        <div className="gg-panel">
          <div className="gg-board gg-mine-board" style={{ gridTemplateColumns: `repeat(${MINE_SIZE}, 1fr)` }} aria-label="Grille du démineur">
            {Array.from({ length: CELL_COUNT }, (_, i) => {
              const revealed = game.revealed.has(i), flagged = game.flags.has(i)
              const mine = game.mines?.has(i), showMine = mine && (revealed || game.status === 'lost')
              const count = revealed && !mine ? neighbors(i).filter((n) => game.mines.has(n)).length : 0
              const label = `Ligne ${Math.floor(i / MINE_SIZE) + 1}, colonne ${i % MINE_SIZE + 1} : ${showMine ? 'mine' : flagged ? 'drapeau' : revealed ? count ? `${count} mines voisines` : 'vide' : 'cachée'}`
              return <button key={i} type="button" className={`gg-cell${revealed ? ' revealed' : ''}${showMine ? ' mine' : ''}`} aria-label={label} onClick={() => act(i)} onContextMenu={(event) => { event.preventDefault(); act(i, true) }} style={{ color: count === 1 ? '#2054ac' : count === 2 ? '#287c40' : '#ab4033' }}>{showMine ? '✹' : flagged ? '⚑' : count || ''}</button>
            })}
          </div>
        </div>
        <div className="gg-status" aria-live="polite">{game.status === 'ready' ? 'Le premier clic est toujours sans danger.' : game.status === 'lost' ? 'Une mine ! Partie terminée.' : game.status === 'won' ? 'Bravo, champ déminé !' : 'À toi de jouer.'}</div>
        <p className="gg-sub">Clic pour découvrir, clic droit pour poser un drapeau. Sur téléphone, active le mode drapeau avant de toucher une case.</p>
      </div>
    </div>
  )
}
