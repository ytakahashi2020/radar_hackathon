import { useState, useEffect, useCallback, useMemo } from "react";
import BattlePopup from "./components/BattlePopup";
import VictoryPopup from "./components/VictoryPopup";
import {
  isTreePosition,
  isWaterPosition,
  handleUseHerb,
  attemptHerbDrop,
} from "./utils/gameFunctions";
import Image from "next/image";

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

const Game = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerHp, setPlayerHp] = useState(50);
  const [herbCount, setHerbCount] = useState(0); // やくそうの所持数
  const [isBattlePopupVisible, setIsBattlePopupVisible] = useState(false);
  const [steps, setSteps] = useState(0);
  const [nextBattleSteps, setNextBattleSteps] = useState(0);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [isVictoryPopupVisible, setIsVictoryPopupVisible] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [enemyAttackMessage, setEnemyAttackMessage] = useState("");
  const [herbMessage, setHerbMessage] = useState(""); // やくそうを入手したメッセージ

  const enemies: Enemy[] = useMemo(
    () => [
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
    ],
    []
  );
  type Enemy = {
    name: string;
    image: string;
    hp: number;
    attackRange: [number, number];
  };

  const closePopup = () => {
    setIsBattlePopupVisible(false);
    startRandomBattleSteps();
  };

  const startRandomBattleSteps = () => {
    const randomSteps = Math.floor(Math.random() * 6) + 3;
    setNextBattleSteps(randomSteps);
    setSteps(0);
  };

  const enemyAttack = () => {
    if (currentEnemy) {
      const [minAttack, maxAttack] = currentEnemy.attackRange;
      const damage =
        Math.floor(Math.random() * (maxAttack - minAttack + 1)) + minAttack;
      setPlayerHp((prevHp) => Math.max(prevHp - damage, 0));
      setEnemyAttackMessage(
        `${currentEnemy.name}による攻撃: ${damage} ダメージ`
      );
      setIsPlayerTurn(true);
    }
  };

  const handleAttack = () => {
    if (currentEnemy && isPlayerTurn) {
      const newHp = currentEnemy.hp - 6;
      if (newHp <= 0) {
        setCurrentEnemy({ ...currentEnemy, hp: 0 });
        setTimeout(() => {
          attemptHerbDrop(currentEnemy, setHerbCount, setHerbMessage);
          setIsBattlePopupVisible(false);
          setIsVictoryPopupVisible(true);
          setTimeout(() => {
            setIsVictoryPopupVisible(false);
            setHerbMessage(""); // 勝利ポップアップが消える時にメッセージもリセット
            startRandomBattleSteps();
          }, 2000);
        }, 500);
      } else {
        setCurrentEnemy({ ...currentEnemy, hp: newHp });
        setIsPlayerTurn(false);
        setTimeout(() => {
          enemyAttack();
        }, 1000);
      }
    }
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isBattlePopupVisible) return;

      setPlayerPosition((prev) => {
        let newPos = { ...prev };

        switch (e.key) {
          case "ArrowUp":
            if (
              prev.y > 0 &&
              !isTreePosition(prev.x, prev.y - 1, treePositions) &&
              !isWaterPosition(prev.x, prev.y - 1, waterPositions)
            )
              newPos.y -= 1;
            break;
          case "ArrowDown":
            if (
              prev.y < 19 &&
              !isTreePosition(prev.x, prev.y + 1, treePositions) &&
              !isWaterPosition(prev.x, prev.y + 1, waterPositions)
            )
              newPos.y += 1;
            break;
          case "ArrowLeft":
            if (
              prev.x > 0 &&
              !isTreePosition(prev.x - 1, prev.y, treePositions) &&
              !isWaterPosition(prev.x - 1, prev.y, waterPositions)
            )
              newPos.x -= 1;
            break;
          case "ArrowRight":
            if (
              prev.x < 19 &&
              !isTreePosition(prev.x + 1, prev.y, treePositions) &&
              !isWaterPosition(prev.x + 1, prev.y, waterPositions)
            )
              newPos.x += 1;
            break;
          default:
            break;
        }
        return newPos;
      });

      setSteps((prevSteps) => prevSteps + 1);
    },
    [isBattlePopupVisible]
  );

  useEffect(() => {
    if (!isBattlePopupVisible) {
      window.addEventListener("keydown", handleKeyPress);
    } else {
      window.removeEventListener("keydown", handleKeyPress);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isBattlePopupVisible, handleKeyPress]);

  useEffect(() => {
    startRandomBattleSteps();
  }, []);

  useEffect(() => {
    if (steps >= nextBattleSteps) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      setCurrentEnemy(randomEnemy);
      setIsBattlePopupVisible(true);
      setIsPlayerTurn(true);
      setEnemyAttackMessage("");
    }
  }, [steps, nextBattleSteps, enemies]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>簡単なフィールドでの移動</h1>

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
          const isTree = isTreePosition(x, y, treePositions);
          const isWater = isWaterPosition(x, y, waterPositions);

          return (
            <div
              key={index}
              style={{
                width: 32,
                height: 32,
                backgroundColor: isPlayer ? "blue" : "green",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              {isPlayer && <span style={{ color: "white" }}>P</span>}
              {isTree && (
                <Image
                  src="/images/tree.png"
                  width={100} // 幅
                  height={100}
                  alt="Tree"
                  style={{ width: "100%", height: "100%" }}
                />
              )}
              {isWater && (
                <Image
                  src="/images/water.png"
                  width={100} // 幅
                  height={100}
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
          herbCount={herbCount}
          onUseHerb={() =>
            handleUseHerb(
              herbCount,
              playerHp,
              setPlayerHp,
              setHerbCount,
              setEnemyAttackMessage
            )
          } // useHerbは通常の関数として使用
          playerHp={playerHp}
        />
      )}

      {/* 勝利ポップアップ */}
      {isVictoryPopupVisible && <VictoryPopup herbMessage={herbMessage} />}
    </div>
  );
};

export default Game;
