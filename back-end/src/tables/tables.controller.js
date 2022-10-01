const service = require('./tables.service');
const reservationService = require('../reservations/reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

//table validator 

async function tableCheck(req, res, next) {
    if (!req.body.data) return next({ status: 400, message: "Missing data" });

    const { table_name, capacity, reservation_id } = req.body.data;

    if (!capacity || capacity === 0 || typeof capacity !== 'number')
        return next({ status: 400, message: 'capacity is invalid' });

    if (!table_name || table_name === '' || table_name.length === 1)
        return next({ status: 400, message: 'table_name is invalid' });

    res.locals.newTable = { table_name, capacity };

    if (reservation_id) {
        res.locals.newTable.reservation_id = reservation_id;
        res.locals.newTable.occupied = true;
    }

    next();
} 

//table update check -- similar to check above

async function tableUpdateCheck(req, res, next) {
    if (!req.body.data) return next({ status: 400, message: 'Missing data' });
    const { reservation_id } = req.body.data;
   
    if (!reservation_id) {
        return next({ status: 400, message: 'reservation_id missing' });
    }

    const reservation = await reservationService.read(reservation_id);

    if (!reservation) {
        return next({ status: 404, message: `Cannot find ${reservation_id}` });
    }
  
    if (reservation.status === 'seated') {
        return next({ status: 400, message: 'Reservation already seated' });
    }
  
    res.locals.reservation = reservation;
    next();
}

//table capacity check

async function tableCapacityCheck(req, res, next) {
    const { table_id } = req.params;
    const table = await service.read(table_id);
    const reservation = res.locals.reservation;

    if (table.capacity < reservation.people) {
        return next({ status: 400, message: `The max capacity for ${table.table_name} is ${table.capacity}!` });
    }
    if (table.occupied) {
        return next({ status: 400, message: `${table.table_name} currently in use` });
    }
    next();
}

// check if table exists 

async function tableExists(req, res, next) {
    const { table_id } = req.params;
    const table = await service.read(table_id)
    if (!table) {
        return next({ status: 404, message: `Table ${table_id} not found` });
    }
    
    res.locals.table = table;
    next();
}

//list

async function list(req, res) {
    res.json({ data: await service.list() });
}

//CRUD

async function read(req, res) {
    res.json({ data: res.locals.table });
}

async function create(req, res) {
    const newTable = await service.create(res.locals.newTable);
    res.status(201).json({ data: newTable });
}


async function update(req, res) {
    const { reservation_id } = res.locals.reservation
    
    const updatedTable = await service.update(req.params.table_id, reservation_id);
    await reservationService.updateStatus(reservation_id, 'seated');
    
    res.status(200).json({ data: updatedTable });
}

async function tableClear(req, res, next) {
    const table = await service.read(req.params.table_id);

    if (!table.occupied) {
        return next({ status: 400, message: `${table.table_name} is not occupied.` });
    }

    const openTable = await service.clearTable(table.table_id);
    await reservationService.updateStatus(table.reservation_id, 'finished');

    res.status(200).json({ data: openTable });
}

module.exports = {
    list: [asyncErrorBoundary(list)],
    read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
    create: [asyncErrorBoundary(tableCheck), asyncErrorBoundary(create)],
    update: [asyncErrorBoundary(tableUpdateCheck), asyncErrorBoundary(tableCapacityCheck), asyncErrorBoundary(update)],
    tableClear: [asyncErrorBoundary(tableExists), asyncErrorBoundary(tableClear)]
}
