const firebaseConfig = {
    apiKey: "AIzaSyDa8GKRuPLjq67gQ9I5EO_YQdW1aA0tM0w",
    authDomain: "kkalisite-4fc4e.firebaseapp.com",
    projectId: "kkalisite-4fc4e",
    storageBucket: "kkalisite-4fc4e.appspot.com",
    messagingSenderId: "1041085614061",
    appId: "1:1041085614061:web:b876df26a5571fb44309e4",
    measurementId: "G-YGWSDLB7HW"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

document.addEventListener("DOMContentLoaded", function() {
    const record = document.getElementById('record');
    const stopRecord = document.getElementById('stopRecord');
    const upload = document.getElementById('upload'); // Reference to the upload button
    const recordedAudio = document.getElementById('recordedAudio');
    let rec, audioChunks = [];
    let blob; // Define blob outside to make it accessible to the upload click event


    const db = firebase.firestore();

    function updateStoryContent(storyText) {
        const titleMatch = storyText.match(/{(.*?),/);
        const authorMatch = storyText.match(/, (.*?)}/);
    
        if (titleMatch && authorMatch) {
          document.getElementById('storyTitle').textContent = titleMatch[1]; // Update title
          document.getElementById('authorName').textContent = `By ${authorMatch[1]}`; // Update author
        }
    
        // First, replace Kannada words with tooltips for English translations
        let updatedStoryText = storyText.replace(/\{(.*?), (.*?)\}/g, (match, p1, p2) => {
          return `<span class="word-tooltip" data-translate="${p2}">${p1}</span>`;
        });
    
        // Then, replace newline characters with HTML line breaks
        updatedStoryText = updatedStoryText.replace(/\n/g, '<br>');
    
        document.getElementById('storyText').innerHTML = updatedStoryText;
    }
    
      

    function fetchStoryContent() {
      db.collection("stories").doc("story1").get().then(doc => {
        if (doc.exists) {
          const storyData = doc.data();
        //   document.getElementById('storyText').textContent = storyData.content;
            updateStoryContent(storyData.content);  
        } else {
          console.log("No such document!");
        }
      }).catch(error => {
        console.log("Error getting document:", error);
      });
    }
    
    // document.addEventListener("DOMContentLoaded", function() {
    //   fetchStoryContent();
    //   // Your existing code...
    // });
    
    fetchStoryContent(); // Call the function to fetch and display the story





    navigator.mediaDevices.getUserMedia({audio:true})
        .then(stream => {
            handlerFunction(stream);
        });

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
            // upload.style.display = 'none'; // Optionally hide the upload button after uploading
        } else {
            console.log('No recording available to upload.');
            alert("Audio Error. File upload failed.");
        }
    };

    function sendData(blob) {
        const audioRef = storage.ref(`audio_${document.getElementById('studentName').value}_${new Date().getTime()}.mp3`);
        audioRef.put(blob).then(snapshot => {
            console.log('Uploaded a blob or file!');
            snapshot.ref.getDownloadURL().then(downloadURL => {
                console.log('File available at', downloadURL);
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
