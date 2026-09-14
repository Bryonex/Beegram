const fs = require('fs');
function replaceIn(f, regex, replacement) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, c.replace(regex, replacement));
  }
}
replaceIn('src/components/games/CandyCrush.tsx', /\s*const \[showRules, setShowRules\] = useState\(false\);?\r?\n/, '\n');
replaceIn('src/components/games/ChessGame.tsx', /\s*const \[showRules, setShowRules\] = useState\(false\);?\r?\n/, '\n');
replaceIn('src/components/games/RockPaperScissors.tsx', /\s*const \[showRules, setShowRules\] = useState\(false\);?\r?\n/, '\n');
replaceIn('src/components/games/TowerBlock.tsx', /\s*const \[showRules, setShowRules\] = useState\(false\);?\r?\n/, '\n');
replaceIn('src/components/games/ReflexZero.tsx', /,\s*Info\s*/, '');
replaceIn('src/components/games/PopBalloons.tsx', /,\s*Info\s*/, '');
replaceIn('src/components/games/TicTacToe.tsx', /,\s*Info\s*/, '');
