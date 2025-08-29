const API_BASE_URL = 'http://127.0.0.1:5000'; // Assuming Flask backend runs on port 5000

export const registerUser = async (name, email, mobileNumber, gender, facialData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, mobile_number: mobileNumber, gender, facial_data: facialData }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error registering user:", error);
        return { error: "Failed to register user" };
    }
};

export const markAttendance = async (facialData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/mark_attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ facial_data: facialData }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error marking attendance:", error);
        return { error: "Failed to mark attendance" };
    }
};

export const getUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return { error: "Failed to fetch users" };
    }
};

export const getAttendanceRecords = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return { error: "Failed to fetch attendance records" };
    }
};

export const queryChatbot = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chatbot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error querying chatbot:", error);
        return { error: "Failed to query chatbot" };
    }
};

export const updateUser = async (userId, name, email, mobileNumber, gender, facialData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, mobile_number: mobileNumber, gender, facial_data: facialData }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating user:", error);
        return { error: "Failed to update user" };
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Failed to delete user" };
    }
};

export const addAttendance = async (userId, timestamp) => {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, timestamp }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding attendance:", error);
        return { error: "Failed to add attendance" };
    }
};

export const updateAttendance = async (recordId, userId, timestamp) => {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId, timestamp }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating attendance:", error);
        return { error: "Failed to update attendance" };
    }
};

export const deleteAttendance = async (recordId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting attendance:", error);
        return { error: "Failed to delete attendance" };
    }
};

export const detectFace = async (facialData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/detect_face`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ facial_data: facialData }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error detecting face:", error);
        return { error: "Failed to detect face" };
    }
};

export const getMonthlyReport = async (month, year, userId) => {
    try {
        const url = new URL(`${API_BASE_URL}/attendance/report/monthly`);
        url.searchParams.append('month', month);
        url.searchParams.append('year', year);
        if (userId) {
            url.searchParams.append('user_id', userId);
        }
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error fetching monthly report:", error);
        return { error: "Failed to fetch monthly report" };
    }
};

export const getMonthlyAnalytics = async (month, year) => {
    try {
        const url = new URL(`${API_BASE_URL}/attendance/analytics/monthly`);
        url.searchParams.append('month', month);
        url.searchParams.append('year', year);
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error fetching monthly analytics:", error);
        return { error: "Failed to fetch monthly analytics" };
    }
};
