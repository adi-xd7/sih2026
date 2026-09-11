package com.dr.dr_screening.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dr.dr_screening.client.MlServiceClient;
import com.dr.dr_screening.dto.MlPredictionResponse;
import com.dr.dr_screening.entity.DrGrade;
import com.dr.dr_screening.entity.Patient;
import com.dr.dr_screening.entity.Screening;
import com.dr.dr_screening.entity.ScreeningStatus;
import com.dr.dr_screening.repository.PatientRepository;
import com.dr.dr_screening.repository.ScreeningRepository;

@Service
public class ScreeningService {

    private final ScreeningRepository screeningRepository;
    private final PatientRepository patientRepository;
    private final MlServiceClient mlServiceClient;

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    public ScreeningService(
            ScreeningRepository screeningRepository,
            PatientRepository patientRepository,
            MlServiceClient mlServiceClient) {

        this.screeningRepository = screeningRepository;
        this.patientRepository = patientRepository;
        this.mlServiceClient = mlServiceClient;
    }

    public Screening createScreening(
            Long patientId,
            MultipartFile image) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Image is empty");
        }

        String originalFilename = image.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Image filename is missing");
        }

        String filename = originalFilename.toLowerCase();

        if (!filename.endsWith(".jpg")
                && !filename.endsWith(".jpeg")
                && !filename.endsWith(".png")) {

            throw new RuntimeException(
                    "Only JPG, JPEG and PNG images are allowed");
        }

        Path filePath;

        try {
            Files.createDirectories(uploadDirectory);

            String extension = ".jpg";

            if (filename.endsWith(".png")) {
                extension = ".png";
            } else if (filename.endsWith(".jpeg")) {
                extension = ".jpeg";
            }

            String uniqueFilename =
                    UUID.randomUUID() + extension;

            filePath = uploadDirectory.resolve(uniqueFilename);

            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to store image", e);
        }

        Screening screening = new Screening();

        screening.setPatient(patient);
        screening.setImagePath(filePath.toString());
        screening.setStatus(ScreeningStatus.UPLOADED);

        screening = screeningRepository.save(screening);

        try {
            screening.setStatus(ScreeningStatus.GRADING);
            screeningRepository.save(screening);

            MlPredictionResponse prediction =
                    mlServiceClient.predict(filePath);

            switch (prediction.getClass_idx()) {

                case 0:
                    screening.setDrGrade(DrGrade.LEVEL_0);
                    break;

                case 1:
                    screening.setDrGrade(DrGrade.LEVEL_1);
                    break;

                case 2:
                    screening.setDrGrade(DrGrade.LEVEL_2);
                    break;

                case 3:
                    screening.setDrGrade(DrGrade.LEVEL_3);
                    break;

                case 4:
                    screening.setDrGrade(DrGrade.LEVEL_4);
                    break;

                default:
                    throw new RuntimeException(
                            "Invalid DR class returned by ML service: "
                                    + prediction.getClass_idx());
            }

            screening.setConfidence(
                    prediction.getConfidence());

            screening.setReferable(
                    prediction.getReferable_dr());

            screening.setGradable(true);

            screening.setStatus(ScreeningStatus.COMPLETED);

            return screeningRepository.save(screening);

        } catch (Exception e) {

            screening.setStatus(ScreeningStatus.FAILED);
            screeningRepository.save(screening);

            throw new RuntimeException(
                    "ML inference failed: " + e.getMessage(), e);
        }
    }
}