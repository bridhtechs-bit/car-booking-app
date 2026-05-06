import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { getCarById } from "../features/car/carSlice";
import { createNewBooking, resetBookingState } from "../features/auth/bookingSlice";

const CarDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedCar, loading , error} = useSelector((state) => state.car);
  const { loading: bookingLoading, success } = useSelector(
    (state) => state.booking
  );

  // Reset booking success state when mounting this page
  useEffect(() => {
    dispatch(resetBookingState());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCarById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      navigate("/my-bookings");
    }
  }, [success, navigate]);

  const car = selectedCar || {}

  const initialValues = {
    startDate: "",
    endDate: "",
    additionalDriver: false,
    insurance: false,
  };

  const bookingSchema = Yup.object({
    startDate: Yup.date().required("Date de début obligatoire"),
    endDate: Yup.date()
      .min(Yup.ref("startDate"), "La date de fin doit être après la date de début")
      .required("Date de fin obligatoire"),
  });

  if (loading || !car) {
    return <div className="text-center mt-5">Chargement...</div>;
  }

  return (
    <div className="container my-5">
      <div className="row">

        {/* Image + Infos */}
        <div className="col-md-6">
          <img
            src={car.images ? car.images[0] : car.image}
            alt={car.name}
            className="img-fluid rounded shadow"
          />
          <h3 className="mt-3">{car.name}</h3>
          <p className="text-muted">{car.description}</p>
          <h4 className="text-primary">
            {car.pricePerDay}€ / jour
          </h4>
        </div>

        {/* Formulaire réservation */}
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h4 className="mb-3">Réserver ce véhicule</h4>

            <Formik
              initialValues={initialValues}
              validationSchema={bookingSchema}
              onSubmit={(values, { resetForm }) => {
                const days =
                  (new Date(values.endDate) -
                    new Date(values.startDate)) /
                  (1000 * 60 * 60 * 24);

                const finalPrice =
                  car.pricePerDay * days +
                  (values.additionalDriver ? 15 * days : 0) +
                  (values.insurance ? 20 * days : 0);

                dispatch(
                  createNewBooking({
                    carId: id,
                    ...values,
                    totalPrice: finalPrice,
                  })
                );

                resetForm();
              }}
            >
              {({ values }) => {
                const days =
                  values.startDate && values.endDate
                    ? Math.max(
                        (new Date(values.endDate) -
                          new Date(values.startDate)) /
                          (1000 * 60 * 60 * 24),
                        1
                      )
                    : 1;

                const total =
                  car.pricePerDay * days +
                  (values.additionalDriver ? 15 * days : 0) +
                  (values.insurance ? 20 * days : 0);

                return (
                  <Form>

                    <div className="mb-3">
                      <label>Date de début</label>
                      <Field
                        type="date"
                        name="startDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="startDate"
                        component="small"
                        className="text-danger"
                      />
                    </div>

                    <div className="mb-3">
                      <label>Date de fin</label>
                      <Field
                        type="date"
                        name="endDate"
                        className="form-control"
                      />
                      <ErrorMessage
                        name="endDate"
                        component="small"
                        className="text-danger"
                      />
                    </div>

                    <div className="form-check mb-2">
                      <Field
                        type="checkbox"
                        name="additionalDriver"
                        className="form-check-input"
                        id="driver"
                      />
                      <label className="form-check-label" htmlFor="driver">
                        Conducteur additionnel (+15€/jour)
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <Field
                        type="checkbox"
                        name="insurance"
                        className="form-check-input"
                        id="insurance"
                      />
                      <label className="form-check-label" htmlFor="insurance">
                        Assurance premium (+20€/jour)
                      </label>
                    </div>

                    <div className="alert alert-info">
                      <strong>Durée :</strong> {days} jour(s) <br />
                      <strong>Total :</strong> {total.toFixed(2)}€
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="btn btn-primary w-100"
                    >
                      {bookingLoading
                        ? "Réservation..."
                        : "Confirmer la réservation"}
                    </button>

                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;