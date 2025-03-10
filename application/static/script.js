document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the predict page
  const predictionForm = document.getElementById("prediction-form")
  const locationSelect = document.getElementById("location")

  if (locationSelect) {
    // Fetch locations from API
    fetchLocations()
  }

  if (predictionForm) {
    predictionForm.addEventListener("submit", handlePredictionSubmit)
  }
})

// Fetch locations from API
async function fetchLocations() {
  const locationSelect = document.getElementById("location")
  const loader = document.createElement("div")
  loader.className = "spinner"
  loader.style.width = "20px"
  loader.style.height = "20px"

  // Show loading spinner
  locationSelect.parentNode.appendChild(loader)
  locationSelect.disabled = true

  try {
    const response = await fetch("/api/locations")
    const locations = await response.json()

    // Sort locations alphabetically
    locations.sort()

    // Populate dropdown
    locations.forEach((location) => {
      const option = document.createElement("option")
      option.value = location
      option.textContent = location.charAt(0).toUpperCase() + location.slice(1).replace(/_/g, " ")
      locationSelect.appendChild(option)
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    const option = document.createElement("option")
    option.value = ""
    option.textContent = "Error loading locations"
    locationSelect.appendChild(option)
  } finally {
    // Remove loading spinner
    if (loader.parentNode) {
      loader.parentNode.removeChild(loader)
    }
    locationSelect.disabled = false
  }
}

// Handle form submission
async function handlePredictionSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const resultContainer = document.getElementById('result-container');
    const predictionResult = document.getElementById('prediction-result');
    const loader = document.getElementById('loader');
    
    // Input validation
    const sqft = parseFloat(form.sqft.value);
    if (sqft < 300) {
        alert('Square feet area should be at least 300 sqft');
        return;
    }
    
    // Show loader
    resultContainer.classList.remove('hidden');
    loader.classList.remove('hidden');
    predictionResult.classList.add('hidden');
    predictionResult.innerHTML = '';
    
    // Create form data
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Hide loader
        loader.classList.add('hidden');
        predictionResult.classList.remove('hidden');
        
        if (data.error) {
            predictionResult.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${data.error}</p>
                </div>
            `;
        } else {
            predictionResult.innerHTML = `
                <h3>Estimated Home Price</h3>
                <div class="result-value">${data.prediction}</div>
                <p class="result-details">Based on ${sqft} sq.ft, ${form.bhk.value} BHK, ${form.bath.value} bath in ${form.location.options[form.location.selectedIndex].text}</p>
                <p>Ready to take the next step? <a href="/contact">Contact us</a> for more information.</p>
            `;
        }
    } catch (error) {
        // Hide loader
        loader.classList.add('hidden');
        predictionResult.classList.remove('hidden');
        
        predictionResult.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>Something went wrong. Please try again later.</p>
            </div>
        `;
        console.error('Error making prediction:', error);
    }
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
