package com.dr.dr_screening.controller;

import com.dr.dr_screening.dto.ScreeningResultResponse;
import com.dr.dr_screening.entity.Screening;
import com.dr.dr_screening.service.ScreeningService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/screenings")
public class ScreeningController {

    private final ScreeningService screeningService;

    public ScreeningController(ScreeningService screeningService) {
        this.screeningService = screeningService;
    }

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

    @GetMapping("/{id}")
    public ScreeningResultResponse getScreening(
            @PathVariable Long id) {

        Screening screening =
                screeningService.getScreeningById(id);

        return screeningService.toResponse(screening);
    }

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
}