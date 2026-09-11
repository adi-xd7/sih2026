package com.dr.dr_screening.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dr.dr_screening.entity.Screening;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {
}