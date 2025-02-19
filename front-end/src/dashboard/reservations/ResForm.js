import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createReservation, updateReservation, readReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";
import formatReservationDate from "../../utils/format-reservation-date";
import formatReservationTime from "../../utils/format-reservation-time";

/**
 * Input form to create and edit a reservation. 
 * 
 * @returns {JSX.Element}
 */
export default function ResForm() {
    const history = useHistory();
    const { reservation_id } = useParams();

    const initForm = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 1,
    };
    
    const [ResForm, setReservationForm] = useState({ ...initForm });
    const [resErrors, setResErrors] = useState([]);

    
    useEffect(() => {
       if (reservation_id) {
            readReservation(reservation_id)
                .then((res) => {
                    formatReservationDate(res);
                    formatReservationTime(res);
                    setReservationForm({
                        first_name: res.first_name,
                        last_name: res.last_name,
                        mobile_number: res.mobile_number,
                        reservation_date: res.reservation_date,
                        reservation_time: res.reservation_time,
                        people: res.people,
                    });
                })
                .catch(setResErrors);
        }
    }, [reservation_id]);


   
    const checkValidInputs = async () => {
        const { reservation_date, reservation_time } = ResForm;
        const errors = [];
        const reservationDate = new Date(`${reservation_date}T${reservation_time}:00.000`);
        const todaysDate = new Date();
        const reservationTime = Number(reservation_time.replace(":", ""));

        if (reservationDate < todaysDate) {
            errors.push({ message: "Please choose a future date!" });
        };
        
        if (reservationTime < 1030 || reservationTime > 2130) {
            errors.push({ message: "Please choose a time between 10:30 am - 9:30 pm!" });
        };
        
        if (reservationDate.getDay() === 2) {
            errors.push({ message: "Closed on Tuesdays! Please choose a different day!" });
        };

        setResErrors(errors);
        if (errors.length > 0) {
            return false;
          } else {
            return true;
        };
    }
    
    const errorMessages = () => {
        return resErrors.map((err, index) => <ErrorAlert key={index} error={err} />);
      };

    const handleChange = ({ target }) => {
        if (target.name === "people") {
            setReservationForm({
                ...ResForm,
                [target.name]: Number(target.value)
            })
        } else {
            setReservationForm({
                ...ResForm,
                [target.name]: target.value,
            });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let valid = await checkValidInputs();
        
        if (valid) {
            if (reservation_id) {
                await updateReservation(reservation_id, {
                    ...ResForm,
                    reservation_id: reservation_id,
                    status: "booked",
                })
                    .then((res) =>
                        history.push(`/dashboard?date=${ResForm.reservation_date}`)
                    );
                
            } else {
                await createReservation(ResForm)
                    .then((res) =>
                        history.push(`/dashboard?date=${ResForm.reservation_date}`)
                    );
            }
        }
    };

    const handleCancel = event => {
        event.preventDefault();
        history.goBack();
    };

    return (
        <div className="formContainer m-3">
            {/* <h3 className="pt-2">New Reservation</h3> */}
            {errorMessages()}
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className = "form-group col-md-4">
                        <label htmlFor="first_name"> First Name: </label>
                        <input
                            className = "form-control"
                            id = "first_name"
                            type="text"
                            name="first_name"
                            placeholder="First name..."
                            onChange={handleChange}
                            value={ResForm.first_name}
                            required
                        />
                    </div>
                    <div className = "form-group col-md-4">
                        <label htmlFor="last_name">Last Name:</label>
                        <input
                            className = "form-control"
                            id = "last_name"
                            type="text"
                            name="last_name"
                            placeholder="Last name..."
                            onChange={handleChange}
                            value={ResForm.last_name}
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className = "form-group col-md-4">
                        <label htmlFor="mobile_number">Phone Number:</label>
                        <input
                            className = "form-control"
                            id = "mobile_number"
                            type="tel"
                            name="mobile_number"
                            placeholder="xxx-xxx-xxxx"
                            onChange={handleChange}
                            value={ResForm.mobile_number}
                            required
                        />
                    </div>
                    <div className = "form-group col-md-4">
                        <label htmlFor="people">Number of People:</label>
                        <input
                            className = "form-control"
                            id="people"
                            type="number"
                            name="people"
                            onChange={handleChange}
                            value={ResForm.people}
                            required
                         />
                    </div>
                </div>
                <div className="form-row">
                    <div className = "form-group col-md-4">
                        <label htmlFor="reservation_date">Date:</label>
                        <input
                            className = "form-control"
                            id = "reservation_date"
                            type="date"
                            placeholder="YYYY-MM-DD"
                            pattern="\d{4}-\d{2}-\d{2}"
                            name="reservation_date"
                            onChange={handleChange}
                            value={ResForm.reservation_date}
                            required
                        />
                    </div>
                    <div className = "form-group col-md-4">
                        <label htmlFor="reservation_time">Time:</label>
                        <input
                            className = "form-control"
                            id = "reservation_time"
                            type="time"
                            placeholder="HH:MM"
                            pattern="[0-9]{2}:[0-9]{2}"
                            name="reservation_time"
                            onChange={handleChange}
                            value={ResForm.reservation_time}
                            required
                        />
                    </div>
                </div>
                    <button type="submit" className="btn btn-primary mr-2"> Submit </button>
                    <button className="btn btn-secondary mr-2" onClick={handleCancel}> Cancel </button>
            </form>
        </div>
    );
};