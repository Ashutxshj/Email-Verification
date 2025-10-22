// --- Function to handle Login Form Submission ---
async function handleLogin(event) {
    // Prevent the default form submission (which reloads the page)
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Assuming your Spring backend returns the JWT in a field named 'token'
            const jwtToken = data.token; 
            
            // Store the token
            localStorage.setItem('jwtToken', jwtToken); 
            
            // Redirect to the dashboard
            window.location.href = '/dashboard.html'; 
        } else {
            // Read and display the error message from the backend
            const error = await response.json(); 
            messageElement.textContent = `Login failed: ${error.message || 'Invalid credentials'}`;
        }
    } catch (error) {
        messageElement.textContent = 'Network error. Could not connect to the server.';
        console.error('Network Error:', error);
    }
}

// --- Function to Fetch Protected Data ---
async function fetchUserProfile() {
    const token = localStorage.getItem('jwtToken');
    const dataElement = document.getElementById('profileData');
    
    if (!token) {
        dataElement.textContent = 'Error: Not logged in.';
        handleLogout(); // Redirects to login
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/profile', { // NOTE: This endpoint must exist and be protected in Spring!
            method: 'GET',
            headers: {
                // CRITICAL: The header that your Spring filter is looking for
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            const profileData = await response.json();
            dataElement.textContent = JSON.stringify(profileData, null, 2); // Display data
        } else if (response.status === 401 || response.status === 403) {
            dataElement.textContent = 'Session expired or unauthorized.';
            handleLogout(); // Token is invalid/expired, force logout
        } else {
            dataElement.textContent = 'Failed to load profile data.';
        }
    } catch (error) {
        dataElement.textContent = 'Error fetching data.';
        console.error('Fetch Error:', error);
    }
}

// --- Function to handle Logout ---
function handleLogout() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login.html';
}

// --- Attach the Login Handler to the form when the page loads ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Auto-check authentication status on dashboard load
    // If you want to restrict access to dashboard.html when not logged in:
    if (window.location.pathname.endsWith('/dashboard.html') && !localStorage.getItem('jwtToken')) {
        window.location.href = '/login.html';
    }
});