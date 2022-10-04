const service = require('./tables.service');
const reservationService = require('../reservations/reservations.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

//table validator 

 function tableCheck(req, res, next) {
    if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });
  
    const { table_name, capacity, reservation_id } = req.body.data;
  
    if (!table_name || table_name === '' || table_name.length === 1)
      return next({ status: 400, message: 'Invalid table_name' });
  
    if (!capacity || capacity === 0 || typeof capacity !== 'number')
      return next({ status: 400, message: 'Invalid capacity' });
  
    res.locals.newTable = { table_name, capacity };
  
    if (reservation_id) {
      res.locals.newTable.reservation_id = reservation_id;
      res.locals.newTable.occupied = true;
    }

    next();
}

//table update check -- similar to check above

async function tableUpdateCheck(req, res, next) {
    if (!req.body.data) return next({ status: 400, message: 'Data Missing!' });
    const { reservation_id } = req.body.data;
   
    if (!reservation_id) {
        return next({ status: 400, message: 'Missing reservation_id' });
    }

    const reservation = await reservationService.read(reservation_id);

    if (!reservation) {
        return next({ status: 404, message: `${reservation_id} does not exist` });
    }
  
    if (reservation.status === 'seated') {
        return next({ status: 400, message: 'Party already seated' });
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
        return next({ status: 400, message: `${table.table_name} is already occupied!` });
    }
    next();
}

// check if table exists 

async function tableExists(req, res, next) {
    const { table_id } = req.params;
    const table = await service.read(table_id)
    if (!table) {
        return next({ status: 404, message: `Table ${table_id} cannot be found` });
    }
    
    res.locals.table = table;
    next();
}

//list

async function list(req, res) {
    res.json({ data: await service.list() });
}

//CRUD

 function read(req, res) {
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
    list: [list],
    read: [asyncErrorBoundary(tableExists), read],
    create: [asyncErrorBoundary(tableCheck), asyncErrorBoundary(create)],
    update: [asyncErrorBoundary(tableUpdateCheck), asyncErrorBoundary(tableCapacityCheck), asyncErrorBoundary(update)],
    tableClear: [asyncErrorBoundary(tableExists), asyncErrorBoundary(tableClear)]
}
