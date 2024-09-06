import React from "react";

type Enemy = {
  name: string;
  image: string;
  hp: number;
};

type BattlePopupProps = {
  enemy: Enemy;
  isPlayerTurn: boolean;
  onAttack: () => void;
  enemyAttackMessage: string;
  herbCount: number; // やくそうの数
  onUseHerb: () => void; // やくそうを使う処理
  playerHp: number; // プレイヤーのHP
};

const BattlePopup: React.FC<BattlePopupProps> = ({
  enemy,
  isPlayerTurn,
  onAttack,
  enemyAttackMessage,
  herbCount,
  onUseHerb,
  playerHp,
}) => {
  return (
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
      <img
        src={enemy.image}
        alt="Enemy"
        style={{ width: "150px", height: "150px" }}
      />
      <p>HP: {enemy.hp}</p>
      <button onClick={onAttack} disabled={!isPlayerTurn}>
        戦う
      </button>

      {/* やくそうボタン */}
      <button onClick={onUseHerb} disabled={herbCount === 0 || playerHp >= 50}>
        やくそう ({herbCount}個)
      </button>

      {/* 敵の攻撃メッセージ */}
      {enemyAttackMessage && <p>{enemyAttackMessage}</p>}
    </div>
  );
};

export default BattlePopup;
