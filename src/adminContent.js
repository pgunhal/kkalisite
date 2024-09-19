document.addEventListener("DOMContentLoaded", function() {
    const storage = firebase.storage();
    const storageRef = storage.ref(); // Reference to storage root
    const audioWeekSelect = document.getElementById('audioWeekSelect');
    const filterAudioButton = document.getElementById('filterAudioButton');

    let specifiedWeek = ""; 

    filterAudioButton.addEventListener('click', () => {
        specifiedWeek = audioWeekSelect.value;
        if (!specifiedWeek) {
            alert("Please enter a valid week number to filter.");
            return;
        }

        // Clear the audio lists before filtering
        document.getElementById('cupList').innerHTML = '';
        document.getElementById('milList').innerHTML = '';

        listAllFiles(); // Call to filter files by week
    });

    const listAllFiles = async () => {
        const prefixes = ['cup', 'mil'];

        storageRef.listAll().then((result) => {
            result.items.forEach((audioRef) => {
                // Check the prefix of each file to categorize it and display accordingly
                prefixes.forEach(prefix => {
                    if (audioRef.name.toLowerCase().startsWith(prefix)) {
                        displayAudio(audioRef, `${prefix.toLowerCase()}List`);
                    }
                });
            });
        }).catch((error) => {
        });
    };

    const displayAudio = (audioRef, listId) => {
        audioRef.getDownloadURL().then((url) => {
            // Extract the week number from the file name (ensure regex is case-insensitive)
            const weekMatch = audioRef.name.match(/week (\d+)/i);
            const fileWeek = weekMatch ? weekMatch[1] : null;

            // Check if the extracted week matches the specified week variable
            if (fileWeek === specifiedWeek) { 
                const list = document.getElementById(listId);
                const listItem = document.createElement('li');
                
                const audioTable = document.createElement('div');
                audioTable.className = 'audio-table';
        
                const audioPlayer = document.createElement('audio');
                audioPlayer.controls = true;
                const source = document.createElement('source');
                source.src = url;
                source.type = 'audio/mpeg';
                audioPlayer.appendChild(source);
                
                // Extract name and optionally other details from the audioRef.name
                const nameMatch = audioRef.name.match(/_(.*?)_week/i); // Case-insensitive match for 'week'
                const fileName = nameMatch ? nameMatch[1].trim() : "Unknown"; // Default to "Unknown" if no match
    
                const audioName = document.createElement('span');
                audioName.className = 'audio-name';
                audioName.textContent = `Week ${fileWeek} - ${fileName}`; // Display extracted name
                
                audioTable.appendChild(audioPlayer);
                audioTable.appendChild(audioName);
                listItem.appendChild(audioTable);
                list.appendChild(listItem);
            }
        }).catch((error) => {
        });
    };
});


// For Admin Story Management
document.addEventListener("DOMContentLoaded", async function() {
    const db = firebase.firestore();
    const storySelect = document.getElementById('storySelect');
    const weekInput = document.getElementById('weekInput');

    // Ensure the storySelect element exists
    if (!storySelect) {
        console.error("storySelect element is missing in the HTML.");
        return;
    }

    // Ensure the weekInput element exists
    if (!weekInput) {
        console.error("weekInput element is missing in the HTML.");
        return;
    }

    // Load all available stories from Firestore to populate the dropdown
    try {
        const querySnapshot = await db.collection("stories").get();
        
        if (querySnapshot.empty) {
            console.error("No stories found in Firestore!");
            return;
        }


        querySnapshot.forEach((doc) => {

            const storyData = doc.data();
            
            // Check if the title field exists before adding to the dropdown
            if (storyData && storyData.title) {
                const option = document.createElement("option");
                option.value = doc.id;
                option.textContent = storyData.title;
                storySelect.appendChild(option);
            } else {
                console.warn(`Document ${doc.id} does not contain a 'title' field.`);
            }
        });
    } catch (error) {
        console.error("Error loading stories: ", error);
    }

    // Handle admin selection of a new week and story
    document.getElementById('setWeekStory').addEventListener('click', async () => {
        const selectedStory = storySelect.value;
        const enteredWeek = weekInput.value;

        if (!selectedStory || !enteredWeek) {
            alert("Please select a story and enter a valid week number.");
            return;
        }

        try {
            await db.collection("adminSettings").doc("story").set({
                storyName: selectedStory,
                week: enteredWeek
            });
            alert("Week and Story updated successfully!");
        } catch (error) {
            console.error("Error updating week and story:", error);
        }
    });
});
