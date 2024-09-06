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
  const [isBattlePopupVisible, setIsBattlePopupVisible] = useState(false); // ポップアップの表示状態
  const [steps, setSteps] = useState(0); // プレイヤーが進んだマス数
  const [nextBattleSteps, setNextBattleSteps] = useState(0); // 次の戦闘が発生するまでのマス数

  // ポップアップを閉じる処理
  const closePopup = () => {
    setIsBattlePopupVisible(false);
    startRandomBattleSteps(); // 次の戦闘発生マス数を設定
  };

  // ランダムな戦闘発生マス数を設定
  const startRandomBattleSteps = () => {
    const randomSteps = Math.floor(Math.random() * 6) + 3; // 3〜8マスの間でランダム
    setNextBattleSteps(randomSteps);
    setSteps(0); // マス数カウントをリセット
  };

  // キー入力による移動処理
  const handleKeyPress = (e: KeyboardEvent) => {
    if (isBattlePopupVisible) return; // ポップアップが表示されている間は移動不可

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

    // 1マス移動するごとにステップ数を増加
    setSteps((prevSteps) => prevSteps + 1);
  };

  useEffect(() => {
    if (!isBattlePopupVisible) {
      // キーイベントリスナーを設定（ポップアップが表示されていないとき）
      window.addEventListener("keydown", handleKeyPress);
    } else {
      // ポップアップ表示中はリスナーを無効化
      window.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isBattlePopupVisible]);

  // 初期化時にランダム戦闘発生マス数を設定
  useEffect(() => {
    startRandomBattleSteps();
  }, []);

  // プレイヤーが規定のマス数を進んだらポップアップを表示
  useEffect(() => {
    if (steps >= nextBattleSteps) {
      setIsBattlePopupVisible(true);
    }
  }, [steps, nextBattleSteps]);

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

      {/* ポップアップの表示 */}
      {isBattlePopupVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            border: "2px solid black",
            zIndex: 1000,
          }}
        >
          <h2>敵が現れた！</h2>
          <button onClick={closePopup}>閉じる</button>
        </div>
      )}
    </div>
  );
};

export default Game;
