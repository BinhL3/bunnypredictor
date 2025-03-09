import React, { useState, useEffect } from "react";

const attributes = [
  "father_white", "father_grey", "father_black", "father_orange", "father_brown",
  "father_lilac", "father_frosty", "father_tricolor", "father_broken", "father_harlequin",
  "father_vienna", "father_eye_brown", "father_eye_blue", "mother_white", "mother_grey",
  "mother_black", "mother_orange", "mother_brown", "mother_lilac", "mother_vienna",
  "mother_solid", "mother_broken", "mother_harlequin", "mother_eye_brown", "mother_eye_blue"
];

function App() {
  const [features, setFeatures] = useState(new Array(25).fill(0));
  const [player1Guess, setPlayer1Guess] = useState(null);
  const [player2Guess, setPlayer2Guess] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [result, setResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [correctPlayersText, setCorrectPlayersText] = useState(""); // New state for the message

  // 🎲 Randomize attributes each round
  const generateRandomAttributes = () => {
    let randomFeatures = Array.from({ length: 25 }, () => (Math.random() < 0.5 ? 1 : 0));
    setFeatures(randomFeatures);
  };

  useEffect(() => {
    generateRandomAttributes();
  }, []);

  const handleGuess = (guess) => {
    if (currentPlayer === 1) {
      setPlayer1Guess(guess);
      setCurrentPlayer(2);
    } else {
      setPlayer2Guess(guess);
      setCurrentPlayer(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });

      const data = await response.json();
      setResult(data);

      // Calculate new scores
      const newPlayer1Score = player1Guess === data.prediction ? player1Score + 1 : player1Score;
      const newPlayer2Score = player2Guess === data.prediction ? player2Score + 1 : player2Score;

      setPlayer1Score(newPlayer1Score);
      setPlayer2Score(newPlayer2Score);

      const player1Correct = player1Guess === data.prediction;
      const player2Correct = player2Guess === data.prediction;
      let text = "";
      if (player1Correct && player2Correct) {
        text = "Both Players Got It Right! 🎉";
      } else if (player1Correct) {
        text = "Player 1 Got It Right! 🎉";
      } else if (player2Correct) {
        text = "Player 2 Got It Right! 🎉";
      } else {
        text = "No One Got It Right 😔";
      }
      setCorrectPlayersText(text);

      if (newPlayer1Score === 5) {
        setWinner("🎉 Player 1 Wins! 🎉");
      } else if (newPlayer2Score === 5) {
        setWinner("🎉 Player 2 Wins! 🎉");
      } else {
        setCurrentPlayer(1);
        setPlayer1Guess(null);
        setPlayer2Guess(null);
        generateRandomAttributes();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetGame = () => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setWinner(null);
    setCurrentPlayer(1);
    setPlayer1Guess(null);
    setPlayer2Guess(null);
    setCorrectPlayersText("");
    generateRandomAttributes();
  };

  // 🖼 Choose bunny image based on prediction
  const getBunnyImage = () => {
    if (!result) return null;
    return result.prediction === 1
      ? `/bunny${Math.random() < 0.5 ? "1" : "2"}.jpeg` // Black fur (bunny1 or bunny2)
      : `/bunny${Math.random() < 0.5 ? "3" : "4"}.jpeg`; // No black fur (bunny3 or bunny4)
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#f9ecef",
        minHeight: "100vh",
        color: "#5a3e4b",
      }}
    >
      <h1 style={{ fontSize: "2.5em", marginBottom: "10px" }}>🐰 Bunny Predictor Game 🐰</h1>
      <p style={{ fontSize: "1.2em", color: "#7d5a68" }}>
        Guess if the bunny will have black fur based on its parents!
      </p>

      {/* Display text above bunny image */}
      {result && (
        <div>
          <h3 style={{ margin: "20px 0", color: "#ff6f91", fontSize: "1.5em" }}>
            {correctPlayersText}
          </h3>
          <img
            src={getBunnyImage()}
            alt="Predicted Bunny"
            style={{
              width: "200px",
              margin: "0 auto",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Attributes displayed as color tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          maxWidth: "800px",
          margin: "20px auto",
          padding: "20px",
          backgroundColor: "#fff0f5",
          borderRadius: "15px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {attributes.map((attr, index) => (
          <span
            key={index}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              fontSize: "0.9em",
              fontWeight: "bold",
              backgroundColor: features[index] ? "#ffccd5" : "#e0e0e0",
              color: "#5a3e4b",
              cursor: "default",
              transition: "0.2s ease-in-out",
            }}
          >
            {features[index] ? `✔ ${attr}` : `✖ ${attr}`}
          </span>
        ))}
      </div>

      {winner ? (
        <div>
          <h2 style={{ fontSize: "2em", color: "#ff6f91" }}>{winner}</h2>
          <button
            onClick={resetGame}
            style={{
              padding: "12px 25px",
              fontSize: "1.1em",
              backgroundColor: "#ffccd5",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: "#5a3e4b",
              marginTop: "20px",
            }}
          >
            Restart Game
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ margin: "20px 0", color: "#ff6f91" }}>Scores</h2>
          <p style={{ fontSize: "1.3em" }}>
            🎯 Player 1: {player1Score} | Player 2: {player2Score}
          </p>

          {currentPlayer ? (
            <div>
              <h2 style={{ margin: "20px 0" }}>Player {currentPlayer}'s Turn</h2>
              <button
                onClick={() => handleGuess(1)}
                style={{
                  padding: "10px 20px",
                  margin: "10px",
                  backgroundColor: "#ffccd5",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1em",
                  color: "#5a3e4b",
                }}
              >
                Yes (Contains Black)
              </button>
              <button
                onClick={() => handleGuess(0)}
                style={{
                  padding: "10px 20px",
                  margin: "10px",
                  backgroundColor: "#ffccd5",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1em",
                  color: "#5a3e4b",
                }}
              >
                No (Does Not Contain Black)
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                padding: "12px 25px",
                fontSize: "1.1em",
                backgroundColor: "#ff6f91",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#fff",
                marginTop: "20px",
              }}
            >
              Submit Guesses & Predict
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default App;