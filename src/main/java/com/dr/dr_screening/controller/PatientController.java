package com.dr.dr_screening.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dr.dr_screening.dto.ScreeningResultResponse;
import com.dr.dr_screening.entity.Patient;
import com.dr.dr_screening.service.PatientService;
import com.dr.dr_screening.service.ScreeningService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;
    private final ScreeningService screeningService;

    public PatientController(
            PatientService patientService,
            ScreeningService screeningService) {

        this.patientService = patientService;
        this.screeningService = screeningService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient createPatient(
            @RequestBody Patient patient) {

        return patientService.createPatient(patient);
    }

    @GetMapping("/{id}")
    public Patient getPatient(
            @PathVariable Long id) {

        return patientService.getPatientById(id);
    }

    @GetMapping
    public List<Patient> getAllPatients() {

        return patientService.getAllPatients();
    }

    @GetMapping("/{id}/screenings")
    public List<ScreeningResultResponse> getPatientScreenings(
            @PathVariable Long id) {

        return screeningService.getPatientScreenings(id);
    }
}