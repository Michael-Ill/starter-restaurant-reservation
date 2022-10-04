import React from "react";
import ResForm from "./ResForm";

/**
 * Defines the page that is used to edit a reservation
 */

function ResEdit() {
  return (
    <section className="newResContainer">
      <div className="mb-1 newRes border border-secondary text-center">
        <h1 className="mb-0">Edit Reservation</h1>
      </div>
      <ResForm method={"PUT"} />
    </section>
  );
}

export default ResEdit;