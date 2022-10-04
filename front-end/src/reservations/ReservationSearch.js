import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./ReservationCard";
import { mobileSearch } from "../utils/api";

/**
 * Searchs for a reservation by mobile_number. 
 * All found reservations are displayed in a ReservationCard (same as dashboard)
 * If no reservation is found, displays "No reservations found"
 * 
 * @returns {JSX.Element}
 */
export default function ReservationSearch() {

    const [phoneNumber, setPhoneNumber] = useState("");
    const [foundReservations, setFoundReservations] = useState([]);
    const [errors, setErrors] = useState(null);

    //creates a ReservationCard for each found reservation. 
    const reservationCards = foundReservations.map((foundReservation) => {
        return <ReservationCard key={foundReservation.reservation_id} reservation={foundReservation} />
    });
    
    const handleChange = ({ target }) => {
        setPhoneNumber(target.value);
    };

    const handleFind = async (event) => {
        event.preventDefault();

        const abortController = new AbortController();
        await mobileSearch(phoneNumber, abortController.signal)
            .then(reservations => {
                setFoundReservations(reservations);
                if (reservationCards.length === 0) {
                    setErrors({ message: "No reservations found" });
                } else {
                    setErrors(null);
                };
            })
            .catch(setErrors);
    };

    return (
        <div className="reservation">
            <h3 >Find Reservation</h3>
            <form onSubmit={handleFind}>
                <div className="form-row">
                    <div className = "form-group col-md-5">
                        <label htmlFor="mobile_number"> Search: </label>
                        <input
                            className = "form-control"
                            name="mobile_number"
                            placeholder="Enter a customer's phone number"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <button className="btn btn-primary p-2" type="submit"> Find </button>
            </form>
            {reservationCards.length === 0 ? (
                <ErrorAlert error={errors} />
                ) : null}
            <div className="">
                {reservationCards}
            </div>
        </div>
    );
}