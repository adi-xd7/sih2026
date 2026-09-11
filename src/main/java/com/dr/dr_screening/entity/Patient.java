package com.dr.dr_screening.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "patients")
public class Patient {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;


@NotBlank
@Column(nullable = false, unique = true)
private String patientCode;

@Min(1)
@Max(120)
private Integer age;

@NotBlank
private String gender;

@NotNull
private Boolean diabetic;

    public Patient() {
    }

    public Patient(String patientCode, Integer age, String gender, Boolean diabetic) {
        this.patientCode = patientCode;
        this.age = age;
        this.gender = gender;
        this.diabetic = diabetic;
    }

    public Long getId() {
        return id;
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Boolean getDiabetic() {
        return diabetic;
    }

    public void setDiabetic(Boolean diabetic) {
        this.diabetic = diabetic;
    }
}