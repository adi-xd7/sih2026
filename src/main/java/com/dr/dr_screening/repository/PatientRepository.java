package com.dr.dr_screening.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dr.dr_screening.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

}