import React, { useState } from 'react';

const SUITS = [
  { symbol: '♠', name: 'pique', red: false },
  { symbol: '♥', name: 'cœur', red: true },
  { symbol: '♣', name: 'trèfle', red: false },
  { symbol: '♦', name: 'carreau', red: true },
];
const rankName = (rank) => ({ 1: 'As', 11: 'Valet', 12: 'Dame', 13: 'Roi' }[rank] || String(rank));
const rankLabel = (rank) => ({ 1: 'A', 11: 'V', 12: 'D', 13: 'R' }[rank] || rank);
const cardName = (card) => `${rankName(card.rank)} de ${SUITS[card.suit].name}`;

function newGame() {
  const deck = SUITS.flatMap((_, suit) => Array.from({ length: 13 }, (_, i) => ({ suit, rank: i + 1, faceUp: false })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau = Array.from({ length: 7 }, (_, i) => Array.from({ length: i + 1 }, (_, j) => {
    const card = deck.pop();
    return { ...card, faceUp: j === i };
  }));
  return { stock: deck, waste: [], foundations: SUITS.map(() => []), tableau, moves: 0 };
}

function moveCard(game, source, target) {
  if (!source || (source.type === target.type && source.pile === target.pile)) return null;
  const from = source.type === 'waste' ? game.waste : game[source.type][source.pile];
  const index = source.type === 'tableau' ? source.index : from.length - 1;
  const moving = from.slice(index);
  const card = moving[0];
  if (!card || !card.faceUp) return null;
  if (target.type === 'foundations') {
    const pile = game.foundations[target.pile];
    if (moving.length !== 1 || card.suit !== target.pile || card.rank !== pile.length + 1) return null;
  } else {
    const pile = game.tableau[target.pile];
    const top = pile[pile.length - 1];
    if (top ? (!top.faceUp || top.rank !== card.rank + 1 || SUITS[top.suit].red === SUITS[card.suit].red) : card.rank !== 13) return null;
  }
  const next = {
    ...game,
    waste: [...game.waste],
    foundations: game.foundations.map((pile) => [...pile]),
    tableau: game.tableau.map((pile) => [...pile]),
    moves: game.moves + 1,
  };
  const nextFrom = source.type === 'waste' ? next.waste : next[source.type][source.pile];
  nextFrom.splice(index);
  if (source.type === 'tableau' && nextFrom.length) {
    nextFrom[nextFrom.length - 1] = { ...nextFrom[nextFrom.length - 1], faceUp: true };
  }
  next[target.type][target.pile].push(...moving);
  return next;
}

const styles = `
.solitaire { --gap: 6px; --step: clamp(14px, 3.4cqw, 22px); container-type: inline-size; box-sizing: border-box; width: 100%; max-width: 580px; margin: auto; padding: clamp(12px, 3vw, 24px); color: #f4f8ed; background: radial-gradient(circle at 50% 0%, #267554, #104834 75%); border-radius: 14px; font-family: system-ui, sans-serif; }
.solitaire *, .solitaire *::before, .solitaire *::after { box-sizing: border-box; }
.solitaire .sg-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.solitaire h2 { margin: 0; font-size: 1.25rem; }
.solitaire .sg-meta { color: #d8eadc; font-size: .8rem; margin: 3px 0 0; }
.solitaire .sg-actions { display: flex; gap: 6px; }
.solitaire .sg-action { border: 1px solid #a1c7aa; border-radius: 7px; background: #f4f8ed; color: #173e2c; padding: 8px 10px; font: inherit; font-size: .8rem; font-weight: 700; cursor: pointer; }
.solitaire .sg-action:disabled { opacity: .5; cursor: default; }
.solitaire .sg-board { container-type: inline-size; --card-w: calc((100cqw - 6 * var(--gap)) / 7); --card-h: calc(var(--card-w) * 1.4); }
.solitaire .sg-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--gap); }
.solitaire .sg-top { margin-bottom: 14px; }
.solitaire .sg-spacer { pointer-events: none; }
.solitaire .sg-slot, .solitaire .sg-card { width: 100%; aspect-ratio: 5 / 7; border-radius: clamp(4px, 1cqw, 8px); }
.solitaire .sg-slot { border: 1px dashed #aacfb2; background: #0c3e2d80; color: #b8d2ba; font: inherit; font-size: clamp(15px, 5cqw, 27px); cursor: pointer; }
.solitaire .sg-card { display: flex; align-items: flex-start; justify-content: flex-start; padding: clamp(2px, 0.8cqw, 7px); border: 1px solid #d4d9d0; background: #fffefa; color: #18251f; box-shadow: 0 2px 5px #092b2050; font: 700 clamp(11px, 3.1cqw, 20px)/1 system-ui, sans-serif; text-align: left; cursor: pointer; }
.solitaire .sg-card { position: relative; }
.solitaire .sg-card .sg-big { position: absolute; right: 8%; bottom: 6%; font-size: 1.7em; line-height: 1; opacity: .9; }
.solitaire .sg-card.red { color: #be303a; }
.solitaire .sg-card.back { border: 2px solid #f4f1df; background: repeating-linear-gradient(45deg, #264b83 0 4px, #3764a0 4px 8px); cursor: default; }
.solitaire .sg-card.selected { outline: 3px solid #f8d66d; outline-offset: -3px; }
.solitaire .sg-card span { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.solitaire .sg-pile { position: relative; min-height: var(--card-h); height: calc(var(--card-h) + var(--count) * var(--step)); }
.solitaire .sg-pile > .sg-slot, .solitaire .sg-pile > .sg-card { position: absolute; top: calc(var(--index, 0) * var(--step)); left: 0; }
.solitaire button:focus-visible { outline: 3px solid #ffdf72; outline-offset: 2px; z-index: 2; }
.solitaire .sg-hint { margin: 12px 0 0; color: #d7ebdb; font-size: .78rem; line-height: 1.45; }
.solitaire .sg-message { min-height: 1.4em; margin: 8px 0 0; font-size: .85rem; font-weight: 650; color: #ffedaa; }
@media (max-width: 380px) { .solitaire { --gap: 3px; padding: 10px; } .solitaire .sg-action { padding: 7px; } }
`;

export default function SolitaireGame() {
  const [game, setGame] = useState(newGame);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const won = game.foundations.every((pile) => pile.length === 13);

  function save(next) {
    setHistory((previous) => [...previous, game]);
    setGame(next);
    setSelected(null);
    setMessage('');
  }
  function draw() {
    if (won) return;
    if (game.stock.length) {
      const stock = [...game.stock];
      const card = { ...stock.pop(), faceUp: true };
      save({ ...game, stock, waste: [...game.waste, card], moves: game.moves + 1 });
    } else if (game.waste.length) {
      save({ ...game, stock: [...game.waste].reverse().map((card) => ({ ...card, faceUp: false })), waste: [], moves: game.moves + 1 });
    }
  }
  function choose(source) {
    if (won) return;
    if (selected) {
      if (selected.type === source.type && selected.pile === source.pile && selected.index === source.index) {
        setSelected(null);
        setMessage('');
        return;
      }
      if (source.type !== 'waste') {
        const next = moveCard(game, selected, { type: source.type, pile: source.pile });
        if (next) { save(next); return; }
      }
    }
    setSelected(source);
    setMessage('Carte sélectionnée : choisis une destination.');
  }
  function destination(target) {
    if (!selected || won) return;
    const next = moveCard(game, selected, target);
    if (next) save(next);
    else setMessage('Déplacement impossible. Choisis une autre destination ou une autre carte.');
  }
  // double-clic : la carte part directement sur sa fondation si c'est possible
  function toFoundation(source) {
    if (won) return;
    const from = source.type === 'waste' ? game.waste : game.tableau[source.pile];
    const card = from[from.length - 1];
    if (!card || (source.type === 'tableau' && source.index !== from.length - 1)) return;
    const next = moveCard(game, source, { type: 'foundations', pile: card.suit });
    if (next) save(next);
  }
  function cardButton(card, onClick, isSelected, extraStyle, onDoubleClick) {
    return <button type="button" className={`sg-card${SUITS[card.suit].red ? ' red' : ''}${isSelected ? ' selected' : ''}`} style={extraStyle} onClick={onClick} onDoubleClick={onDoubleClick} aria-label={cardName(card)} aria-pressed={isSelected}><span>{rankLabel(card.rank)}<span aria-hidden="true">{SUITS[card.suit].symbol}</span></span><span className="sg-big" aria-hidden="true">{SUITS[card.suit].symbol}</span></button>;
  }
  const wasteTop = game.waste[game.waste.length - 1];
  return (
    <section className="solitaire" aria-label="Jeu de solitaire">
      <style>{styles}</style>
      <header className="sg-head"><div><h2>Solitaire</h2><p className="sg-meta">{game.moves} coup{game.moves !== 1 ? 's' : ''} · {game.foundations.reduce((sum, pile) => sum + pile.length, 0)} / 52 cartes rangées</p></div><div className="sg-actions"><button type="button" className="sg-action" disabled={!history.length} onClick={() => { setGame(history[history.length - 1]); setHistory(history.slice(0, -1)); setSelected(null); setMessage('Dernier coup annulé.'); }}>Annuler</button><button type="button" className="sg-action" onClick={() => { setGame(newGame()); setHistory([]); setSelected(null); setMessage('Nouvelle partie.'); }}>Nouvelle partie</button></div></header>
      <div className="sg-board">
        <div className="sg-row sg-top">
          <button type="button" className={game.stock.length ? 'sg-card back' : 'sg-slot'} onClick={draw} aria-label={game.stock.length ? `Piocher une carte, ${game.stock.length} restantes` : 'Retourner la défausse dans la pioche'}>{game.stock.length ? '' : '↻'}</button>
          {wasteTop ? cardButton(wasteTop, () => choose({ type: 'waste' }), selected?.type === 'waste', undefined, () => toFoundation({ type: 'waste' })) :<div className="sg-slot" aria-label="Défausse vide" />}
          <div className="sg-spacer" />
          {game.foundations.map((pile, i) => { const top = pile[pile.length - 1]; return top ? <React.Fragment key={i}>{cardButton(top, () => choose({ type: 'foundations', pile: i }), selected?.type === 'foundations' && selected.pile === i)}</React.Fragment> : <button key={i} type="button" className="sg-slot" onClick={() => destination({ type: 'foundations', pile: i })} aria-label={`Fondation ${SUITS[i].name} vide`}>{SUITS[i].symbol}</button>; })}
        </div>
        <div className="sg-row">
          {game.tableau.map((pile, i) => <div className="sg-pile" key={i} style={{ '--count': Math.max(0, pile.length - 1) }}>
            {!pile.length && <button type="button" className="sg-slot" onClick={() => destination({ type: 'tableau', pile: i })} aria-label={`Colonne ${i + 1} vide`} />}
            {pile.map((card, j) => card.faceUp ? <React.Fragment key={`${card.suit}-${card.rank}`}>{cardButton(card, () => choose({ type: 'tableau', pile: i, index: j }), selected?.type === 'tableau' && selected.pile === i && selected.index === j, { '--index': j }, () => toFoundation({ type: 'tableau', pile: i, index: j }))}</React.Fragment> : <div key={`${card.suit}-${card.rank}`} className="sg-card back" style={{ '--index': j }} aria-label="Carte cachée" />)}
          </div>)}
        </div>
      </div>
      <p className="sg-hint">Touche une carte, puis sa destination, ou double-clique pour la ranger en haut. Alterne les couleurs par ordre décroissant ; seul un roi peut occuper une colonne vide. Range chaque couleur de l’as au roi. La pioche se retourne autant que tu veux.</p>
      <p className="sg-message" role="status">{won ? 'Bravo, tu as gagné !' : message}</p>
    </section>
  );
}
