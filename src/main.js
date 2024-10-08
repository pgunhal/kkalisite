const storage = firebase.storage();
let week = 100;

document.addEventListener("DOMContentLoaded", function() {
    const toggleWeekButton = document.getElementById('toggleWeekButton');
    let showingCurrentWeek = true;
    let activeWeek = null;
    let prevWeek = null;
    let activeStory = null;
    let prevStory = null;

    if (!firebase.apps.length) {
        console.error("Firebase is not initialized!");
        return;
    }

    const db = firebase.firestore();

    function updateStoryContent(storyText) {
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

    function fetchStoryContent(storyName) {
        db.collection("stories").doc(storyName).get().then(doc => {
            if (doc.exists) {
                const storyData = doc.data();
                updateStoryContent(storyData.content);
            } else {
                document.getElementById('storyTitle').textContent = "Story not found.";
                document.getElementById('storyText').textContent = "No content available.";
            }
        }).catch(error => {
            console.error("Error getting document:", error);
            document.getElementById('storyText').textContent = "Error loading story.";
        });
    }

    function fetchActiveStoryAndWeek() {
        db.collection("adminSettings").doc("story").get().then(doc => {
            if (doc.exists) {
                const settingsData = doc.data();
                activeWeek = settingsData.week;
                activeStory = settingsData.storyName;

                db.collection("adminSettings").doc("prev_story").get().then(doc => {
                    if (doc.exists) {
                        const settingsData = doc.data();
                        prevWeek = settingsData.week;
                        prevStory = settingsData.storyName;

                        // Set initial content as current week
                        document.getElementById('weekDisplay').textContent = "Week: " + activeWeek;
                        fetchStoryContent(activeStory);
                    }
                });
            } else {
                document.getElementById('weekDisplay').textContent = "No active week set.";
            }
        }).catch(error => {
            console.error("Error getting active week and story:", error);
            document.getElementById('weekDisplay').textContent = "Error loading week.";
        });
    }

    toggleWeekButton.addEventListener('click', () => {
        if (showingCurrentWeek) {
            // Show the previous week
            document.getElementById('weekDisplay').textContent = "Week: " + prevWeek;
            fetchStoryContent(prevStory);
            toggleWeekButton.textContent = "View Current Week";
            showingCurrentWeek = false;
        } else {
            // Show the current week
            document.getElementById('weekDisplay').textContent = "Week: " + activeWeek;
            fetchStoryContent(activeStory);
            toggleWeekButton.textContent = "View Previous Week";
            showingCurrentWeek = true;
        }
    });

    fetchActiveStoryAndWeek();
});
