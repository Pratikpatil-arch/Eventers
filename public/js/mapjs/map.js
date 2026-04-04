 function initializeMap(mapStyle = "Standard", colorScheme = "Dark") {
            const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${API_KEY}&color-scheme=${colorScheme}`;
            const map = new maplibregl.Map({
                container: 'map',                   // The ID of the map container
                style: styleUrl,                    // The style URL for the map
                center: [75.5626, 21.0077],   // Starting center coordinates
                zoom: 13,                           // Initial zoom level
                validateStyle: false                // Disable style validation
            });
            return map;                             // Return the initialized map
        }
        
        /**
         * Gets a GeoPlaces instance for Places operations.
         */
        function getGeoPlaces(map) {
            const authHelper =  amazonLocationClient.withAPIKey(API_KEY, AWS_REGION);                      // Authenticate using the API key and AWS region
            const locationClient = new amazonLocationClient.GeoPlacesClient(authHelper.getClientConfig()); // Create a GeoPlaces client
            const geoPlaces = new GeoPlaces(locationClient, map);                                          // Create GeoPlaces instance
                return geoPlaces;                                                                          // Return the GeoPlaces instance
        }
        
         /**
         * Adds search box to the map.
         */
        
        function addSearchBox(map, geoPlaces) {
            const searchBox = new MaplibreGeocoder(geoPlaces, {
                maplibregl,
                showResultsWhileTyping: true,                    // Show results while typing
                debounceSearch: 300,                             // Debounce search requests
                limit: 30,                                       // Limit number of results
                popuprender: renderPopup,                        // Function to render popup
                reverseGeocode: true,                            // Enable reverse geocoding
                zoom: 14,                                        // Zoom level on result selection
                placeholder: "Search text or nearby (lat,long)"  // Place holder text for search box.  
            });
            
            // Add the search box to the map
            map.addControl(searchBox, 'top-left'); 

            // Event listener for when a search result is selected
            searchBox.on('result', async (event) => {
                const { id, result_type } = event.result;                     // Get result ID and type
                if (result_type === "Place") {                                // Check if the result is a place
                    const placeResults = await geoPlaces.searchByPlaceId(id); // Fetch details for the selected place
                    if (placeResults.features.length) {
                        createPopup(placeResults.features[0]).addTo(map);     // Create and add popup for the place
                    }
                }
            });
        }

        /**
         * Renders the popup content for a given feature.
         */
        function renderPopup(feature) {
            return `
                <div class="popup-content">
                    <span class="${feature.place_type.toLowerCase()} badge">${feature.place_type}</span><br>
                    ${feature.place_name}
                </div>`;
        }

        /**
         * Creates a popup for a given feature and sets its position.
         */
        function createPopup(feature) {
            return new maplibregl.Popup({ offset: 30 })      // Create a new popup
                .setLngLat(feature.geometry.coordinates)     // Set the popup position
                .setHTML(renderPopup(feature));              // Set the popup content
        }
        
        /**
         * Sets up reverse geocoding on map click events.
         */
        function addMapClick(map, geoPlaces) {
            map.on('click', async ({ lngLat }) => {                     // Listen for click events on the map
                const response = await geoPlaces.reverseGeocode({ query: [lngLat.lng, lngLat.lat], limit: 1, click:true }); // Perform reverse geocoding

                if (response.features.length) {                         // If there are results
                    const clickMarker = new maplibregl.Marker({ color: "orange" }); // Create a marker
                    const feature = response.features[0];               // Get the clicked feature
                    const clickedPopup = createPopup(feature);          // Create popup for the clicked feature
                    clickMarker.setLngLat(feature.geometry.coordinates) // Set marker position
                        .setPopup(clickedPopup)                         // Attach popup to marker
                        .addTo(map);                                    // Add marker to the map

                    clickedPopup.on('close', () => clickMarker.remove()).addTo(map); // Remove marker when popup is closed
                }
            });
        }
        