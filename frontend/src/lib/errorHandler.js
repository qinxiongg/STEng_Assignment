// src/utils/errorHandler.js
import { toast } from 'svelte-sonner';
import { goto } from '$app/navigation';

// Function to handle a general error message
export function customError(error) {
	toast.error(`Error: ${error || 'Something went wrong!'}`);
}

export function customAlert(success) {
	toast.success(`${success || 'Something went wrong!'}`);
}

// Function to handle a general error message
export function handleError(error) {
	if (error.message == 'Access denied') {
		goto('/login');
		setTimeout(() => {
			toast.error(`Error: ${error.message || 'Access denied'}`);
		}, 200);
	} else if (error.message == 'Unauthorised') {
		goto('/home/applications');
		setTimeout(() => {
			toast.error(`Error: ${error.message || 'Unauthorised'}`);
		}, 200);
	} else {
		toast.error(`Error: ${error.message || 'Something went wrong!'}`);
	}
}

// Function for handling specific error scenarios
export function handleNetworkError() {
	toast.error('Network error: Please check your connection.');
}

export function handleUnauthorizedError() {
	goto('/home/applications');
	setTimeout(() => {
		toast.error(`Error: ${error.message || 'You are not authorised to access resources'}`);
	}, 200);
}

export function handleValidationError(field) {
	toast.error(`Validation error: ${field} is invalid.`);
}

// module.exports = {
//   customError,
//   handleError,
//   customAlert,
//   handleNetworkError,
//   handleUnauthorizedError,
//   handleValidationError,
// };
