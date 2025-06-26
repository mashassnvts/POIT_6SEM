document.addEventListener('DOMContentLoaded', () => {
    const celebritiesContainer = document.getElementById('celebrities-container');
    const eventsList = document.getElementById('events-list');

    async function loadCelebrities() {
        try {
            const response = await fetch('/api/Celebrities');
            if (!response.ok) throw new Error('Failed to load celebrities');

            const celebrities = await response.json();
            celebrities.forEach(celebrity => {
                const div = document.createElement('div');
                div.className = 'celebrity';

                const img = document.createElement('img');
                img.src = `/api/Celebrities/photo/${celebrity.reqPhotoPath}`;
                img.alt = celebrity.fullName;
                img.title = celebrity.fullName;
               

                img.onerror = () => {
                    console.error('Фото не найдено:', celebrity.reqPhotoPath);
                    img.src = '/Images/default.jpg';  
                };

                img.addEventListener('click', () => loadEvents(celebrity.id, celebrity.fullName));

                div.appendChild(img);
                celebritiesContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading celebrities:', error);
            celebritiesContainer.innerHTML = '<p>Error loading celebrities.</p>';
        }
    }

    async function loadEvents(celebrityId, celebrityName) {
        try {
            const response = await fetch(`/api/Lifeevents/Celebrities/${celebrityId}`);
            if (!response.ok) throw new Error('Failed to load events');

            const events = await response.json();
            eventsList.innerHTML = ''; 

            if (events.length === 0) {
                eventsList.innerHTML = '<li>No events found for this celebrity.</li>';
                return;
            }

            events.forEach(event => {
                const li = document.createElement('li');
                const date = new Date(event.date).toLocaleDateString();
                li.textContent = `${date}: ${event.description}`;
                eventsList.appendChild(li);
            });

            const eventsContainer = document.getElementById('events-container');
            eventsContainer.querySelector('h2').textContent = `Life Events for ${celebrityName}`;
        } catch (error) {
            console.error('Error loading events:', error);
            eventsList.innerHTML = '<li>Error loading events.</li>';
        }
    }

    loadCelebrities();
});