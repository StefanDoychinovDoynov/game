import React, { useState, useEffect } from "react";

function Component() {
  const [position, setPosition] = useState({ top: 0, left: 0 }); // State for character position
  const [smallBlocks, setSmallBlocks] = useState([]); // State for small blocks
  const [yellowBlock, setYellowBlock] = useState(null); // State for yellow block
  const [speed, setSpeed] = useState(5); // Initial speed of small blocks
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [yellowCount, setYellowCount] = useState(0); // Yellow block counter
  const [redBlockCount, setRedBlockCount] = useState(0); // Counter for red blocks created
  const [score, setScore] = useState(0); // Score counter

  // Key press handler function
  const handleKeyPress = (event) => {
    const key = event.key.toLowerCase(); // Normalize key to lowercase

    if (['w', 'a', 's', 'd'].includes(key)) {
      console.log(`Key pressed: ${key}`);
      handleSpecificKey(key);
    }
  };

  // Function to handle specific key logic
  const handleSpecificKey = (key) => {
    setPosition((prev) => {
      switch (key) {
        case 'w':
          return { ...prev, top: Math.max(prev.top - 40, 0) };
        case 'a':
          return { ...prev, left: Math.max(prev.left - 40, 0) };
        case 's':
          return { ...prev, top: Math.min(prev.top + 40, window.innerHeight - 40) };
        case 'd':
          return { ...prev, left: Math.min(prev.left + 40, window.innerWidth - 40) };
        default:
          return prev;
      }
    });
  };

  useEffect(() => {
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Empty dependency array ensures this runs once

  useEffect(() => {
    if (gameOver) return; // Stop small blocks if game over

    const interval = setInterval(() => {
      setSmallBlocks((blocks) => [
        ...blocks,
        { top: Math.random() * (window.innerHeight - 15), left: window.innerWidth },
      ]);
      setRedBlockCount((count) => count + 1);
      setSpeed((prevSpeed) => prevSpeed + 1); // Increase speed with each new block
    }, 8000); // Spawn every 10 seconds

    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (redBlockCount > 0 && redBlockCount % 3 === 0 && !yellowBlock) {
      // Spawn yellow block every 3 red blocks
      setYellowBlock({ top: Math.random() * (window.innerHeight - 25), left: Math.random() * (window.innerWidth - 25) });
    }
  }, [redBlockCount, yellowBlock]);

  useEffect(() => {
    if (gameOver) return;

    const moveBlocks = () => {
      setSmallBlocks((blocks) =>
        blocks.map((block) => {
          const newLeft = block.left - speed;
          // Respawn at random vertical position when block reaches the left edge
          if (newLeft <= 0) {
            return { top: Math.random() * (window.innerHeight - 15), left: window.innerWidth };
          }
          return { ...block, left: newLeft };
        })
      );
    };

    const checkCollision = () => {
      // Check collision with red blocks
      smallBlocks.forEach((block) => {
        if (
          position.left < block.left + 15 &&
          position.left + 40 > block.left &&
          position.top < block.top + 15 &&
          position.top + 40 > block.top
        ) {
          setGameOver(true);
          console.log("Game Over");
        }
      });

      // Check collision with yellow block
      if (yellowBlock) {
        if (
          position.left < yellowBlock.left + 25 &&
          position.left + 40 > yellowBlock.left &&
          position.top < yellowBlock.top + 25 &&
          position.top + 40 > yellowBlock.top
        ) {
          setYellowBlock(null); // Remove yellow block
          setYellowCount((count) => count + 1); // Increment yellow block counter
        }
      }
    };

    const interval = setInterval(() => {
      moveBlocks();
      checkCollision();
      setScore((prevScore) => prevScore + 1); // Increment score over time
    }, 15);

    return () => clearInterval(interval);
  }, [smallBlocks, speed, position, yellowBlock, gameOver]);

  return (
    <>
      <h1>{gameOver ? `Game Over. Score: ${score}` : `Score: ${score}, Yellow Blocks: ${yellowCount}`}</h1>
      <div
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          backgroundColor: 'blue',
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      ></div>
      {smallBlocks.map((block, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            width: '15px',
            height: '15px',
            backgroundColor: 'red',
            top: `${block.top}px`,
            left: `${block.left}px`,
          }}
        ></div>
      ))}
      {yellowBlock && (
        <div
          style={{
            position: 'absolute',
            width: '25px',
            height: '25px',
            backgroundColor: 'yellow',
            top: `${yellowBlock.top}px`,
            left: `${yellowBlock.left}px`,
          }}
        ></div>
      )}
    </>
  );
}

export default Component;
