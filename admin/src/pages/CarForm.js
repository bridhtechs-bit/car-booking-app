import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCar, updateCar, resetSuccess } from '../features/cars/carsSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CarForm = () => {
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');
  const hasLoadedRef = useRef(false);

  const Schema = Yup.object().shape({
    name: Yup.string()
      .required('Le nom de la voiture est requis')
      .min(2, 'Le nom doit avoir au moins 2 caractères')
      .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    brand: Yup.string()
      .required('La marque est requise')
      .min(2, 'La marque doit avoir au moins 2 caractères'),
    pricePerDay: Yup.number()
      .required('Le prix par jour est requis')
      .positive('Le prix doit être positif')
      .typeError('Le prix doit être un nombre'),
    category: Yup.string()
      .required('La catégorie est requise')
      .oneOf(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'van', 'sport'], 'Catégorie invalide'),
    transmission: Yup.string()
      .required('La transmission est requise')
      .oneOf(['manual', 'automatic'], 'Transmission invalide'),
    fuelType: Yup.string()
      .required('Le type de carburant est requis')
      .oneOf(['Petrol', 'Diesel', 'Hybrid', 'Electric'], 'Type de carburant invalide'),
    year: Yup.number()
      .required('L\'année est requise')
      .min(1980, 'L\'année doit être minimale 1980')
      .max(new Date().getFullYear() + 1, 'L\'année ne peut pas dépasser l\'année actuelle + 1'),
    color: Yup.string()
      .required('La couleur est requise')
      .min(2, 'La couleur doit avoir au moins 2 caractères'),
    mileage: Yup.string()
      .required('Le kilométrage est requis'),
    seats: Yup.number()
      .required('Le nombre de sièges est requis')
      .min(2, 'Au minimum 2 sièges')
      .max(10, 'Au maximum 10 sièges')
      .typeError('Le nombre de sièges doit être un nombre'),
    description: Yup.string()
      .max(500, 'La description ne doit pas dépasser 500 caractères'),
  });

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      brand: '',
      pricePerDay: 0,
      category: 'sedan',
      transmission: 'automatic',
      fuelType: 'Petrol',
      year: new Date().getFullYear(),
      color: 'Black',
      mileage: '0 km',
      seats: 5,
      available: true,
      featured: false,
      description: '',
    },
    validationSchema: Schema,
    onSubmit: (values) => {
      const submitData = {
        ...values,
        features,
        images
      };
      if (id) {
        dispatch(updateCar({ id, updateData: submitData }));
      } else {
        dispatch(createCar(submitData));
      }
    }
  });

  const { cars, loading, isSuccess, error } = useSelector((state) => state.cars);

  useEffect(() => {
    if (isSuccess) {
      navigate('/admin/cars');
      dispatch(resetSuccess());
    }
  }, [isSuccess, navigate, dispatch]);

  useEffect(() => {
    hasLoadedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (id && cars.length > 0 && !hasLoadedRef.current) {
      const selectedCar = cars.find(c => c._id === id);
      if (selectedCar) {
        formik.setValues({
          name: selectedCar.name || '',
          brand: selectedCar.brand || '',
          pricePerDay: selectedCar.pricePerDay || 0,
          category: selectedCar.category || 'sedan',
          transmission: selectedCar.transmission || 'automatic',
          fuelType: selectedCar.fuelType || 'Petrol',
          year: selectedCar.year || new Date().getFullYear(),
          color: selectedCar.color || 'Black',
          mileage: selectedCar.mileage || '0 km',
          seats: selectedCar.seats || 5,
          available: selectedCar.available || true,
          featured: selectedCar.featured || false,
          description: selectedCar.description || '',
        });
        setFeatures(selectedCar.features || []);
        setImages(selectedCar.images || []);
        hasLoadedRef.current = true;
      }
    }
  }, [id, cars]);

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setImages([...images, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className='container d-center' style={{ minHeight: '80vh', paddingBottom: '2rem' }}>
      <div className='car-form-container'>
        <h2>{id ? 'Éditer voiture' : 'Nouvelle voiture'}</h2>
        {error && <div className="alert alert-danger">{typeof error === 'string' ? error : error.message || 'Erreur'}</div>}
        <form onSubmit={formik.handleSubmit}>
          {/* Nom */}
          <div className="mb-3">
            <label className="form-label">Nom de la voiture *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${formik.errors.name && formik.touched.name ? 'is-invalid' : ''}`}
              placeholder="Ex: BMW X5"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.name && formik.touched.name && <div className="invalid-feedback d-block">{formik.errors.name}</div>}
          </div>

          {/* Marque */}
          <div className="mb-3">
            <label className="form-label">Marque *</label>
            <input
              type="text"
              name="brand"
              className={`form-control ${formik.errors.brand && formik.touched.brand ? 'is-invalid' : ''}`}
              placeholder="Ex: BMW"
              value={formik.values.brand}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.brand && formik.touched.brand && <div className="invalid-feedback d-block">{formik.errors.brand}</div>}
          </div>

          {/* Catégorie */}
          <div className="mb-3">
            <label className="form-label">Catégorie *</label>
            <select
              name="category"
              className={`form-control ${formik.errors.category && formik.touched.category ? 'is-invalid' : ''}`}
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="sedan">sedan</option>
              <option value="suv">suv</option>
              <option value="hatchback">hatchback</option>
              <option value="coupe">coupe</option>
              <option value="convertible">cabriolet</option>
              <option value="van">monospace</option>
              <option value="sport">sport</option>
            </select>
            {formik.errors.category && formik.touched.category && <div className="invalid-feedback d-block">{formik.errors.category}</div>}
          </div>

          {/* Année */}
          <div className="mb-3">
            <label className="form-label">Année *</label>
            <input
              type="number"
              name="year"
              className={`form-control ${formik.errors.year && formik.touched.year ? 'is-invalid' : ''}`}
              placeholder="Ex: 2023"
              value={formik.values.year}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1980"
              max={new Date().getFullYear() + 1}
            />
            {formik.errors.year && formik.touched.year && <div className="invalid-feedback d-block">{formik.errors.year}</div>}
          </div>

          {/* Transmission */}
          <div className="mb-3">
            <label className="form-label">Transmission *</label>
            <select
              name="transmission"
              className={`form-control ${formik.errors.transmission && formik.touched.transmission ? 'is-invalid' : ''}`}
              value={formik.values.transmission}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Sélectionner une transmission</option>
              <option value="manual">manuelle</option>
              <option value="automatic">automatique</option>
            </select>
            {formik.errors.transmission && formik.touched.transmission && <div className="invalid-feedback d-block">{formik.errors.transmission}</div>}
          </div>

          {/* Type de carburant */}
          <div className="mb-3">
            <label className="form-label">Type de carburant *</label>
            <select
              name="fuelType"
              className={`form-control ${formik.errors.fuelType && formik.touched.fuelType ? 'is-invalid' : ''}`}
              value={formik.values.fuelType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Sélectionner un carburant</option>
              <option value="Petrol">Essence</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybride</option>
              <option value="Electric">Électrique</option>
            </select>
            {formik.errors.fuelType && formik.touched.fuelType && <div className="invalid-feedback d-block">{formik.errors.fuelType}</div>}
          </div>

          {/* Couleur */}
          <div className="mb-3">
            <label className="form-label">Couleur *</label>
            <input
              type="text"
              name="color"
              className={`form-control ${formik.errors.color && formik.touched.color ? 'is-invalid' : ''}`}
              placeholder="Ex: Noir"
              value={formik.values.color}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.color && formik.touched.color && <div className="invalid-feedback d-block">{formik.errors.color}</div>}
          </div>

          {/* Kilométrage */}
          <div className="mb-3">
            <label className="form-label">Kilométrage *</label>
            <input
              type="text"
              name="mileage"
              className={`form-control ${formik.errors.mileage && formik.touched.mileage ? 'is-invalid' : ''}`}
              placeholder="Ex: 50000 km"
              value={formik.values.mileage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.mileage && formik.touched.mileage && <div className="invalid-feedback d-block">{formik.errors.mileage}</div>}
          </div>

          {/* Nombre de sièges */}
          <div className="mb-3">
            <label className="form-label">Nombre de sièges *</label>
            <input
              type="number"
              name="seats"
              className={`form-control ${formik.errors.seats && formik.touched.seats ? 'is-invalid' : ''}`}
              placeholder="Ex: 5"
              value={formik.values.seats}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="2"
              max="10"
            />
            {formik.errors.seats && formik.touched.seats && <div className="invalid-feedback d-block">{formik.errors.seats}</div>}
          </div>

          {/* Prix par jour */}
          <div className="mb-3">
            <label className="form-label">Prix par jour (€) *</label>
            <input
              type="number"
              name="pricePerDay"
              className={`form-control ${formik.errors.pricePerDay && formik.touched.pricePerDay ? 'is-invalid' : ''}`}
              placeholder="Ex: 50"
              value={formik.values.pricePerDay}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              step="0.01"
              min="0"
            />
            {formik.errors.pricePerDay && formik.touched.pricePerDay && <div className="invalid-feedback d-block">{formik.errors.pricePerDay}</div>}
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className={`form-control ${formik.errors.description && formik.touched.description ? 'is-invalid' : ''}`}
              placeholder="Description de la voiture..."
              rows="4"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.description && formik.touched.description && <div className="invalid-feedback d-block">{formik.errors.description}</div>}
          </div>

          {/* Disponibilité */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              name="available"
              className="form-check-input"
              id="available"
              checked={formik.values.available}
              onChange={(e) => formik.setFieldValue('available', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="available">
              Disponible
            </label>
          </div>

          {/* Vedette */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              name="featured"
              className="form-check-input"
              id="featured"
              checked={formik.values.featured}
              onChange={(e) => formik.setFieldValue('featured', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="featured">
              Voiture en vedette
            </label>
          </div>

          {/* Caractéristiques */}
          <div className="mb-3">
            <label className="form-label">Caractéristiques</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Ajouter une caractéristique (ex: Climatisation)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={addFeature}>
                Ajouter
              </button>
            </div>
            {features.length > 0 && (
              <div className="mb-2">
                {features.map((feature, index) => (
                  <span key={index} className="badge bg-info me-2 mb-2">
                    {feature}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => removeFeature(index)}
                      aria-label="Remove"
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="mb-3">
            <label className="form-label">Images (URLs)</label>
            <div className="input-group mb-2">
              <input
                type="url"
                className="form-control"
                placeholder="URL de l'image"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={addImage}>
                Ajouter
              </button>
            </div>
            {images.length > 0 && (
              <div className="mb-2">
                {images.map((image, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                      <small className="text-truncate">{image}</small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeImage(index)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : (id ? 'Mettre à jour' : 'Créer la voiture')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
