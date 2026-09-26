package com.dr.dr_screening.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ScreeningResultResponse {

    private Long id;

    private Long patientId;

    private String patientCode;

    private String status;

    private String drGrade;

    private Double confidence;

    private Boolean referable;

    private Map<String, Double> probabilities;

    private String imageUrl;

    private String heatmapUrl;

    private LocalDateTime createdAt;


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
    // PATIENT ID
    // ============================================================

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }


    // ============================================================
    // PATIENT CODE
    // ============================================================

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }


    // ============================================================
    // STATUS
    // ============================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    // ============================================================
    // DR GRADE
    // ============================================================

    public String getDrGrade() {
        return drGrade;
    }

    public void setDrGrade(String drGrade) {
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
    // PROBABILITIES
    // ============================================================

    public Map<String, Double> getProbabilities() {
        return probabilities;
    }

    public void setProbabilities(
            Map<String, Double> probabilities) {

        this.probabilities = probabilities;
    }


    // ============================================================
    // ORIGINAL IMAGE URL
    // ============================================================

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }


    // ============================================================
    // HEATMAP URL
    // ============================================================

    public String getHeatmapUrl() {
        return heatmapUrl;
    }

    public void setHeatmapUrl(String heatmapUrl) {
        this.heatmapUrl = heatmapUrl;
    }


    // ============================================================
    // CREATED AT
    // ============================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }
}