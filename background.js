// Initialize context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-word",
    title: "Save Word",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-word") {
    const word = info.selectionText.trim();
    
    if (!word) return;

    // Get current date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch word definition from Open Dictionary API
    fetchWordDetails(word)
      .then(details => {
        // Save word with details
        saveWord(word, details, today);
      })
      .catch(error => {
        console.error("Error fetching word details:", error);
        // Save word without details if API fails
        saveWord(word, getDefaultDetails(word), today);
      });
  }
});

// Fetch word details from API
async function fetchWordDetails(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    const entry = data[0];

    // Extract definition and example
    let definition = "No definition found";
    let meaning = "No meaning found";
    let example = "No example found";

    if (entry.meanings && entry.meanings.length > 0) {
      const firstMeaning = entry.meanings[0];
      
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        definition = firstMeaning.definitions[0].definition;
        if (firstMeaning.definitions[0].example) {
          example = firstMeaning.definitions[0].example;
        }
      }

      meaning = firstMeaning.partOfSpeech || "Word";
    }

    return {
      definition,
      meaning,
      example
    };
  } catch (error) {
    throw error;
  }
}

// Get default details if API fails
function getDefaultDetails(word) {
  return {
    definition: `Look up the definition of "${word}"`,
    meaning: "Word",
    example: `Example: "${word}" can be used in various contexts.`
  };
}

// Save word to storage
function saveWord(word, details, date) {
  chrome.storage.local.get({ words: {} }, (result) => {
    const words = result.words;

    // Create date entry if it doesn't exist
    if (!words[date]) {
      words[date] = [];
    }

    // Check if word already exists for this date
    const wordExists = words[date].some(w => w.word.toLowerCase() === word.toLowerCase());

    if (!wordExists) {
      words[date].push({
        word,
        definition: details.definition,
        meaning: details.meaning,
        example: details.example,
        savedAt: new Date().toISOString()
      });

      chrome.storage.local.set({ words }, () => {
        // Show notification
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showNotification",
            word: word
          }).catch(() => {
            // Notification silently fails if content script not ready
          });
        });
      });
    } else {
      console.log("Word already saved for today");
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getWords") {
    chrome.storage.local.get({ words: {} }, (result) => {
      sendResponse(result.words);
    });
    return true;
  }

  if (request.action === "deleteWord") {
    chrome.storage.local.get({ words: {} }, (result) => {
      const words = result.words;
      if (words[request.date]) {
        words[request.date] = words[request.date].filter(
          w => w.word !== request.word
        );
        chrome.storage.local.set({ words }, () => {
          sendResponse({ success: true });
        });
      }
      return true;
    });
    return true;
  }

  if (request.action === "deleteDate") {
    chrome.storage.local.get({ words: {} }, (result) => {
      const words = result.words;
      delete words[request.date];
      chrome.storage.local.set({ words }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});
