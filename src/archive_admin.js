document.addEventListener("DOMContentLoaded", function() {
    const storage = firebase.storage();
    const storageRef = storage.ref(); 
    const audioWeekSelect = document.getElementById('audioWeekSelect');
    const filterAudioButton = document.getElementById('filterAudioButton');

    let specifiedWeek = "", prevWeek = "", prevStory = ""; 

    filterAudioButton.addEventListener('click', () => {
        specifiedWeek = audioWeekSelect.value;
        
        if (!specifiedWeek) {
            alert("Please enter a valid week number to filter.");
            return;
        }

        // Clear the audio lists before filtering
        document.getElementById('cupList').innerHTML = '';
        document.getElementById('milList').innerHTML = '';
        document.getElementById('freList').innerHTML = ''; 

        listAllFiles(); 
    });

    const listAllFiles = async () => {
        const prefixes = ['cup', 'mil', 'fre']; 
        storageRef.listAll().then((result) => {
            result.items.forEach((audioRef) => {
                prefixes.forEach(prefix => {
                    if (audioRef.name.toLowerCase().startsWith(prefix)) {
                        displayAudio(audioRef, `${prefix.toLowerCase()}List`);
                    }
                });
            });
        }).catch((error) => {
            console.error("Error listing files: ", error);
        });
    };

    const displayAudio = (audioRef, listId) => {
        audioRef.getDownloadURL().then((url) => {
            const weekMatch = audioRef.name.match(/week(\d+)/i); 
            const fileWeek = weekMatch ? weekMatch[1] : null;

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
                
                const nameMatch = audioRef.name.match(/_(.*?)_week/i); 
                const fileName = nameMatch ? nameMatch[1].trim() : "Unknown"; 
                const audioName = document.createElement('span');
                audioName.className = 'audio-name';
                audioName.textContent = `Week ${fileWeek} - ${fileName}`; 
                
                audioTable.appendChild(audioPlayer);
                audioTable.appendChild(audioName);
                listItem.appendChild(audioTable);
                list.appendChild(listItem);
            } else {
                console.error("File week does not match the specified week.");
            }
        }).catch((error) => {
            console.error("Error getting file URL: ", error);
        });
    };
});



document.addEventListener("DOMContentLoaded", async function() {
    const db = firebase.firestore();
    const storySelect = document.getElementById('storySelect');
    const weekInput = document.getElementById('weekInput');

    if (!storySelect) {
        console.error("storySelect element is missing in the HTML.");
        return;
    }

    if (!weekInput) {
        console.error("weekInput element is missing in the HTML.");
        return;
    }

    try {
        const querySnapshot = await db.collection("stories").get();
        
        if (querySnapshot.empty) {
            console.error("No stories found in Firestore!");
            return;
        }


        querySnapshot.forEach((doc) => {

            const storyData = doc.data();
            
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

    document.getElementById('setWeekStory').addEventListener('click', async () => {
        const selectedStory = storySelect.value;
        const enteredWeek = weekInput.value;

        if (!selectedStory || !enteredWeek) {
            alert("Please select a story and enter a valid week number.");
            return;
        }
        

        // Get the currently selected story and week from Firestore
        await db.collection("adminSettings").doc("story").get().then(doc => {
        if (doc.exists) {
            const settingsData = doc.data();
            prevWeek = settingsData.week;
            prevStory = settingsData.storyName;

            db.collection("adminSettings").doc("prev_story").set({
                storyName: prevStory,
                week: prevWeek
            });

        } 
        }).catch(error => {
        console.error("Error getting active week and story:", error);
        document.getElementById('weekDisplay').textContent = "Error loading week.";
         });

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