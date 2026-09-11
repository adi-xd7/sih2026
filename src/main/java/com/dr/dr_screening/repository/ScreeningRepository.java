package com.dr.dr_screening.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dr.dr_screening.entity.Screening;

public interface ScreeningRepository
        extends JpaRepository<Screening, Long> {

    List<Screening> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}