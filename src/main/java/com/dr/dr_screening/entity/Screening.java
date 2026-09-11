package com.dr.dr_screening.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "screenings")
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String imagePath;

    @Enumerated(EnumType.STRING)
    private ScreeningStatus status;

    @Enumerated(EnumType.STRING)
    private DrGrade drGrade;

    private Double confidence;

    private Boolean referable;

    private LocalDateTime createdAt;

    @Column(name = "prob_no_dr")
    private Double probabilityNoDr;

    @Column(name = "prob_mild_dr")
    private Double probabilityMildDr;

    @Column(name = "prob_moderate_dr")
    private Double probabilityModerateDr;

    @Column(name = "prob_severe_dr")
    private Double probabilitySevereDr;

    @Column(name = "prob_proliferative_dr")
    private Double probabilityProliferativeDr;

    public Screening() {
        this.createdAt = LocalDateTime.now();
        this.status = ScreeningStatus.UPLOADED;
    }

    // getters and setters
    public Long getId() {
        return id;
    }

    public Patient getPatient() {
        return patient;
    }

    public String getImagePath() {
        return imagePath;
    }

    public ScreeningStatus getStatus() {
        return status;
    }

    public DrGrade getDrGrade() {
        return drGrade;
    }

    public Double getConfidence() {
        return confidence;
    }

    public Boolean getReferable() {
        return referable;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public void setStatus(ScreeningStatus status) {
        this.status = status;
    }

    public void setDrGrade(DrGrade drGrade) {
        this.drGrade = drGrade;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public void setReferable(Boolean referable) {
        this.referable = referable;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getProbabilityNoDr() {
        return probabilityNoDr;
    }

    public void setProbabilityNoDr(Double probabilityNoDr) {
        this.probabilityNoDr = probabilityNoDr;
    }

    public Double getProbabilityMildDr() {
        return probabilityMildDr;
    }

    public void setProbabilityMildDr(Double probabilityMildDr) {
        this.probabilityMildDr = probabilityMildDr;
    }

    public Double getProbabilityModerateDr() {
        return probabilityModerateDr;
    }

    public void setProbabilityModerateDr(Double probabilityModerateDr) {
        this.probabilityModerateDr = probabilityModerateDr;
    }

    public Double getProbabilitySevereDr() {
        return probabilitySevereDr;
    }

    public void setProbabilitySevereDr(Double probabilitySevereDr) {
        this.probabilitySevereDr = probabilitySevereDr;
    }

    public Double getProbabilityProliferativeDr() {
        return probabilityProliferativeDr;
    }

    public void setProbabilityProliferativeDr(
            Double probabilityProliferativeDr) {
        this.probabilityProliferativeDr
                = probabilityProliferativeDr;
    }

}
