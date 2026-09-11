package com.dr.dr_screening.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dr.dr_screening.entity.Patient;
import com.dr.dr_screening.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient getPatientById(Long id) {
    return patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public List<Patient> getAllPatients() {
    return patientRepository.findAll();
    }
}