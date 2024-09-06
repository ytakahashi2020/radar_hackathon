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
export const useHerb = (
  herbCount: number,
  playerHp: number,
  setPlayerHp: (hp: number) => void,
  setHerbCount: (count: number) => void,
  setEnemyAttackMessage: (message: string) => void
) => {
  if (herbCount > 0 && playerHp < 50) {
    const healAmount = Math.floor(Math.random() * 11) + 20; // 20~30回復
    setPlayerHp((prevHp) => Math.min(prevHp + healAmount, 50)); // HPが50を超えないようにする
    setHerbCount((prev) => prev - 1); // やくそうの数を減らす
    setEnemyAttackMessage(`やくそうを使ってHPが${healAmount}回復した！`);
  }
};
