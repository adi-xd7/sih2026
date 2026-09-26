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


    // ============================================================
    // PATIENT
    // ============================================================

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;


    // ============================================================
    // ORIGINAL IMAGE
    // ============================================================

    @Column(nullable = false)
    private String imagePath;


    // ============================================================
    // HEATMAP / EXPLAINABILITY IMAGE
    // ============================================================

    /*
     * Path to the generated Grad-CAM overlay image.
     *
     * This is stored separately from the original fundus image.
     *
     * Example:
     * uploads/heatmaps/uuid_heatmap.png
     */
    private String heatmapPath;


    // ============================================================
    // SCREENING STATUS
    // ============================================================

    @Enumerated(EnumType.STRING)
    private ScreeningStatus status;


    // ============================================================
    // DR GRADE
    // ============================================================

    @Enumerated(EnumType.STRING)
    private DrGrade drGrade;


    // ============================================================
    // PREDICTION
    // ============================================================

    private Double confidence;

    private Boolean referable;


    // ============================================================
    // PROBABILITIES
    // ============================================================

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


    // ============================================================
    // CREATED AT
    // ============================================================

    private LocalDateTime createdAt;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public Screening() {

        this.createdAt = LocalDateTime.now();

        this.status = ScreeningStatus.UPLOADED;
    }


    // ============================================================
    // ID
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // ============================================================
    // PATIENT
    // ============================================================

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }


    // ============================================================
    // ORIGINAL IMAGE PATH
    // ============================================================

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }


    // ============================================================
    // HEATMAP PATH
    // ============================================================

    public String getHeatmapPath() {
        return heatmapPath;
    }

    public void setHeatmapPath(String heatmapPath) {
        this.heatmapPath = heatmapPath;
    }


    // ============================================================
    // STATUS
    // ============================================================

    public ScreeningStatus getStatus() {
        return status;
    }

    public void setStatus(ScreeningStatus status) {
        this.status = status;
    }


    // ============================================================
    // DR GRADE
    // ============================================================

    public DrGrade getDrGrade() {
        return drGrade;
    }

    public void setDrGrade(DrGrade drGrade) {
        this.drGrade = drGrade;
    }


    // ============================================================
    // CONFIDENCE
    // ============================================================

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }


    // ============================================================
    // REFERABLE
    // ============================================================

    public Boolean getReferable() {
        return referable;
    }

    public void setReferable(Boolean referable) {
        this.referable = referable;
    }


    // ============================================================
    // CREATED AT
    // ============================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    // ============================================================
    // NO DR PROBABILITY
    // ============================================================

    public Double getProbabilityNoDr() {
        return probabilityNoDr;
    }

    public void setProbabilityNoDr(
            Double probabilityNoDr) {

        this.probabilityNoDr = probabilityNoDr;
    }


    // ============================================================
    // MILD DR PROBABILITY
    // ============================================================

    public Double getProbabilityMildDr() {
        return probabilityMildDr;
    }

    public void setProbabilityMildDr(
            Double probabilityMildDr) {

        this.probabilityMildDr = probabilityMildDr;
    }


    // ============================================================
    // MODERATE DR PROBABILITY
    // ============================================================

    public Double getProbabilityModerateDr() {
        return probabilityModerateDr;
    }

    public void setProbabilityModerateDr(
            Double probabilityModerateDr) {

        this.probabilityModerateDr = probabilityModerateDr;
    }


    // ============================================================
    // SEVERE DR PROBABILITY
    // ============================================================

    public Double getProbabilitySevereDr() {
        return probabilitySevereDr;
    }

    public void setProbabilitySevereDr(
            Double probabilitySevereDr) {

        this.probabilitySevereDr = probabilitySevereDr;
    }


    // ============================================================
    // PROLIFERATIVE DR PROBABILITY
    // ============================================================

    public Double getProbabilityProliferativeDr() {
        return probabilityProliferativeDr;
    }

    public void setProbabilityProliferativeDr(
            Double probabilityProliferativeDr) {

        this.probabilityProliferativeDr =
                probabilityProliferativeDr;
    }
}