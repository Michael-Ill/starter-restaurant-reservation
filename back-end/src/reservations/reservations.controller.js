const service = require("../reservations/reservations.service")
const hasProperties = require("../errors/hasProperties")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")

/**
 * List handler for reservation resources
 */
const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
]

const hasValidProperties = hasProperties(...VALID_PROPERTIES);

function peopleCheck(req, res, next) {
  const { people } = req.body.data;
  if (!people || people < 1 || typeof people !== "number") {
    return next({
      status: 400,
      message: `${people} is an invalid number of people`
    })
  }
  next();
}

//Reservation Validation functions

function checkTimeAndDate(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const reservationTime = Number(reservation_time.replace(":", ""))
  const currentDate = new Date();
  const reservationDate = new Date(`${reservation_date}T${reservation_time}:00.000`);

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/)) {
    return next({ status: 400, message: "reservation_date is invalid" });
  }

  if (reservationDate < currentDate) {
    return next({ status: 400, message: "reservations not allowed for future dates" })
  };

  if (reservationDate.getDay() === 2) {
    return next({ status: 400, message: "Restaurant is closed on Tuesdays" })
  };

  if (!reservation_time.match(/\d{2}:\d{2}/)) {
    return next({ status: 400, message: "reservation_time is invalid" });
  };

  if (reservationTime < 1030 || reservationTime > 2130) {
    return next({ status: 400, message: 'Reservation must be made during operating hours' })
  };
  next();
}

//Reservation status Validator

function reservationStatusCheck(req, res, next) {
  const { status } = req.body.data;
  if (status === "seated" || status === "finished") {
    return next({ status: 400, message: "Reservation status must not be finished or seated" })
  }
  next();
}

//Check if res exists

async function reservationExistsCheck(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (!reservation) {
    return next({ status: 404, message: `Reservation ${reservation_id} not found` });
  }

  res.locals.reservation = reservation;
  next();
}

//validate Current Status

async function validateStatus(req, res, next) {
  const currentStatus = res.locals.reservation.status;
  const { status } = req.body.data;

  if (status === "cancelled") return next();

  if (currentStatus === "finished") {
    return next({ status: 400, message: "Cannot update finished reservation." });
  };

  if (status !== "booked" && status !== "seated" && status !== "finished") {
    return next({ status: 400, message: "status unknown!" });
  };

  next();
};

//List Handler

async function list(req, res, next) {
  const { date, mobile_number } = req.query;

  if (date) {
    return res.json({ data: await service.list(date) });
  } else if (mobile_number) {
    return res.json({ data: await service.search(mobile_number) });
  }
}

//create handler

async function create(req, res) {
  const newReservation = req.body.data
  res.status(201).json({ data: await service.create(newReservation) })
}

//read handler

function read(req, res) {
  res.json({ data: res.locals.reservation })
}

// reservation status updater

async function reservationStatusUpdater(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;
  const reservation = await service.reservationStatusUpdater(reservation_id, status);

  res.status(200).json({ data: { status: reservation[0] } });
};

//reservation updater

async function reservationUpdater(req, res, next) {
  const { reservation_id } = req.params;
  if (reservation_id) {
    res.json({
      data: await service.update(reservation_id, req.body.data),
    });
  } else {
    next({
      status: 404,
      message: "reservation_id not found"
    })
  }
}



module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExistsCheck), read],
  create: [
    asyncErrorBoundary(hasValidProperties),
    asyncErrorBoundary(peopleCheck),
    asyncErrorBoundary(checkTimeAndDate),
    asyncErrorBoundary(reservationStatusCheck),
    asyncErrorBoundary(create),
  ],
  reservationStatusUpdater: [
    asyncErrorBoundary(reservationExistsCheck),
    asyncErrorBoundary(validateStatus),
    asyncErrorBoundary(reservationStatusUpdater)
  ],
  update: [
    asyncErrorBoundary(reservationExistsCheck),
    asyncErrorBoundary(hasValidProperties),
    asyncErrorBoundary(peopleCheck),
    asyncErrorBoundary(checkTimeAndDate),
    asyncErrorBoundary(reservationUpdater)
  ]
};
