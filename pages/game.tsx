import { useState, useEffect } from "react";
import BattlePopup from "./components/BattlePopup";
import VictoryPopup from "./components/VictoryPopup";

// 木と水を配置する位置
const treePositions = [
  { x: 3, y: 2 },
  { x: 5, y: 6 },
];

// 水の配置を範囲で指定する
const waterPositions = [];

// x: 1〜20, y: 17〜19 の範囲で水を配置
for (let x = 0; x <= 20; x++) {
  for (let y = 13; y <= 14; y++) {
    waterPositions.push({ x, y });
  }
}

// 木や水があるかどうかをチェックする関数
const isTreePosition = (x: number, y: number) => {
  return treePositions.some((pos) => pos.x === x && pos.y === y);
};

const isWaterPosition = (x: number, y: number) => {
  return waterPositions.some((pos) => pos.x === x && pos.y === y);
};

// 敵データの型定義
type Enemy = {
  name: string;
  image: string;
  hp: number;
  attackRange: [number, number];
};

const Game = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerHp, setPlayerHp] = useState(50); // 主人公のHPを50に設定
  const [herbCount, setHerbCount] = useState(0); // やくそうの所持数
  const [isBattlePopupVisible, setIsBattlePopupVisible] = useState(false);
  const [steps, setSteps] = useState(0);
  const [nextBattleSteps, setNextBattleSteps] = useState(0);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [isVictoryPopupVisible, setIsVictoryPopupVisible] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // プレイヤーのターンかどうか
  const [enemyAttackMessage, setEnemyAttackMessage] = useState("");
  const [herbMessage, setHerbMessage] = useState(""); // やくそうを入手したメッセージ

  const enemies: Enemy[] = [
    {
      name: "enemy1",
      image: "/images/enemy1.png",
      hp: 10,
      attackRange: [1, 3],
    },
    {
      name: "enemy2",
      image: "/images/enemy2.png",
      hp: 15,
      attackRange: [4, 6],
    },
    {
      name: "enemy3",
      image: "/images/enemy3.png",
      hp: 20,
      attackRange: [7, 9],
    },
  ];

  const closePopup = () => {
    setIsBattlePopupVisible(false);
    startRandomBattleSteps();
  };

  const startRandomBattleSteps = () => {
    const randomSteps = Math.floor(Math.random() * 6) + 3;
    setNextBattleSteps(randomSteps);
    setSteps(0);
  };

  // 敵の攻撃処理
  const enemyAttack = () => {
    if (currentEnemy) {
      const [minAttack, maxAttack] = currentEnemy.attackRange;
      const damage =
        Math.floor(Math.random() * (maxAttack - minAttack + 1)) + minAttack;
      setPlayerHp((prevHp) => Math.max(prevHp - damage, 0)); // HPが0を下回らないようにする
      setEnemyAttackMessage(
        `${currentEnemy.name}による攻撃: ${damage} ダメージ`
      );
      setIsPlayerTurn(true); // プレイヤーのターンに戻す
    }
  };

  // やくそう入手の処理
  const attemptHerbDrop = () => {
    const herbDrop = Math.random() < 0.8; // 50%の確率
    if (herbDrop) {
      setHerbCount((prev) => prev + 1);
      setHerbMessage(`${currentEnemy?.name}はやくそうをおとした`);
    } else {
      setHerbMessage(""); // やくそうを入手しなかった場合はリセット
    }
  };

  // プレイヤーの攻撃処理
  const handleAttack = () => {
    if (currentEnemy && isPlayerTurn) {
      const newHp = currentEnemy.hp - 6;
      if (newHp <= 0) {
        setCurrentEnemy({ ...currentEnemy, hp: 0 });
        setTimeout(() => {
          attemptHerbDrop(); // やくそう入手の処理
          setIsBattlePopupVisible(false);
          setIsVictoryPopupVisible(true);
          setTimeout(() => {
            setIsVictoryPopupVisible(false);
            setHerbMessage(""); // 勝利ポップアップが消える時にメッセージもリセット
            startRandomBattleSteps();
          }, 2000); // 2秒後にポップアップを閉じる
        }, 500);
      } else {
        setCurrentEnemy({ ...currentEnemy, hp: newHp });
        setIsPlayerTurn(false); // プレイヤーの攻撃が終わったら敵のターンにする
        setTimeout(() => {
          enemyAttack(); // 敵の攻撃
        }, 1000); // 1秒後に敵が攻撃
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isBattlePopupVisible) return;

    setPlayerPosition((prev) => {
      let newPos = { ...prev };

      switch (e.key) {
        case "ArrowUp":
          if (
            prev.y > 0 &&
            !isTreePosition(prev.x, prev.y - 1) &&
            !isWaterPosition(prev.x, prev.y - 1)
          )
            newPos.y -= 1;
          break;
        case "ArrowDown":
          if (
            prev.y < 19 &&
            !isTreePosition(prev.x, prev.y + 1) &&
            !isWaterPosition(prev.x, prev.y + 1)
          )
            newPos.y += 1;
          break;
        case "ArrowLeft":
          if (
            prev.x > 0 &&
            !isTreePosition(prev.x - 1, prev.y) &&
            !isWaterPosition(prev.x - 1, prev.y)
          )
            newPos.x -= 1;
          break;
        case "ArrowRight":
          if (
            prev.x < 19 &&
            !isTreePosition(prev.x + 1, prev.y) &&
            !isWaterPosition(prev.x + 1, prev.y)
          )
            newPos.x += 1;
          break;
        default:
          break;
      }
      return newPos;
    });

    setSteps((prevSteps) => prevSteps + 1);
  };

  useEffect(() => {
    if (!isBattlePopupVisible) {
      window.addEventListener("keydown", handleKeyPress);
    } else {
      window.removeEventListener("keydown", handleKeyPress);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isBattlePopupVisible]);

  useEffect(() => {
    startRandomBattleSteps();
  }, []);

  useEffect(() => {
    if (steps >= nextBattleSteps) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      setCurrentEnemy(randomEnemy);
      setIsBattlePopupVisible(true);
      setIsPlayerTurn(true); // 戦闘開始時はプレイヤーのターン
      setEnemyAttackMessage(""); // 敵の攻撃メッセージをリセット
    }
  }, [steps, nextBattleSteps]);

  // やくそうを使う処理
  const useHerb = () => {
    if (herbCount > 0 && playerHp < 50) {
      const healAmount = Math.floor(Math.random() * 11) + 20; // 20~30回復
      setPlayerHp((prevHp) => Math.min(prevHp + healAmount, 50)); // HPが50を超えないようにする
      setHerbCount((prev) => prev - 1); // やくそうの数を減らす
      setEnemyAttackMessage(`やくそうを使ってHPが${healAmount}回復した！`);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>簡単なフィールドでの移動</h1>

      {/* プレイヤーのHPとやくそう表示 */}
      <div style={{ marginBottom: "20px" }}>
        <h2>主人公のHP: {playerHp}</h2>
        <h2>やくそう: {herbCount}個</h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(20, 30px)`,
          gridTemplateRows: `repeat(20, 30px)`,
          gap: "2px",
        }}
      >
        {Array.from({ length: 20 * 20 }).map((_, index) => {
          const x = index % 20;
          const y = Math.floor(index / 20);
          const isPlayer = playerPosition.x === x && playerPosition.y === y;
          const isTree = isTreePosition(x, y);
          const isWater = isWaterPosition(x, y);

          return (
            <div
              key={index}
              style={{
                width: 32, // マス目のサイズを小さく
                height: 32, // マス目のサイズを小さく
                backgroundColor: isPlayer ? "blue" : "green",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // border: "1px solid black", // 境界線を設定して隙間を無くす
                boxSizing: "border-box", // 隙間を完全に無くす
              }}
            >
              {isPlayer && <span style={{ color: "white" }}>P</span>}
              {isTree && (
                <img
                  src="/images/tree.png"
                  alt="Tree"
                  style={{ width: "100%", height: "100%" }}
                />
              )}

              {isWater && (
                <img
                  src="/images/water.png"
                  alt="Water"
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 戦闘ポップアップ */}
      {isBattlePopupVisible && currentEnemy && (
        <BattlePopup
          enemy={currentEnemy}
          isPlayerTurn={isPlayerTurn}
          onAttack={handleAttack}
          enemyAttackMessage={enemyAttackMessage}
          herbCount={herbCount} // やくそうの数を渡す
          onUseHerb={useHerb} // やくそうを使う処理を渡す
          playerHp={playerHp} // プレイヤーのHPを渡す
        />
      )}

      {/* 勝利ポップアップ */}
      {isVictoryPopupVisible && <VictoryPopup herbMessage={herbMessage} />}
    </div>
  );
};

export default Game;
