import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ResEdit from "../dashboard/reservations/ResEdit";
import TableForm from "../dashboard/tables/TableForm";
import Seat from "../dashboard/tables/Seat";
import ResNew from "../dashboard/reservations/ResNew";
import ResSearch from "../dashboard/reservations/ResSearch"
//import EditReservation from "../reservations/EditReservation"
/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard defaultDate={today()} />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <Seat />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <ResEdit />
      </Route>
      <Route path="/reservations/new">
        <ResNew />
      </Route>
      <Route path="/search">
        <ResSearch />
      </Route>
      <Route path="/tables/new">
        <TableForm />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;