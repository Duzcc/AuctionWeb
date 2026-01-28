import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api'; // Adjust if env var available

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for Cookies
    headers: { 'Content-Type': 'application/json' }
});

// useAxiosPrivate hook will be implemented inside components to attach AT, 
// BUT for simpler global usage (like in Context), we can configure interceptors on this instance 
// IF we have access to the store/state properly. 
// Circular dependency issue: AuthContext uses axiosPrivate, axiosPrivate needs AccessToken from Context.
// SOLUTION: We usually export a setup function or use a functional component wrapper "AxiosInterceptor".

// However, for this simplified implementation plan, we can export the instance 
// and attach interceptors DYNAMICALLY or use a closure if feasible.
// Better pattern: Create a Custom Hook `useAxiosPrivate` that returns an axios instance 
// with interceptors attached that read from `useAuth()`.

// Let's stick to the plan: `src/utils/axiosPrivate.js` just exports the base. 
// AND `src/hooks/useAxiosPrivate.js` exports the hook.
