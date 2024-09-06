// 木や水があるかどうかをチェックする関数
export const isTreePosition = (
  x: number,
  y: number,
  treePositions: { x: number; y: number }[]
) => {
  return treePositions.some((pos) => pos.x === x && pos.y === y);
};

export const isWaterPosition = (
  x: number,
  y: number,
  waterPositions: { x: number; y: number }[]
) => {
  return waterPositions.some((pos) => pos.x === x && pos.y === y);
};

// やくそうを使う処理
export const handleUseHerb = (
  herbCount: number,
  playerHp: number,
  setPlayerHp: (hp: number | ((prevHp: number) => number)) => void, // 型を明示
  setHerbCount: (count: number | ((prevCount: number) => number)) => void, // 同様に型を明示
  setEnemyAttackMessage: (message: string) => void,
  herbSound: HTMLAudioElement | null // 効果音のAudioオブジェクトを引数に追加
) => {
  if (herbCount > 0 && playerHp < 50) {
    const healAmount = Math.floor(Math.random() * 11) + 20; // 20~30回復
    setPlayerHp((prevHp) => {
      return Math.min(prevHp + healAmount, 50); // HPが50を超えないようにする
    });
    setHerbCount((prev) => prev - 1); // やくそうの数を減らす
    setEnemyAttackMessage(`やくそうを使ってHPが${healAmount}回復した！`);
    herbSound
      .play()
      .catch((err) => console.error("Error playing herb sound:", err));
  }
};

// やくそう入手の処理
export const attemptHerbDrop = (
  currentEnemy: { name: string } | null,
  setHerbCount: (count: number | ((prev: number) => number)) => void,
  setHerbMessage: (message: string) => void
) => {
  const herbDrop = Math.random() < 0.9; // 50%の確率でやくそうをドロップ
  if (herbDrop) {
    setHerbCount((prev) => prev + 1); // やくそうの数を増やす
    setHerbMessage(`${currentEnemy?.name}はやくそうをおとした`);
  } else {
    setHerbMessage(""); // やくそうを入手しなかった場合はリセット
  }
};
