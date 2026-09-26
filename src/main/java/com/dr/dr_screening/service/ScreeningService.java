package com.dr.dr_screening.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;
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

    private final Path heatmapDirectory =
            uploadDirectory.resolve("heatmaps");


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

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

        // --------------------------------------------------------
        // FIND PATIENT
        // --------------------------------------------------------

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));


        // --------------------------------------------------------
        // VALIDATE IMAGE
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // SAVE ORIGINAL IMAGE
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // CREATE SCREENING RECORD
        // --------------------------------------------------------

        Screening screening = new Screening();

        screening.setPatient(patient);

        screening.setImagePath(
                filePath.toString());

        screening.setStatus(
                ScreeningStatus.UPLOADED);

        screening =
                screeningRepository.save(screening);


        try {

            // ----------------------------------------------------
            // START GRADING
            // ----------------------------------------------------

            screening.setStatus(
                    ScreeningStatus.GRADING);

            screeningRepository.save(screening);


            // ----------------------------------------------------
            // CALL FASTAPI ML SERVICE
            // ----------------------------------------------------

            MlPredictionResponse prediction =
                    mlServiceClient.predict(filePath);

            if (prediction == null) {

                throw new RuntimeException(
                        "ML service returned an empty response");
            }


            // ----------------------------------------------------
            // VALIDATE CLASS INDEX
            // ----------------------------------------------------

            Integer classIndex =
                    prediction.getClass_idx();

            if (classIndex == null
                    || classIndex < 0
                    || classIndex > 4) {

                throw new RuntimeException(
                        "Invalid DR class returned by ML service: "
                                + classIndex);
            }


            // ----------------------------------------------------
            // DR GRADE
            //
            // 0 -> No DR
            // 1 -> Mild DR
            // 2 -> Moderate DR
            // 3 -> Severe DR
            // 4 -> Proliferative DR
            // ----------------------------------------------------

            switch (classIndex) {

                case 0:
                    screening.setDrGrade(
                            DrGrade.LEVEL_0);
                    break;

                case 1:
                    screening.setDrGrade(
                            DrGrade.LEVEL_1);
                    break;

                case 2:
                    screening.setDrGrade(
                            DrGrade.LEVEL_2);
                    break;

                case 3:
                    screening.setDrGrade(
                            DrGrade.LEVEL_3);
                    break;

                case 4:
                    screening.setDrGrade(
                            DrGrade.LEVEL_4);
                    break;

                default:
                    throw new RuntimeException(
                            "Invalid DR class returned by ML service: "
                                    + classIndex);
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

            Map<String, Double> probabilities =
                    prediction.getProbabilities();

            if (probabilities != null) {

                screening.setProbabilityNoDr(
                        probabilities.get("No DR"));

                screening.setProbabilityMildDr(
                        probabilities.get("Mild DR"));

                screening.setProbabilityModerateDr(
                        probabilities.get("Moderate DR"));

                screening.setProbabilitySevereDr(
                        probabilities.get("Severe DR"));

                screening.setProbabilityProliferativeDr(
                        probabilities.get("Proliferative DR"));
            }


            // ----------------------------------------------------
            // SAVE GRAD-CAM HEATMAP
            // ----------------------------------------------------

            String heatmapImage =
                    prediction.getHeatmap_image();

            if (heatmapImage != null
                    && !heatmapImage.isBlank()) {

                String heatmapPath =
                        saveHeatmapImage(
                                heatmapImage);

                screening.setHeatmapPath(
                        heatmapPath);
            }


            // ----------------------------------------------------
            // COMPLETE SCREENING
            // ----------------------------------------------------

            screening.setStatus(
                    ScreeningStatus.COMPLETED);

            return screeningRepository.save(screening);


        } catch (Exception e) {

            // ----------------------------------------------------
            // MARK SCREENING AS FAILED
            // ----------------------------------------------------

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
    // SAVE HEATMAP
    // ============================================================

    private String saveHeatmapImage(
            String heatmapImage) {

        try {

            Files.createDirectories(
                    heatmapDirectory);

            String base64Data =
                    heatmapImage;

            /*
             * FastAPI returns:
             *
             * data:image/png;base64,<BASE64_DATA>
             *
             * Remove the data URL prefix before decoding.
             */

            if (base64Data.startsWith("data:image")) {

                int commaIndex =
                        base64Data.indexOf(',');

                if (commaIndex >= 0) {

                    base64Data =
                            base64Data.substring(
                                    commaIndex + 1);
                }
            }

            byte[] imageBytes =
                    Base64.getDecoder().decode(
                            base64Data);

            String filename =
                    UUID.randomUUID()
                            + "_heatmap.png";

            Path heatmapPath =
                    heatmapDirectory.resolve(filename);

            Files.write(
                    heatmapPath,
                    imageBytes);

            return heatmapPath.toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to save Grad-CAM heatmap",
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
    // GET ORIGINAL SCREENING IMAGE
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
    // GET HEATMAP IMAGE
    // ============================================================

    public Resource getScreeningHeatmap(Long id) {

        Screening screening =
                getScreeningById(id);

        String heatmapPath =
                screening.getHeatmapPath();

        if (heatmapPath == null
                || heatmapPath.isBlank()) {

            throw new RuntimeException(
                    "Heatmap is not available for this screening");
        }

        try {

            Path imagePath =
                    Paths.get(heatmapPath)
                            .toAbsolutePath()
                            .normalize();

            Resource resource =
                    new UrlResource(
                            imagePath.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new RuntimeException(
                        "Heatmap file not found");
            }

            return resource;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to load screening heatmap",
                    e);
        }
    }


    // ============================================================
    // ORIGINAL IMAGE MEDIA TYPE
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
    // HEATMAP MEDIA TYPE
    // ============================================================

    public MediaType getHeatmapMediaType(Long id) {

        /*
         * Heatmaps generated by FastAPI are always
         * stored as PNG files.
         */

        return MediaType.IMAGE_PNG;
    }


    // ============================================================
    // ENTITY -> RESPONSE DTO
    // ============================================================

    public ScreeningResultResponse toResponse(
            Screening screening) {

        ScreeningResultResponse response =
                new ScreeningResultResponse();


        // --------------------------------------------------------
        // BASIC INFORMATION
        // --------------------------------------------------------

        response.setId(
                screening.getId());

        response.setPatientId(
                screening.getPatient().getId());

        response.setPatientCode(
                screening.getPatient().getPatientCode());


        // --------------------------------------------------------
        // STATUS
        // --------------------------------------------------------

        response.setStatus(
                screening.getStatus() != null
                        ? screening.getStatus().name()
                        : null);


        // --------------------------------------------------------
        // DR GRADE
        // --------------------------------------------------------

        response.setDrGrade(
                screening.getDrGrade() != null
                        ? screening.getDrGrade().name()
                        : null);


        // --------------------------------------------------------
        // CONFIDENCE
        // --------------------------------------------------------

        response.setConfidence(
                screening.getConfidence());


        // --------------------------------------------------------
        // REFERABLE DR
        // --------------------------------------------------------

        response.setReferable(
                screening.getReferable());


        // --------------------------------------------------------
        // CREATED AT
        // --------------------------------------------------------

        response.setCreatedAt(
                screening.getCreatedAt());


        // --------------------------------------------------------
        // ORIGINAL IMAGE URL
        // --------------------------------------------------------

        response.setImageUrl(
                "/api/screenings/"
                        + screening.getId()
                        + "/image");


        // --------------------------------------------------------
        // HEATMAP URL
        // --------------------------------------------------------

        if (screening.getHeatmapPath() != null
                && !screening.getHeatmapPath().isBlank()) {

            response.setHeatmapUrl(
                    "/api/screenings/"
                            + screening.getId()
                            + "/heatmap");
        }


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


    // ============================================================
    // GET PATIENT SCREENING HISTORY
    // ============================================================

    public List<ScreeningResultResponse> getPatientScreenings(
            Long patientId) {

        if (!patientRepository.existsById(patientId)) {

            throw new RuntimeException(
                    "Patient not found");
        }

        return screeningRepository
                .findByPatientIdOrderByCreatedAtDesc(
                        patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}