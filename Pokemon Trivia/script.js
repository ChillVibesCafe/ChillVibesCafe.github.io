// Global variable to hold the decrypted API key
let OPENAI_API_KEY = "";

// Your encrypted API key (provided)
const encryptedApi = "U2FsdGVkX1/qN454gmap5DBKOZ47WGRsx0Cf1EMf3YqdQLsAnIof0HsmRbvWEgzFD7LidFgC8cEhSGrKqsCX9CmpsVzMW8I8muVYG+OzWuU0RjxtxeSOwFMJg5k1xBfLQnmUuOYq6CROR440VDmQO+lM7pNQVsVFlTg4QhodhmBe59SRPLeGXuEKtwOssLBQ6dVpxma/5PzoR4/GjHuVVLQ6a/VFOgnwNjziZkcxY2mb49z1IEcmYxB7MB1eEs3X";

// PokéAPI URL (using Gen 1 Pokémon for simplicity)
const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon/";

// Global variable to store the correct answer for the current question.
let currentCorrectAnswer = "";

/**
 * Prompts the user for the password and attempts to decrypt the API key.
 * If decryption is successful, the game container is revealed and the trivia game starts.
 */
function initializeGame() {
  const password = prompt("Enter the password to start the game:");
  if (!password) {
    alert("Password is required to start the game.");
    return;
  }
  
  // Attempt to decrypt the API key.
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedApi, password);
  const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8);
  
  if (!decryptedKey) {
    alert("Incorrect password. Please try again.");
    return;
  }
  
  // Set the global API key.
  OPENAI_API_KEY = decryptedKey;
  
  // Hide the intro and show the game container.
  document.getElementById("intro-container").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");
  
  // Start the game by loading the first question.
  loadQuestion();
}

/**
 * Fetches a random Pokémon (from Gen 1) using the PokéAPI.
 */
async function getPokemon() {
  const randomId = Math.floor(Math.random() * 151) + 1;
  const response = await fetch(`${POKE_API_URL}${randomId}`);
  const data = await response.json();
  return data;
}

/**
 * Uses OpenAI's API to generate a trivia question about the given Pokémon.
 * Expects a JSON response with keys: question, options (array), and correctAnswer.
 */
async function generateTrivia(pokemon) {
  const questionPrompt = `Generate a Pokémon trivia question about ${pokemon.name}. The answer should be a JSON object with the following keys:
- "question": a string representing the trivia question.
- "options": an array of four strings representing multiple choice answers.
- "correctAnswer": a string that is one of the options, representing the correct answer.
Provide only the JSON, no additional text.`;
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: questionPrompt }],
      max_tokens: 150,
      temperature: 0.7
    })
  });
  
  const aiData = await response.json();
  const textResponse = aiData.choices[0].message.content;
  
  try {
    const triviaObject = JSON.parse(textResponse);
    return triviaObject;
  } catch (e) {
    console.error("Error parsing JSON:", e, textResponse);
    // Fallback trivia object in case of parsing error.
    return {
      question: `What is ${pokemon.name}'s primary type?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A"
    };
  }
}

/**
 * Loads a new trivia question by fetching a Pokémon and generating trivia from OpenAI.
 */
async function loadQuestion() {
  document.getElementById("result").innerText = "";
  document.getElementById("question").innerText = "Loading question...";
  
  const pokemon = await getPokemon();
  const trivia = await generateTrivia(pokemon);
  
  // Update the question text and store the correct answer.
  document.getElementById("question").innerText = trivia.question;
  currentCorrectAnswer = trivia.correctAnswer;
  
  // Populate the answer options.
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  trivia.options.forEach(option => {
    const btn = document.createElement("button");
    btn.innerText = option;
    btn.classList.add("option");
    btn.onclick = () => checkAnswer(option);
    optionsDiv.appendChild(btn);
  });
}

/**
 * Checks the player's answer and updates the result.
 */
function checkAnswer(selectedAnswer) {
  const resultElement = document.getElementById("result");
  if (selectedAnswer === currentCorrectAnswer) {
    resultElement.innerText = "Correct!";
  } else {
    resultElement.innerText = `Incorrect! The correct answer was ${currentCorrectAnswer}.`;
  }
  // Load the next question after a short delay.
  setTimeout(loadQuestion, 3000);
}

// Attach the startGame handler to the start button.
document.getElementById("start-game").addEventListener("click", initializeGame);
