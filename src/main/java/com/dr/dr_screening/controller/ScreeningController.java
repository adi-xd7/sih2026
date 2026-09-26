package com.dr.dr_screening.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.dr.dr_screening.dto.ScreeningResultResponse;
import com.dr.dr_screening.entity.Screening;
import com.dr.dr_screening.service.ScreeningService;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private final ScreeningService screeningService;

    public ScreeningController(
            ScreeningService screeningService) {

        this.screeningService = screeningService;
    }


    // ============================================================
    // UPLOAD IMAGE + RUN SCREENING
    // ============================================================

    @PostMapping("/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public ScreeningResultResponse uploadImage(
            @RequestParam Long patientId,
            @RequestParam("image") MultipartFile image) {

        Screening screening =
                screeningService.createScreening(
                        patientId,
                        image
                );

        return screeningService.toResponse(screening);
    }


    // ============================================================
    // GET SCREENING RESULT
    // ============================================================

    @GetMapping("/{id}")
    public ScreeningResultResponse getScreening(
            @PathVariable Long id) {

        Screening screening =
                screeningService.getScreeningById(id);

        return screeningService.toResponse(screening);
    }


    // ============================================================
    // GET ORIGINAL FUNDUS IMAGE
    // ============================================================

    @GetMapping("/{id}/image")
    public ResponseEntity<Resource> getScreeningImage(
            @PathVariable Long id) {

        Resource image =
                screeningService.getScreeningImage(id);

        MediaType mediaType =
                screeningService.getImageMediaType(id);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline"
                )
                .body(image);
    }


    // ============================================================
    // GET GRAD-CAM HEATMAP OVERLAY
    // ============================================================

    @GetMapping("/{id}/heatmap")
    public ResponseEntity<Resource> getScreeningHeatmap(
            @PathVariable Long id) {

        Resource heatmap =
                screeningService.getScreeningHeatmap(id);

        MediaType mediaType =
                screeningService.getHeatmapMediaType(id);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline"
                )
                .body(heatmap);
    }
}