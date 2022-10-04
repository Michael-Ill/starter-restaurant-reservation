import ResForm from "./ResForm"
import React from "react"

function ResNew() {
    return (
      <section className="newResContainer">
        <div className="mb-1">
          <h1 className="mb-1 newRes border border-secondary text-center">New Reservation</h1>
        </div>
        <ResForm method={"POST"} />
      </section>
    );
  }
  
  export default ResNew;

