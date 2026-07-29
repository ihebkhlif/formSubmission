package com.fromsub.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "employees")
public class Employee {

    @Id
    private String id;

    @NotBlank
    private String name;

    @NotNull
    private WorkTeam workTeam;

    private int annualCredit = 25;

    private int usedCredit = 0;

    private int remainingCredit = 25;

    public Employee() {
    }

    public Employee(String id, String name, WorkTeam workTeam, int annualCredit) {
        this.id = id;
        this.name = name;
        this.workTeam = workTeam;
        this.annualCredit = annualCredit;
    }

    public Employee(String name, WorkTeam workTeam, int annualCredit) {
        this.name = name;
        this.workTeam = workTeam;
        this.annualCredit = annualCredit;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public WorkTeam getWorkTeam() {
        return workTeam;
    }

    public void setWorkTeam(WorkTeam workTeam) {
        this.workTeam = workTeam;
    }

    public int getAnnualCredit() {
        return annualCredit;
    }

    public void setAnnualCredit(int annualCredit) {
        this.annualCredit = annualCredit;
    }

    public int getUsedCredit() {
        return usedCredit;
    }

    public void setUsedCredit(int usedCredit) {
        this.usedCredit = usedCredit;
    }

    public int getRemainingCredit() {
        return remainingCredit;
    }

    public void setRemainingCredit(int remainingCredit) {
        this.remainingCredit = remainingCredit;
    }
}
