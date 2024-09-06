import { useState, useEffect, useCallback, useMemo } from "react";
import BattlePopup from "./components/BattlePopup";
import VictoryPopup from "./components/VictoryPopup";
import {
  isTreePosition,
  isWaterPosition,
  handleUseHerb,
  attemptHerbDrop,
  enemyAttack,
} from "./utils/gameFunctions";

import {
  initializeAudio,
  playNormalMusic,
  stopNormalMusic,
  playBattleMusic,
  stopBattleMusic,
  playEnemyAttackSound,
} from "./utils/audioManager"; // 音声管理ファイルをインポート

import { Enemy } from "./utils/types"; // 型定義をインポート
import { enemies } from "./utils/enemies";
import { playerImages } from "./utils/playerImages"; // playerImagesをインポート

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

  // 音楽ファイルのAudioオブジェクトをクライアントサイドで初期化
  const [normalMusic, setNormalMusic] = useState<HTMLAudioElement | null>(null);
  const [battleMusic, setBattleMusic] = useState<HTMLAudioElement | null>(null);
  const [swordSound, setSwordSound] = useState<HTMLAudioElement | null>(null);
  const [herbSound, setHerbSound] = useState<HTMLAudioElement | null>(null); // やくそう使用時の音
  const [victorySound, setVictorySound] = useState<HTMLAudioElement | null>(
    null
  ); // 勝利時の音
  const [enemyAttackSound, setEnemyAttackSound] =
    useState<HTMLAudioElement | null>(null); // 敵の攻撃音

  const [direction, setDirection] = useState("down"); // プレイヤーの向き
  const [animationFrame, setAnimationFrame] = useState(0); // 画像を切り替えるためのフレーム

  useEffect(() => {
    if (typeof window !== "undefined") {
      // クライアントサイドでのみAudioを初期化
      setNormalMusic(new Audio("/music/normalMusic.mp3"));
      setBattleMusic(new Audio("/music/battleMusic.mp3"));
      setSwordSound(new Audio("/sounds/sword.mp3"));
      setHerbSound(new Audio("/sounds/herbSound.mp3")); // やくそう使用時の音を初期化
      setVictorySound(new Audio("/sounds/victorySound.mp3")); // 勝利時の音を初期化
      setEnemyAttackSound(new Audio("/sounds/enemyAttack.mp3"));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prevFrame) => (prevFrame === 0 ? 1 : 0)); // フレームを切り替える
    }, 600); // 1秒ごとに切り替え

    return () => clearInterval(interval); // クリーンアップ
  }, []);

  // 通常音楽の再生を開始
  useEffect(() => {
    playNormalMusic(normalMusic);
    return () => {
      stopNormalMusic(normalMusic); // クリーンアップ
    };
  }, [normalMusic]);

  // 戦闘が始まるときに音楽を切り替え
  useEffect(() => {
    if (isBattlePopupVisible) {
      stopNormalMusic(normalMusic); // 通常の音楽を停止
      playBattleMusic(battleMusic); // 戦闘音楽を再生
    } else {
      stopBattleMusic(battleMusic); // 戦闘音楽を停止

      // 2秒の遅延を追加して通常の音楽を再開
      setTimeout(() => {
        playNormalMusic(normalMusic); // 通常音楽を再生
      }, 2000);
    }

    return () => {
      stopBattleMusic(battleMusic); // コンポーネント終了時に戦闘音楽を停止
      stopNormalMusic(normalMusic); // 通常音楽も停止
    };
  }, [isBattlePopupVisible, normalMusic, battleMusic]);

  const startRandomBattleSteps = () => {
    const randomSteps = Math.floor(Math.random() * 6) + 3;
    setNextBattleSteps(randomSteps);
    setSteps(0);
  };

  // 関数を使用
  const handleEnemyAttack = () => {
    enemyAttack(
      currentEnemy,
      setPlayerHp,
      setEnemyAttackMessage,
      setIsPlayerTurn,
      enemyAttackSound
    );
  };

  const handleAttack = () => {
    if (currentEnemy && isPlayerTurn) {
      swordSound
        .play()
        .catch((err) => console.error("Error playing sword sound:", err)); // エラーキャッチ
      const newHp = currentEnemy.hp - 6;
      if (newHp <= 0) {
        setCurrentEnemy({ ...currentEnemy, hp: 0 });
        setTimeout(() => {
          attemptHerbDrop(currentEnemy, setHerbCount, setHerbMessage);
          if (victorySound) victorySound.play();
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
          handleEnemyAttack();
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
            ) {
              newPos.y -= 1;
              setDirection("up"); // 上向きに変更
            }
            break;
          case "ArrowDown":
            if (
              prev.y < 19 &&
              !isTreePosition(prev.x, prev.y + 1, treePositions) &&
              !isWaterPosition(prev.x, prev.y + 1, waterPositions)
            ) {
              newPos.y += 1;
              setDirection("down"); // 下向きに変更
            }
            break;
          case "ArrowLeft":
            if (
              prev.x > 0 &&
              !isTreePosition(prev.x - 1, prev.y, treePositions) &&
              !isWaterPosition(prev.x - 1, prev.y, waterPositions)
            ) {
              newPos.x -= 1;
              setDirection("left"); // 左向きに変更
            }
            break;
          case "ArrowRight":
            if (
              prev.x < 19 &&
              !isTreePosition(prev.x + 1, prev.y, treePositions) &&
              !isWaterPosition(prev.x + 1, prev.y, waterPositions)
            ) {
              newPos.x += 1;
              setDirection("right"); // 右向きに変更
            }
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
                backgroundColor: "green",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              {isPlayer && (
                <Image
                  src={playerImages[direction][animationFrame]} // 向きとアニメーションフレームに応じて画像を切り替える
                  width={100}
                  height={100}
                  alt="Player"
                  style={{ width: "100%", height: "100%" }}
                />
              )}
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
              setEnemyAttackMessage,
              herbSound
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
