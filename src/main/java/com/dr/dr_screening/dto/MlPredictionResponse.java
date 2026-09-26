package com.dr.dr_screening.dto;

import java.util.Map;

public class MlPredictionResponse {

    private Integer class_idx;

    private String class_name;

    private Boolean referable_dr;

    private Double confidence;

    private Map<String, Double> probabilities;

    /*
     * Base64 PNG data URL returned by FastAPI.
     *
     * Example:
     * data:image/png;base64,iVBORw0KGgoAAAANS...
     *
     * The image contains the original fundus image
     * with the Grad-CAM heatmap overlaid.
     */
    private String heatmap_image;


    // ============================================================
    // CLASS INDEX
    // ============================================================

    public Integer getClass_idx() {
        return class_idx;
    }

    public void setClass_idx(Integer class_idx) {
        this.class_idx = class_idx;
    }


    // ============================================================
    // CLASS NAME
    // ============================================================

    public String getClass_name() {
        return class_name;
    }

    public void setClass_name(String class_name) {
        this.class_name = class_name;
    }


    // ============================================================
    // REFERABLE DR
    // ============================================================

    public Boolean getReferable_dr() {
        return referable_dr;
    }

    public void setReferable_dr(Boolean referable_dr) {
        this.referable_dr = referable_dr;
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
    // HEATMAP IMAGE
    // ============================================================

    public String getHeatmap_image() {
        return heatmap_image;
    }

    public void setHeatmap_image(String heatmap_image) {
        this.heatmap_image = heatmap_image;
    }
}