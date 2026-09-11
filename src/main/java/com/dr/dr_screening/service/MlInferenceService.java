package com.dr.dr_screening.service;

import java.nio.file.Path;

import org.springframework.stereotype.Service;

import com.dr.dr_screening.client.MlServiceClient;
import com.dr.dr_screening.dto.MlPredictionResponse;
import com.dr.dr_screening.entity.DrGrade;

@Service
public class MlInferenceService {

    private final MlServiceClient mlServiceClient;

    public MlInferenceService(MlServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    public MlPredictionResponse analyze(Path imagePath) {
        return mlServiceClient.predict(imagePath);
    }

    public DrGrade mapGrade(Integer classIdx) {

    return switch (classIdx) {
        case 0 -> DrGrade.LEVEL_0;
        case 1 -> DrGrade.LEVEL_1;
        case 2 -> DrGrade.LEVEL_2;
        case 3 -> DrGrade.LEVEL_3;
        case 4 -> DrGrade.LEVEL_4;
        default -> throw new IllegalArgumentException(
                "Invalid DR class: " + classIdx
        );
    };
}
}