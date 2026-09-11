package com.dr.dr_screening.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dr.dr_screening.client.MlServiceClient;
import com.dr.dr_screening.dto.MlPredictionResponse;
import com.dr.dr_screening.dto.ScreeningResultResponse;
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

    // ============================================================
    // CREATE SCREENING
    // ============================================================

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

            filePath =
                    uploadDirectory.resolve(uniqueFilename);

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

            // ----------------------------------------------------
            // DR GRADE
            // ----------------------------------------------------

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

            // ----------------------------------------------------
            // CONFIDENCE
            // ----------------------------------------------------

            screening.setConfidence(
                    prediction.getConfidence());

            // ----------------------------------------------------
            // REFERABLE DR
            // ----------------------------------------------------

            screening.setReferable(
                    prediction.getReferable_dr());

            // ----------------------------------------------------
            // PROBABILITIES
            // ----------------------------------------------------

            if (prediction.getProbabilities() != null) {

                screening.setProbabilityNoDr(
                        prediction.getProbabilities()
                                .get("No DR"));

                screening.setProbabilityMildDr(
                        prediction.getProbabilities()
                                .get("Mild DR"));

                screening.setProbabilityModerateDr(
                        prediction.getProbabilities()
                                .get("Moderate DR"));

                screening.setProbabilitySevereDr(
                        prediction.getProbabilities()
                                .get("Severe DR"));

                screening.setProbabilityProliferativeDr(
                        prediction.getProbabilities()
                                .get("Proliferative DR"));
            }

            // ----------------------------------------------------
            // QUALITY
            // ----------------------------------------------------

            /*
             * The current ML API does not perform
             * image quality assessment.
             *
             * Therefore we do NOT invent a quality score.
             */

            screening.setGradable(true);

            // ----------------------------------------------------
            // COMPLETE
            // ----------------------------------------------------

            screening.setStatus(
                    ScreeningStatus.COMPLETED);

            return screeningRepository.save(screening);

        } catch (Exception e) {

            screening.setStatus(
                    ScreeningStatus.FAILED);

            screeningRepository.save(screening);

            throw new RuntimeException(
                    "ML inference failed: "
                            + e.getMessage(),
                    e);
        }
    }

    // ============================================================
    // GET SCREENING
    // ============================================================

    public Screening getScreeningById(Long id) {

        return screeningRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Screening not found"));
    }

    // ============================================================
    // GET IMAGE
    // ============================================================

    public Resource getScreeningImage(Long id) {

        Screening screening =
                getScreeningById(id);

        try {

            Path imagePath =
                    Paths.get(
                            screening.getImagePath())
                            .toAbsolutePath()
                            .normalize();

            Resource resource =
                    new UrlResource(
                            imagePath.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new RuntimeException(
                        "Image file not found");
            }

            return resource;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to load screening image",
                    e);
        }
    }

    // ============================================================
    // IMAGE MEDIA TYPE
    // ============================================================

    public MediaType getImageMediaType(Long id) {

        Screening screening =
                getScreeningById(id);

        String imagePath =
                screening.getImagePath()
                        .toLowerCase();

        if (imagePath.endsWith(".png")) {

            return MediaType.IMAGE_PNG;

        } else if (imagePath.endsWith(".jpg")
                || imagePath.endsWith(".jpeg")) {

            return MediaType.IMAGE_JPEG;
        }

        return MediaType.APPLICATION_OCTET_STREAM;
    }

    // ============================================================
    // ENTITY → RESPONSE DTO
    // ============================================================

    public ScreeningResultResponse toResponse(
            Screening screening) {

        ScreeningResultResponse response =
                new ScreeningResultResponse();

        response.setId(
                screening.getId());

        response.setPatientId(
                screening.getPatient().getId());

        response.setPatientCode(
                screening.getPatient().getPatientCode());

        response.setStatus(
                screening.getStatus() != null
                        ? screening.getStatus().name()
                        : null);

        response.setQualityScore(
                screening.getQualityScore());

        response.setGradable(
                screening.getGradable());

        response.setDrGrade(
                screening.getDrGrade() != null
                        ? screening.getDrGrade().name()
                        : null);

        response.setConfidence(
                screening.getConfidence());

        response.setReferable(
                screening.getReferable());

        response.setCreatedAt(
                screening.getCreatedAt());

        // --------------------------------------------------------
        // IMAGE URL
        // --------------------------------------------------------

        response.setImageUrl(
                "/api/screenings/"
                        + screening.getId()
                        + "/image");

        // --------------------------------------------------------
        // PROBABILITIES
        // --------------------------------------------------------

        Map<String, Double> probabilities =
                new LinkedHashMap<>();

        probabilities.put(
                "No DR",
                screening.getProbabilityNoDr());

        probabilities.put(
                "Mild DR",
                screening.getProbabilityMildDr());

        probabilities.put(
                "Moderate DR",
                screening.getProbabilityModerateDr());

        probabilities.put(
                "Severe DR",
                screening.getProbabilitySevereDr());

        probabilities.put(
                "Proliferative DR",
                screening.getProbabilityProliferativeDr());

        response.setProbabilities(
                probabilities);

        return response;
    }

    public List<ScreeningResultResponse> getPatientScreenings(
        Long patientId) {

    if (!patientRepository.existsById(patientId)) {
        throw new RuntimeException("Patient not found");
    }

    return screeningRepository
            .findByPatientIdOrderByCreatedAtDesc(patientId)
            .stream()
            .map(this::toResponse)
            .toList();
}
}