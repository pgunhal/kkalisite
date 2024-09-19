const storage = firebase.storage();
let week = 100;



document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // Ensure Firebase is initialized
    if (!firebase.apps.length) {
        console.error("Firebase is not initialized!");
        return;
    }

    console.log("Firebase initialized successfully");

    const db = firebase.firestore();

    function updateStoryContent(storyText) {
        console.log("Updating story content...");

        const titleAuthorPattern = /^\{(.*?), (.*?)\}\s*/;
        const titleAuthorMatch = storyText.match(titleAuthorPattern);

        if (titleAuthorMatch) {
            document.getElementById('storyTitle').textContent = titleAuthorMatch[1];
            document.getElementById('authorName').textContent = `${titleAuthorMatch[2]}`;
            storyText = storyText.replace(titleAuthorPattern, '');
        }

        let updatedStoryText = storyText.replace(/\{(.*?), (.*?)\}/g, (match, p1, p2) => {
            return `<span class="word-tooltip" data-translate="${p2}">${p1}</span>`;
        });

        updatedStoryText = updatedStoryText.replace(/\|\|/g, '<br><br>').replace(/\|/g, '<br>');
        document.getElementById('storyText').innerHTML = updatedStoryText;
    }

    function fetchActiveStoryAndWeek() {
        console.log("Fetching active story and week...");

        // Get the currently selected story and week from Firestore
        db.collection("adminSettings").doc("story").get().then(doc => {
            if (doc.exists) {
                const settingsData = doc.data();
                const activeWeek = settingsData.week;
                const activeStory = settingsData.storyName;
                console.log("about to fetch story");
                week = activeWeek;
                console.log("set active week");

                console.log("Active week: ", activeWeek);
                console.log("Active story: ", activeStory);

                // Update the week display in the HTML
                document.getElementById('weekDisplay').textContent = "Week: " + activeWeek;

                // Fetch and display the story content using the story name
                console.log("about to fetch story");
                fetchStoryContent(activeStory);
                console.log("fetched story");

            } else {
                console.log("No active week or story set in adminSettings.");
                document.getElementById('weekDisplay').textContent = "No active week set.";
            }
        }).catch(error => {
            console.error("Error getting active week and story:", error);
            document.getElementById('weekDisplay').textContent = "Error loading week.";
        });
    }

    function fetchStoryContent(storyName) {
        console.log("Fetching story content for: ", storyName);
        
        // Fetch the story content from the Firestore 'stories' collection using the story name
        db.collection("stories").doc(storyName).get().then(doc => {
            if (doc.exists) {
                const storyData = doc.data();
                console.log("Story data: ", storyData);
                updateStoryContent(storyData.content);
            } else {
                console.log("No such document in 'stories' collection!");
                document.getElementById('storyTitle').textContent = "Story not found.";
                document.getElementById('storyText').textContent = "No content available.";
            }
        }).catch(error => {
            console.error("Error getting document:", error);
            document.getElementById('storyText').textContent = "Error loading story.";
        });
    }

    // Fetch the active week and story when the page is loaded
    fetchActiveStoryAndWeek();
});





document.addEventListener("DOMContentLoaded", function() {
    const record = document.getElementById('record');
    const stopRecord = document.getElementById('stopRecord');
    const upload = document.getElementById('upload'); // Reference to the upload button
    const recordedAudio = document.getElementById('recordedAudio');
    let rec, audioChunks = [];
    let blob; // Define blob outside to make it accessible to the upload click event

   try { navigator.mediaDevices.getUserMedia({audio:true})
        .then(stream => {
            handlerFunction(stream);
        });}
        catch {
            alert("Microphone permission denied!");
        }

    function handlerFunction(stream) {
        rec = new MediaRecorder(stream);

        rec.ondataavailable = e => {
            audioChunks.push(e.data);
            if (rec.state === "inactive") {
                blob = new Blob(audioChunks, {type: 'audio/mpeg-3'});
                recordedAudio.src = URL.createObjectURL(blob);
                recordedAudio.controls = true;
                recordedAudio.autoplay = true;
                upload.style.display = 'inline'; // Show the upload button
            }
        };
    }

    // Moved sendData inside the upload button click event
    upload.onclick = () => {
        if (blob) {
            sendData(blob);
        } else {
            console.log('No recording available to upload.');
            alert("Audio Error. File upload failed.");
        }
    };

    function sendData(blob) {
        console.log("in function");
        const selectedCenter = document.querySelector('input[name="studentCenter"]:checked').value;
        const audioRef = storage.ref(`${selectedCenter}_${document.getElementById('studentName').value}_week${week}_${new Date().getTime()}.mp3`);
        audioRef.put(blob).then(snapshot => {
            console.log('Uploaded file');
            snapshot.ref.getDownloadURL().then(downloadURL => {
                // console.log('File available at', downloadURL);
                alert("File uploaded successfully.");
            });
        }).catch(error => {
            console.error('Upload failed', error);
            alert("Upload Error. File upload failed.");
        });
    }

    record.onclick = () => {
        console.log('Record button was clicked');
        record.disabled = true;
        stopRecord.disabled = false;
        audioChunks = [];
        rec.start();
    };

    stopRecord.onclick = () => {
        console.log("Stop button was clicked");
        record.disabled = false;
        stopRecord.disabled = true;
        rec.stop();
    };
});
