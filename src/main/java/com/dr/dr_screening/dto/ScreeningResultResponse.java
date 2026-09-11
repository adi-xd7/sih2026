package com.dr.dr_screening.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ScreeningResultResponse {

    private Long id;
    private Long patientId;
    private String patientCode;

    private String status;

    private Double qualityScore;
    private Boolean gradable;

    private String drGrade;
    private Double confidence;
    private Boolean referable;

    private Map<String, Double> probabilities;

    private String imageUrl;

    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }

    public Boolean getGradable() {
        return gradable;
    }

    public void setGradable(Boolean gradable) {
        this.gradable = gradable;
    }

    public String getDrGrade() {
        return drGrade;
    }

    public void setDrGrade(String drGrade) {
        this.drGrade = drGrade;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public Boolean getReferable() {
        return referable;
    }

    public void setReferable(Boolean referable) {
        this.referable = referable;
    }

    public Map<String, Double> getProbabilities() {
        return probabilities;
    }

    public void setProbabilities(Map<String, Double> probabilities) {
        this.probabilities = probabilities;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}