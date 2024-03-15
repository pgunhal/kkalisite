document.addEventListener("DOMContentLoaded", function() {
    const storage = firebase.storage();
    const storageRef = storage.ref(); // Reference to your storage root

    const listAllFiles = async () => {
        const prefixes = ['cup', 'fre', 'mil'];

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
            console.log("Error listing files: ", error);
        });
    };

    const displayAudio = (audioRef, listId) => {
        audioRef.getDownloadURL().then((url) => {
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
            
            // Extract name from the audioRef.name
            const nameMatch = audioRef.name.match(/_(.*?)_/); // Adjust regex as needed
            const fileName = nameMatch ? nameMatch[1] : "Unknown"; // Default to "Unknown" if no match

            const audioName = document.createElement('span');
            audioName.className = 'audio-name';
            audioName.textContent = fileName; // Display extracted name
            
            audioTable.appendChild(audioPlayer);
            audioTable.appendChild(audioName);
            listItem.appendChild(audioTable);
            list.appendChild(listItem);
        }).catch((error) => {
            console.log("Error getting file URL: ", error);
        });
    };
    

    listAllFiles(); // Call the function on page load
});
