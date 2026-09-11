package com.dr.dr_screening.dto;

import java.util.Map;

public class MlPredictionResponse {

    private Integer class_idx;
    private String class_name;
    private Boolean referable_dr;
    private Double confidence;
    private Map<String, Double> probabilities;

    public Integer getClass_idx() {
        return class_idx;
    }

    public void setClass_idx(Integer class_idx) {
        this.class_idx = class_idx;
    }

    public String getClass_name() {
        return class_name;
    }

    public void setClass_name(String class_name) {
        this.class_name = class_name;
    }

    public Boolean getReferable_dr() {
        return referable_dr;
    }

    public void setReferable_dr(Boolean referable_dr) {
        this.referable_dr = referable_dr;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public Map<String, Double> getProbabilities() {
        return probabilities;
    }

    public void setProbabilities(Map<String, Double> probabilities) {
        this.probabilities = probabilities;
    }
}