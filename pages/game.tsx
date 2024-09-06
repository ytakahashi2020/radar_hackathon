import { useState, useEffect } from "react";

const tileSize = 50; // タイルのサイズ
const fieldWidth = 10; // フィールドの横のタイル数
const fieldHeight = 10; // フィールドの縦のタイル数

// 木を配置する位置
const treePositions = [
  { x: 3, y: 2 }, // (3, 2) に木を配置
  { x: 5, y: 6 }, // (5, 6) に木を配置
];

// 木があるかどうかをチェックする関数
const isTreePosition = (x: number, y: number) => {
  return treePositions.some((pos) => pos.x === x && pos.y === y);
};

const Game = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });

  // キー入力による移動処理
  const handleKeyPress = (e: KeyboardEvent) => {
    setPlayerPosition((prev) => {
      let newPos = { ...prev };

      switch (e.key) {
        case "ArrowUp":
          if (prev.y > 0 && !isTreePosition(prev.x, prev.y - 1)) newPos.y -= 1;
          break;
        case "ArrowDown":
          if (prev.y < fieldHeight - 1 && !isTreePosition(prev.x, prev.y + 1))
            newPos.y += 1;
          break;
        case "ArrowLeft":
          if (prev.x > 0 && !isTreePosition(prev.x - 1, prev.y)) newPos.x -= 1;
          break;
        case "ArrowRight":
          if (prev.x < fieldWidth - 1 && !isTreePosition(prev.x + 1, prev.y))
            newPos.x += 1;
          break;
        default:
          break;
      }

      return newPos;
    });
  };

  useEffect(() => {
    // キーイベントリスナーを設定
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>簡単なフィールドでの移動</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${fieldWidth}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${fieldHeight}, ${tileSize}px)`,
          gap: "2px",
        }}
      >
        {/* フィールドの生成 */}
        {Array.from({ length: fieldWidth * fieldHeight }).map((_, index) => {
          const x = index % fieldWidth;
          const y = Math.floor(index / fieldWidth);
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const isTree = isTreePosition(x, y);

          return (
            <div
              key={index}
              style={{
                width: tileSize,
                height: tileSize,
                backgroundColor: isPlayer ? "blue" : "green",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isPlayer ? (
                <span style={{ color: "white" }}>P</span>
              ) : isTree ? (
                <img
                  src="/images/tree.png"
                  alt="Tree"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Game;
