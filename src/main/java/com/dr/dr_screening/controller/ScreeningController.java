package com.dr.dr_screening.controller;

import com.dr.dr_screening.entity.Screening;
import com.dr.dr_screening.service.ScreeningService;
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
    public Screening uploadImage(
            @RequestParam Long patientId,
            @RequestParam("image") MultipartFile image) {

        return screeningService.createScreening(patientId, image);
    }
}