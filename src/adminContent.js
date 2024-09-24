document.addEventListener("DOMContentLoaded", function() {
    const storage = firebase.storage();
    const storageRef = storage.ref(); 
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
