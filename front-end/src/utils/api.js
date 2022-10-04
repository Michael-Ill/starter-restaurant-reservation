/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment var.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Saves a reservation to the database.
 * 
 * @param reservation
 *  the reservation to save
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<reservation>}
 *  a promise that resolves the saved reservation
 */
 export async function createReservation(reservation, signal){
  const url = new URL(`${API_BASE_URL}/reservations`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "POST",
    body: JSON.stringify({ data: reservation })
  });
}

/**
 * Retrieves the reservation with the specified `reservation_id`
 * @param reservation_id
 *  the `reservation_id` property matching the desired deck.
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<any>}
 *  a promise that resolves to the saved reservation.
 */
export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of table saved in the database.
 */
export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Saves a table to the database.
 * 
 * @param table
 *  the table to save
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<table>}
 *  a promise that resolves the saved table
 */
export async function createTable(table, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "POST",
    body: JSON.stringify({ data: table })
  });
}

/**
 * seats target reservation to target table 
 * @param reservation_id 
 * the target reserservation's id
 * @param table_id 
 * the target table's id
 * @param signal 
 * optional AbortController.signal
 * @returns {Promise<>}
 * 
 */
export async function seatReservation(reservation_id, table_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}/seat`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "PUT",
    body: JSON.stringify({ data: { reservation_id: reservation_id } }),
  }, []);
}

/**
 * changes the reservation's status to "seated" or "finished"
 * @param reservation_id 
 * the target reservation id
 * @param status 
 * the reservation status property value
 * @param signal 
 * optional AbortController.signal
 * @returns {Promise<>}
 */
export async function updateResStatus(reservation_id, status, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/status`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "PUT",
    body: JSON.stringify({ data: { status } })
  }, []);
}

/**
 * unlinks the reservation_id from table that was occupied
 * changes the reservation status to "finished" 
 * @param reservation_id 
 * the target reserservation's id
 * @param table_id 
 * the target table's id
 * @param signal 
 * optional AbortController.signal
 * @returns {Promise<>}
 * 
 */
export async function unassignTable(table_id, reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${table_id}/seat`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "DELETE",
    body: JSON.stringify({data: {reservation_id: reservation_id}})
  })
}

/**
 * Retrieves all reservations that match mobile_number input.
 * @param mobile_number
 * the user inputed string that searchs for a full or partial match 
 * of an exsisting reservation's mobile number
 * @returns {Promise<[table]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */
export async function mobileSearch(mobile_number, signal) {
  const url = new URL(
    `${API_BASE_URL}/reservations?mobile_number=${mobile_number}`
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Updates an existing reservation
 * @param reservation_id
 *  the id of the reservation to update
 * @param updatedReservation
 * the reservation to save
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the updated reservation.
 */
export async function updateReservation(reservation_id, updatedReservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/edit`);
  return await fetchJson(url, {
    headers,
    signal,
    method: "PUT",
    body: JSON.stringify({data: updatedReservation})
  })
}